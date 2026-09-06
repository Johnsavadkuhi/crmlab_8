import assert from "node:assert/strict";
import test from "node:test";
import { assetsApi } from "@/entities/asset/api/assetsApi";
import { logout } from "@/features/auth/model/authSlice";
import type { AssetSummary } from "@/entities/asset/model/types";
import { setupStore } from "./store";

const summary: AssetSummary = {
  total: 42,
  owned: 2,
  assigned: 1,
  byType: {},
  byOwnerType: {},
  byStatus: {},
  byDepartment: {},
  byPlatform: {},
  lifecycle: {
    warrantyExpired: 0,
    warrantyExpiring: 0,
    licenseExpired: 0,
    licenseExpiring: 0,
    maintenanceOverdue: 0,
    maintenanceDueSoon: 0,
  },
};

test("logout clears cached API data before another account can reuse it", async () => {
  const store = setupStore();
  await store.dispatch(
    assetsApi.util.upsertQueryData("getAssetSummary", undefined, summary)
  );
  assert.equal(Object.keys(store.getState().api.queries).length, 1);

  store.dispatch(logout());

  assert.deepEqual(store.getState().api.queries, {});
});
