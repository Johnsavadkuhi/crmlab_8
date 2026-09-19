import type { RequestHandler } from "express";
import { HTTP_STATUS } from "@/constants/http";
import { COOKIE_NAMES } from "@/constants/security";
import { AppError } from "@/utils/AppError";
import { getAuthUserFromAccessToken, resumeDownloadSession } from "@/modules/auth/services/session.service";
import { ROUTES } from "@/constants/routes";
import { setAccessCookie } from "@/utils/cookies";
import { TokenExpiredError } from "jsonwebtoken";

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

    if (accessToken) {
      try {
        req.user = await getAuthUserFromAccessToken(accessToken);
        return next();
      } catch (error) {
        if (!(error instanceof TokenExpiredError)) throw error;
      }
    }

    // Native image/video/download requests cannot run the frontend 401 retry.
    // Resume these without rotating a token shared by concurrent file requests.
    if (["GET", "HEAD"].includes(req.method) && req.baseUrl === ROUTES.PENTEST.BASE && req.path.startsWith("/pocs/")) {
      const session = await resumeDownloadSession(req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN]);
      req.user = session.user;
      setAccessCookie(res, session.accessToken);
      return next();
    }

    // Only the refresh endpoint rotates tokens. Parallel protected requests
    // must not consume the same refresh token or clear each other's cookies.
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  } catch {
    next(new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED));
  }
};
