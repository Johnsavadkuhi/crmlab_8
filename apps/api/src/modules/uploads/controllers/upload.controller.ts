import fs from "node:fs/promises";
import path from "node:path";
import type { RequestHandler } from "express";
import { resolveUploadFile, uploadDir } from "@/config/uploadStorage";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { HTTP_STATUS } from "@/constants/http";
import { UPLOADS } from "@/constants/uploads";
import { writeAuditLog } from "@/modules/audit/services/audit.service";
import { AppError } from "@/utils/AppError";
import { sendSuccess } from "@/utils/response";
import { UserModel } from "@/modules/users/models/user.model";
import { ROLES } from "@/constants/roles";
import { hasAvatarSignature } from "../services/avatar.service";
import { isEvidenceUpload } from "../services/uploadAccess.service";

type MulterFiles = Record<string, Express.Multer.File[]>;

function getUploadedAvatarFile(req: Parameters<RequestHandler>[0]) {
    const files = req.files as MulterFiles | undefined;

    return (
        req.file ||
        files?.[UPLOADS.AVATAR_FIELD_ALIAS]?.[0] ||
        files?.[UPLOADS.AVATAR_FIELD]?.[0]
    );
}

function safeUploadFilename(fileId: string) {
    const filename = path.basename(fileId);

    if (!filename || filename !== fileId) {
        throw new AppError("Invalid upload file id", HTTP_STATUS.BAD_REQUEST);
    }

    return filename;
}

export const uploadAvatar: RequestHandler = async (req, res, next) => {
    try {
        const file = getUploadedAvatarFile(req);

        if (!file) {
            throw new AppError("Avatar image is required", HTTP_STATUS.BAD_REQUEST);
        }

        const handle = await fs.open(file.path, "r");
        let valid: boolean;
        try {
            const bytes = Buffer.alloc(12);
            await handle.read(bytes, 0, bytes.length, 0);
            valid = hasAvatarSignature(file.mimetype, bytes);
        } finally {
            await handle.close();
        }
        if (!valid) {
            await fs.unlink(file.path);
            throw new AppError("Uploaded content is not a valid avatar image", HTTP_STATUS.BAD_REQUEST);
        }

        const avatarUrl = UPLOADS.PUBLIC_PATH(file.filename);

        await writeAuditLog({
            req,
            action: AUDIT_ACTIONS.UPLOAD_AVATAR,
            entityType: AUDIT_ENTITY_TYPES.UPLOAD,
            entityId: file.filename,
            metadata: {
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            },
        });

        sendSuccess(
            res,
            {
                url: avatarUrl,
                fileId: file.filename,
                avatarUrl,
                user: null,
            },
            HTTP_STATUS.CREATED
        );
    } catch (error) {
        next(error);
    }
};

export const deleteUpload: RequestHandler = async (req, res, next) => {
    try {

        const uploadId = req.params.id;
        if (Array.isArray(uploadId)) {
            throw new AppError("Invalid upload file id", HTTP_STATUS.BAD_REQUEST);
        }
        const filename = safeUploadFilename(uploadId);
        if (await isEvidenceUpload(filename)) {
            throw new AppError("Evidence must be managed through its project", HTTP_STATUS.FORBIDDEN);
        }
        if (!req.user?.roles.includes(ROLES.ADMIN)) {
            const user = await UserModel.findById(req.user?.id);
            const avatarPath = UPLOADS.PUBLIC_PATH(filename);
            if (!user || ![user.avatarUrl, user.profileImageUrl].some((url) => {
                if (!url) return false;
                try { return new URL(url, "http://avatar.local").pathname === avatarPath; }
                catch { return false; }
            })) {
                throw new AppError("Forbidden: upload does not belong to this user", HTTP_STATUS.FORBIDDEN);
            }
            const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const sharedReference = new RegExp(`(?:^|/)${escapedFilename}(?:[?#].*)?$`);
            const shared = await UserModel.exists({
                _id: { $ne: req.user?.id },
                $or: [
                    { avatarUrl: sharedReference },
                    { profileImageUrl: sharedReference },
                ],
            });
            if (shared) throw new AppError("Forbidden: upload is used by another user", HTTP_STATUS.FORBIDDEN);
        }
        const filePath = resolveUploadFile(filename);

        if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
            throw new AppError("Invalid upload path", HTTP_STATUS.BAD_REQUEST);
        }

        try {
            await fs.unlink(filePath);
        } catch (error) {
            const nodeError = error as { code?: string };

            if (nodeError.code !== "ENOENT") {
                throw error;
            }
        }

        await writeAuditLog({
            req,
            action: AUDIT_ACTIONS.UPLOAD_DELETE,
            entityType: AUDIT_ENTITY_TYPES.UPLOAD,
            entityId: filename,
            metadata: {
                filename,
            },
        });

        sendSuccess(res, {
            fileId: filename,
            deleted: true,
        });
    } catch (error) {
        next(error);
    }
};
