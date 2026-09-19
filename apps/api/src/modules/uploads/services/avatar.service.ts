import { AppError } from "@/utils/AppError";
import { HTTP_STATUS } from "@/constants/http";

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function avatarExtension(mimeType: string) {
  const extension = Object.hasOwn(extensions, mimeType) ? extensions[mimeType] : undefined;
  if (!extension) throw new AppError("Unsupported avatar image type", HTTP_STATUS.BAD_REQUEST);
  return extension;
}

export function hasAvatarSignature(mimeType: string, bytes: Buffer) {
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }
  if (mimeType === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === "image/gif") return /^(GIF87a|GIF89a)$/.test(bytes.subarray(0, 6).toString("ascii"));
  if (mimeType === "image/webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}
