import type { RequestHandler } from "express";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/response";
import {
  assignAsset,
  createAsset,
  getAsset,
  getAssetSummary,
  listAssets,
  redactAssetAuditInput,
  retireAsset,
  unassignAsset,
  updateAsset,
} from "../services/asset.service";
import type { CreateAssetInput, UpdateAssetInput } from "../validators/asset.validators";

function actor(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  return req.user;
}

function noStore(res: Parameters<RequestHandler>[1]) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Pragma", "no-cache");
}

export const getAssets: RequestHandler = async (req, res, next) => {
  try {
    noStore(res);
    sendSuccess(
      res,
      await listAssets(req.query as Record<string, string | undefined>, actor(req))
    );
  } catch (error) {
    next(error);
  }
};

export const getMyAssets: RequestHandler = async (req, res, next) => {
  try {
    noStore(res);
    sendSuccess(
      res,
      await listAssets(
        { ...(req.query as Record<string, string | undefined>), view: "owned" },
        actor(req)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getAssignedToMeAssets: RequestHandler = async (req, res, next) => {
  try {
    noStore(res);
    sendSuccess(
      res,
      await listAssets(
        { ...(req.query as Record<string, string | undefined>), view: "assigned" },
        actor(req)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getAssetsSummary: RequestHandler = async (req, res, next) => {
  try {
    noStore(res);
    sendSuccess(res, await getAssetSummary(actor(req)));
  } catch (error) {
    next(error);
  }
};

export const getAssetById: RequestHandler = async (req, res, next) => {
  try {
    noStore(res);
    sendSuccess(res, await getAsset(String(req.params.id), actor(req)));
  } catch (error) {
    next(error);
  }
};

export const revealAssetLicenseKey: RequestHandler = async (req, res, next) => {
  try {
    noStore(res);
    const asset = await getAsset(String(req.params.id), actor(req), true);
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.ASSET_LICENSE_REVEAL,
      entityType: AUDIT_ENTITY_TYPES.ASSET,
      entityId: String(req.params.id),
    });
    sendSuccess(res, { id: asset.id, licenseKey: asset.licenseKey });
  } catch (error) {
    next(error);
  }
};

export const postAsset: RequestHandler = async (req, res, next) => {
  try {
    const asset = await createAsset(req.body as CreateAssetInput, actor(req));
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.ASSET_CREATE,
      entityType: AUDIT_ENTITY_TYPES.ASSET,
      entityId: asset.id,
      metadata: { ownerType: asset.ownerType, type: asset.type },
    });
    sendSuccess(res, asset, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const patchAsset: RequestHandler = async (req, res, next) => {
  try {
    const asset = await updateAsset(
      String(req.params.id),
      req.body as UpdateAssetInput,
      actor(req)
    );
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.ASSET_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.ASSET,
      entityId: asset.id,
      metadata: {
        changedFields: Object.keys(req.body),
        values: redactAssetAuditInput(req.body),
      },
    });
    sendSuccess(res, asset);
  } catch (error) {
    next(error);
  }
};

export const postAssignAsset: RequestHandler = async (req, res, next) => {
  try {
    const asset = await assignAsset(
      String(req.params.id),
      req.body.assignedTo,
      req.body.assignedDate,
      actor(req)
    );
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.ASSET_ASSIGN,
      entityType: AUDIT_ENTITY_TYPES.ASSET,
      entityId: asset.id,
      metadata: { assignedTo: req.body.assignedTo, assignedDate: asset.assignedDate },
    });
    sendSuccess(res, asset);
  } catch (error) {
    next(error);
  }
};

export const postUnassignAsset: RequestHandler = async (req, res, next) => {
  try {
    const asset = await unassignAsset(String(req.params.id), actor(req));
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.ASSET_UNASSIGN,
      entityType: AUDIT_ENTITY_TYPES.ASSET,
      entityId: asset.id,
    });
    sendSuccess(res, asset);
  } catch (error) {
    next(error);
  }
};

export const deleteAsset: RequestHandler = async (req, res, next) => {
  try {
    const asset = await retireAsset(String(req.params.id), actor(req));
    await writeAuditLog({
      req,
      action: AUDIT_ACTIONS.ASSET_RETIRE,
      entityType: AUDIT_ENTITY_TYPES.ASSET,
      entityId: asset.id,
    });
    sendSuccess(res, asset);
  } catch (error) {
    next(error);
  }
};
