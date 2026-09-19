import assert from "node:assert/strict";
import test from "node:test";
import { removeUserSocketsFromProject } from "./socket.rooms";
import { SOCKET_ROOMS } from "@/constants/socket";
import type { RealtimeServer } from "./socket.types";

test("removed project members leave only that project across all their sockets", async () => {
  const calls: [string, string][] = [];
  const io = { in: (userRoom: string) => ({ socketsLeave: (projectRoom: string) => calls.push([userRoom, projectRoom]) }) } as unknown as RealtimeServer;
  await removeUserSocketsFromProject(io, ["user-1", "user-1", "user-2"], "project-1");
  assert.deepEqual(calls, [
    [SOCKET_ROOMS.USER("user-1"), SOCKET_ROOMS.PROJECT("project-1")],
    [SOCKET_ROOMS.USER("user-2"), SOCKET_ROOMS.PROJECT("project-1")],
  ]);
});
