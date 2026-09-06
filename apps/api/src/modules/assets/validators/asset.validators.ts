import { isIP } from "node:net";
import { z } from "zod";
import {
  ASSET_DEPARTMENTS,
  ASSET_OWNER_TYPES,
  ASSET_PLATFORMS,
  ASSET_STATUSES,
  ASSET_TYPES,
  LICENSE_STATUSES,
  SOFTWARE_TYPES,
} from "@role-dashboard/contracts";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const text = (max: number) => z.string().trim().max(max);
const nullableText = (max: number) => text(max).nullable().optional();
const nullableDate = z
  .union([z.string().date(), z.string().datetime(), z.null()])
  .optional();
const nullableNumber = z.number().nonnegative().nullable().optional();
const macAddress = z
  .string()
  .trim()
  .regex(/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i, "Invalid MAC address");

const assetFields = {
  name: text(300).min(1, "Asset name is required"),
  assetCode: nullableText(150),
  type: z.enum(ASSET_TYPES),
  ownerType: z.enum(ASSET_OWNER_TYPES),
  owner: objectId.nullable().optional(),
  departmentScope: z.array(z.enum(ASSET_DEPARTMENTS)).min(1).max(2),
  platforms: z.array(z.enum(ASSET_PLATFORMS)).min(1).max(4),
  description: nullableText(10000),
  brand: nullableText(300),
  model: nullableText(300),
  version: nullableText(300),
  serialNumber: nullableText(300),
  licenseKey: nullableText(5000),
  macAddress: z.union([macAddress, z.literal(""), z.null()]).optional(),
  ipAddress: z
    .union([
      z
        .string()
        .trim()
        .refine((value) => isIP(value) !== 0, "Invalid IP address"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  status: z.enum(ASSET_STATUSES).optional(),
  location: nullableText(500),
  purchaseDate: nullableDate,
  warrantyExpiry: nullableDate,
  maintenanceSchedule: nullableDate,
  cost: nullableNumber,
  vendor: nullableText(500),
  tags: z.array(text(100).min(1)).max(100).optional(),
  softwareType: z.enum(SOFTWARE_TYPES).nullable().optional(),
  licenseStatus: z.enum(LICENSE_STATUSES).nullable().optional(),
  licenseExpiry: nullableDate,
  installDate: nullableDate,
  allowedInstallations: z.number().int().nonnegative().nullable().optional(),
};

function ownershipRules(
  value: { ownerType?: string; owner?: string | null; assetCode?: string | null },
  context: z.RefinementCtx
) {
  if (["bank", "lab"].includes(value.ownerType || "") && !value.assetCode?.trim()) {
    context.addIssue({
      code: "custom",
      path: ["assetCode"],
      message: "Asset code is required for bank or lab-owned assets",
    });
  }
}

export const createAssetBodySchema = z
  .object(assetFields)
  .strict()
  .superRefine(ownershipRules);
export const updateAssetBodySchema = z
  .object({
    ...Object.fromEntries(
      Object.entries(assetFields).map(([key, schema]) => [key, schema.optional()])
    ),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

const queryBoolean = z.enum(["true", "false"]).optional();
export const assetListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    search: text(300).optional(),
    view: z.enum(["all", "owned", "assigned"]).optional(),
    type: z.enum(ASSET_TYPES).optional(),
    ownerType: z.enum(ASSET_OWNER_TYPES).optional(),
    status: z.enum(ASSET_STATUSES).optional(),
    department: z.enum(ASSET_DEPARTMENTS).optional(),
    platform: z.enum(ASSET_PLATFORMS).optional(),
    owner: objectId.optional(),
    assignedTo: objectId.optional(),
    brand: text(300).optional(),
    vendor: text(300).optional(),
    tag: text(100).optional(),
    purchaseFrom: z.string().date().optional(),
    purchaseTo: z.string().date().optional(),
    warrantyExpiring: queryBoolean,
    licenseExpiring: queryBoolean,
    sortBy: z
      .enum([
        "name",
        "assetCode",
        "type",
        "ownerType",
        "status",
        "purchaseDate",
        "warrantyExpiry",
        "licenseExpiry",
        "cost",
        "createdAt",
        "updatedAt",
      ])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .strict();

export const createAssetSchema = z.object({ body: createAssetBodySchema });
export const updateAssetSchema = z.object({
  body: updateAssetBodySchema,
  params: z.object({ id: objectId }),
});
export const assetIdSchema = z.object({ params: z.object({ id: objectId }) });
export const assetListSchema = z.object({ query: assetListQuerySchema });
export const assignAssetSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ assignedTo: objectId, assignedDate: nullableDate }).strict(),
});

export type CreateAssetInput = z.infer<typeof createAssetBodySchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetBodySchema>;
