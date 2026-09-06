import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const adminAnalyticsQuerySchema = z.object({
  query: z.object({
    from: date.optional(),
    to: date.optional(),
    granularity: z.enum(["day", "week", "month", "quarter", "year"]).default("day"),
    project: objectId.optional(),
    tester: objectId.optional(),
    severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(),
    findingStatus: z.string().trim().min(1).max(80).optional(),
    projectStatus: z.string().trim().min(1).max(80).optional(),
  }),
});

export type AdminAnalyticsQuery = z.infer<typeof adminAnalyticsQuerySchema>["query"];
