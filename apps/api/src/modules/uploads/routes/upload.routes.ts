import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { uploadDir } from "@/config/uploadStorage";
import { HTTP_STATUS } from "@/constants/http";
import { ROUTES } from "@/constants/routes";
import { UPLOADS } from "@/constants/uploads";
import { requireAuth } from "@/middlewares/auth.middleware";
import { AppError } from "@/utils/AppError";
import { deleteUpload, uploadAvatar } from "../controllers/upload.controller";
import { avatarExtension } from "../services/avatar.service";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = avatarExtension(file.mimetype);
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: UPLOADS.MAX_IMAGE_SIZE_BYTES,
    files: 1,
    fields: 5,
    parts: 6,
  },
  fileFilter: (_req, file, callback) => {
    try {
      avatarExtension(file.mimetype);
    } catch {
      callback(new AppError("Only image files are allowed", HTTP_STATUS.BAD_REQUEST));
      return;
    }

    callback(null, true);
  },
});

const avatarUpload = upload.fields([
  { name: UPLOADS.AVATAR_FIELD, maxCount: 1 },
  { name: UPLOADS.AVATAR_FIELD_ALIAS, maxCount: 1 },
]);

router.post(ROUTES.UPLOAD.AVATAR, rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
}), avatarUpload, uploadAvatar);
router.delete(ROUTES.PARAM_ID, requireAuth, deleteUpload);

export default router;
