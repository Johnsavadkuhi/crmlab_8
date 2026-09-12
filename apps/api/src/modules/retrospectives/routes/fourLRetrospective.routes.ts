import { Router } from "express";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { requireAuth } from "@/middlewares/auth.middleware";
import {
  requireAnyPermission,
  requirePermission,
} from "@/middlewares/permission.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  approveFourLRetrospective,
  getFourLRetrospective,
  getMyFourLWorkGate,
  listFourLRetrospectives,
  reopenFourLRetrospective,
  requestFourLChanges,
  saveFourLDraft,
  sendFourLToAdmin,
  submitFourLRetrospective,
} from "../controllers/fourLRetrospective.controller";
import {
  fourLDraftSchema,
  fourLIdSchema,
  fourLOptionalReviewSchema,
  fourLReviewSchema,
} from "../validators/fourLRetrospective.validators";

const router = Router();

router.use(requireAuth);
router.get(
  ROUTES.ROOT,
  requireAnyPermission(
    PERMISSIONS.PENTEST_PROJECTS_READ,
    PERMISSIONS.REPRESENTATIVE_PROJECTS_READ,
    PERMISSIONS.ADMIN_SYSTEM_MANAGE
  ),
  listFourLRetrospectives
);
router.get(
  ROUTES.FOUR_L_RETROSPECTIVES.WORK_GATE,
  requirePermission(PERMISSIONS.PENTEST_PROJECTS_READ),
  getMyFourLWorkGate
);
router.get(
  ROUTES.FOUR_L_RETROSPECTIVES.DETAIL,
  requireAnyPermission(
    PERMISSIONS.PENTEST_PROJECTS_READ,
    PERMISSIONS.REPRESENTATIVE_PROJECTS_READ,
    PERMISSIONS.ADMIN_SYSTEM_MANAGE
  ),
  validate(fourLIdSchema),
  getFourLRetrospective
);
router.put(
  ROUTES.FOUR_L_RETROSPECTIVES.DRAFT,
  requirePermission(PERMISSIONS.PENTEST_PROJECTS_READ),
  validate(fourLDraftSchema),
  saveFourLDraft
);
router.post(
  ROUTES.FOUR_L_RETROSPECTIVES.SUBMIT,
  requirePermission(PERMISSIONS.PENTEST_PROJECTS_READ),
  validate(fourLIdSchema),
  submitFourLRetrospective
);
router.post(
  ROUTES.FOUR_L_RETROSPECTIVES.REQUEST_CHANGES,
  requirePermission(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ),
  validate(fourLReviewSchema),
  requestFourLChanges
);
router.post(
  ROUTES.FOUR_L_RETROSPECTIVES.APPROVE,
  requirePermission(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ),
  validate(fourLOptionalReviewSchema),
  approveFourLRetrospective
);
router.post(
  ROUTES.FOUR_L_RETROSPECTIVES.SEND_TO_ADMIN,
  requirePermission(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ),
  validate(fourLIdSchema),
  sendFourLToAdmin
);
router.post(
  ROUTES.FOUR_L_RETROSPECTIVES.REOPEN,
  requirePermission(PERMISSIONS.REPRESENTATIVE_PROJECTS_READ),
  validate(fourLReviewSchema),
  reopenFourLRetrospective
);

export default router;
