import { VulnerabilityModel } from "@/modules/pentest/models/vulnerability.model";

const evidenceFileFields = ["pocs", "requestHeadersFile"].flatMap((field) =>
  ["fileId", "filename", "originalname"].map((key) => `${field}.${key}`)
);

export async function isEvidenceUpload(filename: string) {
  return Boolean(await VulnerabilityModel.exists({
    $or: evidenceFileFields.map((field) => ({ [field]: filename })),
  }));
}

export async function ensureEvidenceUploadIndexes() {
  try {
    const collection = VulnerabilityModel.collection;
    const indexes = await collection.indexes();
    for (const field of evidenceFileFields) {
      if (indexes.some((index) => Object.keys(index.key).length === 1 && index.key[field] === 1)) continue;
      await collection.createIndex({ [field]: 1 }, { sparse: true });
    }
  } catch (error) {
    if ((error as { code?: number }).code === 26) return; // Preserve absent legacy collections.
    throw error;
  }
}
