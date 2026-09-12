import mongoose, { Schema, type HydratedDocument, type InferSchemaType } from "mongoose";
import {
  FOUR_L_ACTION_PRIORITIES,
  FOUR_L_ACTION_STATUSES,
  FOUR_L_CATEGORIES,
  FOUR_L_RATINGS,
  FOUR_L_STATUSES,
  FOUR_L_STATUS_VALUES,
} from "@role-dashboard/contracts";

const sectionSchema = new Schema(
  {
    text: { type: String, trim: true, maxlength: 1000, default: "" },
    notApplicable: { type: Boolean, default: false },
  },
  { _id: false }
);

const actionItemSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    // Empty descriptions are valid while autosaving a draft. Submission validation
    // requires every action item to have a meaningful description.
    description: { type: String, trim: true, maxlength: 500, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: { type: String, enum: FOUR_L_ACTION_PRIORITIES, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: FOUR_L_ACTION_STATUSES, required: true },
  },
  { _id: false }
);

const fourLRetrospectiveSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    pentesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    representativeId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    projectName: { type: String, required: true, trim: true },
    projectLetterNumber: { type: String, trim: true },
    projectClosedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: FOUR_L_STATUS_VALUES,
      default: FOUR_L_STATUSES.DRAFT,
      index: true,
    },
    rating: { type: String, enum: FOUR_L_RATINGS },
    wouldChange: { type: Boolean },
    liked: { type: sectionSchema, default: () => ({}) },
    lacked: { type: sectionSchema, default: () => ({}) },
    learned: { type: sectionSchema, default: () => ({}) },
    longedFor: { type: sectionSchema, default: () => ({}) },
    needsFollowUp: { type: Boolean },
    categories: { type: [String], enum: FOUR_L_CATEGORIES, default: [] },
    biggestObstacle: { type: String, trim: true, maxlength: 500, default: "" },
    actionItems: { type: [actionItemSchema], default: [] },
    acknowledged: { type: Boolean, default: false },
    reviewNote: { type: String, trim: true, maxlength: 2000 },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    sentToAdminAt: { type: Date },
    sentToAdminBy: { type: Schema.Types.ObjectId, ref: "User" },
    reopenedAt: { type: Date },
    reopenedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    collection: "project4lretrospectives",
    timestamps: true,
    autoCreate: false,
    autoIndex: false,
  }
);

fourLRetrospectiveSchema.index(
  { projectId: 1, pentesterId: 1 },
  { unique: true, name: "projectId_1_pentesterId_1" }
);
fourLRetrospectiveSchema.index({ pentesterId: 1, status: 1, projectClosedAt: -1 });
fourLRetrospectiveSchema.index({ representativeId: 1, status: 1, submittedAt: -1 });
fourLRetrospectiveSchema.index({ status: 1, sentToAdminAt: -1 });

export type FourLRetrospective = InferSchemaType<typeof fourLRetrospectiveSchema>;
export type FourLRetrospectiveDocument = HydratedDocument<FourLRetrospective>;

export const FourLRetrospectiveModel = mongoose.model<FourLRetrospective>(
  "FourLRetrospective",
  fourLRetrospectiveSchema
);
