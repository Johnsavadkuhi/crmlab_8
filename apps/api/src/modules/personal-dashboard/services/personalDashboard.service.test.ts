import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import type { NextFunction, Request, Response } from "express";
import { PERMISSIONS, type Permission } from "@/constants/permissions";
import { requirePermission } from "@/middlewares/permission.middleware";
import { PERSONAL_DASHBOARD_PERMISSIONS } from "../policies/personalDashboard.policy";
import {
  buildCapabilityAssignmentFilter,
  buildCapabilityProjectFilter,
  buildOwnFindingFilter,
} from "./personalDashboard.service";

function authorize(required: Permission[], granted: Permission[]) {
  let result: unknown = "not-called";
  const request = {
    user: { id: "user-1", roles: [], permissions: granted },
  } as unknown as Request;
  requirePermission(...required)(
    request,
    {} as Response,
    ((error?: unknown) => {
      result = error || "allowed";
    }) as NextFunction
  );
  return result;
}

const qaPolicy = [...PERSONAL_DASHBOARD_PERMISSIONS.qa];
const devopsPolicy = [...PERSONAL_DASHBOARD_PERMISSIONS.devops];

test("capability endpoints reject cross-capability and partial grants with 403", () => {
  const devopsCallingQa = authorize(qaPolicy, devopsPolicy);
  const qaCallingDevops = authorize(devopsPolicy, qaPolicy);
  const partialQa = authorize(qaPolicy, [PERMISSIONS.QA_DASHBOARD_READ]);

  for (const error of [devopsCallingQa, qaCallingDevops, partialQa]) {
    assert.ok(error instanceof Error);
    assert.equal("statusCode" in error ? error.statusCode : undefined, 403);
  }
  assert.equal(authorize(qaPolicy, qaPolicy), "allowed");
});

test("removing a stored permission makes the same endpoint forbidden", () => {
  assert.equal(authorize(devopsPolicy, devopsPolicy), "allowed");
  const afterRefresh = authorize(devopsPolicy, [PERMISSIONS.DEVOPS_DASHBOARD_READ]);
  assert.ok(afterRefresh instanceof Error);
  assert.equal("statusCode" in afterRefresh ? afterRefresh.statusCode : undefined, 403);
});

test("capability assignment filters bind both the user and the workflow role", () => {
  const qa = JSON.stringify(buildCapabilityAssignmentFilter("user-1", "qa"));
  const devops = JSON.stringify(buildCapabilityAssignmentFilter("user-1", "devops"));

  assert.match(qa, /"userId":"user-1"/);
  assert.match(qa, /"assignmentRole":\{"\$in":\["qa"\]\}/);
  assert.doesNotMatch(qa, /managerId|pentester/);
  assert.match(devops, /"userId":"user-1"/);
  assert.match(devops, /"devops"/);
  assert.doesNotMatch(devops, /managerId|pentester/);
});

test("direct project filters cannot select projects owned by another user", () => {
  const devops = JSON.stringify(buildCapabilityProjectFilter("user-1", "devops"));
  const qa = JSON.stringify(buildCapabilityProjectFilter("user-1", "qa"));

  assert.match(devops, /"devops":"user-1"/);
  assert.doesNotMatch(devops, /user-2/);
  assert.equal(qa, '{"_id":{"$in":[]}}');
});

test("finding analytics are restricted to the signed-in reporter and assigned projects", () => {
  const assignedProject = new mongoose.Types.ObjectId();
  const forgedProject = new mongoose.Types.ObjectId();
  const serialized = JSON.stringify(buildOwnFindingFilter("user-1", [assignedProject]));

  assert.match(serialized, /user-1/);
  assert.match(serialized, new RegExp(String(assignedProject)));
  assert.doesNotMatch(serialized, new RegExp(String(forgedProject)));
  assert.match(serialized, /createdBy|reporter/);
});
