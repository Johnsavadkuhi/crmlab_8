import assert from "node:assert/strict";
import test from "node:test";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { baseQueryWithReauth } from "./baseApi";

test("GETs avoid CSRF fetches, permission errors are not replayed, and concurrent 401s share refresh", async (t) => {
  const NativeRequest = globalThis.Request;
  t.mock.method(globalThis, "Request", class extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(typeof input === "string" && input.startsWith("/") ? `http://app.test${input}` : input, init);
    }
  });
  const counts = new Map<string, number>();
  let refreshed = false;
  t.mock.method(globalThis, "fetch", async (request: Request) => {
    const path = new URL(request.url).pathname;
    counts.set(path, (counts.get(path) || 0) + 1);
    if (path === "/api/auth/csrf-token") {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return Response.json({ data: { csrfToken: "csrf-one" } });
    }
    if (path === "/api/auth/refresh-token") {
      await new Promise((resolve) => setTimeout(resolve, 20));
      refreshed = true;
      return Response.json({ data: { csrfToken: "csrf-two" } });
    }
    if (path === "/api/forbidden") return Response.json({ error: { message: "Forbidden: missing permission" } }, { status: 403 });
    if (path === "/api/expired" && !refreshed) return Response.json({}, { status: 401 });
    if (path === "/api/auth/me" && !refreshed) return Response.json({}, { status: 401 });
    if (path === "/api/after-refresh") assert.equal(request.headers.get("x-csrf-token"), "csrf-two");
    return Response.json({ ok: true });
  });
  const api = {
    signal: new AbortController().signal, abort() {}, dispatch() {}, getState: () => ({}),
    endpoint: "test", type: "query",
  } as unknown as BaseQueryApi;
  assert.ok((await baseQueryWithReauth("/healthy", api, {})).data);
  assert.equal(counts.get("/api/auth/csrf-token"), undefined);
  await Promise.all(Array.from({ length: 5 }, () => baseQueryWithReauth({ url: "/healthy", method: "POST" }, api, {})));
  assert.equal(counts.get("/api/auth/csrf-token"), 1);
  const denied = await baseQueryWithReauth({ url: "/forbidden", method: "POST" }, api, {});
  assert.equal(denied.error?.status, 403);
  assert.equal(counts.get("/api/forbidden"), 1);
  const results = await Promise.all(Array.from({ length: 5 }, () => baseQueryWithReauth("/expired", api, {})));
  assert.equal(results.every((result) => Boolean(result.data)), true);
  assert.equal(counts.get("/api/auth/refresh-token"), 1);
  assert.equal(counts.get("/api/auth/csrf-token"), 1);
  assert.ok((await baseQueryWithReauth({ url: "/after-refresh", method: "POST" }, api, {})).data);
});
