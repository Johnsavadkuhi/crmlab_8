import mongoose, { type PipelineStage } from "mongoose";
import { BUG_REVIEW_STATES, normalizeBugReviewState } from "@role-dashboard/contracts";
import { HTTP_STATUS } from "@/constants/http";
import { PROJECT_STATUS, PROJECT_STATUS_VALUES } from "@/constants/projects";
import {
  VULNERABILITY_SEVERITY_VALUES,
} from "@/constants/vulnerabilities";
import { AppError } from "@/utils/AppError";
import { AuditLogModel } from "@/modules/audit/models/auditLog.model";
import { VulnerabilityModel } from "@/modules/pentest/models/vulnerability.model";
import { ProjectModel } from "@/modules/projects/models/project.model";
import { ProjectAssignmentModel } from "@/modules/projects/models/projectAssignment.model";
import { UserModel } from "@/modules/users/models/user.model";
import type { AdminAnalyticsQuery } from "../validators/adminAnalytics.validators";

type Granularity = NonNullable<AdminAnalyticsQuery["granularity"]>;
type DateWindow = { from: Date; to: Date; previousFrom: Date; previousTo: Date };
type CountRow = { _id: string | null; count: number };
type TrendRow = { _id: Date; count: number };

const CLOSED_PROJECT_STATUSES = [PROJECT_STATUS.FINISHED, PROJECT_STATUS.CLOSED];
const ACTIVE_PROJECT_STATUSES = [
  PROJECT_STATUS.OPEN,
  PROJECT_STATUS.IN_PROGRESS,
  PROJECT_STATUS.PENDING,
];
const CLOSED_FINDING_STATES = [
  BUG_REVIEW_STATES.DUPLICATE.toLowerCase(),
  BUG_REVIEW_STATES.NOT_APPLICABLE.toLowerCase(),
];
const CLOSED_FINDING_STATUSES = ["fixed", "closed"];

// A deliberately simple management score: Critical×10 + High×6 + Medium×3
// + Low×1 + Informational×0.5. It ranks concentration of risk; it is not CVSS.
export const RISK_WEIGHTS = {
  critical: 10,
  high: 6,
  medium: 3,
  low: 1,
  info: 0.5,
} as const;

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function endOfUtcDay(value: Date) {
  const end = startOfUtcDay(value);
  end.setUTCDate(end.getUTCDate() + 1);
  end.setUTCMilliseconds(-1);
  return end;
}

export function resolveAnalyticsWindow(query: Pick<AdminAnalyticsQuery, "from" | "to">): DateWindow {
  const now = new Date();
  const to = query.to ? endOfUtcDay(new Date(`${query.to}T00:00:00.000Z`)) : endOfUtcDay(now);
  const from = query.from
    ? startOfUtcDay(new Date(`${query.from}T00:00:00.000Z`))
    : new Date(to.getTime() - 29 * 86_400_000 - 86_399_999);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    throw new AppError("Analytics start date must not be after the end date", HTTP_STATUS.BAD_REQUEST);
  }
  const duration = to.getTime() - from.getTime() + 1;
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - duration + 1);
  return { from, to, previousFrom, previousTo };
}

function dateRange(field: "created" | "updated", from: Date, to: Date) {
  const canonical = field === "created" ? "createdAt" : "updatedAt";
  const legacy = field === "created" ? "created_at" : "updated_at";
  return {
    $or: [
      { [canonical]: { $gte: from, $lte: to } },
      { [canonical]: { $exists: false }, [legacy]: { $gte: from, $lte: to } },
    ],
  };
}

function dateExpression(field: "created" | "updated" = "created") {
  return field === "created"
    ? { $ifNull: ["$createdAt", "$created_at"] }
    : { $ifNull: ["$updatedAt", "$updated_at"] };
}

function bucketExpression(granularity: Granularity, field: unknown = dateExpression()) {
  return { $dateTrunc: { date: field, unit: granularity, timezone: "UTC" } };
}

function severityExpression() {
  return {
    $let: {
      vars: { raw: { $toLower: { $ifNull: ["$severity", { $ifNull: ["$cvss.severity", "info"] }] } } },
      in: { $cond: [{ $eq: ["$$raw", "informational"] }, "info", "$$raw"] },
    },
  };
}

function findingStateExpression() {
  return { $toLower: { $ifNull: ["$state", { $ifNull: ["$status", "New"] }] } };
}

function isClosedExpression() {
  return {
    $or: [
      { $in: [{ $toLower: { $ifNull: ["$status", ""] } }, CLOSED_FINDING_STATUSES] },
      { $in: [{ $toLower: { $ifNull: ["$state", ""] } }, CLOSED_FINDING_STATES] },
    ],
  };
}

function combine(...filters: Array<Record<string, unknown> | undefined>) {
  const values = filters.filter(Boolean) as Record<string, unknown>[];
  if (!values.length) return {};
  return values.length === 1 ? values[0] : { $and: values };
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function id(value?: string) {
  return value ? new mongoose.Types.ObjectId(value) : undefined;
}

function findingBaseFilter(query: AdminAnalyticsQuery) {
  const projectId = id(query.project);
  const testerId = id(query.tester);
  return combine(
    projectId ? { $or: [{ projectId }, { project: projectId }] } : undefined,
    testerId
      ? {
          $or: [
            { createdBy: testerId },
            { user: testerId },
            { pentester: testerId },
            { creator: testerId },
            { reporter: testerId },
          ],
        }
      : undefined,
    query.severity ? { $expr: { $eq: [severityExpression(), query.severity] } } : undefined,
    query.findingStatus
      ? { $expr: { $eq: [findingStateExpression(), query.findingStatus.toLowerCase()] } }
      : undefined
  );
}

function projectBaseFilter(query: AdminAnalyticsQuery, testerProjectIds: mongoose.Types.ObjectId[]) {
  const projectId = id(query.project);
  return combine(
    projectId ? { _id: projectId } : undefined,
    query.tester ? { _id: { $in: testerProjectIds } } : undefined,
    query.projectStatus ? { status: query.projectStatus } : { status: { $ne: PROJECT_STATUS.REMOVED } }
  );
}

function normalizeCountRows(rows: CountRow[]) {
  return rows
    .filter((row) => row._id)
    .map((row) => ({ key: String(row._id), value: row.count }))
    .sort((a, b) => b.value - a.value);
}

function trendMap(rows: TrendRow[]) {
  return new Map(rows.map((row) => [new Date(row._id).toISOString(), row.count]));
}

function mergeTwoTrends(first: TrendRow[], second: TrendRow[], firstKey: string, secondKey: string) {
  const left = trendMap(first);
  const right = trendMap(second);
  return [...new Set([...left.keys(), ...right.keys()])]
    .sort()
    .map((period) => ({ period, [firstKey]: left.get(period) || 0, [secondKey]: right.get(period) || 0 }));
}

async function testerProjectIds(query: AdminAnalyticsQuery) {
  if (!query.tester) return [];
  const testerId = id(query.tester)!;
  const [canonical, legacy, fromFindingsCanonical, fromFindingsLegacy] = await Promise.all([
    ProjectAssignmentModel.distinct("projectId", { $or: [{ userId: testerId }, { pentester: testerId }] }),
    ProjectAssignmentModel.distinct("project", { $or: [{ userId: testerId }, { pentester: testerId }] }),
    VulnerabilityModel.distinct("projectId", findingBaseFilter(query)),
    VulnerabilityModel.distinct("project", findingBaseFilter(query)),
  ]);
  return [...new Set([...canonical, ...legacy, ...fromFindingsCanonical, ...fromFindingsLegacy].map(String))]
    .filter(mongoose.isValidObjectId)
    .map((value) => new mongoose.Types.ObjectId(value));
}

export async function getAdminAnalytics(query: AdminAnalyticsQuery) {
  const window = resolveAnalyticsWindow(query);
  const granularity = query.granularity || "day";
  const assignedProjects = await testerProjectIds(query);
  const projectFilter = projectBaseFilter(query, assignedProjects);
  const findingFilter = findingBaseFilter(query);
  const currentProjectMatch = combine(projectFilter, dateRange("created", window.from, window.to));
  const currentFindingMatch = combine(findingFilter, dateRange("created", window.from, window.to));

  const projectSummaryPipeline: PipelineStage[] = [
    { $match: projectFilter },
    {
      $facet: {
        current: [
          { $match: dateRange("created", window.from, window.to) },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $in: ["$status", ACTIVE_PROJECT_STATUSES] }, 1, 0] } },
              completed: { $sum: { $cond: [{ $in: ["$status", CLOSED_PROJECT_STATUSES] }, 1, 0] } },
            },
          },
        ],
        previous: [
          { $match: dateRange("created", window.previousFrom, window.previousTo) },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $in: ["$status", ACTIVE_PROJECT_STATUSES] }, 1, 0] } },
              completed: { $sum: { $cond: [{ $in: ["$status", CLOSED_PROJECT_STATUSES] }, 1, 0] } },
            },
          },
        ],
      },
    },
  ];

  const findingSummaryPipeline: PipelineStage[] = [
    { $match: findingFilter },
    {
      $facet: {
        current: [
          { $match: dateRange("created", window.from, window.to) },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              critical: { $sum: { $cond: [{ $eq: [severityExpression(), "critical"] }, 1, 0] } },
              high: { $sum: { $cond: [{ $eq: [severityExpression(), "high"] }, 1, 0] } },
              closed: { $sum: { $cond: [isClosedExpression(), 1, 0] } },
              confirmed: {
                $sum: {
                  $cond: [{ $in: [findingStateExpression(), ["verify", "triaged"]] }, 1, 0],
                },
              },
            },
          },
        ],
        previous: [
          { $match: dateRange("created", window.previousFrom, window.previousTo) },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              critical: { $sum: { $cond: [{ $eq: [severityExpression(), "critical"] }, 1, 0] } },
              high: { $sum: { $cond: [{ $eq: [severityExpression(), "high"] }, 1, 0] } },
              closed: { $sum: { $cond: [isClosedExpression(), 1, 0] } },
            },
          },
        ],
      },
    },
  ];

  const projectCreatedTrendPipeline: PipelineStage[] = [
    { $match: currentProjectMatch },
    { $group: { _id: bucketExpression(granularity), count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const projectCompletedTrendPipeline: PipelineStage[] = [
    {
      $match: combine(projectFilter, {
        status: { $in: CLOSED_PROJECT_STATUSES },
        $or: [
          { manuallyClosedAt: { $gte: window.from, $lte: window.to } },
          { manuallyClosedAt: { $exists: false }, updatedAt: { $gte: window.from, $lte: window.to } },
        ],
      }),
    },
    {
      $group: {
        _id: bucketExpression(granularity, { $ifNull: ["$manuallyClosedAt", "$updatedAt"] }),
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const findingTrendPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    {
      $group: {
        _id: bucketExpression(granularity),
        total: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: [severityExpression(), "critical"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: [severityExpression(), "high"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: [severityExpression(), "medium"] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: [severityExpression(), "low"] }, 1, 0] } },
        info: { $sum: { $cond: [{ $eq: [severityExpression(), "info"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const severityPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    { $group: { _id: severityExpression(), count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const findingStatusPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    { $group: { _id: findingStateExpression(), count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const projectStatusPipeline: PipelineStage[] = [
    { $match: currentProjectMatch },
    { $group: { _id: { $toLower: { $ifNull: ["$status", "open"] } }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const testerPerformancePipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    {
      $project: {
        reporterId: { $ifNull: ["$createdBy", { $ifNull: ["$user", { $ifNull: ["$pentester", { $ifNull: ["$creator", "$reporter"] }] }] }] },
        projectId: { $ifNull: ["$projectId", "$project"] },
        severity: severityExpression(),
        state: findingStateExpression(),
        activityAt: dateExpression("updated"),
      },
    },
    { $match: { reporterId: { $ne: null } } },
    {
      $group: {
        _id: "$reporterId",
        totalFindings: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $in: ["$state", ["verify", "triaged"]] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $in: ["$state", CLOSED_FINDING_STATES] }, 1, 0] } },
        projects: { $addToSet: "$projectId" },
        lastActivity: { $max: "$activityAt" },
      },
    },
    { $lookup: { from: UserModel.collection.name, localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $sort: { totalFindings: -1, lastActivity: -1 } },
    { $limit: 200 },
  ];
  const projectRiskPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    {
      $project: {
        projectId: { $ifNull: ["$projectId", "$project"] },
        severity: severityExpression(),
      },
    },
    { $match: { projectId: { $ne: null } } },
    {
      $group: {
        _id: "$projectId",
        total: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] } },
        info: { $sum: { $cond: [{ $eq: ["$severity", "info"] }, 1, 0] } },
        riskScore: {
          $sum: {
            $switch: {
              branches: Object.entries(RISK_WEIGHTS).map(([severity, weight]) => ({
                case: { $eq: ["$severity", severity] },
                then: weight,
              })),
              default: 0,
            },
          },
        },
      },
    },
    { $lookup: { from: ProjectModel.collection.name, localField: "_id", foreignField: "_id", as: "project" } },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    { $sort: { riskScore: -1, total: -1 } },
    { $limit: 15 },
  ];
  const testerProjectMatrixPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    {
      $project: {
        reporterId: { $ifNull: ["$createdBy", { $ifNull: ["$user", { $ifNull: ["$pentester", { $ifNull: ["$creator", "$reporter"] }] }] }] },
        projectId: { $ifNull: ["$projectId", "$project"] },
        severity: severityExpression(),
      },
    },
    { $match: { reporterId: { $ne: null }, projectId: { $ne: null } } },
    {
      $group: {
        _id: { reporterId: "$reporterId", projectId: "$projectId" },
        findings: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } },
      },
    },
    { $lookup: { from: UserModel.collection.name, localField: "_id.reporterId", foreignField: "_id", as: "tester" } },
    { $lookup: { from: ProjectModel.collection.name, localField: "_id.projectId", foreignField: "_id", as: "project" } },
    { $unwind: { path: "$tester", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    { $sort: { findings: -1, critical: -1 } },
    { $limit: 150 },
  ];
  const categoryPipeline: PipelineStage[] = [
    { $match: combine(currentFindingMatch, { owaspCategory: { $type: "string", $ne: "" } }) },
    { $group: { _id: "$owaspCategory", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ];
  const closedDate = { $ifNull: ["$stateChangedAt", dateExpression("updated")] };
  const openedTrendPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    { $group: { _id: bucketExpression(granularity), count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const closedTrendPipeline: PipelineStage[] = [
    {
      $match: combine(findingFilter, {
        $expr: {
          $and: [
            isClosedExpression(),
            { $gte: [closedDate, window.from] },
            { $lte: [closedDate, window.to] },
          ],
        },
      }),
    },
    { $group: { _id: bucketExpression(granularity, closedDate), count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const resolutionPipeline: PipelineStage[] = [
    { $match: currentFindingMatch },
    { $match: { $expr: isClosedExpression() } },
    {
      $project: {
        severity: severityExpression(),
        durationHours: {
          $divide: [{ $subtract: [closedDate, dateExpression()] }, 3_600_000],
        },
      },
    },
    { $match: { durationHours: { $gte: 0 } } },
    { $group: { _id: "$severity", hours: { $avg: "$durationHours" }, count: { $sum: 1 } } },
  ];
  const activityFilter = combine(
    { createdAt: { $gte: window.from, $lte: window.to } },
    query.project ? { projectId: id(query.project) } : undefined,
    query.tester ? { actorId: id(query.tester) } : undefined,
    { status: { $ne: "failure" } }
  );
  const activityPipeline: PipelineStage[] = [
    { $match: activityFilter },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: 12 },
    { $lookup: { from: UserModel.collection.name, localField: "actorId", foreignField: "_id", as: "actor" } },
    { $lookup: { from: ProjectModel.collection.name, localField: "projectId", foreignField: "_id", as: "project" } },
    { $unwind: { path: "$actor", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
  ];

  const [
    projectSummaryRows,
    findingSummaryRows,
    projectCreatedTrend,
    projectCompletedTrend,
    findingTrend,
    severityRows,
    findingStatusRows,
    projectStatusRows,
    testerRows,
    projectRows,
    testerProjectRows,
    categoryRows,
    openedRows,
    closedRows,
    resolutionRows,
    activityRows,
    filterProjects,
    filterTesters,
    rawFindingStates,
    rawFindingStatuses,
  ] = await Promise.all([
    ProjectModel.aggregate(projectSummaryPipeline),
    VulnerabilityModel.aggregate(findingSummaryPipeline),
    ProjectModel.aggregate<TrendRow>(projectCreatedTrendPipeline),
    ProjectModel.aggregate<TrendRow>(projectCompletedTrendPipeline),
    VulnerabilityModel.aggregate(findingTrendPipeline),
    VulnerabilityModel.aggregate<CountRow>(severityPipeline),
    VulnerabilityModel.aggregate<CountRow>(findingStatusPipeline),
    ProjectModel.aggregate<CountRow>(projectStatusPipeline),
    VulnerabilityModel.aggregate(testerPerformancePipeline),
    VulnerabilityModel.aggregate(projectRiskPipeline),
    VulnerabilityModel.aggregate(testerProjectMatrixPipeline),
    VulnerabilityModel.aggregate<CountRow>(categoryPipeline),
    VulnerabilityModel.aggregate<TrendRow>(openedTrendPipeline),
    VulnerabilityModel.aggregate<TrendRow>(closedTrendPipeline),
    VulnerabilityModel.aggregate(resolutionPipeline),
    AuditLogModel.aggregate(activityPipeline),
    ProjectModel.find({ status: { $ne: PROJECT_STATUS.REMOVED } }).select("projectName").sort({ projectName: 1 }).lean(),
    UserModel.find({ $or: [{ roles: "pentester" }, { security: true }] })
      .select("firstName lastName username")
      .sort({ firstName: 1, lastName: 1 })
      .lean(),
    VulnerabilityModel.distinct("state"),
    VulnerabilityModel.distinct("status"),
  ]);

  const projectCurrent = projectSummaryRows[0]?.current?.[0] || { total: 0, active: 0, completed: 0 };
  const projectPrevious = projectSummaryRows[0]?.previous?.[0] || { total: 0, active: 0, completed: 0 };
  const findingCurrent = findingSummaryRows[0]?.current?.[0] || {
    total: 0,
    critical: 0,
    high: 0,
    closed: 0,
    confirmed: 0,
  };
  const findingPrevious = findingSummaryRows[0]?.previous?.[0] || {
    total: 0,
    critical: 0,
    high: 0,
    closed: 0,
  };
  const activeTesters = testerRows.length;
  const closureRate = findingCurrent.total
    ? Number(((findingCurrent.closed / findingCurrent.total) * 100).toFixed(1))
    : 0;
  const resolutionBySeverity = Object.fromEntries(
    resolutionRows.map((row) => [String(row._id), Number(Number(row.hours).toFixed(1))])
  );
  const totalResolutionCount = resolutionRows.reduce((sum, row) => sum + Number(row.count), 0);
  const mttrHours = totalResolutionCount
    ? Number(
        (
          resolutionRows.reduce((sum, row) => sum + Number(row.hours) * Number(row.count), 0) /
          totalResolutionCount
        ).toFixed(1)
      )
    : null;

  const kpi = (id: string, value: number | null, previous: number | null, unit: "count" | "percent" | "hours" = "count") => ({
    id,
    value,
    previous,
    changePercent: value === null || previous === null ? null : percentChange(value, previous),
    unit,
  });

  return {
    meta: {
      from: window.from,
      to: window.to,
      previousFrom: window.previousFrom,
      previousTo: window.previousTo,
      granularity,
      generatedAt: new Date(),
      riskFormula: "critical*10 + high*6 + medium*3 + low*1 + info*0.5",
      limitations: [
        "The finding model has no immutable state history, so reopened and retest metrics are unavailable.",
        "MTTR uses stateChangedAt, falling back to updatedAt for legacy closed findings.",
      ],
    },
    filters: {
      projects: filterProjects.map((project) => ({ id: String(project._id), name: project.projectName })),
      testers: filterTesters.map((user) => ({
        id: String(user._id),
        name: `${user.firstName} ${user.lastName}`.trim() || user.username,
      })),
      severities: VULNERABILITY_SEVERITY_VALUES,
      findingStatuses: [...new Set(
        [...rawFindingStates, ...rawFindingStatuses]
          .filter(Boolean)
          .map((value) => normalizeBugReviewState(value))
          .map(String)
      )].sort(),
      projectStatuses: PROJECT_STATUS_VALUES,
    },
    kpis: [
      kpi("totalProjects", projectCurrent.total, projectPrevious.total),
      kpi("activeProjects", projectCurrent.active, projectPrevious.active),
      kpi("completedProjects", projectCurrent.completed, projectPrevious.completed),
      kpi("totalFindings", findingCurrent.total, findingPrevious.total),
      kpi("criticalFindings", findingCurrent.critical, findingPrevious.critical),
      kpi("highFindings", findingCurrent.high, findingPrevious.high),
      kpi("openFindings", findingCurrent.total - findingCurrent.closed, findingPrevious.total - findingPrevious.closed),
      kpi("closedFindings", findingCurrent.closed, findingPrevious.closed),
      kpi("activeTesters", activeTesters, null),
      kpi(
        "averageFindingsPerProject",
        projectCurrent.total ? Number((findingCurrent.total / projectCurrent.total).toFixed(1)) : 0,
        projectPrevious.total ? Number((findingPrevious.total / projectPrevious.total).toFixed(1)) : 0
      ),
      kpi("closureRate", closureRate, null, "percent"),
      kpi("mttr", mttrHours, null, "hours"),
    ],
    projectTrend: projectCreatedTrend.map((row) => ({ period: row._id, created: row.count })),
    findingTrend: findingTrend.map((row) => ({ period: row._id, ...row, _id: undefined })),
    severityDistribution: normalizeCountRows(severityRows),
    findingStatusDistribution: normalizeCountRows(findingStatusRows),
    projectStatusDistribution: normalizeCountRows(projectStatusRows),
    completionTrend: mergeTwoTrends(projectCreatedTrend, projectCompletedTrend, "created", "completed"),
    closureTrend: mergeTwoTrends(openedRows, closedRows, "opened", "closed"),
    resolution: { mttrHours, bySeverity: resolutionBySeverity, sampleSize: totalResolutionCount },
    testerPerformance: testerRows.map((row) => {
      const projects = (row.projects || []).filter(Boolean);
      return {
        id: String(row._id),
        name: row.user ? `${row.user.firstName} ${row.user.lastName}`.trim() : "Unknown tester",
        username: row.user?.username,
        projects: projects.length,
        totalFindings: row.totalFindings,
        critical: row.critical,
        high: row.high,
        medium: row.medium,
        low: row.low,
        confirmed: row.confirmed,
        rejected: row.rejected,
        averagePerProject: projects.length ? Number((row.totalFindings / projects.length).toFixed(1)) : 0,
        lastActivity: row.lastActivity,
      };
    }),
    projectRisk: projectRows.map((row) => ({
      id: String(row._id),
      name: row.project?.projectName || "Unknown project",
      total: row.total,
      critical: row.critical,
      high: row.high,
      medium: row.medium,
      low: row.low,
      info: row.info,
      riskScore: row.riskScore,
    })),
    testerProjectMatrix: testerProjectRows.map((row) => ({
      testerId: String(row._id.reporterId),
      testerName: row.tester
        ? `${row.tester.firstName} ${row.tester.lastName}`.trim()
        : "Unknown tester",
      projectId: String(row._id.projectId),
      projectName: row.project?.projectName || "Unknown project",
      findings: row.findings,
      critical: row.critical,
      high: row.high,
    })),
    categories: normalizeCountRows(categoryRows),
    recentActivity: activityRows.map((row) => ({
      id: String(row._id),
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      actor: row.actor
        ? { id: String(row.actor._id), name: `${row.actor.firstName} ${row.actor.lastName}`.trim() }
        : undefined,
      project: row.project
        ? { id: String(row.project._id), name: row.project.projectName }
        : undefined,
      createdAt: row.createdAt,
    })),
  };
}
