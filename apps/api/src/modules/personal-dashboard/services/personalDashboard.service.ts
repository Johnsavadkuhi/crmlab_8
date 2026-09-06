import mongoose, { type PipelineStage, type QueryFilter } from "mongoose";
import { PERMISSIONS } from "@/constants/permissions";
import {
  PROJECT_ASSIGNMENT_ROLES,
  PROJECT_STATUS,
  PROJECT_TYPES,
} from "@/constants/projects";
import { TASK_STATUSES } from "@/constants/tasks";
import { AuditLogModel } from "@/modules/audit/models/auditLog.model";
import { ProjectDevopsInfoModel } from "@/modules/devops/models/projectDevopsInfo.model";
import { VulnerabilityModel } from "@/modules/pentest/models/vulnerability.model";
import {
  ProjectModel,
  type ProjectDocument,
} from "@/modules/projects/models/project.model";
import { ProjectAssignmentModel } from "@/modules/projects/models/projectAssignment.model";
import { getAccessibleProjectIds } from "@/middlewares/projectAccess.middleware";
import { TaskModel } from "@/modules/tasks/models/task.model";

export type PersonalDashboardCapability =
  | "testing"
  | "qa"
  | "quality"
  | "devops"
  | "security"
  | "representative";

const finishedStatuses = [
  PROJECT_STATUS.FINISHED,
  PROJECT_STATUS.CLOSED,
  PROJECT_STATUS.REMOVED,
];
const openTaskStatuses = [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS];

const scopeDefinitions: Record<
  PersonalDashboardCapability,
  {
    assignmentRoles: string[];
    assignmentUserFields: string[];
    projectFields: string[];
    projectTypes?: string[];
    allowLegacyPentester?: boolean;
  }
> = {
  testing: {
    assignmentRoles: [PROJECT_ASSIGNMENT_ROLES.PENTESTER],
    assignmentUserFields: ["userId", "pentester"],
    projectFields: ["assignedUserIds"],
    projectTypes: [PROJECT_TYPES.SECURITY],
    allowLegacyPentester: true,
  },
  qa: {
    assignmentRoles: [PROJECT_ASSIGNMENT_ROLES.QA],
    assignmentUserFields: ["userId"],
    projectFields: [],
    projectTypes: [PROJECT_TYPES.QUALITY],
  },
  quality: {
    assignmentRoles: [
      PROJECT_ASSIGNMENT_ROLES.QUALITY_MANAGER,
      PROJECT_ASSIGNMENT_ROLES.MANAGER,
    ],
    assignmentUserFields: ["userId", "managerId", "manager"],
    projectFields: ["qualityManager", "projectManager"],
    projectTypes: [PROJECT_TYPES.QUALITY],
  },
  devops: {
    assignmentRoles: [
      PROJECT_ASSIGNMENT_ROLES.DEVOPS,
      PROJECT_ASSIGNMENT_ROLES.DEVOPS_MANAGER,
    ],
    assignmentUserFields: ["userId"],
    projectFields: ["devops"],
  },
  security: {
    assignmentRoles: [
      PROJECT_ASSIGNMENT_ROLES.SECURITY_MANAGER,
      PROJECT_ASSIGNMENT_ROLES.MANAGER,
    ],
    assignmentUserFields: ["userId", "managerId", "manager"],
    projectFields: ["projectManager"],
    projectTypes: [PROJECT_TYPES.SECURITY],
  },
  representative: {
    assignmentRoles: [PROJECT_ASSIGNMENT_ROLES.REPRESENTATIVE],
    assignmentUserFields: ["userId"],
    projectFields: ["representative", "ownerId"],
  },
};

function projectTypeFilter(types?: string[]) {
  return types?.length
    ? { $or: [{ type: { $in: types } }, { projectType: { $in: types } }] }
    : undefined;
}

export function buildCapabilityAssignmentFilter(
  userId: string,
  capability: PersonalDashboardCapability
) {
  const definition = scopeDefinitions[capability];
  const roleConditions: Record<string, unknown>[] = [
    { assignmentRole: { $in: definition.assignmentRoles } },
  ];
  if (definition.allowLegacyPentester) {
    roleConditions.push({ assignmentRole: { $exists: false }, pentester: userId });
  }
  return {
    $and: [
      { $or: definition.assignmentUserFields.map((field) => ({ [field]: userId })) },
      { $or: roleConditions },
      { status: { $ne: PROJECT_STATUS.REMOVED } },
    ],
  };
}

export function buildCapabilityProjectFilter(
  userId: string,
  capability: PersonalDashboardCapability
) {
  const definition = scopeDefinitions[capability];
  const ownership = definition.projectFields.map((field) => ({ [field]: userId }));
  // Capabilities without a canonical direct-owner field must be resolved only
  // through an explicit ProjectAssignment row. Never fall back to all projects
  // of that discipline.
  if (!ownership.length) return { _id: { $in: [] } };
  const typeFilter = projectTypeFilter(definition.projectTypes);
  const filters: Record<string, unknown>[] = [
    { status: { $ne: PROJECT_STATUS.REMOVED } },
    { $or: ownership },
    ...(typeFilter ? [typeFilter] : []),
  ];
  return filters.length === 1 ? filters[0] : { $and: filters };
}

export function buildOwnFindingFilter(
  userId: string,
  projectIds: mongoose.Types.ObjectId[]
) {
  return {
    $and: [
      {
        $or: [
          { createdBy: userId },
          { user: userId },
          { pentester: userId },
          { creator: userId },
          { reporter: userId },
        ],
      },
      { $or: [{ projectId: { $in: projectIds } }, { project: { $in: projectIds } }] },
    ],
  };
}

export async function getCapabilityProjectIds(
  userId: string,
  capability: PersonalDashboardCapability
) {
  const definition = scopeDefinitions[capability];
  const [assignments, directProjects] = await Promise.all([
    ProjectAssignmentModel.find(buildCapabilityAssignmentFilter(userId, capability))
      .select("projectId project")
      .lean(),
    definition.projectFields.length
      ? ProjectModel.find(
          buildCapabilityProjectFilter(userId, capability) as QueryFilter<ProjectDocument>
        )
          .select("_id")
          .lean()
      : Promise.resolve([]),
  ]);
  const candidateIds = [
    ...new Set([
      ...assignments.flatMap((assignment) => {
        const projectId = assignment.projectId || assignment.project;
        return projectId ? [String(projectId)] : [];
      }),
      ...directProjects.map((project) => String(project._id)),
    ]),
  ]
    .filter(mongoose.isValidObjectId)
    .map((value) => new mongoose.Types.ObjectId(value));
  if (!candidateIds.length) return [];

  const typeFilter = projectTypeFilter(definition.projectTypes);
  const scoped = await ProjectModel.find({
    ...projectSelection(candidateIds),
    ...(typeFilter || {}),
  })
    .select("_id")
    .lean();
  return scoped.map((project) => project._id);
}

function projectSelection(projectIds?: mongoose.Types.ObjectId[]) {
  return projectIds
    ? { _id: { $in: projectIds }, status: { $ne: PROJECT_STATUS.REMOVED } }
    : { status: { $ne: PROJECT_STATUS.REMOVED } };
}

function serializeProject(project: Record<string, unknown>) {
  return {
    id: String(project._id),
    name: String(project.projectName || "Untitled project"),
    type:
      project.type ||
      (Array.isArray(project.projectType) ? project.projectType[0] : project.projectType),
    status: project.status,
    provisioningStatus: project.provisioningStatus,
    deadline: project.testExpiresAt || project.expireDay || project.expireDayQuality,
    updatedAt: project.updatedAt,
  };
}

function serializeTask(task: Record<string, unknown>) {
  return {
    id: String(task._id),
    title: String(task.title || "Task"),
    status: task.status,
    priority: task.priority,
    deadline: task.deadline,
  };
}

async function scopedProjects(projectIds: mongoose.Types.ObjectId[], limit = 50) {
  return ProjectModel.find(projectSelection(projectIds))
    .select(
      "projectName type projectType status provisioningStatus testExpiresAt expireDay expireDayQuality updatedAt"
    )
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
}

async function personalTasks(userId: string, limit = 12) {
  return TaskModel.find({ assigneeId: userId })
    .select("title status priority deadline")
    .sort({ deadline: 1 })
    .limit(limit)
    .lean();
}

export async function getBaseDashboard(user: Express.UserContext) {
  const accessibleIds = await getAccessibleProjectIds(user);
  const projectFilter = projectSelection(accessibleIds);
  const now = new Date();
  const deadlineLimit = new Date(now.getTime() + 14 * 86_400_000);
  const deadlineFilter = {
    ...projectFilter,
    $or: [
      { testExpiresAt: { $gte: now, $lte: deadlineLimit } },
      { expireDay: { $gte: now, $lte: deadlineLimit } },
      { expireDayQuality: { $gte: now, $lte: deadlineLimit } },
    ],
  };
  const [
    projects,
    tasks,
    activity,
    assignedProjects,
    openTasks,
    upcomingDeadlines,
    upcoming,
  ] = await Promise.all([
    ProjectModel.find(projectSelection(accessibleIds))
      .select(
        "projectName type projectType status provisioningStatus testExpiresAt expireDay expireDayQuality updatedAt"
      )
      .sort({ updatedAt: -1 })
      .limit(12)
      .lean(),
    personalTasks(user.id),
    AuditLogModel.find({ actorId: user.id, status: { $ne: "failure" } })
      .select("action entityType entityId projectId createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(8)
      .lean(),
    ProjectModel.countDocuments(projectFilter),
    TaskModel.countDocuments({ assigneeId: user.id, status: { $in: openTaskStatuses } }),
    ProjectModel.countDocuments(deadlineFilter),
    ProjectModel.find(deadlineFilter)
      .select(
        "projectName type projectType status provisioningStatus testExpiresAt expireDay expireDayQuality updatedAt"
      )
      .sort({ testExpiresAt: 1, expireDay: 1, expireDayQuality: 1 })
      .limit(8)
      .lean(),
  ]);
  return {
    projects: projects.map((project) =>
      serializeProject(project as unknown as Record<string, unknown>)
    ),
    tasks: tasks.map((task) => serializeTask(task as unknown as Record<string, unknown>)),
    summary: {
      assignedProjects,
      openTasks,
      upcomingDeadlines,
    },
    upcomingDeadlines: upcoming.map((project) =>
      serializeProject(project as unknown as Record<string, unknown>)
    ),
    recentActivity: activity.map((item) => ({
      id: String(item._id),
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      projectId: item.projectId ? String(item.projectId) : undefined,
      createdAt: item.createdAt,
    })),
  };
}

function severityExpression() {
  return {
    $toLower: { $ifNull: ["$severity", { $ifNull: ["$cvss.severity", "info"] }] },
  };
}

function stateExpression() {
  return { $toLower: { $ifNull: ["$state", { $ifNull: ["$status", "new"] }] } };
}

export async function getTestingDashboard(user: Express.UserContext) {
  const projectIds = await getCapabilityProjectIds(user.id, "testing");
  const findingFilter = buildOwnFindingFilter(user.id, projectIds);
  const since = new Date(Date.now() - 29 * 86_400_000);
  const pipeline: PipelineStage[] = [
    { $match: findingFilter },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              critical: {
                $sum: { $cond: [{ $eq: [severityExpression(), "critical"] }, 1, 0] },
              },
              high: { $sum: { $cond: [{ $eq: [severityExpression(), "high"] }, 1, 0] } },
              revisionRequired: {
                $sum: {
                  $cond: [{ $eq: [stateExpression(), "need more information"] }, 1, 0],
                },
              },
              verified: {
                $sum: {
                  $cond: [{ $in: [stateExpression(), ["verify", "triaged"]] }, 1, 0],
                },
              },
            },
          },
        ],
        severity: [
          { $group: { _id: severityExpression(), value: { $sum: 1 } } },
          { $sort: { value: -1 } },
        ],
        status: [
          { $group: { _id: stateExpression(), value: { $sum: 1 } } },
          { $sort: { value: -1 } },
        ],
        categories: [
          { $match: { owaspCategory: { $type: "string", $ne: "" } } },
          { $group: { _id: "$owaspCategory", value: { $sum: 1 } } },
          { $sort: { value: -1 } },
          { $limit: 8 },
        ],
        trend: [
          {
            $match: {
              $or: [
                { createdAt: { $gte: since } },
                { createdAt: { $exists: false }, created_at: { $gte: since } },
              ],
            },
          },
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: { $ifNull: ["$createdAt", "$created_at"] },
                  unit: "day",
                  timezone: "UTC",
                },
              },
              value: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        recent: [
          { $sort: { createdAt: -1, created_at: -1 } },
          { $limit: 8 },
          {
            $project: {
              title: { $ifNull: ["$title", { $ifNull: ["$bugTitle", "$label"] }] },
              severity: severityExpression(),
              state: stateExpression(),
              projectId: { $ifNull: ["$projectId", "$project"] },
              createdAt: { $ifNull: ["$createdAt", "$created_at"] },
            },
          },
          {
            $lookup: {
              from: ProjectModel.collection.name,
              localField: "projectId",
              foreignField: "_id",
              as: "project",
            },
          },
          { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
        ],
      },
    },
  ];
  const [rows, projects] = await Promise.all([
    VulnerabilityModel.aggregate(pipeline),
    scopedProjects(projectIds, 20),
  ]);
  const row = rows[0] || {};
  return {
    summary: row.summary?.[0] || {
      total: 0,
      critical: 0,
      high: 0,
      revisionRequired: 0,
      verified: 0,
    },
    severity: (row.severity || []).map((item: { _id: string; value: number }) => ({
      key: item._id,
      value: item.value,
    })),
    status: (row.status || []).map((item: { _id: string; value: number }) => ({
      key: item._id,
      value: item.value,
    })),
    categories: (row.categories || []).map((item: { _id: string; value: number }) => ({
      key: item._id,
      value: item.value,
    })),
    trend: (row.trend || []).map((item: { _id: Date; value: number }) => ({
      period: item._id,
      value: item.value,
    })),
    recentFindings: (row.recent || []).map(
      (item: Record<string, unknown> & { project?: { projectName?: string } }) => ({
        id: String(item._id),
        title: item.title,
        severity: item.severity,
        state: item.state,
        projectId: String(item.projectId),
        projectName: item.project?.projectName,
        createdAt: item.createdAt,
      })
    ),
    projects: projects.map((project) =>
      serializeProject(project as unknown as Record<string, unknown>)
    ),
  };
}

async function workCapabilityDashboard(
  user: Express.UserContext,
  capability: PersonalDashboardCapability
) {
  const projectIds = await getCapabilityProjectIds(user.id, capability);
  const [projects, assignedProjects, activeProjects] = await Promise.all([
    scopedProjects(projectIds),
    ProjectModel.countDocuments(projectSelection(projectIds)),
    ProjectModel.countDocuments({
      ...projectSelection(projectIds),
      status: { $nin: finishedStatuses },
    }),
  ]);
  return {
    summary: {
      assignedProjects,
      activeProjects,
      pendingTasks: 0,
      completedTasks: 0,
    },
    projects: projects.map((project) =>
      serializeProject(project as unknown as Record<string, unknown>)
    ),
    tasks: [],
    taskMetricsAvailable: false,
  };
}

export async function getQaDashboard(user: Express.UserContext) {
  return {
    ...(await workCapabilityDashboard(user, "qa")),
    reviewMetricsAvailable: false,
  };
}

export async function getQualityDashboard(user: Express.UserContext) {
  return {
    ...(await workCapabilityDashboard(user, "quality")),
    reviewMetricsAvailable: false,
  };
}

export async function getRepresentativeDashboard(user: Express.UserContext) {
  return {
    ...(await workCapabilityDashboard(user, "representative")),
    reviewMetricsAvailable: false,
  };
}

export async function getDevopsDashboard(user: Express.UserContext) {
  const projectIds = await getCapabilityProjectIds(user.id, "devops");
  const [projects, configuredProjectIds, statusRows, assignedProjects] =
    await Promise.all([
      scopedProjects(projectIds),
      ProjectDevopsInfoModel.distinct("projectId", { projectId: { $in: projectIds } }),
      ProjectModel.aggregate([
        { $match: projectSelection(projectIds) },
        {
          $group: {
            _id: { $ifNull: ["$provisioningStatus", "AWAITING_DEVOPS_SETUP"] },
            value: { $sum: 1 },
          },
        },
      ]),
      ProjectModel.countDocuments(projectSelection(projectIds)),
    ]);
  const configured = new Set(configuredProjectIds.map(String));
  const statusCounts = Object.fromEntries(
    statusRows.map((row) => [String(row._id), row.value])
  );
  return {
    summary: {
      assignedProjects,
      configuredEnvironments: configured.size,
      pendingSetup: assignedProjects - (statusCounts.DEVOPS_READY || 0),
      blocked: statusCounts.DEVOPS_BLOCKED || 0,
      pendingTasks: 0,
    },
    statusCounts,
    projects: projects.map((project) => ({
      ...serializeProject(project as unknown as Record<string, unknown>),
      environmentConfigured: configured.has(String(project._id)),
    })),
    tasks: [],
    taskMetricsAvailable: false,
  };
}

export async function getSecurityManagementDashboard(user: Express.UserContext) {
  const projectIds = await getCapabilityProjectIds(user.id, "security");
  const canReadFindings = user.permissions.includes(
    PERMISSIONS.SECURITY_VULNERABILITIES_READ
  );
  const [projects, assignments, findings, assignedProjects, activeProjects] =
    await Promise.all([
      scopedProjects(projectIds),
      ProjectAssignmentModel.aggregate([
        {
          $match: {
            $or: [{ projectId: { $in: projectIds } }, { project: { $in: projectIds } }],
            assignmentRole: PROJECT_ASSIGNMENT_ROLES.PENTESTER,
            status: { $ne: PROJECT_STATUS.REMOVED },
          },
        },
        {
          $group: { _id: { $ifNull: ["$projectId", "$project"] }, testers: { $sum: 1 } },
        },
      ]),
      canReadFindings
        ? VulnerabilityModel.aggregate([
            {
              $match: {
                $or: [
                  { projectId: { $in: projectIds } },
                  { project: { $in: projectIds } },
                ],
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                critical: {
                  $sum: { $cond: [{ $eq: [severityExpression(), "critical"] }, 1, 0] },
                },
                high: {
                  $sum: { $cond: [{ $eq: [severityExpression(), "high"] }, 1, 0] },
                },
              },
            },
          ])
        : Promise.resolve([]),
      ProjectModel.countDocuments(projectSelection(projectIds)),
      ProjectModel.countDocuments({
        ...projectSelection(projectIds),
        status: { $nin: finishedStatuses },
      }),
    ]);
  const testersByProject = new Map(
    assignments.map((row) => [String(row._id), row.testers])
  );
  return {
    summary: {
      assignedProjects,
      activeProjects,
      projectsWithoutTesters: Math.max(0, assignedProjects - testersByProject.size),
    },
    projects: projects.map((project) => ({
      ...serializeProject(project as unknown as Record<string, unknown>),
      testerCount: testersByProject.get(String(project._id)) || 0,
    })),
    ...(canReadFindings
      ? { findings: findings[0] || { total: 0, critical: 0, high: 0 } }
      : {}),
  };
}
