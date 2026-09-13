import assert from "node:assert/strict";
import test from "node:test";
import { FOUR_L_STATUSES } from "@role-dashboard/contracts";
import { resolveWorkspaceFourLGate } from "./workGate";

const blocker = {
  retrospectiveId: "form",
  projectId: "closed-project",
  projectName: "Previous",
  status: FOUR_L_STATUSES.DRAFT,
  actionUrl: "/retrospectives/4l/form",
};
const input = {
  gate: { blocked: true, blockers: [blocker] },
  hasError: false,
  projectId: "new-project",
  isClosed: false,
  isSecurityManager: false,
};

test("switching to a manager workspace ignores cached pentester blockers and errors", () => {
  assert.deepEqual(
    resolveWorkspaceFourLGate({ ...input, hasError: true, isSecurityManager: true }),
    { blocker: undefined, unavailable: false }
  );
});
test("a pentester's next project is blocked until the previous form is submitted", () => {
  assert.equal(resolveWorkspaceFourLGate(input).blocker, blocker);
  assert.equal(
    resolveWorkspaceFourLGate({ ...input, gate: { blocked: false, blockers: [] } })
      .blocker,
    undefined
  );
});
test("an extension does not require that same project's retrospective to work", () => {
  assert.equal(
    resolveWorkspaceFourLGate({ ...input, projectId: blocker.projectId }).blocker,
    undefined
  );
  assert.equal(
    resolveWorkspaceFourLGate({ ...input, projectId: blocker.projectId, isClosed: true })
      .blocker,
    blocker
  );
});
test("loading and failed checks keep work unavailable", () => {
  assert.equal(
    resolveWorkspaceFourLGate({ ...input, gate: undefined }).unavailable,
    true
  );
  assert.equal(resolveWorkspaceFourLGate({ ...input, hasError: true }).unavailable, true);
});
