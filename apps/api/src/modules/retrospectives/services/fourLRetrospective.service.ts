import mongoose from "mongoose";
import {
  FOUR_L_STATUSES,
  type FourLActorCapabilitiesContract,
  type FourLDraftInputContract,
  type FourLStatus,
  type FourLWorkGateContract,
} from "@role-dashboard/contracts";
import { HTTP_STATUS } from "@/constants/http";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/constants/notifications";
import { PERMISSIONS } from "@/constants/permissions";
import {
  PROJECT_ASSIGNMENT_ROLES,
  PROJECT_ASSIGNMENT_STATUS,
  PROJECT_STATUS,
  PROJECT_TYPES,
} from "@/constants/projects";
import { ROUTES } from "@/constants/routes";
import {
  createNotifications,
  type CreateNotificationInput,
} from "@/modules/notifications/services/notification.service";
import { ProjectModel } from "@/modules/projects/models/project.model";
import { ProjectAssignmentModel } from "@/modules/projects/models/projectAssignment.model";
import { getEffectiveProjectType } from "@/modules/projects/services/project.mapper";
import { AppError } from "@/utils/AppError";
import {
  FourLRetrospectiveModel,
  type FourLRetrospectiveDocument,
} from "../models/fourLRetrospective.model";
import { fourLSubmissionSchema } from "../validators/fourLRetrospective.validators";

const BLOCKING_STATUSES: readonly FourLStatus[] = [
  FOUR_L_STATUSES.DRAFT,
  FOUR_L_STATUSES.CHANGES_REQUESTED,
];

const CLOSED_PROJECT_STATUSES = [PROJECT_STATUS.CLOSED, PROJECT_STATUS.FINISHED];

export async function deliverPendingFourLNotifications(
  record: FourLRetrospectiveDocument
) {
  const pending = [...(record.pendingNotifications || [])];
  if (!pending.length) return;
  try {
    await createNotifications(
      pending.map((item) => item.toObject()) as CreateNotificationInput[]
    );
    await FourLRetrospectiveModel.updateOne(
      { _id: record._id },
      {
        $pull: {
          pendingNotifications: {
            dedupeKey: { $in: pending.map((item) => item.dedupeKey) },
          },
        },
      },
      { timestamps: false }
    );
    const deliveredKeys = new Set(pending.map((item) => item.dedupeKey));
    record.set(
      "pendingNotifications",
      record.pendingNotifications.filter((item) => !deliveredKeys.has(item.dedupeKey))
    );
  } catch (error) {
    // The persisted outbox is retried on later reads. Deduplication makes retries
    // safe even if delivery succeeded but clearing the outbox failed.
    console.error("4L notification delivery will be retried", String(record._id), error);
  }
}

export function isFourLStatusBlockingWork(status: FourLStatus) {
  return BLOCKING_STATUSES.includes(status);
}

export function canLabAdminViewFourL(status: FourLStatus) {
  return status === FOUR_L_STATUSES.SENT_TO_ADMIN;
}

export function sanitizeFourLDraftInput(
  input: FourLDraftInputContract
): FourLDraftInputContract {
  return {
    rating: input.rating,
    wouldChange: input.wouldChange,
    liked: { text: input.liked.text, notApplicable: input.liked.notApplicable },
    lacked: { text: input.lacked.text, notApplicable: input.lacked.notApplicable },
    learned: { text: input.learned.text, notApplicable: input.learned.notApplicable },
    longedFor: {
      text: input.longedFor.text,
      notApplicable: input.longedFor.notApplicable,
    },
    needsFollowUp: input.needsFollowUp,
    categories: [...input.categories],
    biggestObstacle: input.biggestObstacle,
    actionItems: input.actionItems.map((item) => ({
      id: item.id,
      description: item.description,
      ownerId: item.ownerId,
      priority: item.priority,
      dueDate: item.dueDate,
      status: item.status,
    })),
    acknowledged: input.acknowledged,
  };
}

export function retrospectiveSubmissionIssues(input: FourLDraftInputContract) {
  const result = fourLSubmissionSchema.safeParse(sanitizeFourLDraftInput(input));
  return result.success
    ? []
    : result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
}

export function resolveFourLActorCapabilities(input: {
  status: FourLStatus;
  isOwner: boolean;
  isRepresentative: boolean;
  isAdmin: boolean;
}): FourLActorCapabilitiesContract {
  const editable = [FOUR_L_STATUSES.DRAFT, FOUR_L_STATUSES.CHANGES_REQUESTED].includes(
    input.status as typeof FOUR_L_STATUSES.DRAFT
  );
  const submitted = input.status === FOUR_L_STATUSES.SUBMITTED;
  const approved = input.status === FOUR_L_STATUSES.APPROVED;
  const sent = input.status === FOUR_L_STATUSES.SENT_TO_ADMIN;
  return {
    canEdit: input.isOwner && editable,
    canSubmit: input.isOwner && editable,
    canRequestChanges: input.isRepresentative && (submitted || approved),
    canApprove: input.isRepresentative && submitted,
    canSendToAdmin: input.isRepresentative && approved,
    canReopen: input.isRepresentative && sent,
  };
}

function projectClosedAt(project: Record<string, unknown>, fallback: Date) {
  const value =
    project.manuallyClosedAt ||
    project.deadlineExpiredAt ||
    project.testExpiresAt ||
    project.expireDay ||
    project.expireDayQuality;
  const date = value ? new Date(String(value)) : fallback;
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function ensureFourLRetrospectivesForClosedProjects(
  projectIds: readonly string[],
  now = new Date()
) {
  const validIds = [...new Set(projectIds)].filter((id) => mongoose.isValidObjectId(id));
  if (!validIds.length) return [];

  const candidates = await ProjectModel.find({
    _id: { $in: validIds },
    status: { $in: CLOSED_PROJECT_STATUSES },
  })
    .select(
      "type projectType projectName letterNumber representative status manuallyClosedAt deadlineExpiredAt testExpiresAt expireDay expireDayQuality"
    )
    .lean();
  const projects = candidates.filter(
    (project) => getEffectiveProjectType(project) === PROJECT_TYPES.SECURITY
  );
  if (!projects.length) return [];

  const projectById = new Map(projects.map((project) => [String(project._id), project]));
  const assignments = await ProjectAssignmentModel.find({
    status: { $ne: PROJECT_ASSIGNMENT_STATUS.REMOVED },
    $and: [
      {
        $or: [
          { projectId: { $in: [...projectById.keys()] } },
          { project: { $in: [...projectById.keys()] } },
        ],
      },
      {
        $or: [
          { assignmentRole: PROJECT_ASSIGNMENT_ROLES.PENTESTER },
          { assignmentRole: { $exists: false }, pentester: { $exists: true } },
        ],
      },
    ],
  })
    .select("projectId project userId pentester assignmentRole status")
    .lean();

  const records = await Promise.all(
    assignments.flatMap((assignment) => {
      const projectId = String(assignment.projectId || assignment.project || "");
      const pentesterId = String(assignment.userId || assignment.pentester || "");
      const project = projectById.get(projectId);
      if (!project || !mongoose.isValidObjectId(pentesterId)) return [];
      return [
        FourLRetrospectiveModel.findOneAndUpdate(
          { projectId, pentesterId },
          {
            $setOnInsert: {
              projectId,
              pentesterId,
              projectName: project.projectName || "Security project",
              projectLetterNumber: project.letterNumber,
              projectClosedAt: projectClosedAt(project as Record<string, unknown>, now),
              status: FOUR_L_STATUSES.DRAFT,
              createdAt: now,
              updatedAt: now,
            },
            ...(project.representative
              ? { $set: { representativeId: project.representative } }
              : {}),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: false }
        ),
      ];
    })
  );

  await Promise.all(records.map(deliverPendingFourLNotifications));
  try {
    await createNotifications(
      records
        .filter((record) => record.status === FOUR_L_STATUSES.DRAFT)
        .map((record) => ({
          userId: String(record.pentesterId),
          projectId: String(record.projectId),
          type: NOTIFICATION_TYPES.RETROSPECTIVE_REQUIRED,
          title: "4L retrospective required",
          message: `Complete the 4L retrospective for ${record.projectName} before starting work on another project.`,
          priority: NOTIFICATION_PRIORITIES.HIGH,
          actionUrl: ROUTES.FRONTEND.FOUR_L_RETROSPECTIVE(String(record._id)),
          entityId: String(record._id),
          dedupeKey: `${NOTIFICATION_TYPES.RETROSPECTIVE_REQUIRED}:${record._id}`,
          data: {
            retrospectiveId: String(record._id),
            projectId: String(record.projectId),
          },
        }))
    );
  } catch (error) {
    // Required-form notifications are idempotently recreated on the next check.
    console.error("4L required notifications will be retried", error);
  }

  return records;
}

async function closedProjectIdsForPentester(userId: string) {
  const assignments = await ProjectAssignmentModel.find({
    status: { $ne: PROJECT_ASSIGNMENT_STATUS.REMOVED },
    $and: [
      { $or: [{ userId }, { pentester: userId }] },
      {
        $or: [
          { assignmentRole: PROJECT_ASSIGNMENT_ROLES.PENTESTER },
          { assignmentRole: { $exists: false }, pentester: { $exists: true } },
        ],
      },
    ],
  })
    .select("projectId project")
    .lean();
  const assignedIds = assignments
    .map((assignment) => String(assignment.projectId || assignment.project || ""))
    .filter((id) => mongoose.isValidObjectId(id));
  if (!assignedIds.length) return [];
  const projects = await ProjectModel.find({
    _id: { $in: assignedIds },
    status: { $in: CLOSED_PROJECT_STATUSES },
  })
    .select("_id type projectType")
    .lean();
  return projects
    .filter((project) => getEffectiveProjectType(project) === PROJECT_TYPES.SECURITY)
    .map((project) => String(project._id));
}

export async function ensureFourLRetrospectivesForActor(actor: Express.UserContext) {
  const projectIds = new Set<string>();
  if (actor.permissions.includes(PERMISSIONS.PENTEST_PROJECTS_READ)) {
    (await closedProjectIdsForPentester(actor.id)).forEach((id) => projectIds.add(id));
  }
  if (actor.permissions.includes(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ)) {
    const projects = await ProjectModel.find({
      representative: actor.id,
      status: { $in: CLOSED_PROJECT_STATUSES },
    })
      .select("_id type projectType")
      .lean();
    projects
      .filter((project) => getEffectiveProjectType(project) === PROJECT_TYPES.SECURITY)
      .forEach((project) => projectIds.add(String(project._id)));
  }
  return ensureFourLRetrospectivesForClosedProjects([...projectIds]);
}

export async function getFourLWorkGate(userId: string): Promise<FourLWorkGateContract> {
  const projectIds = await closedProjectIdsForPentester(userId);
  await ensureFourLRetrospectivesForClosedProjects(projectIds);
  const records = await FourLRetrospectiveModel.find({
    pentesterId: userId,
    projectId: { $in: projectIds },
    status: { $in: BLOCKING_STATUSES },
  })
    .select("_id projectId projectName status projectClosedAt")
    .sort({ projectClosedAt: 1, _id: 1 })
    .lean();
  const blockers = records.map((record) => ({
    retrospectiveId: String(record._id),
    projectId: String(record.projectId),
    projectName: record.projectName,
    status: record.status as FourLStatus,
    actionUrl: ROUTES.FRONTEND.FOUR_L_RETROSPECTIVE(String(record._id)),
  }));
  return { blocked: blockers.length > 0, blockers };
}

export async function assertFourLWorkGateOpen(userId: string, projectId: string) {
  const isAssignedPentester = await ProjectAssignmentModel.exists({
    status: { $ne: PROJECT_ASSIGNMENT_STATUS.REMOVED },
    $and: [
      { $or: [{ projectId }, { project: projectId }] },
      { $or: [{ userId }, { pentester: userId }] },
      {
        $or: [
          { assignmentRole: PROJECT_ASSIGNMENT_ROLES.PENTESTER },
          { assignmentRole: { $exists: false }, pentester: { $exists: true } },
        ],
      },
    ],
  });
  if (!isAssignedPentester) return;
  const gate = await getFourLWorkGate(userId);
  // An individual deadline extension can allow work on this same project.
  // The retrospective gate applies to work on other projects.
  const blocker = gate.blockers.find((item) => item.projectId !== projectId);
  if (!blocker) return;
  const error = new AppError(
    `Complete the required 4L retrospective for ${blocker.projectName} before starting new project work`,
    HTTP_STATUS.CONFLICT
  ) as AppError & { code: string };
  error.code = "FOUR_L_RETROSPECTIVE_REQUIRED";
  throw error;
}
