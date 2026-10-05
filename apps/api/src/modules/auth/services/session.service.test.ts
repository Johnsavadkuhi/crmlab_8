import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { AuthSessionModel } from "../models/authSession.model";
import { UserModel } from "@/modules/users/models/user.model";
import { UserPermissionModel } from "@/modules/users/models/userPermission.model";
import { signAccessToken, signRefreshToken } from "@/utils/jwt";
import { getAuthUserFromAccessToken, refreshAuthSession, resumeDownloadSession } from "./session.service";

const userId = new mongoose.Types.ObjectId();
const user = {
  _id: userId, roles: ["pentester"], status: "Active", isActive: true,
  sessionVersion: 0, projectIds: [new mongoose.Types.ObjectId()],
};

test("concurrent refresh consumes a stored token once and rejects replay", async (t) => {
  t.mock.method(UserModel, "findById", async () => user);
  t.mock.method(UserPermissionModel, "findOne", async () => ({ permissions: [] }));
  let consumed = false;
  let created = 0;
  t.mock.method(AuthSessionModel, "findOneAndUpdate", async (
    filter: { revokedAt: unknown; userId: string; expiresAt: { $gt: Date } },
    update: { $set: { revokedAt: Date } }
  ) => {
    assert.deepEqual(filter.revokedAt, { $exists: false });
    assert.equal(filter.userId, userId.toString());
    assert.ok(filter.expiresAt.$gt instanceof Date);
    assert.ok(update.$set.revokedAt instanceof Date);
    if (consumed) return null;
    consumed = true;
    return { save: async () => undefined };
  });
  t.mock.method(AuthSessionModel, "create", async () => { created += 1; });
  const token = signRefreshToken({ id: String(userId), sessionVersion: 0, tokenId: "old-session" });
  const results = await Promise.allSettled([refreshAuthSession(token), refreshAuthSession(token)]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(created, 1);
  await assert.rejects(refreshAuthSession(token), /Unauthorized/);
});

test("inactive legacy status invalidates access even when isActive is true", async (t) => {
  t.mock.method(UserModel, "findById", async () => ({ ...user, status: "Inactive" }));
  await assert.rejects(getAuthUserFromAccessToken(signAccessToken({ id: String(userId), sessionVersion: 0 })), /Unauthorized/);
});

test("legacy active users without isActive remain compatible", async (t) => {
  t.mock.method(UserModel, "findById", async () => ({ ...user, isActive: undefined }));
  t.mock.method(UserPermissionModel, "findOne", async () => ({ permissions: [] }));
  const result = await getAuthUserFromAccessToken(signAccessToken({ id: String(userId), sessionVersion: 0 }));
  assert.equal(result.id, String(userId));
});

test("parallel native downloads resume only a live refresh session without rotating it", async (t) => {
  t.mock.method(UserModel, "findById", async () => user);
  t.mock.method(UserPermissionModel, "findOne", async () => ({ permissions: [] }));
  let active = true;
  t.mock.method(AuthSessionModel, "exists", async (filter: { revokedAt: unknown }) => {
    assert.deepEqual(filter.revokedAt, { $exists: false });
    return active ? { _id: "session" } : null;
  });
  const create = t.mock.method(AuthSessionModel, "create", async () => {});
  const token = signRefreshToken({ id: String(userId), sessionVersion: 0, tokenId: "download" });
  const results = await Promise.all([resumeDownloadSession(token), resumeDownloadSession(token)]);
  assert.equal(results.every((result) => result.user.id === String(userId)), true);
  assert.equal(create.mock.callCount(), 0);
  active = false;
  await assert.rejects(resumeDownloadSession(token), /Unauthorized/);
});
