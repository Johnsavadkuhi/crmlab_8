import mongoose, { type QueryFilter } from "mongoose";
import type { AssetContract, AssetSummaryContract } from "@role-dashboard/contracts";
import { HTTP_STATUS } from "@/constants/http";
import { env } from "@/config/env";
import { PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { UserModel } from "@/modules/users/models/user.model";
import { AppError } from "@/utils/AppError";
import { AssetModel, type AssetDocument } from "../models/asset.model";
import type { CreateAssetInput, UpdateAssetInput } from "../validators/asset.validators";

export type AssetActor = Express.UserContext;
export type AssetListQuery = Record<string, string | undefined>;

const STRING_FIELDS = new Set([
  "assetCode",
  "description",
  "brand",
  "model",
  "version",
  "serialNumber",
  "licenseKey",
  "macAddress",
  "ipAddress",
  "location",
  "vendor",
]);
const DATE_FIELDS = new Set([
  "assignedDate",
  "purchaseDate",
  "warrantyExpiry",
  "maintenanceSchedule",
  "licenseExpiry",
  "installDate",
]);
const MUTABLE_FIELDS = new Set([
  "name",
  "assetCode",
  "type",
  "ownerType",
  "owner",
  "departmentScope",
  "platforms",
  "description",
  "brand",
  "model",
  "version",
  "serialNumber",
  "licenseKey",
  "macAddress",
  "ipAddress",
  "status",
  "location",
  "purchaseDate",
  "warrantyExpiry",
  "maintenanceSchedule",
  "cost",
  "vendor",
  "tags",
  "softwareType",
  "licenseStatus",
  "licenseExpiry",
  "installDate",
  "allowedInstallations",
]);

function has(actor: AssetActor, permission: Permission) {
  return (
    actor.permissions.includes(PERMISSIONS.ADMIN_SYSTEM_MANAGE) ||
    actor.permissions.includes(permission)
  );
}

export function canReadAllAssets(actor: AssetActor) {
  return (
    has(actor, PERMISSIONS.ASSETS_READ_ALL) || has(actor, PERMISSIONS.ASSETS_MANAGE_ALL)
  );
}

export function canUpdateAllAssets(actor: AssetActor) {
  return (
    has(actor, PERMISSIONS.ASSETS_UPDATE_ALL) || has(actor, PERMISSIONS.ASSETS_MANAGE_ALL)
  );
}

export function assetScopeFilter(actor: AssetActor): QueryFilter<AssetDocument> {
  if (canReadAllAssets(actor)) return {};
  return personalAssetScopeFilter(actor);
}

function personalAssetScopeFilter(actor: AssetActor): QueryFilter<AssetDocument> {
  const userId = new mongoose.Types.ObjectId(actor.id);
  return { $or: [{ ownerType: "user", owner: userId }, { assignedTo: userId }] };
}

export function assetSummaryScopeFilter(actor: AssetActor): QueryFilter<AssetDocument> {
  return actor.roles.includes(ROLES.ADMIN) ? {} : personalAssetScopeFilter(actor);
}

function sameId(value: unknown, expected: string) {
  if (!value) return false;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id) === expected;
  }
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: unknown }).id) === expected;
  }
  return String(value) === expected;
}

export function isPersonallyOwnedBy(asset: Record<string, unknown>, actor: AssetActor) {
  return asset.ownerType === "user" && sameId(asset.owner, actor.id);
}

function canEditAsset(asset: Record<string, unknown>, actor: AssetActor) {
  return (
    canUpdateAllAssets(actor) ||
    (has(actor, PERMISSIONS.ASSETS_UPDATE_OWN) && isPersonallyOwnedBy(asset, actor))
  );
}

export function canReadAsset(asset: Record<string, unknown>, actor: AssetActor) {
  return (
    canReadAllAssets(actor) ||
    isPersonallyOwnedBy(asset, actor) ||
    sameId(asset.assignedTo, actor.id)
  );
}

function canAssignAssets(actor: AssetActor) {
  return (
    has(actor, PERMISSIONS.ASSETS_ASSIGN_ALL) || has(actor, PERMISSIONS.ASSETS_MANAGE_ALL)
  );
}

function maskLicenseKey(value: string) {
  const suffix = value.replace(/\s/g, "").slice(-4);
  return suffix ? `••••-••••-${suffix}` : "••••••••";
}

function plainAsset(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && "toObject" in value) {
    return (value as { toObject(): Record<string, unknown> }).toObject();
  }
  return { ...(value as Record<string, unknown>) };
}

function serializeUserReference(value: unknown) {
  if (!value) return value;
  if (typeof value === "object" && "_id" in value) {
    const user = value as {
      _id: unknown;
      firstName?: string;
      lastName?: string;
      username?: string;
    };
    return {
      id: String(user._id),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    };
  }
  return { id: String(value) };
}

function expiryState(value: unknown) {
  if (!value) return "unknown" as const;
  const time = new Date(String(value)).getTime();
  if (!Number.isFinite(time)) return "unknown" as const;
  const now = Date.now();
  if (time < now) return "expired" as const;
  return time <= now + env.assetAlertDays * 24 * 60 * 60 * 1000
    ? ("expiring" as const)
    : ("active" as const);
}

function maintenanceState(value: unknown) {
  const state = expiryState(value);
  if (state === "expired") return "overdue" as const;
  if (state === "expiring") return "due-soon" as const;
  if (state === "active") return "scheduled" as const;
  return "unknown" as const;
}

export function serializeAsset(
  value: unknown,
  actor: AssetActor,
  revealLicense = false
): AssetContract {
  const asset = plainAsset(value);
  const id = String(asset._id || asset.id);
  delete asset._id;
  delete asset.__v;
  const own = isPersonallyOwnedBy(asset, actor);
  const viewCost = own || has(actor, PERMISSIONS.ASSETS_COST_READ_ALL);
  const viewSensitive = own || has(actor, PERMISSIONS.ASSETS_SENSITIVE_READ_ALL);
  const reveal =
    (own || has(actor, PERMISSIONS.ASSETS_LICENSE_READ_ALL)) && revealLicense;
  const licenseKey = typeof asset.licenseKey === "string" ? asset.licenseKey : undefined;

  asset.owner = serializeUserReference(asset.owner);
  asset.assignedTo = serializeUserReference(asset.assignedTo);

  if (!viewCost) delete asset.cost;
  if (!viewSensitive) {
    delete asset.ipAddress;
    delete asset.macAddress;
    delete asset.serialNumber;
  }
  if (licenseKey) {
    asset.licenseKey = reveal ? licenseKey : maskLicenseKey(licenseKey);
    asset.licenseKeyMasked = !reveal;
  } else {
    delete asset.licenseKey;
  }

  return {
    ...asset,
    id,
    departmentScope: Array.isArray(asset.departmentScope) ? asset.departmentScope : [],
    platforms: Array.isArray(asset.platforms) ? asset.platforms : [],
    tags: Array.isArray(asset.tags) ? asset.tags : [],
    lifecycleAlerts: {
      warranty: expiryState(asset.warrantyExpiry),
      license: expiryState(asset.licenseExpiry),
      maintenance: maintenanceState(asset.maintenanceSchedule),
    },
    permissions: {
      canEdit: canEditAsset(asset, actor),
      canAssign:
        canAssignAssets(actor) && ["bank", "lab"].includes(String(asset.ownerType)),
      canRevealLicense:
        Boolean(licenseKey) && (own || has(actor, PERMISSIONS.ASSETS_LICENSE_READ_ALL)),
      canViewCost: viewCost,
      canViewSensitive: viewSensitive,
    },
  } as unknown as AssetContract;
}

function andFilter(...filters: QueryFilter<AssetDocument>[]) {
  const active = filters.filter((filter) => Object.keys(filter).length > 0);
  return active.length <= 1 ? active[0] || {} : { $and: active };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildAssetListFilter(query: AssetListQuery, actor: AssetActor) {
  const filter: QueryFilter<AssetDocument> = {};
  const userId = new mongoose.Types.ObjectId(actor.id);
  if (query.view === "owned")
    Object.assign(
      filter,
      canReadAllAssets(actor)
        ? { ownerType: "user" }
        : { ownerType: "user", owner: userId }
    );
  if (query.view === "assigned")
    Object.assign(
      filter,
      canReadAllAssets(actor) ? { assignedTo: { $ne: null } } : { assignedTo: userId }
    );
  for (const field of ["type", "ownerType", "status"] as const) {
    if (query[field]) filter[field] = query[field] as never;
  }
  if (query.department) filter.departmentScope = query.department as never;
  if (query.platform) filter.platforms = query.platform as never;
  if (query.owner && canReadAllAssets(actor)) filter.owner = query.owner;
  if (query.assignedTo && canReadAllAssets(actor)) filter.assignedTo = query.assignedTo;
  if (query.brand) filter.brand = new RegExp(escapeRegex(query.brand), "i");
  if (query.vendor) filter.vendor = new RegExp(escapeRegex(query.vendor), "i");
  if (query.tag) filter.tags = query.tag;
  if (query.purchaseFrom || query.purchaseTo) {
    filter.purchaseDate = {
      ...(query.purchaseFrom
        ? { $gte: new Date(`${query.purchaseFrom}T00:00:00.000Z`) }
        : {}),
      ...(query.purchaseTo
        ? { $lte: new Date(`${query.purchaseTo}T23:59:59.999Z`) }
        : {}),
    };
  }
  const now = new Date();
  const alertEnd = new Date(now.getTime() + env.assetAlertDays * 24 * 60 * 60 * 1000);
  if (query.warrantyExpiring === "true")
    filter.warrantyExpiry = { $gte: now, $lte: alertEnd };
  if (query.licenseExpiring === "true")
    filter.licenseExpiry = { $gte: now, $lte: alertEnd };
  const search = query.search?.trim();
  const searchFilter = search ? { $text: { $search: search } } : {};
  return andFilter(assetScopeFilter(actor), filter, searchFilter);
}

const POPULATE = [
  { path: "owner", select: "firstName lastName username" },
  { path: "assignedTo", select: "firstName lastName username" },
];

export async function listAssets(query: AssetListQuery, actor: AssetActor) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const sortBy = query.sortBy || "updatedAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const filter = buildAssetListFilter(query, actor);
  const [items, total] = await Promise.all([
    AssetModel.find(filter)
      .select("+licenseKey")
      .populate(POPULATE)
      .sort({ [sortBy]: sortOrder, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    AssetModel.countDocuments(filter),
  ]);
  return {
    items: items.map((item) => serializeAsset(item, actor)),
    pageInfo: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

async function accessibleAsset(id: string, actor: AssetActor) {
  const asset = await AssetModel.findById(id).select("+licenseKey").populate(POPULATE);
  if (!asset) throw new AppError("Asset not found", HTTP_STATUS.NOT_FOUND);
  if (!canReadAsset(plainAsset(asset), actor)) {
    throw new AppError("Asset access is forbidden", HTTP_STATUS.FORBIDDEN);
  }
  return asset;
}

export async function getAsset(id: string, actor: AssetActor, revealLicense = false) {
  return serializeAsset(await accessibleAsset(id, actor), actor, revealLicense);
}

async function assertUserExists(userId: string) {
  const exists = await UserModel.exists({ _id: userId, isActive: { $ne: false } });
  if (!exists)
    throw new AppError(
      "Asset user does not exist or is inactive",
      HTTP_STATUS.BAD_REQUEST
    );
}

function cleanedInput(input: CreateAssetInput | UpdateAssetInput) {
  const output: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(input)) {
    if (!MUTABLE_FIELDS.has(key) || raw === undefined) continue;
    let value: unknown = raw;
    if (typeof value === "string") value = value.trim();
    if (DATE_FIELDS.has(key) && typeof value === "string" && value)
      value = new Date(value);
    if (key === "macAddress" && typeof value === "string") value = value.toLowerCase();
    if (key === "tags" && Array.isArray(value))
      value = Array.from(
        new Set(
          value
            .map(String)
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      );
    if (["departmentScope", "platforms"].includes(key) && Array.isArray(value))
      value = Array.from(new Set(value));
    output[key] = value;
  }
  return output;
}

async function assertOwnership(input: Record<string, unknown>) {
  const ownerType = String(input.ownerType || "");
  if (["bank", "lab"].includes(ownerType) && !String(input.assetCode || "").trim()) {
    throw new AppError(
      "Asset code is required for bank or lab-owned assets",
      HTTP_STATUS.BAD_REQUEST
    );
  }
  if (ownerType === "user") {
    if (!input.owner)
      throw new AppError(
        "Owner is required for personal assets",
        HTTP_STATUS.BAD_REQUEST
      );
    const owner = input.owner;
    const ownerId =
      typeof owner === "object" && owner !== null && "_id" in owner
        ? String((owner as { _id: unknown })._id)
        : String(owner);
    await assertUserExists(ownerId);
  }
}

async function assertUniqueIdentifiers(
  input: Record<string, unknown>,
  excludeId?: string
) {
  for (const field of ["assetCode", "serialNumber", "macAddress"] as const) {
    const value = input[field];
    if (!value) continue;
    const condition =
      field === "macAddress"
        ? { $regex: `^${escapeRegex(String(value))}$`, $options: "i" }
        : value;
    const duplicate = await AssetModel.exists({
      [field]: condition,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (duplicate) throw new AppError(`${field} already exists`, HTTP_STATUS.CONFLICT);
  }
}

function throwPersistenceError(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  ) {
    throw new AppError("An asset identifier already exists", HTTP_STATUS.CONFLICT);
  }
  throw error;
}

export async function createAsset(input: CreateAssetInput, actor: AssetActor) {
  const canCreateAll = canUpdateAllAssets(actor);
  const payload = cleanedInput(input);
  if (!canCreateAll) {
    if (payload.ownerType !== "user") {
      throw new AppError("Users may only create personal assets", HTTP_STATUS.FORBIDDEN);
    }
    if (payload.owner && String(payload.owner) !== actor.id) {
      throw new AppError(
        "Users cannot create assets for another owner",
        HTTP_STATUS.FORBIDDEN
      );
    }
    payload.owner = actor.id;
  }
  if (["bank", "lab"].includes(String(payload.ownerType))) delete payload.owner;
  for (const field of [...STRING_FIELDS, ...DATE_FIELDS]) {
    if (payload[field] === null || payload[field] === "") delete payload[field];
  }
  if (payload.type === "software") {
    payload.softwareType ??= "free";
    payload.licenseStatus ??= "licensed";
  }
  await assertOwnership(payload);
  await assertUniqueIdentifiers(payload);
  const asset = await AssetModel.create(payload).catch(throwPersistenceError);
  return serializeAsset(
    await AssetModel.findById(asset._id).select("+licenseKey").populate(POPULATE),
    actor
  );
}

export async function updateAsset(
  id: string,
  input: UpdateAssetInput,
  actor: AssetActor
) {
  const current = await accessibleAsset(id, actor);
  const currentPlain = plainAsset(current);
  if (!canEditAsset(currentPlain, actor))
    throw new AppError("Asset update is forbidden", HTTP_STATUS.FORBIDDEN);
  const changes = cleanedInput(input);
  if (!canUpdateAllAssets(actor)) {
    for (const locked of ["ownerType", "owner", "assignedTo", "assignedDate"])
      delete changes[locked];
  }
  const finalValue = { ...currentPlain, ...changes };
  if (["bank", "lab"].includes(String(finalValue.ownerType))) {
    delete finalValue.owner;
    changes.owner = null;
  }
  // Do not block an unrelated patch to a partial legacy document. Existing
  // ownership inconsistencies remain flagged until ownership/code is edited.
  if (["ownerType", "owner", "assetCode"].some((field) => field in changes)) {
    await assertOwnership(finalValue);
  }
  await assertUniqueIdentifiers(finalValue, id);

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, 1> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || (STRING_FIELDS.has(key) && value === "")) $unset[key] = 1;
    else $set[key] = value;
  }
  const updated = await AssetModel.findByIdAndUpdate(
    id,
    {
      ...(Object.keys($set).length ? { $set } : {}),
      ...(Object.keys($unset).length ? { $unset } : {}),
    },
    { new: true, runValidators: true }
  )
    .select("+licenseKey")
    .populate(POPULATE)
    .catch(throwPersistenceError);
  if (!updated) throw new AppError("Asset not found", HTTP_STATUS.NOT_FOUND);
  return serializeAsset(updated, actor);
}

export async function assignAsset(
  id: string,
  assignedTo: string,
  assignedDate: string | null | undefined,
  actor: AssetActor
) {
  if (!canAssignAssets(actor))
    throw new AppError("Asset assignment is forbidden", HTTP_STATUS.FORBIDDEN);
  await assertUserExists(assignedTo);
  const asset = await AssetModel.findById(id).select("+licenseKey");
  if (!asset) throw new AppError("Asset not found", HTTP_STATUS.NOT_FOUND);
  if (!["bank", "lab"].includes(asset.ownerType))
    throw new AppError(
      "Only bank or laboratory assets can be assigned",
      HTTP_STATUS.BAD_REQUEST
    );
  asset.assignedTo = new mongoose.Types.ObjectId(assignedTo);
  asset.assignedDate = assignedDate ? new Date(assignedDate) : new Date();
  if (asset.status === "available") asset.status = "in-use";
  await asset.save();
  return serializeAsset(
    await AssetModel.findById(id).select("+licenseKey").populate(POPULATE),
    actor
  );
}

export async function unassignAsset(id: string, actor: AssetActor) {
  if (!canAssignAssets(actor))
    throw new AppError("Asset assignment is forbidden", HTTP_STATUS.FORBIDDEN);
  const asset = await AssetModel.findById(id).select("+licenseKey");
  if (!asset) throw new AppError("Asset not found", HTTP_STATUS.NOT_FOUND);
  asset.assignedTo = undefined;
  asset.assignedDate = undefined;
  if (asset.status === "in-use") asset.status = "available";
  await asset.save();
  return serializeAsset(
    await AssetModel.findById(id).select("+licenseKey").populate(POPULATE),
    actor
  );
}

export async function retireAsset(id: string, actor: AssetActor) {
  if (!has(actor, PERMISSIONS.ASSETS_MANAGE_ALL))
    throw new AppError("Asset retirement is forbidden", HTTP_STATUS.FORBIDDEN);
  const asset = await AssetModel.findByIdAndUpdate(
    id,
    { $set: { status: "retired" } },
    { new: true, runValidators: true }
  )
    .select("+licenseKey")
    .populate(POPULATE);
  if (!asset) throw new AppError("Asset not found", HTTP_STATUS.NOT_FOUND);
  return serializeAsset(asset, actor);
}

function groupCounts(rows: Array<{ _id: unknown; count: number }>) {
  return Object.fromEntries(
    rows.filter((row) => row._id !== null).map((row) => [String(row._id), row.count])
  );
}

export async function getAssetSummary(actor: AssetActor): Promise<AssetSummaryContract> {
  const isAdminSummary = actor.roles.includes(ROLES.ADMIN);
  const scope = assetSummaryScopeFilter(actor);
  const userId = new mongoose.Types.ObjectId(actor.id);
  const now = new Date();
  const in30 = new Date(now.getTime() + env.assetAlertDays * 24 * 60 * 60 * 1000);
  const [facet] = await AssetModel.aggregate([
    { $match: scope },
    {
      $facet: {
        total: [{ $count: "count" }],
        owned: [
          {
            $match: isAdminSummary
              ? { ownerType: "user" }
              : { ownerType: "user", owner: userId },
          },
          { $count: "count" },
        ],
        assigned: [
          {
            $match: isAdminSummary
              ? { assignedTo: { $ne: null } }
              : { assignedTo: userId },
          },
          { $count: "count" },
        ],
        byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
        byOwnerType: [{ $group: { _id: "$ownerType", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byDepartment: [
          { $unwind: { path: "$departmentScope", preserveNullAndEmptyArrays: false } },
          { $group: { _id: "$departmentScope", count: { $sum: 1 } } },
        ],
        byPlatform: [
          { $unwind: { path: "$platforms", preserveNullAndEmptyArrays: false } },
          { $group: { _id: "$platforms", count: { $sum: 1 } } },
        ],
        warrantyExpired: [
          { $match: { warrantyExpiry: { $lt: now } } },
          { $count: "count" },
        ],
        warrantyExpiring: [
          { $match: { warrantyExpiry: { $gte: now, $lte: in30 } } },
          { $count: "count" },
        ],
        licenseExpired: [
          { $match: { licenseExpiry: { $lt: now } } },
          { $count: "count" },
        ],
        licenseExpiring: [
          { $match: { licenseExpiry: { $gte: now, $lte: in30 } } },
          { $count: "count" },
        ],
        maintenanceOverdue: [
          { $match: { maintenanceSchedule: { $lt: now } } },
          { $count: "count" },
        ],
        maintenanceDueSoon: [
          { $match: { maintenanceSchedule: { $gte: now, $lte: in30 } } },
          { $count: "count" },
        ],
        totalCost: [
          { $group: { _id: null, value: { $sum: { $ifNull: ["$cost", 0] } } } },
        ],
      },
    },
  ]);
  const count = (key: string) => Number(facet?.[key]?.[0]?.count || 0);
  return {
    total: count("total"),
    owned: count("owned"),
    assigned: count("assigned"),
    byType: groupCounts(facet?.byType || []),
    byOwnerType: groupCounts(facet?.byOwnerType || []),
    byStatus: groupCounts(facet?.byStatus || []),
    byDepartment: groupCounts(facet?.byDepartment || []),
    byPlatform: groupCounts(facet?.byPlatform || []),
    lifecycle: {
      warrantyExpired: count("warrantyExpired"),
      warrantyExpiring: count("warrantyExpiring"),
      licenseExpired: count("licenseExpired"),
      licenseExpiring: count("licenseExpiring"),
      maintenanceOverdue: count("maintenanceOverdue"),
      maintenanceDueSoon: count("maintenanceDueSoon"),
    },
    ...(has(actor, PERMISSIONS.ASSETS_COST_READ_ALL)
      ? { totalCost: Number(facet?.totalCost?.[0]?.value || 0) }
      : {}),
  };
}

export function redactAssetAuditInput(input: Record<string, unknown>) {
  const redacted = { ...input };
  for (const field of ["licenseKey", "ipAddress", "macAddress", "serialNumber", "cost"]) {
    if (field in redacted) redacted[field] = "[REDACTED]";
  }
  return redacted;
}
