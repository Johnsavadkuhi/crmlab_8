import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import type { Request, Response } from "express";
import { UserModel } from "@/modules/users/models/user.model";
import { VulnerabilityModel } from "@/modules/pentest/models/vulnerability.model";
import { AuditLogModel } from "@/modules/audit/models/auditLog.model";
import { deleteUpload } from "./upload.controller";

test("upload deletion enforces ownership, shared references and evidence isolation", async (t) => {
  let evidence = false;
  let shared = false;
  let avatarUrl = "/uploads/other.png";
  t.mock.method(VulnerabilityModel, "exists", async () => evidence ? { _id: "evidence" } : null);
  t.mock.method(UserModel, "findById", async () => ({ avatarUrl }));
  t.mock.method(UserModel, "exists", async (query: { $or: { avatarUrl?: RegExp }[] }) => {
    const pattern = query.$or[0].avatarUrl!;
    assert.ok(pattern.test("https://app.test/uploads/avatar.png?version=1"));
    return shared ? { _id: "other-user" } : null;
  });
  t.mock.method(AuditLogModel, "create", async () => ({}));
  const unlink = t.mock.method(fs, "unlink", async () => {});
  const req = { params: { id: "avatar.png" }, user: { id: "user", roles: ["pentester"] }, get: () => undefined } as unknown as Request;
  const res = { status: () => res, json: () => res } as unknown as Response;
  const invoke = async () => {
    let error: unknown;
    await deleteUpload(req, res, (value) => { error = value; });
    return (error as { statusCode?: number } | undefined)?.statusCode;
  };
  assert.equal(await invoke(), 403);
  avatarUrl = "/uploads/avatar.png";
  shared = true;
  assert.equal(await invoke(), 403);
  shared = false;
  evidence = true;
  assert.equal(await invoke(), 403);
  assert.equal(unlink.mock.callCount(), 0);
  evidence = false;
  assert.equal(await invoke(), undefined);
  assert.equal(unlink.mock.callCount(), 1);
});
