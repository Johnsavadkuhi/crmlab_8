import { useSyncExternalStore } from "react";

let currentTime = Date.now();
let timer: ReturnType<typeof globalThis.setInterval> | undefined;
const listeners = new Set<() => void>();
const getSnapshot = () => currentTime;

function update() {
  currentTime = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined) {
    update();
    timer = globalThis.setInterval(update, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer !== undefined) {
      globalThis.clearInterval(timer);
      timer = undefined;
    }
  };
}

// All visible deadline badges share a single clock and timer.
export function useCurrentTime() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
