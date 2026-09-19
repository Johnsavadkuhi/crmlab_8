import assert from "node:assert/strict";
import test from "node:test";
import { safeNotificationActionUrl } from "./notification";

test("notification navigation only accepts local application paths", () => {
  assert.equal(safeNotificationActionUrl("/projects/123?tab=bugs#item"), "/projects/123?tab=bugs#item");
  for (const url of ["javascript:alert(1)", "data:text/html,bad", "https://external.test", "//external.test", "/\\external.test", "/\n/external.test", undefined]) {
    assert.equal(safeNotificationActionUrl(url), undefined);
  }
});
import { normalizeNotification, normalizeNotificationPriority } from "./notification";

test("normalizes legacy and unknown notification priorities safely", () => {
  assert.equal(normalizeNotificationPriority("normal"), "medium");
  assert.equal(normalizeNotificationPriority(undefined), "medium");
  assert.equal(normalizeNotificationPriority("URGENT"), "critical");
  assert.equal(normalizeNotificationPriority("HIGH"), "high");
});

test("normalizes realtime JSON payloads into the application contract", () => {
  const notification = normalizeNotification({
    id: 42 as unknown as string,
    type: "system.announcement",
    title: "Notice",
    message: "Message",
    priority: "URGENT" as unknown as "medium",
    isRead: 0 as unknown as boolean,
    createdAt: new Date("2026-01-01T00:00:00Z") as unknown as string,
  });

  assert.equal(notification.id, "42");
  assert.equal(notification.priority, "critical");
  assert.equal(notification.isRead, false);
  assert.equal(notification.createdAt, "2026-01-01T00:00:00.000Z");
});
