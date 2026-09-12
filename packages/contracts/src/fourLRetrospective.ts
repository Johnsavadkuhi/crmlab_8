export const FOUR_L_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted_to_representative",
  CHANGES_REQUESTED: "changes_requested",
  APPROVED: "representative_approved",
  SENT_TO_ADMIN: "sent_to_admin",
} as const;

export const FOUR_L_STATUS_VALUES = Object.values(FOUR_L_STATUSES);
export type FourLStatus = (typeof FOUR_L_STATUSES)[keyof typeof FOUR_L_STATUSES];

export const FOUR_L_RATINGS = ["smooth", "acceptable", "difficult"] as const;
export type FourLRating = (typeof FOUR_L_RATINGS)[number];

export const FOUR_L_CATEGORIES = [
  "process",
  "access_environment",
  "documentation",
  "tools_automation",
  "security_testing",
  "test_data",
  "other",
] as const;
export type FourLCategory = (typeof FOUR_L_CATEGORIES)[number];

export const FOUR_L_ACTION_PRIORITIES = ["low", "medium", "high"] as const;
export type FourLActionPriority = (typeof FOUR_L_ACTION_PRIORITIES)[number];

export const FOUR_L_ACTION_STATUSES = ["open", "in_progress", "done"] as const;
export type FourLActionStatus = (typeof FOUR_L_ACTION_STATUSES)[number];

export type FourLSectionContract = {
  text: string;
  notApplicable: boolean;
};

export type FourLActionItemContract = {
  id: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  priority: FourLActionPriority;
  dueDate: string;
  status: FourLActionStatus;
};

export type FourLDraftActionItemContract = Omit<FourLActionItemContract, "ownerName">;

export type FourLParticipantContract = {
  id: string;
  name: string;
  username?: string;
};

export type FourLDraftInputContract = {
  rating?: FourLRating;
  wouldChange?: boolean;
  liked: FourLSectionContract;
  lacked: FourLSectionContract;
  learned: FourLSectionContract;
  longedFor: FourLSectionContract;
  needsFollowUp?: boolean;
  categories: FourLCategory[];
  biggestObstacle: string;
  actionItems: FourLDraftActionItemContract[];
  acknowledged: boolean;
};

export type FourLActorCapabilitiesContract = {
  canEdit: boolean;
  canSubmit: boolean;
  canRequestChanges: boolean;
  canApprove: boolean;
  canSendToAdmin: boolean;
  canReopen: boolean;
};

export type FourLRetrospectiveContract = Omit<FourLDraftInputContract, "actionItems"> & {
  id: string;
  project: {
    id: string;
    name: string;
    letterNumber?: string;
    status?: string;
    closedAt?: string;
  };
  pentester: FourLParticipantContract;
  representative?: FourLParticipantContract;
  participants: FourLParticipantContract[];
  actionItems: FourLActionItemContract[];
  status: FourLStatus;
  reviewNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  sentToAdminAt?: string;
  reopenedAt?: string;
  createdAt: string;
  updatedAt: string;
  capabilities: FourLActorCapabilitiesContract;
};

export type FourLWorkBlockerContract = {
  retrospectiveId: string;
  projectId: string;
  projectName: string;
  status: FourLStatus;
  actionUrl: string;
};

export type FourLWorkGateContract = {
  blocked: boolean;
  blockers: FourLWorkBlockerContract[];
};
