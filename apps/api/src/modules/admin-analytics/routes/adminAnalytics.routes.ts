import { Router } from "express";
import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requirePermission, requireRole } from "@/middlewares/permission.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { getAdminAnalyticsOverview } from "../controllers/adminAnalytics.controller";
import { adminAnalyticsQuerySchema } from "../validators/adminAnalytics.validators";

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));
router.get(
  ROUTES.ADMIN_ANALYTICS.OVERVIEW,
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD_READ),
  validate(adminAnalyticsQuerySchema),
  getAdminAnalyticsOverview
);

export default router;
