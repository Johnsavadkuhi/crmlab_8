import mongoose, { Schema, type InferSchemaType } from "mongoose";
import {
  ASSET_DEPARTMENTS,
  ASSET_OWNER_TYPES,
  ASSET_PLATFORMS,
  ASSET_STATUSES,
  ASSET_TYPES,
  LICENSE_STATUSES,
  SOFTWARE_TYPES,
} from "@role-dashboard/contracts";
import { LEGACY_COLLECTIONS } from "@/constants/legacyCollections";

const optionalTrimmedString = { type: String, trim: true } as const;

const assetSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    assetCode: {
      ...optionalTrimmedString,
      validate: {
        validator(this: { ownerType?: string }, value?: string) {
          return (
            !["bank", "lab"].includes(this.ownerType || "") || Boolean(value?.trim())
          );
        },
        message: "Asset code is required for bank or lab-owned assets",
      },
    },
    type: { type: String, enum: ASSET_TYPES, required: true },
    ownerType: { type: String, enum: ASSET_OWNER_TYPES, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    // Legacy documents may omit these required-by-old-schema arrays. Keeping
    // them optional here lets partial records remain readable and patchable.
    departmentScope: [{ type: String, enum: ASSET_DEPARTMENTS }],
    platforms: [{ type: String, enum: ASSET_PLATFORMS }],
    description: String,
    brand: String,
    model: String,
    version: String,
    serialNumber: optionalTrimmedString,
    licenseKey: { ...optionalTrimmedString, select: false },
    macAddress: optionalTrimmedString,
    ipAddress: optionalTrimmedString,
    status: { type: String, enum: ASSET_STATUSES, default: "available" },
    location: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedDate: Date,
    purchaseDate: Date,
    warrantyExpiry: Date,
    maintenanceSchedule: Date,
    cost: Number,
    vendor: String,
    tags: [String],
    softwareType: { type: String, enum: SOFTWARE_TYPES },
    licenseStatus: { type: String, enum: LICENSE_STATUSES },
    licenseExpiry: Date,
    installDate: Date,
    allowedInstallations: Number,
  },
  {
    collection: LEGACY_COLLECTIONS.assets,
    timestamps: true,
    autoCreate: false,
    autoIndex: false,
    strict: true,
  }
);

assetSchema.index({ assetCode: 1 }, { unique: true, sparse: true });
assetSchema.index(
  { serialNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { serialNumber: { $type: "string", $ne: "" } },
  }
);
assetSchema.index(
  { macAddress: 1 },
  { unique: true, partialFilterExpression: { macAddress: { $type: "string", $ne: "" } } }
);
assetSchema.index({ licenseKey: 1 });
assetSchema.index({ name: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ ownerType: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ departmentScope: 1 });
assetSchema.index({ platforms: 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ owner: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ purchaseDate: -1 });
assetSchema.index({ warrantyExpiry: -1 });
assetSchema.index({ maintenanceSchedule: -1 });
assetSchema.index({ licenseExpiry: -1 });
assetSchema.index({ createdAt: -1 });
assetSchema.index({ updatedAt: -1 });
assetSchema.index({ departmentScope: 1, status: 1 });
assetSchema.index({ ownerType: 1, owner: 1 });
assetSchema.index({ tags: 1, status: 1 });
assetSchema.index({ type: 1, departmentScope: 1, cost: -1 });
assetSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  model: "text",
  vendor: "text",
  tags: "text",
});

export type AssetDocument = InferSchemaType<typeof assetSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export const AssetModel = mongoose.model<AssetDocument>(
  "Assets",
  assetSchema,
  LEGACY_COLLECTIONS.assets
);
