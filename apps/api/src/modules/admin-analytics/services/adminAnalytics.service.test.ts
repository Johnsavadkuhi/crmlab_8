import assert from "node:assert/strict";
import test from "node:test";
import { ROLES } from "@/constants/roles";
import { hasRequiredRole } from "@/middlewares/permission.middleware";
import { adminAnalyticsQuerySchema } from "../validators/adminAnalytics.validators";
import { RISK_WEIGHTS, resolveAnalyticsWindow } from "./adminAnalytics.service";

test("admin analytics route policy can require the actual admin role", () => {
  assert.equal(hasRequiredRole([ROLES.ADMIN], [ROLES.ADMIN]), true);
  assert.equal(hasRequiredRole([ROLES.PENTESTER], [ROLES.ADMIN]), false);
});

test("analytics query accepts supported filters and rejects malformed identifiers", () => {
  assert.equal(adminAnalyticsQuerySchema.safeParse({ query: {
    from: "2026-08-01",
    to: "2026-08-31",
    granularity: "week",
    project: "64b64c95e1c45d4a34f8a123",
    severity: "critical",
  } }).success, true);
  assert.equal(adminAnalyticsQuerySchema.safeParse({ query: {
    granularity: "minute",
    tester: "not-an-object-id",
  } }).success, false);
});

test("comparison window has exactly the same duration as the selected window", () => {
  const window = resolveAnalyticsWindow({ from: "2026-08-01", to: "2026-08-30" });
  const currentDuration = window.to.getTime() - window.from.getTime() + 1;
  const previousDuration = window.previousTo.getTime() - window.previousFrom.getTime() + 1;
  assert.equal(currentDuration, previousDuration);
  assert.equal(window.previousTo.getTime(), window.from.getTime() - 1);
});

test("risk weighting prioritizes critical and high findings", () => {
  assert.deepEqual(RISK_WEIGHTS, {
    critical: 10,
    high: 6,
    medium: 3,
    low: 1,
    info: 0.5,
  });
  assert.ok(RISK_WEIGHTS.critical > RISK_WEIGHTS.high);
  assert.ok(RISK_WEIGHTS.high > RISK_WEIGHTS.medium);
});
