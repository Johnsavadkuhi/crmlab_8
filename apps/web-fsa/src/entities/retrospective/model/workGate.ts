import type { FourLWorkGateContract } from "@role-dashboard/contracts";

export function resolveWorkspaceFourLGate(input: {
  gate?: FourLWorkGateContract;
  hasError: boolean;
  projectId?: string;
  isClosed: boolean;
  isSecurityManager: boolean;
}) {
  // Skipping an RTK Query request does not erase a previous cached result.
  // A manager must remain exempt even after switching from a pentester project.
  if (input.isSecurityManager) return { blocker: undefined, unavailable: false };
  return {
    blocker: input.gate?.blockers.find(
      (blocker) => input.isClosed || blocker.projectId !== input.projectId
    ),
    unavailable: !input.gate || input.hasError,
  };
}
