import type { RequestHandler } from "express";
import { sendSuccess } from "@/utils/response";
import {
  getBaseDashboard,
  getDevopsDashboard,
  getQaDashboard,
  getQualityDashboard,
  getRepresentativeDashboard,
  getSecurityManagementDashboard,
  getTestingDashboard,
} from "../services/personalDashboard.service";

function handler(
  loader: (user: Express.UserContext) => Promise<unknown>
): RequestHandler {
  return async (req, res, next) => {
    try {
      sendSuccess(res, await loader(req.user!));
    } catch (error) {
      next(error);
    }
  };
}

export const getBaseDashboardOverview = handler(getBaseDashboard);
export const getTestingDashboardOverview = handler(getTestingDashboard);
export const getQaDashboardOverview = handler(getQaDashboard);
export const getQualityDashboardOverview = handler(getQualityDashboard);
export const getDevopsDashboardOverview = handler(getDevopsDashboard);
export const getSecurityDashboardOverview = handler(getSecurityManagementDashboard);
export const getRepresentativeDashboardOverview = handler(getRepresentativeDashboard);
