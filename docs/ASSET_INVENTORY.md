# Enterprise Asset & Inventory Management

## Verified legacy baseline

The pre-implementation diagnostic connected read-only to MongoDB database `test`.
Mongoose's default pluralizer maps model name `Assets` to `assets`, and the database
was independently verified to contain that exact collection. The current model is
therefore explicitly pinned to `collection: "assets"`; it does not rely on inference.

Verified on 2026-09-06:

- Assets: 6 (5 bank, 1 laboratory; all currently hardware)
- Users: 9 in the existing `users` collection
- `owner` / `assignedTo`: 2 distinct references, all valid ObjectIds, no missing users
- Duplicate non-empty asset codes, serial numbers, or MAC addresses: 0
- Invalid legacy enum values: 0
- Data-quality finding: 1 Bank/Lab asset has no asset code

The data-quality finding is reported but intentionally not repaired. An unrelated
patch to this partial legacy document remains possible; changing its ownership or
asset code invokes the current ownership rule.

## Compatibility strategy

`AssetModel` keeps every legacy field name and both legacy timestamps. Schema
evolution is additive and the model is explicitly bound to `assets`. Missing arrays
are normalized to empty arrays only in API output, not written back to MongoDB.
Patch requests use `$set`/`$unset` only for submitted fields, so opening or editing a
legacy record does not manufacture defaults or replace absent fields.

The final schema differs from the supplied schema only in safe runtime behavior:

- collection and model names are explicit rather than inferred;
- `autoCreate` and `autoIndex` are disabled;
- legacy-missing `departmentScope` and `platforms` remain readable, while new creates
  require at least one valid value for each;
- software defaults are applied only when creating software, preventing synthetic
  software metadata on new hardware;
- `licenseKey` is excluded from normal Mongoose selection;
- normal Mongoose timestamps preserve the same `createdAt` and `updatedAt` names.

No asset document migration is required and no document migration runs at startup.

## Index policy

Existing indexes are inspected rather than dropped or recreated. The verified
database already had the sparse unique `assetCode_1`, text search index, lookup,
date, status, tag, scope, and compound legacy indexes. It lacked the intended unique
partial indexes for `serialNumber` and `macAddress`.

The startup index guard checks that `assets` exists and that no duplicate non-empty
values exist before creating a missing identifier index. It never creates the
collection, drops an index, or edits a document. The deployed partial expression
uses `$type: "string"` plus `$gt: ""`, the supported equivalent of the legacy
non-empty-string intent. Both missing indexes passed the preflight and now exist.

## API

All routes require authentication and use permission middleware plus service-level
resource authorization:

- `GET /api/assets` — scoped list, text search, filters, sort, pagination
- `GET /api/assets/my` — personally owned assets
- `GET /api/assets/assigned-to-me` — assigned organizational assets
- `GET /api/assets/summary` — permission-scoped analytics and lifecycle alerts
- `GET /api/assets/:id` — scoped detail
- `GET /api/assets/:id/license-key` — audited, explicit reveal action
- `POST /api/assets` — personal create or authorized organizational create
- `PATCH /api/assets/:id` — partial update
- `POST /api/assets/:id/assign` — Bank/Lab assignment
- `POST /api/assets/:id/unassign` — safe unassignment
- `DELETE /api/assets/:id` — non-destructive retirement (status change)

Search uses the verified legacy text index. Available filters include ownership,
type, status, department, platform, owner, assignee, brand, vendor, tag, purchase
range, expiring warranty and expiring license. Lifecycle alert windows use
`ASSET_ALERT_DAYS` (default 30).

## Authorization and sensitive data

Baseline grants available to every authenticated user are `asset.assets.create.own`,
`asset.assets.read.own`, and `asset.assets.update.own`. They are merged into the
effective session without rewriting existing direct-permission documents. Admin and
delegated manager grants cover read/update/assign/manage-all plus cost, license and
sensitive-identifier visibility.

- A normal user can create only `ownerType=user`; the backend forces `owner` to the
  authenticated user and rejects a forged owner.
- A normal user can read owned assets and Bank/Lab assets assigned to them.
- Assigned assets are read-only to normal users.
- Direct access to another user's private asset returns 403.
- Admin/system managers can see all ownership domains and manage assignments.
- Bank/Lab assets require `assetCode`; personal assets do not.
- Owned and assigned are separate concepts and fields.
- `licenseKey` is masked in all normal responses and revealed only through an
  authorized, no-store, audited action.
- Cost and technical identifiers are removed unless the resource/permission policy
  allows them. License keys, cost, serial, MAC, and IP are redacted from asset audit
  metadata.

## Frontend

The Chakra UI v3 inventory workspace is available at `/inventory` for all users. It
contains Admin/User quick views, responsive table and mobile cards, analytics,
ownership/status/type badges, full filters, pagination, sorting, loading/error/empty
states, a conditional Hardware/Software form, personal owner enforcement, details,
license reveal, assignment management, RTL, Persian/English labels, dark-mode token
compatibility, and dashboard summary widgets.

## Verification

- TypeScript typecheck: API and web passed.
- Production build: API and web passed.
- Asset/legacy compatibility tests: 14/14 passed.
- Complete API test run: 148 passed; four unrelated existing project-table
  capability assertions remain failing and are outside this module.
- Frontend unit tests: 30/30 passed.
- Browser-based visual QA was attempted, but no controllable browser was
  available in the execution environment; the production Vite render/build passed.
- Live read-only diagnostic: all 6 legacy assets detected; user references valid;
  no duplicates or invalid enums; one missing Bank/Lab asset code flagged.
- Live read-only service smoke test: all 6 assets returned to Admin, an assignee
  could read the assigned asset, a different user received 403, and no normal
  list response exposed a plaintext license key.

The diagnostic command is safe and read-only:

```bash
npm --workspace enterprise-dashboard-backend run diagnose:legacy-db
```
