import assert from "node:assert/strict";
import test from "node:test";
import { createUserSchema } from "./user.validators";

test("user creation strips database-owned fields and rejects noncanonical roles", () => {
  const body = { username: "person", password: "secret-password", roles: ["qa"] };
  assert.deepEqual(createUserSchema.parse({ body: {
    ...body, _id: "forged", sessionVersion: 77, projectIds: ["other-project"],
    devOps: true, isActive: true,
  } }).body, body);
  for (const roles of [["ADMIN"], { Admin: 5150 }, ["unknown"]]) {
    assert.equal(createUserSchema.safeParse({ body: { ...body, roles } }).success, false);
  }
});
