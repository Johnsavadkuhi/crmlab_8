import { PERMISSIONS } from "@/entities/permission/model/permissions";
import type { Permission } from "@/shared/types";

export type DashboardWidgetId =
  | "my-work"
  | "testing-insights"
  | "qa-work"
  | "quality-control"
  | "devops-operations"
  | "technical-management"
  | "representative-work";

export type DashboardWidgetCategory =
  | "my-work"
  | "testing"
  | "quality-assurance"
  | "quality-control"
  | "devops"
  | "management"
  | "customer";

export type DashboardDataSource =
  | "base"
  | "testing"
  | "qa"
  | "quality"
  | "devops"
  | "security"
  | "representative";

export type DashboardWidgetConfig = {
  id: DashboardWidgetId;
  title: string;
  requiredPermissions: Permission[];
  permissionMode: "all" | "any";
  optionalPermissions: Permission[];
  priority: number;
  category: DashboardWidgetCategory;
  component: DashboardWidgetId;
  dataSource: DashboardDataSource;
};

const dashboardReadPermissions: Permission[] = [
  PERMISSIONS.PENTEST_DASHBOARD_READ,
  PERMISSIONS.QA_DASHBOARD_READ,
  PERMISSIONS.QUALITY_DASHBOARD_READ,
  PERMISSIONS.DEVOPS_DASHBOARD_READ,
  PERMISSIONS.SECURITY_DASHBOARD_READ,
  PERMISSIONS.REPRESENTATIVE_DASHBOARD_READ,
];

export const dashboardWidgetRegistry: DashboardWidgetConfig[] = [
  {
    id: "my-work",
    title: "My work",
    requiredPermissions: dashboardReadPermissions,
    permissionMode: "any",
    optionalPermissions: [],
    priority: 10,
    category: "my-work",
    component: "my-work",
    dataSource: "base",
  },
  {
    id: "testing-insights",
    title: "Security testing",
    requiredPermissions: [
      PERMISSIONS.PENTEST_DASHBOARD_READ,
      PERMISSIONS.PENTEST_PROJECTS_READ,
      PERMISSIONS.PENTEST_VULNERABILITIES_READ,
    ],
    permissionMode: "all",
    optionalPermissions: [
      PERMISSIONS.PENTEST_VULNERABILITIES_CREATE,
      PERMISSIONS.PENTEST_VULNERABILITIES_UPDATE,
    ],
    priority: 20,
    category: "testing",
    component: "testing-insights",
    dataSource: "testing",
  },
  {
    id: "qa-work",
    title: "Quality assurance",
    requiredPermissions: [PERMISSIONS.QA_DASHBOARD_READ, PERMISSIONS.QA_PROJECTS_READ],
    permissionMode: "all",
    optionalPermissions: [
      PERMISSIONS.QA_TEST_CASES_READ,
      PERMISSIONS.QA_TEST_CASES_CREATE,
      PERMISSIONS.QA_TEST_CASES_UPDATE,
    ],
    priority: 30,
    category: "quality-assurance",
    component: "qa-work",
    dataSource: "qa",
  },
  {
    id: "quality-control",
    title: "Quality control",
    requiredPermissions: [
      PERMISSIONS.QUALITY_DASHBOARD_READ,
      PERMISSIONS.QUALITY_PROJECTS_READ,
    ],
    permissionMode: "all",
    optionalPermissions: [
      PERMISSIONS.QUALITY_RESULTS_REVIEW,
      PERMISSIONS.QUALITY_RESULTS_APPROVE,
      PERMISSIONS.QUALITY_RESULTS_REJECT,
    ],
    priority: 40,
    category: "quality-control",
    component: "quality-control",
    dataSource: "quality",
  },
  {
    id: "devops-operations",
    title: "DevOps operations",
    requiredPermissions: [
      PERMISSIONS.DEVOPS_DASHBOARD_READ,
      PERMISSIONS.DEVOPS_PROJECTS_READ,
    ],
    permissionMode: "all",
    optionalPermissions: [
      PERMISSIONS.DEVOPS_DEPLOYMENTS_READ,
      PERMISSIONS.DEVOPS_DEPLOYMENTS_UPDATE,
      PERMISSIONS.DEVOPS_SERVERS_READ,
    ],
    priority: 25,
    category: "devops",
    component: "devops-operations",
    dataSource: "devops",
  },
  {
    id: "technical-management",
    title: "Technical management",
    requiredPermissions: [
      PERMISSIONS.SECURITY_DASHBOARD_READ,
      PERMISSIONS.SECURITY_PROJECTS_READ,
    ],
    permissionMode: "all",
    optionalPermissions: [
      PERMISSIONS.SECURITY_PROJECTS_ASSIGN,
      PERMISSIONS.SECURITY_VULNERABILITIES_READ,
      PERMISSIONS.SECURITY_FINDINGS_REVIEW,
    ],
    priority: 22,
    category: "management",
    component: "technical-management",
    dataSource: "security",
  },
  {
    id: "representative-work",
    title: "Customer projects",
    requiredPermissions: [
      PERMISSIONS.REPRESENTATIVE_DASHBOARD_READ,
      PERMISSIONS.REPRESENTATIVE_PROJECTS_READ,
    ],
    permissionMode: "all",
    optionalPermissions: [
      PERMISSIONS.REPRESENTATIVE_TICKETS_READ,
      PERMISSIONS.REPRESENTATIVE_TICKETS_CREATE,
    ],
    priority: 50,
    category: "customer",
    component: "representative-work",
    dataSource: "representative",
  },
];

export const dashboardCategoryOrder: DashboardWidgetCategory[] = [
  "my-work",
  "management",
  "testing",
  "quality-assurance",
  "quality-control",
  "devops",
  "customer",
];

export function canRenderDashboardWidget(
  widget: DashboardWidgetConfig,
  permissions: readonly Permission[]
) {
  return widget.permissionMode === "all"
    ? widget.requiredPermissions.every((permission) => permissions.includes(permission))
    : widget.requiredPermissions.some((permission) => permissions.includes(permission));
}

export function getAllowedDashboardWidgets(permissions: readonly Permission[]) {
  return dashboardWidgetRegistry
    .filter((widget) => canRenderDashboardWidget(widget, permissions))
    .sort((left, right) => left.priority - right.priority);
}
