import assert from "node:assert/strict";
import test from "node:test";
import type { Request, Response } from "express";
import { requireAuth } from "./auth.middleware";
import { COOKIE_NAMES } from "@/constants/security";
import { requireRole } from "./permission.middleware";
import { ROLES } from "@/constants/roles";

test("missing or expired access does not delete the refresh cookie", async () => {
  for (const access of [undefined, "invalid-access-token"]) {
    const req = { cookies: { [COOKIE_NAMES.ACCESS_TOKEN]: access, [COOKIE_NAMES.REFRESH_TOKEN]: "refresh" } } as unknown as Request;
    let error: unknown;
    await requireAuth(req, {} as Response, (value) => { error = value; });
    assert.equal((error as { statusCode: number }).statusCode, 401);
  }
});

test("admin registration guard accepts only an authenticated admin role", () => {
  for (const roles of [undefined, [ROLES.PENTESTER], [ROLES.ADMIN]]) {
    let error: unknown;
    const req = { user: roles ? { roles } : undefined } as Request;
    requireRole(ROLES.ADMIN)(req, {} as Response, (value) => { error = value; });
    assert.equal(Boolean(error), !roles?.some((role) => role === ROLES.ADMIN));
  }
});
