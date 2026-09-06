import mongoose from "mongoose";
import { LEGACY_COLLECTIONS } from "@/constants/legacyCollections";

const UNIQUE_IDENTIFIERS = ["serialNumber", "macAddress"] as const;

async function duplicateNonEmptyValues(field: (typeof UNIQUE_IDENTIFIERS)[number]) {
  const database = mongoose.connection.db!;
  const result = await database
    .collection(LEGACY_COLLECTIONS.assets)
    .aggregate([
      { $match: { [field]: { $type: "string", $ne: "" } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ])
    .toArray();
  return result.length > 0;
}

export async function ensureAssetIndexes() {
  const database = mongoose.connection.db;
  if (!database) return;
  const collections = await database
    .listCollections({ name: LEGACY_COLLECTIONS.assets }, { nameOnly: true })
    .toArray();
  if (!collections.length) {
    console.warn(
      "[assets] Legacy assets collection is absent; no collection or index was auto-created."
    );
    return;
  }
  const collection = database.collection(LEGACY_COLLECTIONS.assets);
  const existing = new Set(
    (await collection.listIndexes().toArray()).map((index) => index.name)
  );

  for (const field of UNIQUE_IDENTIFIERS) {
    const name = `${field}_1`;
    if (existing.has(name)) continue;
    if (await duplicateNonEmptyValues(field)) {
      console.warn(
        `[assets] Skipped ${name}: duplicate non-empty legacy values require review.`
      );
      continue;
    }
    try {
      // $gt excludes legacy empty strings using an operator supported by MongoDB
      // partial indexes. This is semantically equivalent to the old $ne: "" intent.
      await collection.createIndex(
        { [field]: 1 },
        {
          name,
          unique: true,
          partialFilterExpression: { [field]: { $type: "string", $gt: "" } },
        }
      );
      console.info(`[assets] Created missing compatibility index ${name}.`);
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code: unknown }).code)
          : "unknown";
      console.warn(
        `[assets] Could not create ${name}; data remains untouched (code=${code}).`
      );
    }
  }
}
