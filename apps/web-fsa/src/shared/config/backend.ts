function getBrowserOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

function removeTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const runtimeEnv: Partial<ImportMetaEnv> = import.meta.env || {};

export const API_BASE_URL = removeTrailingSlash(runtimeEnv.VITE_API_BASE_URL || "/api");

export const SOCKET_URL = removeTrailingSlash(
  runtimeEnv.VITE_SOCKET_URL || getBrowserOrigin()
);

export const SOCKET_PATH = runtimeEnv.VITE_SOCKET_PATH || "/socket.io";
