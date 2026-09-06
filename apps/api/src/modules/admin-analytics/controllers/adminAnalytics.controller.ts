import type { RequestHandler } from "express";
import { sendSuccess } from "@/utils/response";
import { getAdminAnalytics } from "../services/adminAnalytics.service";
import type { AdminAnalyticsQuery } from "../validators/adminAnalytics.validators";

export const getAdminAnalyticsOverview: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await getAdminAnalytics(req.query as unknown as AdminAnalyticsQuery));
  } catch (error) {
    next(error);
  }
};
