import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

test("HTTP guards preserve signup avatars and isolate malicious uploads and legacy evidence", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "crmlab-upload-test-"));
  process.env.UPLOAD_DIR = directory;
  const { createApp } = await import("./app.js");
  const { VulnerabilityModel } = await import("../modules/pentest/models/vulnerability.model.js");
  const { AuditLogModel } = await import("../modules/audit/models/auditLog.model.js");
  t.mock.method(AuditLogModel, "create", async () => ({}));
  let evidence = false;
  t.mock.method(VulnerabilityModel, "exists", async () => evidence ? { _id: "evidence" } : null);
  const server = createApp().listen(0, "127.0.0.1");
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await fs.rm(directory, { recursive: true, force: true });
  });
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const admin = await fetch(`${base}/api/auth/register-admin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "attacker", password: "password" }) });
  assert.equal(admin.status, 401);
  const upload = async (content: Uint8Array | string, type: string, filename: string) => {
    const body = new FormData();
    body.append("avatar", new Blob([content as BlobPart], { type }), filename);
    return fetch(`${base}/api/upload/avatar`, { method: "POST", body });
  };
  assert.equal((await upload("<script>alert(1)</script>", "image/png", "attack.html")).status, 400);
  assert.equal((await upload("<svg onload='alert(1)'/>", "image/svg+xml", "attack.svg")).status, 400);
  assert.deepEqual(await fs.readdir(directory), []);
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nVwAAAAASUVORK5CYII=", "base64");
  const accepted = await upload(png, "image/png", "avatar.html");
  assert.equal(accepted.status, 201);
  const { data } = await accepted.json() as { data: { url: string } };
  assert.ok(data.url.endsWith(".png"));
  const image = await fetch(`${base}${data.url}`);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.match(image.headers.get("content-security-policy") || "", /sandbox/);
  evidence = true;
  assert.equal((await fetch(`${base}${data.url}`)).status, 404);
});
