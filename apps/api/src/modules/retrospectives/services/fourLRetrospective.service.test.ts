import assert from "node:assert/strict";
import test from "node:test";
import { FOUR_L_STATUSES, type FourLDraftInputContract } from "@role-dashboard/contracts";
import {
  canLabAdminViewFourL,
  isFourLStatusBlockingWork,
  resolveFourLActorCapabilities,
  retrospectiveSubmissionIssues,
} from "./fourLRetrospective.service";

const completeDraft: FourLDraftInputContract = {
  rating: "smooth",
  wouldChange: true,
  liked: { text: "Clear collaboration", notApplicable: false },
  lacked: { text: "", notApplicable: true },
  learned: { text: "New testing approach", notApplicable: false },
  longedFor: { text: "More test data", notApplicable: false },
  needsFollowUp: true,
  categories: ["test_data"],
  biggestObstacle: "Late access",
  actionItems: [
    {
      id: "action-1",
      description: "Prepare test data earlier",
      ownerId: "507f191e810c19729de860ea",
      priority: "high",
      dueDate: "2030-01-01",
      status: "open",
    },
  ],
  acknowledged: true,
};

test("complete 4L submissions satisfy every required field", () => {
  assert.deepEqual(retrospectiveSubmissionIssues(completeDraft), []);
});

test("submission validation ignores API metadata and action owner display names", () => {
  const responseShape = {
    ...completeDraft,
    actionItems: completeDraft.actionItems.map((item) => ({
      ...item,
      ownerName: "Project participant",
    })),
    id: "507f191e810c19729de860eb",
    project: { id: "507f191e810c19729de860ec", name: "Security project" },
    pentester: { id: "507f191e810c19729de860ea", name: "Pentester" },
    participants: [],
    status: FOUR_L_STATUSES.DRAFT,
    createdAt: "2030-01-01T00:00:00.000Z",
    updatedAt: "2030-01-01T00:00:00.000Z",
    capabilities: {
      canEdit: true,
      canSubmit: true,
      canRequestChanges: false,
      canApprove: false,
      canSendToAdmin: false,
      canReopen: false,
    },
  };

  assert.deepEqual(retrospectiveSubmissionIssues(responseShape), []);
});

test("incomplete 4L submissions report missing sections and acknowledgement", () => {
  const issues = retrospectiveSubmissionIssues({
    ...completeDraft,
    liked: { text: "", notApplicable: false },
    acknowledged: false,
  });
  assert.ok(issues.some((issue) => issue.path === "liked"));
  assert.ok(issues.some((issue) => issue.path === "acknowledged"));
});

test("follow-up submissions require an action item", () => {
  const issues = retrospectiveSubmissionIssues({
    ...completeDraft,
    actionItems: [],
  });
  assert.ok(issues.some((issue) => issue.path === "actionItems"));
});

test("draft and requested-change forms block work, submitted forms do not", () => {
  assert.equal(isFourLStatusBlockingWork(FOUR_L_STATUSES.DRAFT), true);
  assert.equal(isFourLStatusBlockingWork(FOUR_L_STATUSES.CHANGES_REQUESTED), true);
  assert.equal(isFourLStatusBlockingWork(FOUR_L_STATUSES.SUBMITTED), false);
  assert.equal(isFourLStatusBlockingWork(FOUR_L_STATUSES.APPROVED), false);
});

test("Lab Admin sees a 4L form only after the representative sends it", () => {
  assert.equal(canLabAdminViewFourL(FOUR_L_STATUSES.DRAFT), false);
  assert.equal(canLabAdminViewFourL(FOUR_L_STATUSES.SUBMITTED), false);
  assert.equal(canLabAdminViewFourL(FOUR_L_STATUSES.APPROVED), false);
  assert.equal(canLabAdminViewFourL(FOUR_L_STATUSES.SENT_TO_ADMIN), true);
});

test("only the project representative controls review transitions", () => {
  const owner = resolveFourLActorCapabilities({
    status: FOUR_L_STATUSES.DRAFT,
    isOwner: true,
    isRepresentative: false,
    isAdmin: false,
  });
  const representative = resolveFourLActorCapabilities({
    status: FOUR_L_STATUSES.SUBMITTED,
    isOwner: false,
    isRepresentative: true,
    isAdmin: false,
  });
  const admin = resolveFourLActorCapabilities({
    status: FOUR_L_STATUSES.APPROVED,
    isOwner: false,
    isRepresentative: false,
    isAdmin: true,
  });
  assert.equal(owner.canEdit, true);
  assert.equal(owner.canSubmit, true);
  assert.equal(representative.canApprove, true);
  assert.equal(representative.canRequestChanges, true);
  assert.deepEqual(admin, {
    canEdit: false,
    canSubmit: false,
    canRequestChanges: false,
    canApprove: false,
    canSendToAdmin: false,
    canReopen: false,
  });
});
