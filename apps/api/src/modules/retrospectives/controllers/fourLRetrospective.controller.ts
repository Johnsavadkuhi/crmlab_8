import type { RequestHandler } from "express";
import mongoose from "mongoose";
import {
  FOUR_L_STATUSES,
  type FourLRetrospectiveContract,
  type FourLStatus,
} from "@role-dashboard/contracts";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/constants/notifications";
import { PERMISSIONS } from "@/constants/permissions";
import { PROJECT_ASSIGNMENT_STATUS, PROJECT_STATUS } from "@/constants/projects";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import type { CreateNotificationInput } from "@/modules/notifications/services/notification.service";
import { ProjectModel } from "@/modules/projects/models/project.model";
import { ProjectAssignmentModel } from "@/modules/projects/models/projectAssignment.model";
import { closeExpiredProjects } from "@/modules/projects/services/projectProvisioning.service";
import { UserModel } from "@/modules/users/models/user.model";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/response";
import {
  FourLRetrospectiveModel,
  type FourLRetrospectiveDocument,
} from "../models/fourLRetrospective.model";
import {
  canLabAdminViewFourL,
  deliverPendingFourLNotifications,
  ensureFourLRetrospectivesForActor,
  getFourLWorkGate,
  resolveFourLActorCapabilities,
  retrospectiveSubmissionIssues,
} from "../services/fourLRetrospective.service";
import {
  fourLDraftRequestSchema,
  type FourLDraftRequest,
} from "../validators/fourLRetrospective.validators";

type ProjectContext = {
  _id: unknown;
  projectName?: string;
  letterNumber?: string;
  representative?: unknown;
  projectManager?: unknown;
  status?: string;
  manuallyClosedAt?: Date;
  deadlineExpiredAt?: Date;
  testExpiresAt?: Date;
};

type UserSummary = {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  username?: string;
};

function isAdmin(actor: Express.UserContext) {
  return actor.permissions.includes(PERMISSIONS.ADMIN_SYSTEM_MANAGE);
}

function person(user: UserSummary | undefined, fallbackId: string) {
  const name = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username
    : undefined;
  return {
    id: user ? String(user._id) : fallbackId,
    name: name || fallbackId,
    ...(user?.username ? { username: user.username } : {}),
  };
}

function dateValue(value: unknown) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function actorAccess(
  record: FourLRetrospectiveDocument,
  project: ProjectContext,
  actor: Express.UserContext
) {
  const owner =
    actor.permissions.includes(PERMISSIONS.PENTEST_PROJECTS_READ) &&
    String(record.pentesterId) === actor.id;
  const representative =
    actor.permissions.includes(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ) &&
    String(project.representative || "") === actor.id;
  const admin = isAdmin(actor) && canLabAdminViewFourL(record.status as FourLStatus);
  return { owner, representative, admin };
}

async function userMap(ids: readonly string[]) {
  const validIds = [...new Set(ids)].filter((id) => mongoose.isValidObjectId(id));
  const users = await UserModel.find({ _id: { $in: validIds } })
    .select("firstName lastName username")
    .lean();
  return new Map(users.map((user) => [String(user._id), user as UserSummary]));
}

async function participantIds(project: ProjectContext, pentesterId: string) {
  const assignments = await ProjectAssignmentModel.find({
    $and: [
      { status: { $ne: PROJECT_ASSIGNMENT_STATUS.REMOVED } },
      { $or: [{ projectId: String(project._id) }, { project: String(project._id) }] },
    ],
  })
    .select("userId pentester managerId manager")
    .lean();
  return [
    pentesterId,
    String(project.representative || ""),
    String(project.projectManager || ""),
    ...assignments.flatMap((assignment) => [
      String(assignment.userId || assignment.pentester || ""),
      String(assignment.managerId || assignment.manager || ""),
    ]),
  ].filter((id) => mongoose.isValidObjectId(id));
}

function serialize(
  record: FourLRetrospectiveDocument,
  project: ProjectContext,
  users: Map<string, UserSummary>,
  actor: Express.UserContext,
  participantIdList: readonly string[] = []
): FourLRetrospectiveContract {
  const value = record.toObject();
  const pentesterId = String(value.pentesterId);
  const representativeId = String(project.representative || value.representativeId || "");
  const access = actorAccess(record, project, actor);
  const section = (input: { text?: string; notApplicable?: boolean } | undefined) => ({
    text: input?.text || "",
    notApplicable: input?.notApplicable === true,
  });
  return {
    id: String(record._id),
    project: {
      id: String(value.projectId),
      name: project.projectName || value.projectName,
      ...(project.letterNumber || value.projectLetterNumber
        ? { letterNumber: String(project.letterNumber || value.projectLetterNumber) }
        : {}),
      ...(project.status ? { status: project.status } : {}),
      ...(dateValue(
        project.manuallyClosedAt ||
          project.deadlineExpiredAt ||
          project.testExpiresAt ||
          value.projectClosedAt
      )
        ? {
            closedAt: dateValue(
              project.manuallyClosedAt ||
                project.deadlineExpiredAt ||
                project.testExpiresAt ||
                value.projectClosedAt
            ),
          }
        : {}),
    },
    pentester: person(users.get(pentesterId), pentesterId),
    ...(representativeId
      ? { representative: person(users.get(representativeId), representativeId) }
      : {}),
    participants: [...new Set(participantIdList)].map((id) => person(users.get(id), id)),
    status: value.status as FourLStatus,
    ...(value.rating ? { rating: value.rating } : {}),
    ...(typeof value.wouldChange === "boolean" ? { wouldChange: value.wouldChange } : {}),
    liked: section(value.liked),
    lacked: section(value.lacked),
    learned: section(value.learned),
    longedFor: section(value.longedFor),
    ...(typeof value.needsFollowUp === "boolean"
      ? { needsFollowUp: value.needsFollowUp }
      : {}),
    categories: [...(value.categories || [])] as FourLRetrospectiveContract["categories"],
    biggestObstacle: value.biggestObstacle || "",
    actionItems: (value.actionItems || []).map((item) => ({
      id: item.id,
      description: item.description,
      ownerId: String(item.ownerId),
      ownerName: person(users.get(String(item.ownerId)), String(item.ownerId)).name,
      priority: item.priority,
      dueDate: dateValue(item.dueDate) || "",
      status: item.status,
    })),
    acknowledged: value.acknowledged === true,
    ...(value.reviewNote ? { reviewNote: value.reviewNote } : {}),
    ...(dateValue(value.submittedAt)
      ? { submittedAt: dateValue(value.submittedAt) }
      : {}),
    ...(dateValue(value.reviewedAt) ? { reviewedAt: dateValue(value.reviewedAt) } : {}),
    ...(dateValue(value.approvedAt) ? { approvedAt: dateValue(value.approvedAt) } : {}),
    ...(dateValue(value.sentToAdminAt)
      ? { sentToAdminAt: dateValue(value.sentToAdminAt) }
      : {}),
    ...(dateValue(value.reopenedAt) ? { reopenedAt: dateValue(value.reopenedAt) } : {}),
    createdAt: dateValue(value.createdAt) || new Date(0).toISOString(),
    updatedAt: dateValue(value.updatedAt) || new Date(0).toISOString(),
    capabilities: resolveFourLActorCapabilities({
      status: value.status as FourLStatus,
      isOwner: access.owner,
      isRepresentative: access.representative,
      isAdmin: access.admin,
    }),
  };
}

async function loadContext(id: string, actor: Express.UserContext) {
  const record = await FourLRetrospectiveModel.findById(id);
  if (!record) throw new AppError("4L retrospective not found", HTTP_STATUS.NOT_FOUND);
  const project = (await ProjectModel.findById(record.projectId)
    .select(
      "projectName letterNumber representative projectManager status manuallyClosedAt deadlineExpiredAt testExpiresAt"
    )
    .lean()) as ProjectContext | null;
  if (!project) throw new AppError("Project not found", HTTP_STATUS.NOT_FOUND);
  const access = actorAccess(record, project, actor);
  if (!access.owner && !access.representative && !access.admin) {
    throw new AppError("Forbidden 4L retrospective access", HTTP_STATUS.FORBIDDEN);
  }
  await deliverPendingFourLNotifications(record);
  return { record, project, access };
}

async function serializeContext(
  record: FourLRetrospectiveDocument,
  project: ProjectContext,
  actor: Express.UserContext,
  includeParticipants = false
) {
  const ids = includeParticipants
    ? await participantIds(project, String(record.pentesterId))
    : [
        String(record.pentesterId),
        String(project.representative || record.representativeId || ""),
      ];
  const users = await userMap(ids);
  return serialize(record, project, users, actor, includeParticipants ? ids : []);
}

export const listFourLRetrospectives: RequestHandler = async (req, res, next) => {
  try {
    await closeExpiredProjects();
    await ensureFourLRetrospectivesForActor(req.user!);
    const actor = req.user!;
    const filters: Record<string, unknown>[] = [];
    if (actor.permissions.includes(PERMISSIONS.PENTEST_PROJECTS_READ)) {
      filters.push({ pentesterId: actor.id });
    }
    if (actor.permissions.includes(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ)) {
      filters.push({ representativeId: actor.id });
    }
    if (isAdmin(actor)) {
      filters.push({ status: FOUR_L_STATUSES.SENT_TO_ADMIN });
    }
    const records = await FourLRetrospectiveModel.find(
      filters.length ? { $or: filters } : { _id: null }
    )
      .sort({ projectClosedAt: -1, _id: -1 })
      .limit(200);
    await Promise.all(records.map(deliverPendingFourLNotifications));
    const projects = await ProjectModel.find({
      _id: { $in: records.map((record) => record.projectId) },
    })
      .select(
        "projectName letterNumber representative projectManager status manuallyClosedAt deadlineExpiredAt testExpiresAt"
      )
      .lean();
    const projectsById = new Map(
      projects.map((project) => [String(project._id), project as ProjectContext])
    );
    const ids = records.flatMap((record) => [
      String(record.pentesterId),
      String(
        projectsById.get(String(record.projectId))?.representative ||
          record.representativeId ||
          ""
      ),
    ]);
    const users = await userMap(ids);
    sendSuccess(
      res,
      records.flatMap((record) => {
        const project = projectsById.get(String(record.projectId));
        if (!project) return [];
        const access = actorAccess(record, project, actor);
        return access.owner || access.representative || access.admin
          ? [serialize(record, project, users, actor)]
          : [];
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getMyFourLWorkGate: RequestHandler = async (req, res, next) => {
  try {
    await closeExpiredProjects();
    sendSuccess(res, await getFourLWorkGate(req.user!.id));
  } catch (error) {
    next(error);
  }
};

export const getFourLRetrospective: RequestHandler = async (req, res, next) => {
  try {
    const { record, project } = await loadContext(String(req.params.id), req.user!);
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};

function toPersistenceDraft(input: FourLDraftRequest) {
  return {
    ...input,
    actionItems: input.actionItems.map((item) => ({
      ...item,
      dueDate: item.dueDate ? new Date(item.dueDate) : null,
    })),
  };
}

async function saveRecord(
  record: FourLRetrospectiveDocument,
  notifications: CreateNotificationInput[] = []
) {
  record.pendingNotifications.push(...notifications);
  try {
    await record.save();
  } catch (error) {
    if (error instanceof mongoose.Error.VersionError) {
      throw new AppError(
        "This form changed in another request. Reload and try again",
        HTTP_STATUS.CONFLICT
      );
    }
    throw error;
  }
  await deliverPendingFourLNotifications(record);
}

export const saveFourLDraft: RequestHandler = async (req, res, next) => {
  try {
    const { record, project, access } = await loadContext(
      String(req.params.id),
      req.user!
    );
    if (
      !access.owner ||
      !resolveFourLActorCapabilities({
        status: record.status as FourLStatus,
        isOwner: true,
        isRepresentative: false,
        isAdmin: false,
      }).canEdit
    ) {
      throw new AppError("This 4L form is read-only", HTTP_STATUS.CONFLICT);
    }
    const input = fourLDraftRequestSchema.parse(req.body);
    const allowedParticipants = new Set(
      await participantIds(project, String(record.pentesterId))
    );
    if (input.actionItems.some((item) => !allowedParticipants.has(item.ownerId))) {
      throw new AppError(
        "Action owner must be a project participant",
        HTTP_STATUS.BAD_REQUEST
      );
    }
    record.set(toPersistenceDraft(input));
    await saveRecord(record);
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.FOUR_L_DRAFT_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.RETROSPECTIVE,
      entityId: String(record._id),
      metadata: { projectId: String(record.projectId), status: record.status },
    });
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};

export const submitFourLRetrospective: RequestHandler = async (req, res, next) => {
  try {
    const { record, project, access } = await loadContext(
      String(req.params.id),
      req.user!
    );
    if (
      !access.owner ||
      ![FOUR_L_STATUSES.DRAFT, FOUR_L_STATUSES.CHANGES_REQUESTED].includes(
        record.status as typeof FOUR_L_STATUSES.DRAFT
      )
    ) {
      throw new AppError("This 4L form cannot be submitted", HTTP_STATUS.CONFLICT);
    }
    if (
      ![PROJECT_STATUS.CLOSED, PROJECT_STATUS.FINISHED].includes(project.status as never)
    ) {
      throw new AppError(
        "The project must be closed before submitting 4L",
        HTTP_STATUS.CONFLICT
      );
    }
    const snapshot = serialize(record, project, new Map(), req.user!);
    const issues = retrospectiveSubmissionIssues(snapshot);
    if (issues.length) {
      const error = new AppError(
        issues[0].message,
        HTTP_STATUS.BAD_REQUEST
      ) as AppError & {
        code: string;
      };
      error.code = "FOUR_L_FORM_INCOMPLETE";
      throw error;
    }
    const representativeId = String(project.representative || "");
    if (!mongoose.isValidObjectId(representativeId)) {
      throw new AppError(
        "Assign a Lab Representative before submitting the 4L form",
        HTTP_STATUS.CONFLICT
      );
    }
    const now = new Date();
    record.status = FOUR_L_STATUSES.SUBMITTED;
    record.representativeId = new mongoose.Types.ObjectId(representativeId);
    record.submittedAt = now;
    record.reviewNote = undefined;
    await saveRecord(record, [
      {
        userId: representativeId,
        projectId: String(record.projectId),
        type: NOTIFICATION_TYPES.RETROSPECTIVE_SUBMITTED,
        title: "4L retrospective ready for review",
        message: `${record.projectName} has a completed 4L retrospective ready for your review.`,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        actionUrl: ROUTES.FRONTEND.FOUR_L_RETROSPECTIVE(String(record._id)),
        entityId: String(record._id),
        dedupeKey: `${NOTIFICATION_TYPES.RETROSPECTIVE_SUBMITTED}:${record._id}:${now.toISOString()}`,
        data: {
          retrospectiveId: String(record._id),
          projectId: String(record.projectId),
        },
      },
    ]);
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.FOUR_L_SUBMIT,
      entityType: AUDIT_ENTITY_TYPES.RETROSPECTIVE,
      entityId: String(record._id),
      metadata: { projectId: String(record.projectId), status: record.status },
    });
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};

async function notifyPentester(
  record: FourLRetrospectiveDocument,
  type:
    | typeof NOTIFICATION_TYPES.RETROSPECTIVE_CHANGES_REQUESTED
    | typeof NOTIFICATION_TYPES.RETROSPECTIVE_APPROVED,
  title: string,
  message: string,
  now: Date
) {
  await saveRecord(record, [
    {
      userId: String(record.pentesterId),
      projectId: String(record.projectId),
      type,
      title,
      message,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      actionUrl: ROUTES.FRONTEND.FOUR_L_RETROSPECTIVE(String(record._id)),
      entityId: String(record._id),
      dedupeKey: `${type}:${record._id}:${now.toISOString()}`,
      data: { retrospectiveId: String(record._id), projectId: String(record.projectId) },
    },
  ]);
}

export const requestFourLChanges: RequestHandler = async (req, res, next) => {
  try {
    const { record, project, access } = await loadContext(
      String(req.params.id),
      req.user!
    );
    if (
      !access.representative ||
      ![FOUR_L_STATUSES.SUBMITTED, FOUR_L_STATUSES.APPROVED].includes(
        record.status as typeof FOUR_L_STATUSES.SUBMITTED
      )
    ) {
      throw new AppError("This 4L form cannot be returned", HTTP_STATUS.CONFLICT);
    }
    const now = new Date();
    record.status = FOUR_L_STATUSES.CHANGES_REQUESTED;
    record.reviewNote = String(req.body.note);
    record.reviewedAt = now;
    record.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
    record.approvedAt = undefined;
    await notifyPentester(
      record,
      NOTIFICATION_TYPES.RETROSPECTIVE_CHANGES_REQUESTED,
      "Changes requested for your 4L retrospective",
      `The Lab Representative requested changes to the 4L retrospective for ${record.projectName}.`,
      now
    );
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.FOUR_L_REQUEST_CHANGES,
      entityType: AUDIT_ENTITY_TYPES.RETROSPECTIVE,
      entityId: String(record._id),
      metadata: { projectId: String(record.projectId), status: record.status },
    });
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};

export const approveFourLRetrospective: RequestHandler = async (req, res, next) => {
  try {
    const { record, project, access } = await loadContext(
      String(req.params.id),
      req.user!
    );
    if (!access.representative || record.status !== FOUR_L_STATUSES.SUBMITTED) {
      throw new AppError("This 4L form cannot be approved", HTTP_STATUS.CONFLICT);
    }
    const now = new Date();
    record.status = FOUR_L_STATUSES.APPROVED;
    record.reviewNote = req.body.note || undefined;
    record.reviewedAt = now;
    record.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
    record.approvedAt = now;
    await notifyPentester(
      record,
      NOTIFICATION_TYPES.RETROSPECTIVE_APPROVED,
      "Your 4L retrospective was approved",
      `The 4L retrospective for ${record.projectName} was approved by the Lab Representative.`,
      now
    );
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.FOUR_L_APPROVE,
      entityType: AUDIT_ENTITY_TYPES.RETROSPECTIVE,
      entityId: String(record._id),
      metadata: { projectId: String(record.projectId), status: record.status },
    });
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};

export const sendFourLToAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { record, project, access } = await loadContext(
      String(req.params.id),
      req.user!
    );
    if (!access.representative || record.status !== FOUR_L_STATUSES.APPROVED) {
      throw new AppError("This 4L form is not ready for Admin", HTTP_STATUS.CONFLICT);
    }
    const admins = await UserModel.find({
      $and: [
        { $or: [{ roles: ROLES.ADMIN }, { "roles.Admin": { $gt: 0 } }] },
        { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
      ],
    })
      .select("_id")
      .lean();
    if (!admins.length) {
      throw new AppError("No active Lab Admin is available", HTTP_STATUS.CONFLICT);
    }
    const now = new Date();
    record.status = FOUR_L_STATUSES.SENT_TO_ADMIN;
    record.sentToAdminAt = now;
    record.sentToAdminBy = new mongoose.Types.ObjectId(req.user!.id);
    await saveRecord(
      record,
      admins.map((admin) => ({
        userId: String(admin._id),
        projectId: String(record.projectId),
        type: NOTIFICATION_TYPES.RETROSPECTIVE_SENT_TO_ADMIN,
        title: "Approved 4L retrospective",
        message: `The approved 4L retrospective for ${record.projectName} is available for planning decisions.`,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        actionUrl: ROUTES.FRONTEND.FOUR_L_RETROSPECTIVE(String(record._id)),
        entityId: String(record._id),
        dedupeKey: `${NOTIFICATION_TYPES.RETROSPECTIVE_SENT_TO_ADMIN}:${record._id}:${admin._id}:${now.toISOString()}`,
        data: {
          retrospectiveId: String(record._id),
          projectId: String(record.projectId),
        },
      }))
    );
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.FOUR_L_SEND_TO_ADMIN,
      entityType: AUDIT_ENTITY_TYPES.RETROSPECTIVE,
      entityId: String(record._id),
      metadata: { projectId: String(record.projectId), status: record.status },
    });
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};

export const reopenFourLRetrospective: RequestHandler = async (req, res, next) => {
  try {
    const { record, project, access } = await loadContext(
      String(req.params.id),
      req.user!
    );
    if (!access.representative || record.status !== FOUR_L_STATUSES.SENT_TO_ADMIN) {
      throw new AppError("This 4L form cannot be reopened", HTTP_STATUS.CONFLICT);
    }
    const now = new Date();
    record.status = FOUR_L_STATUSES.CHANGES_REQUESTED;
    record.reviewNote = String(req.body.note);
    record.reopenedAt = now;
    record.reopenedBy = new mongoose.Types.ObjectId(req.user!.id);
    record.approvedAt = undefined;
    record.sentToAdminAt = undefined;
    await notifyPentester(
      record,
      NOTIFICATION_TYPES.RETROSPECTIVE_CHANGES_REQUESTED,
      "Your 4L retrospective was reopened",
      `The 4L retrospective for ${record.projectName} was reopened and requires changes.`,
      now
    );
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.FOUR_L_REOPEN,
      entityType: AUDIT_ENTITY_TYPES.RETROSPECTIVE,
      entityId: String(record._id),
      metadata: { projectId: String(record.projectId), status: record.status },
    });
    sendSuccess(res, await serializeContext(record, project, req.user!, true));
  } catch (error) {
    next(error);
  }
};
