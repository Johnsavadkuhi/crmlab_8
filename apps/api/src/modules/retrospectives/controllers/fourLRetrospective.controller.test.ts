import assert from "node:assert/strict";
import test, { afterEach, mock } from "node:test";
import type { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import {
  FOUR_L_STATUSES,
  type FourLRetrospectiveContract,
} from "@role-dashboard/contracts";
import { PERMISSIONS } from "@/constants/permissions";
import { ProjectModel } from "@/modules/projects/models/project.model";
import { ProjectAssignmentModel } from "@/modules/projects/models/projectAssignment.model";
import { UserModel } from "@/modules/users/models/user.model";
import { NotificationModel } from "@/modules/notifications/models/notification.model";
import { AuditLogModel } from "@/modules/audit/models/auditLog.model";
import { FourLRetrospectiveModel } from "../models/fourLRetrospective.model";
import {
  assertFourLWorkGateOpen,
  ensureFourLRetrospectivesForClosedProjects,
  sanitizeFourLDraftInput,
} from "../services/fourLRetrospective.service";
import {
  approveFourLRetrospective,
  getFourLRetrospective,
  requestFourLChanges,
  saveFourLDraft,
  sendFourLToAdmin,
  submitFourLRetrospective,
} from "./fourLRetrospective.controller";

afterEach(() => mock.restoreAll());

test("autosave accepts a temporarily empty action due date but submission rejects it", async () => {
  const { record } = fixture();
  const detail = await invoke(getFourLRetrospective, "tester", String(record._id));
  assert.ok(detail.data);
  const draft = sanitizeFourLDraftInput(detail.data);
  draft.actionItems[0].dueDate = "";
  const saved = await invoke(saveFourLDraft, "tester", String(record._id), draft);
  assert.equal(saved.error, undefined);
  assert.equal(saved.data?.actionItems[0].dueDate, "");
  assert.equal(
    (await invoke(submitFourLRetrospective, "tester", String(record._id))).error?.code,
    "FOUR_L_FORM_INCOMPLETE"
  );
  draft.actionItems[0].dueDate = "2030-01-01";
  assert.equal(
    (await invoke(saveFourLDraft, "tester", String(record._id), draft)).error,
    undefined
  );
  assert.equal(
    (await invoke(submitFourLRetrospective, "tester", String(record._id))).error,
    undefined
  );
});

test("notification failure preserves the submitted form and retries its durable event on read", async () => {
  const { record } = fixture();
  let savedPending = 0;
  mock.method(record, "save", async () => {
    await record.validate();
    savedPending = record.pendingNotifications.length;
    return record;
  });
  const delivery = mock.method(NotificationModel, "create", async () => {
    throw new Error("notification unavailable");
  });
  mock.method(console, "error", () => undefined);
  const submitted = await invoke(submitFourLRetrospective, "tester", String(record._id));
  assert.equal(submitted.error, undefined);
  assert.equal(submitted.data?.status, FOUR_L_STATUSES.SUBMITTED);
  assert.equal(savedPending, 1);
  assert.equal(record.pendingNotifications.length, 1);
  const deliveryKey = record.pendingNotifications[0].dedupeKey;
  delivery.mock.restore();
  const seenKeys: unknown[] = [];
  mock.method(NotificationModel, "create", async (input: Record<string, unknown>) => {
    seenKeys.push(input.dedupeKey);
    return new NotificationModel(input) as never;
  });
  assert.equal(
    (await invoke(getFourLRetrospective, "tester", String(record._id))).error,
    undefined
  );
  assert.deepEqual(seenKeys, [deliveryKey]);
  assert.equal(record.pendingNotifications.length, 0);
});

test("required-notification outage does not bypass or break the work gate", async () => {
  fixture();
  mock.method(console, "error", () => undefined);
  mock.method(NotificationModel, "create", async () => {
    throw new Error("notification unavailable");
  });
  await assert.rejects(assertFourLWorkGateOpen(ids.tester, ids.nextProject), {
    code: "FOUR_L_RETROSPECTIVE_REQUIRED",
  });
});

test("form generation supports legacy project types and respects the canonical type", async () => {
  const { project } = fixture();
  mock.method(
    ProjectModel,
    "find",
    () => query([{ ...project, type: undefined, projectType: [" Security "] }]) as never
  );
  assert.equal(
    (await ensureFourLRetrospectivesForClosedProjects([ids.project])).length,
    1
  );
  mock.method(
    ProjectModel,
    "find",
    () => query([{ ...project, type: "quality", projectType: ["security"] }]) as never
  );
  assert.equal(
    (await ensureFourLRetrospectivesForClosedProjects([ids.project])).length,
    0
  );
});

test("checking a form does not rewrite its last-edit timestamp", async () => {
  const { record } = fixture();
  // Exercise actual Mongoose casting/timestamp middleware, mocking only Mongo I/O.
  mock.restoreAll();
  const project = {
    _id: ids.project,
    type: "security",
    projectName: "test",
    status: "closed",
  };
  mock.method(ProjectModel, "find", () => query([project]) as never);
  mock.method(
    ProjectAssignmentModel,
    "find",
    () => query([{ project: ids.project, pentester: ids.tester }]) as never
  );
  let update: Record<string, Record<string, unknown>> | undefined;
  mock.method(
    FourLRetrospectiveModel.collection,
    "findOneAndUpdate",
    async (_filter: unknown, value: typeof update) => {
      update = value;
      return record.toObject() as never;
    }
  );
  mock.method(
    NotificationModel,
    "create",
    async (value: Record<string, unknown>) => new NotificationModel(value) as never
  );
  mock.method(NotificationModel, "countDocuments", async () => 0 as never);
  await ensureFourLRetrospectivesForClosedProjects([ids.project]);
  assert.equal(update?.$set?.updatedAt, undefined);
  assert.ok(update?.$setOnInsert?.updatedAt instanceof Date);
});

const ids = {
  tester: "507f191e810c19729de860ea",
  representative: "507f191e810c19729de860eb",
  admin: "507f191e810c19729de860ec",
  project: "507f191e810c19729de860ed",
  nextProject: "507f191e810c19729de860ee",
  stranger: "507f191e810c19729de860ef",
};
const actors = {
  tester: { id: ids.tester, permissions: [PERMISSIONS.PENTEST_PROJECTS_READ] },
  representative: {
    id: ids.representative,
    permissions: [PERMISSIONS.REPRESENTATIVE_PROJECTS_READ],
  },
  admin: { id: ids.admin, permissions: [PERMISSIONS.ADMIN_SYSTEM_MANAGE] },
  stranger: { id: ids.stranger, permissions: [PERMISSIONS.REPRESENTATIVE_PROJECTS_READ] },
};
function query<T>(value: T) {
  return {
    select() {
      return this;
    },
    sort() {
      return this;
    },
    lean: async () => value,
    then: (resolve: (value: T) => unknown) => Promise.resolve(value).then(resolve),
  };
}
function fixture() {
  const record = new FourLRetrospectiveModel({
    projectId: ids.project,
    pentesterId: ids.tester,
    representativeId: ids.representative,
    projectName: "4L test project",
    projectClosedAt: new Date(),
    rating: "smooth",
    wouldChange: false,
    needsFollowUp: true,
    categories: ["test_data"],
    liked: { text: "Team collaboration", notApplicable: false },
    lacked: { text: "", notApplicable: true },
    learned: { text: "Testing skills", notApplicable: false },
    longedFor: { text: "More data", notApplicable: false },
    acknowledged: true,
    actionItems: [
      {
        id: "one",
        description: "Prepare test data",
        ownerId: ids.tester,
        dueDate: new Date("2030-01-01"),
        priority: "high",
        status: "open",
      },
    ],
  });
  const project = {
    type: "security",
    _id: ids.project,
    projectName: record.projectName,
    status: "closed",
    representative: ids.representative,
  };
  const assignments = [
    { projectId: ids.project, userId: ids.tester, assignmentRole: "pentester" },
  ];
  const notices: Record<string, unknown>[] = [];
  mock.method(FourLRetrospectiveModel, "findById", async () => record);
  mock.method(
    FourLRetrospectiveModel,
    "updateOne",
    async () => ({ acknowledged: true, modifiedCount: 1 }) as never
  );
  mock.method(record, "save", async () => {
    await record.validate();
    return record;
  });
  mock.method(ProjectModel, "findById", () => query(project) as never);
  mock.method(ProjectModel, "find", () => query([project]) as never);
  mock.method(ProjectAssignmentModel, "find", () => query(assignments) as never);
  mock.method(
    ProjectAssignmentModel,
    "exists",
    async () => ({ _id: ids.tester }) as never
  );
  mock.method(FourLRetrospectiveModel, "findOneAndUpdate", async () => record);
  mock.method(
    FourLRetrospectiveModel,
    "find",
    () =>
      query(
        [FOUR_L_STATUSES.DRAFT, FOUR_L_STATUSES.CHANGES_REQUESTED].some(
          (status) => status === record.status
        )
          ? [record]
          : []
      ) as never
  );
  mock.method(
    UserModel,
    "find",
    () => query([{ _id: ids.admin, firstName: "Admin" }]) as never
  );
  mock.method(NotificationModel, "create", async (input: Record<string, unknown>) => {
    notices.push(input);
    return new NotificationModel(input) as never;
  });
  mock.method(NotificationModel, "countDocuments", async () => 0 as never);
  mock.method(AuditLogModel, "create", async () => ({}) as never);
  return { record, project, notices };
}
async function invoke(
  handler: RequestHandler,
  actor: keyof typeof actors,
  id: string,
  body = {}
) {
  let error: unknown;
  let data: FourLRetrospectiveContract | undefined;
  const req = {
    params: { id },
    body,
    user: actors[actor],
    get: () => undefined,
  } as unknown as Request;
  const res = {
    status() {
      return this;
    },
    json(value: { data: FourLRetrospectiveContract }) {
      data = value.data;
      return this;
    },
  } as unknown as Response;
  await handler(req, res, (value?: unknown) => {
    error = value;
  });
  return { error: error as { statusCode?: number; code?: string } | undefined, data };
}

test("submit -> representative review -> Admin delivery, with server-side work gate", async () => {
  const { record, notices } = fixture();
  await assert.rejects(assertFourLWorkGateOpen(ids.tester, ids.nextProject), {
    code: "FOUR_L_RETROSPECTIVE_REQUIRED",
  });
  const submitted = await invoke(submitFourLRetrospective, "tester", String(record._id));
  assert.equal(submitted.error, undefined);
  assert.equal(submitted.data?.status, FOUR_L_STATUSES.SUBMITTED);
  await assert.doesNotReject(assertFourLWorkGateOpen(ids.tester, ids.nextProject));
  assert.equal(
    (await invoke(getFourLRetrospective, "admin", String(record._id))).error?.statusCode,
    403
  );
  assert.equal(
    (await invoke(approveFourLRetrospective, "stranger", String(record._id))).error
      ?.statusCode,
    403
  );
  assert.equal(
    (await invoke(saveFourLDraft, "tester", String(record._id))).error?.statusCode,
    409
  );
  assert.equal(
    (await invoke(sendFourLToAdmin, "representative", String(record._id))).error
      ?.statusCode,
    409
  );
  assert.equal(
    (await invoke(approveFourLRetrospective, "representative", String(record._id))).data
      ?.status,
    FOUR_L_STATUSES.APPROVED
  );
  assert.equal(
    (await invoke(sendFourLToAdmin, "representative", String(record._id))).data?.status,
    FOUR_L_STATUSES.SENT_TO_ADMIN
  );
  assert.equal(
    (await invoke(getFourLRetrospective, "admin", String(record._id))).error,
    undefined
  );
  assert.ok(
    notices.some(
      (notice) =>
        notice.type === "retrospective.submitted" && notice.userId === ids.representative
    )
  );
  assert.ok(
    notices.some(
      (notice) =>
        notice.type === "retrospective.sent_to_admin" && notice.userId === ids.admin
    )
  );
});

test("requested changes re-lock work until resubmission", async () => {
  const { record } = fixture();
  record.status = FOUR_L_STATUSES.SUBMITTED;
  const returned = await invoke(
    requestFourLChanges,
    "representative",
    String(record._id),
    { note: "Add more detail" }
  );
  assert.equal(returned.error, undefined);
  await assert.rejects(assertFourLWorkGateOpen(ids.tester, ids.nextProject), {
    code: "FOUR_L_RETROSPECTIVE_REQUIRED",
  });
  assert.equal(
    (await invoke(submitFourLRetrospective, "tester", String(record._id))).error,
    undefined
  );
  await assert.doesNotReject(assertFourLWorkGateOpen(ids.tester, ids.nextProject));
});

test("incomplete form stays draft and never notifies representative", async () => {
  const { record, notices } = fixture();
  record.acknowledged = false;
  assert.equal(
    (await invoke(submitFourLRetrospective, "tester", String(record._id))).error?.code,
    "FOUR_L_FORM_INCOMPLETE"
  );
  assert.equal(record.status, FOUR_L_STATUSES.DRAFT);
  assert.equal(notices.length, 0);
});

test("removing or changing representative revokes the former representative's access", async () => {
  const { record, project } = fixture();
  project.representative = "";
  assert.equal(
    (await invoke(getFourLRetrospective, "representative", String(record._id))).error
      ?.statusCode,
    403
  );
});

test("a concurrent save conflict is reported as 409 without sending notifications", async () => {
  const { record, notices } = fixture();
  mock.method(record, "save", async () => {
    throw new mongoose.Error.VersionError(record, 1, ["status"]);
  });
  assert.equal(
    (await invoke(submitFourLRetrospective, "tester", String(record._id))).error
      ?.statusCode,
    409
  );
  assert.equal(notices.length, 0);
});

test("the retrospective gate does not block work on its own project during an extension", async () => {
  fixture();
  await assert.doesNotReject(assertFourLWorkGateOpen(ids.tester, ids.project));
});
