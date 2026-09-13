import { z } from "zod";
import {
  FOUR_L_ACTION_PRIORITIES,
  FOUR_L_ACTION_STATUSES,
  FOUR_L_CATEGORIES,
  FOUR_L_RATINGS,
} from "@role-dashboard/contracts";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const dateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid due date");

const section = z
  .object({
    text: z.string().trim().max(1000).default(""),
    notApplicable: z.boolean().default(false),
  })
  .strict();

const draftActionItem = z
  .object({
    id: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500),
    ownerId: objectId,
    priority: z.enum(FOUR_L_ACTION_PRIORITIES),
    dueDate: z.union([z.literal(""), dateString]),
    status: z.enum(FOUR_L_ACTION_STATUSES),
  })
  .strict();

export const fourLDraftRequestSchema = z
  .object({
    rating: z.enum(FOUR_L_RATINGS).optional(),
    wouldChange: z.boolean().optional(),
    liked: section.default({ text: "", notApplicable: false }),
    lacked: section.default({ text: "", notApplicable: false }),
    learned: section.default({ text: "", notApplicable: false }),
    longedFor: section.default({ text: "", notApplicable: false }),
    needsFollowUp: z.boolean().optional(),
    categories: z.array(z.enum(FOUR_L_CATEGORIES)).max(4).default([]),
    biggestObstacle: z.string().trim().max(500).default(""),
    actionItems: z.array(draftActionItem).max(20).default([]),
    acknowledged: z.boolean().default(false),
  })
  .strict();

const completeSection = section.refine(
  (value) => value.notApplicable || value.text.length >= 3,
  "Each 4L section requires a response or Not applicable"
);

const completeActionItem = draftActionItem.extend({
  description: z.string().trim().min(2).max(500),
  dueDate: dateString,
});

export const fourLSubmissionSchema = fourLDraftRequestSchema
  .extend({
    rating: z.enum(FOUR_L_RATINGS),
    wouldChange: z.boolean(),
    liked: completeSection,
    lacked: completeSection,
    learned: completeSection,
    longedFor: completeSection,
    needsFollowUp: z.boolean(),
    categories: z.array(z.enum(FOUR_L_CATEGORIES)).min(1).max(4),
    actionItems: z.array(completeActionItem).max(20).default([]),
    acknowledged: z.literal(true),
  })
  .superRefine((value, context) => {
    if (value.needsFollowUp && value.actionItems.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["actionItems"],
        message: "At least one action item is required when follow-up is needed",
      });
    }
  });

export const fourLIdSchema = z.object({ params: z.object({ id: objectId }) });
export const fourLDraftSchema = z.object({
  params: z.object({ id: objectId }),
  body: fourLDraftRequestSchema,
});
export const fourLReviewSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ note: z.string().trim().min(3).max(2000) }).strict(),
});
export const fourLOptionalReviewSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ note: z.string().trim().max(2000).optional() }).strict(),
});

export type FourLDraftRequest = z.infer<typeof fourLDraftRequestSchema>;
