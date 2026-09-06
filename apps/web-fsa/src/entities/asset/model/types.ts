import type {
  AssetContract,
  AssetInputContract,
  AssetListContract,
  AssetOwnerType,
  AssetPlatform,
  AssetStatus,
  AssetSummaryContract,
  AssetType,
  DepartmentScope,
  LicenseStatus,
  SoftwareType,
} from "@role-dashboard/contracts";

export type Asset = AssetContract;
export type AssetInput = AssetInputContract;
export type AssetList = AssetListContract;
export type AssetSummary = AssetSummaryContract;
export type {
  AssetOwnerType,
  AssetPlatform,
  AssetStatus,
  AssetType,
  DepartmentScope,
  LicenseStatus,
  SoftwareType,
};

export type AssetFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  view?: "all" | "owned" | "assigned";
  type?: AssetType;
  ownerType?: AssetOwnerType;
  status?: AssetStatus;
  department?: DepartmentScope;
  platform?: AssetPlatform;
  owner?: string;
  assignedTo?: string;
  brand?: string;
  vendor?: string;
  tag?: string;
  purchaseFrom?: string;
  purchaseTo?: string;
  warrantyExpiring?: "true";
  licenseExpiring?: "true";
  sortBy?:
    | "name"
    | "assetCode"
    | "type"
    | "ownerType"
    | "status"
    | "purchaseDate"
    | "warrantyExpiry"
    | "licenseExpiry"
    | "cost"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
};
