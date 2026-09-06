import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { AssetModel } from "../models/asset.model";
import { createAssetBodySchema } from "../validators/asset.validators";
import {
  canReadAsset,
  assetSummaryScopeFilter,
  isPersonallyOwnedBy,
  redactAssetAuditInput,
  serializeAsset,
  type AssetActor,
} from "./asset.service";

function actor(
  id: mongoose.Types.ObjectId,
  permissions: Permission[] = [
    PERMISSIONS.ASSETS_CREATE_OWN,
    PERMISSIONS.ASSETS_READ_OWN,
    PERMISSIONS.ASSETS_UPDATE_OWN,
  ]
): AssetActor {
  return {
    id: String(id),
    firstName: "Test",
    lastName: "User",
    username: "test",
    roles: [],
    permissions,
    sessionVersion: 0,
  };
}

test("the Assets model is explicitly pinned to the verified legacy collection", () => {
  assert.equal(AssetModel.modelName, "Assets");
  assert.equal(AssetModel.collection.collectionName, "assets");
});

test("partial legacy hardware documents serialize without synthetic software data", () => {
  const owner = new mongoose.Types.ObjectId();
  const legacy = AssetModel.hydrate({
    _id: new mongoose.Types.ObjectId(),
    name: "Legacy workstation",
    type: "hardware",
    ownerType: "user",
    owner,
    status: "available",
  });
  const result = serializeAsset(legacy, actor(owner));
  assert.deepEqual(result.departmentScope, []);
  assert.deepEqual(result.platforms, []);
  assert.deepEqual(result.tags, []);
  assert.equal(result.softwareType, undefined);
  assert.equal(result.licenseStatus, undefined);
});

test("legacy software fields retain version and masked license data", () => {
  const owner = new mongoose.Types.ObjectId();
  const legacy = AssetModel.hydrate({
    _id: new mongoose.Types.ObjectId(),
    name: "Legacy security suite",
    type: "software",
    ownerType: "user",
    owner,
    version: "2024.7",
    licenseKey: "LEGACY-KEY-1234",
    licenseStatus: "licensed",
  });
  const result = serializeAsset(legacy, actor(owner));
  assert.equal(result.version, "2024.7");
  assert.equal(result.licenseStatus, "licensed");
  assert.equal(result.licenseKeyMasked, true);
  assert.notEqual(result.licenseKey, "LEGACY-KEY-1234");
});

test("resource policy blocks another user's personal asset but permits its assignee", () => {
  const owner = new mongoose.Types.ObjectId();
  const assignee = new mongoose.Types.ObjectId();
  const stranger = new mongoose.Types.ObjectId();
  const asset = { ownerType: "user", owner, assignedTo: assignee };
  assert.equal(isPersonallyOwnedBy(asset, actor(owner)), true);
  assert.equal(canReadAsset(asset, actor(owner)), true);
  assert.equal(canReadAsset(asset, actor(assignee)), true);
  assert.equal(canReadAsset(asset, actor(stranger)), false);
});

test("all-scope permission grants organizational visibility without role checks", () => {
  const manager = actor(new mongoose.Types.ObjectId(), [PERMISSIONS.ASSETS_READ_ALL]);
  assert.equal(canReadAsset({ ownerType: "bank" }, manager), true);
});

test("organization-wide asset statistics are restricted to admin accounts", () => {
  const userId = new mongoose.Types.ObjectId();
  const nonAdminWithReadAll = actor(userId, [PERMISSIONS.ASSETS_READ_ALL]);
  assert.deepEqual(assetSummaryScopeFilter(nonAdminWithReadAll), {
    $or: [{ ownerType: "user", owner: userId }, { assignedTo: userId }],
  });

  const admin = actor(userId, [PERMISSIONS.ASSETS_READ_ALL]);
  admin.roles = [ROLES.ADMIN];
  assert.deepEqual(assetSummaryScopeFilter(admin), {});
});

test("license keys are masked by default and revealable only to the owner", () => {
  const owner = new mongoose.Types.ObjectId();
  const asset = {
    _id: new mongoose.Types.ObjectId(),
    name: "Tool",
    type: "software",
    ownerType: "user",
    owner,
    licenseKey: "ABCD-EFGH-1234-5678",
  };
  assert.match(serializeAsset(asset, actor(owner)).licenseKey || "", /5678$/);
  assert.equal(serializeAsset(asset, actor(owner)).licenseKeyMasked, true);
  assert.equal(
    serializeAsset(asset, actor(owner), true).licenseKey,
    "ABCD-EFGH-1234-5678"
  );
  assert.equal(
    serializeAsset(asset, actor(new mongoose.Types.ObjectId()), true).licenseKey,
    "••••-••••-5678"
  );
});

test("legacy asset-code ownership rule remains authoritative", () => {
  const base = {
    name: "Asset",
    type: "hardware",
    departmentScope: ["security"],
    platforms: ["web"],
  };
  assert.equal(
    createAssetBodySchema.safeParse({ ...base, ownerType: "bank" }).success,
    false
  );
  assert.equal(
    createAssetBodySchema.safeParse({ ...base, ownerType: "lab", assetCode: "LAB-1" })
      .success,
    true
  );
  assert.equal(
    createAssetBodySchema.safeParse({ ...base, ownerType: "user" }).success,
    true
  );
});

test("asset audit metadata removes every sensitive field", () => {
  const result = redactAssetAuditInput({
    licenseKey: "secret",
    serialNumber: "serial",
    macAddress: "mac",
    ipAddress: "ip",
    cost: 100,
    name: "Safe",
  });
  assert.equal(result.name, "Safe");
  for (const field of ["licenseKey", "serialNumber", "macAddress", "ipAddress", "cost"])
    assert.equal(result[field], "[REDACTED]");
});
