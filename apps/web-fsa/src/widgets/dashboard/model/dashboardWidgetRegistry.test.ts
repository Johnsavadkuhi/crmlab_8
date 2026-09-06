import assert from "node:assert/strict";
import test from "node:test";
import { PERMISSIONS } from "@/entities/permission/model/permissions";
import {
  dashboardWidgetRegistry,
  getAllowedDashboardWidgets,
} from "./dashboardWidgetRegistry";

const idsFor = (permissions: Parameters<typeof getAllowedDashboardWidgets>[0]) =>
  getAllowedDashboardWidgets(permissions).map((widget) => widget.id);

const devopsPermissions = [
  PERMISSIONS.DEVOPS_DASHBOARD_READ,
  PERMISSIONS.DEVOPS_PROJECTS_READ,
];
const qaPermissions = [PERMISSIONS.QA_DASHBOARD_READ, PERMISSIONS.QA_PROJECTS_READ];
const testingPermissions = [
  PERMISSIONS.PENTEST_DASHBOARD_READ,
  PERMISSIONS.PENTEST_PROJECTS_READ,
  PERMISSIONS.PENTEST_VULNERABILITIES_READ,
];

test("a DevOps-only user receives no QA or testing widgets", () => {
  const widgets = idsFor(devopsPermissions);
  assert.deepEqual(widgets, ["my-work", "devops-operations"]);
  assert.ok(!widgets.includes("qa-work"));
  assert.ok(!widgets.includes("testing-insights"));
});

test("a QA-only user receives no personal finding analytics", () => {
  const widgets = idsFor(qaPermissions);
  assert.deepEqual(widgets, ["my-work", "qa-work"]);
  assert.ok(!widgets.includes("testing-insights"));
});

test("QA and testing capabilities compose without selecting a primary role", () => {
  const widgets = idsFor([...qaPermissions, ...testingPermissions]);
  assert.deepEqual(widgets, ["my-work", "testing-insights", "qa-work"]);
});

test("removing a permission removes its widget on the next permission refresh", () => {
  assert.ok(idsFor(qaPermissions).includes("qa-work"));
  assert.ok(!idsFor([PERMISSIONS.QA_DASHBOARD_READ]).includes("qa-work"));
});

test("a partial capability grant cannot mount a widget or its query component", () => {
  assert.deepEqual(idsFor([PERMISSIONS.DEVOPS_DASHBOARD_READ]), ["my-work"]);
  assert.deepEqual(idsFor([PERMISSIONS.PENTEST_VULNERABILITIES_READ]), []);
});

test("customer projects use their own capability endpoint instead of the base response", () => {
  assert.equal(
    dashboardWidgetRegistry.find((widget) => widget.id === "representative-work")
      ?.dataSource,
    "representative"
  );
});
