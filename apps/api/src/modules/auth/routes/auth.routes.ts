import { Router } from "express";
import { ROUTES } from "@/constants/routes";
import { csrfTokenHandler } from "@/middlewares/csrf.middleware";
import {
  login,
  logout,
  me,
  refreshToken,
  register,
  registerAdmin,
} from "../controllers/auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import {
  loginSchema,
  registerAdminSchema,
  registerSchema,
} from "../validators/auth.validators";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/permission.middleware";
import { ROLES } from "@/constants/roles";
import rateLimit from "express-rate-limit";

const router = Router();
const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(ROUTES.AUTH.REGISTER, authAttemptLimit, validate(registerSchema), register);
router.post(ROUTES.AUTH.REGISTER_ADMIN, requireAuth, requireRole(ROLES.ADMIN), validate(registerAdminSchema), registerAdmin);
router.post(ROUTES.AUTH.LOGIN, authAttemptLimit, validate(loginSchema), login);
router.get(ROUTES.AUTH.CSRF_TOKEN, csrfTokenHandler);
router.get(ROUTES.AUTH.ME, requireAuth, me);
router.post(ROUTES.AUTH.REFRESH_TOKEN, refreshToken);
router.post(ROUTES.AUTH.LOGOUT, logout);

export default router;
