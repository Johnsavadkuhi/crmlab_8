import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import {
  requireAnyPermission,
  requirePermission,
} from "@/middlewares/permission.middleware";
import {
  getBaseDashboardOverview,
  getDevopsDashboardOverview,
  getQaDashboardOverview,
  getQualityDashboardOverview,
  getRepresentativeDashboardOverview,
  getSecurityDashboardOverview,
  getTestingDashboardOverview,
} from "../controllers/personalDashboard.controller";
import { PERSONAL_DASHBOARD_PERMISSIONS } from "../policies/personalDashboard.policy";

const router = Router();

router.use(requireAuth);
router.get(
  ROUTES.MY_DASHBOARD.SUMMARY,
  requireAnyPermission(...PERSONAL_DASHBOARD_PERMISSIONS.base),
  getBaseDashboardOverview
);
router.get(
  ROUTES.MY_DASHBOARD.TESTING,
  requirePermission(...PERSONAL_DASHBOARD_PERMISSIONS.testing),
  getTestingDashboardOverview
);
router.get(
  ROUTES.MY_DASHBOARD.QA,
  requirePermission(...PERSONAL_DASHBOARD_PERMISSIONS.qa),
  getQaDashboardOverview
);
router.get(
  ROUTES.MY_DASHBOARD.QUALITY,
  requirePermission(...PERSONAL_DASHBOARD_PERMISSIONS.quality),
  getQualityDashboardOverview
);
router.get(
  ROUTES.MY_DASHBOARD.DEVOPS,
  requirePermission(...PERSONAL_DASHBOARD_PERMISSIONS.devops),
  getDevopsDashboardOverview
);
router.get(
  ROUTES.MY_DASHBOARD.SECURITY,
  requirePermission(...PERSONAL_DASHBOARD_PERMISSIONS.security),
  getSecurityDashboardOverview
);
router.get(
  ROUTES.MY_DASHBOARD.REPRESENTATIVE,
  requirePermission(...PERSONAL_DASHBOARD_PERMISSIONS.representative),
  getRepresentativeDashboardOverview
);

export default router;
