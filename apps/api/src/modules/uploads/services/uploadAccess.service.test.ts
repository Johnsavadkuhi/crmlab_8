import assert from "node:assert/strict";
import test from "node:test";
import { VulnerabilityModel } from "@/modules/pentest/models/vulnerability.model";
import { ensureEvidenceUploadIndexes, isEvidenceUpload } from "./uploadAccess.service";

test("public-upload protection checks canonical and legacy evidence identifiers", async (t) => {
  const exists = t.mock.method(VulnerabilityModel, "exists", async () => ({ _id: "evidence" }));
  assert.equal(await isEvidenceUpload("private.png"), true);
  const query = exists.mock.calls[0].arguments[0] as unknown as { $or: Record<string, string>[] };
  assert.equal(query.$or.length, 6);
  assert.deepEqual(query.$or.map((clause) => Object.keys(clause)[0]), [
    "pocs.fileId", "pocs.filename", "pocs.originalname",
    "requestHeadersFile.fileId", "requestHeadersFile.filename", "requestHeadersFile.originalname",
  ]);
  assert.ok(query.$or.every((clause) => Object.values(clause)[0] === "private.png"));
});

test("evidence indexes are additive, sparse, nonunique and reuse existing keys", async (t) => {
  const existing = [{ name: "legacy-file-index", key: { "pocs.fileId": 1 } }];
  t.mock.method(VulnerabilityModel.collection, "indexes", async () => existing);
  const create = t.mock.method(VulnerabilityModel.collection, "createIndex", async () => "index");
  await ensureEvidenceUploadIndexes();
  assert.equal(create.mock.callCount(), 5);
  for (const call of create.mock.calls) assert.deepEqual(call.arguments[1], { sparse: true });
});
