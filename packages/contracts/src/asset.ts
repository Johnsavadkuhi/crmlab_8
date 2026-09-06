export const ASSET_TYPES = ["hardware", "software"] as const;
export const ASSET_OWNER_TYPES = ["bank", "lab", "user"] as const;
export const ASSET_STATUSES = [
  "available",
  "in-use",
  "maintenance",
  "retired",
  "lost",
] as const;
export const ASSET_DEPARTMENTS = ["security", "quality"] as const;
export const ASSET_PLATFORMS = ["web", "mobile", "desktop", "api"] as const;
export const SOFTWARE_TYPES = ["free", "paid"] as const;
export const LICENSE_STATUSES = ["licensed", "cracked", "trial"] as const;

export type AssetType = (typeof ASSET_TYPES)[number];
export type AssetOwnerType = (typeof ASSET_OWNER_TYPES)[number];
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type DepartmentScope = (typeof ASSET_DEPARTMENTS)[number];
export type AssetPlatform = (typeof ASSET_PLATFORMS)[number];
export type SoftwareType = (typeof SOFTWARE_TYPES)[number];
export type LicenseStatus = (typeof LICENSE_STATUSES)[number];

export type AssetUserSummary = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type AssetContract = {
  id: string;
  name: string;
  assetCode?: string;
  type: AssetType;
  ownerType: AssetOwnerType;
  owner?: AssetUserSummary | null;
  departmentScope?: DepartmentScope[];
  platforms?: AssetPlatform[];
  description?: string;
  brand?: string;
  model?: string;
  version?: string;
  serialNumber?: string;
  licenseKey?: string;
  licenseKeyMasked?: boolean;
  macAddress?: string;
  ipAddress?: string;
  status?: AssetStatus;
  location?: string;
  assignedTo?: AssetUserSummary | null;
  assignedDate?: string | null;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  maintenanceSchedule?: string | null;
  cost?: number | null;
  vendor?: string;
  tags?: string[];
  softwareType?: SoftwareType;
  licenseStatus?: LicenseStatus;
  licenseExpiry?: string | null;
  installDate?: string | null;
  allowedInstallations?: number | null;
  createdAt?: string;
  updatedAt?: string;
  lifecycleAlerts?: {
    warranty: "expired" | "expiring" | "active" | "unknown";
    license: "expired" | "expiring" | "active" | "unknown";
    maintenance: "overdue" | "due-soon" | "scheduled" | "unknown";
  };
  permissions: {
    canEdit: boolean;
    canAssign: boolean;
    canRevealLicense: boolean;
    canViewCost: boolean;
    canViewSensitive: boolean;
  };
};

export type AssetInputContract = Omit<
  AssetContract,
  | "id"
  | "owner"
  | "assignedTo"
  | "createdAt"
  | "updatedAt"
  | "permissions"
  | "licenseKeyMasked"
  | "lifecycleAlerts"
> & {
  owner?: string | null;
  assignedTo?: string | null;
};

export type AssetListContract = {
  items: AssetContract[];
  pageInfo: { page: number; pageSize: number; total: number; pages: number };
};

export type AssetSummaryContract = {
  total: number;
  owned: number;
  assigned: number;
  byType: Record<string, number>;
  byOwnerType: Record<string, number>;
  byStatus: Record<string, number>;
  byDepartment: Record<string, number>;
  byPlatform: Record<string, number>;
  lifecycle: {
    warrantyExpired: number;
    warrantyExpiring: number;
    licenseExpired: number;
    licenseExpiring: number;
    maintenanceOverdue: number;
    maintenanceDueSoon: number;
  };
  totalCost?: number;
};
