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
  deleteAsset,
  getAssetById,
  getAssets,
  getAssetsSummary,
  getAssignedToMeAssets,
  getMyAssets,
  patchAsset,
  postAsset,
  postAssignAsset,
  postUnassignAsset,
  revealAssetLicenseKey,
} from "../controllers/asset.controller";
import {
  assetIdSchema,
  assetListSchema,
  assignAssetSchema,
  createAssetSchema,
  updateAssetSchema,
} from "../validators/asset.validators";

const router = Router();
router.use(requireAuth);

const readAsset = requireAnyPermission(
  PERMISSIONS.ASSETS_READ_OWN,
  PERMISSIONS.ASSETS_READ_ALL
);
const updateAsset = requireAnyPermission(
  PERMISSIONS.ASSETS_UPDATE_OWN,
  PERMISSIONS.ASSETS_UPDATE_ALL
);

router.get(ROUTES.ASSETS.SUMMARY, readAsset, getAssetsSummary);
router.get(ROUTES.ASSETS.MY, readAsset, validate(assetListSchema), getMyAssets);
router.get(
  ROUTES.ASSETS.ASSIGNED_TO_ME,
  readAsset,
  validate(assetListSchema),
  getAssignedToMeAssets
);
router.get(ROUTES.ROOT, readAsset, validate(assetListSchema), getAssets);
router.post(
  ROUTES.ROOT,
  requirePermission(PERMISSIONS.ASSETS_CREATE_OWN),
  validate(createAssetSchema),
  postAsset
);
router.get(
  ROUTES.ASSETS.LICENSE_KEY,
  readAsset,
  validate(assetIdSchema),
  revealAssetLicenseKey
);
router.post(
  ROUTES.ASSETS.ASSIGN,
  requireAnyPermission(PERMISSIONS.ASSETS_ASSIGN_ALL, PERMISSIONS.ASSETS_MANAGE_ALL),
  validate(assignAssetSchema),
  postAssignAsset
);
router.post(
  ROUTES.ASSETS.UNASSIGN,
  requireAnyPermission(PERMISSIONS.ASSETS_ASSIGN_ALL, PERMISSIONS.ASSETS_MANAGE_ALL),
  validate(assetIdSchema),
  postUnassignAsset
);
router.get(ROUTES.ASSETS.DETAIL, readAsset, validate(assetIdSchema), getAssetById);
router.patch(ROUTES.ASSETS.DETAIL, updateAsset, validate(updateAssetSchema), patchAsset);
router.delete(
  ROUTES.ASSETS.DETAIL,
  requirePermission(PERMISSIONS.ASSETS_MANAGE_ALL),
  validate(assetIdSchema),
  deleteAsset
);

export default router;
