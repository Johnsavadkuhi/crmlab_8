import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "@/features/auth/model/authSlice";
import { API_BASE_URL } from "@/shared/config/backend";

const CSRF_TOKEN_URL = "/auth/csrf-token";
const PUBLIC_AUTH_URLS = new Set([
  "/auth/login",
  "/auth/register",
  CSRF_TOKEN_URL,
]);
let cachedCsrfToken: string | undefined;
let csrfRequest: ReturnType<typeof requestCsrfToken> | undefined;
let refreshRequest: ReturnType<typeof baseQueryWithCsrf> | undefined;
let sessionGeneration = 0;

type CsrfTokenResponse = {
  success?: boolean;
  data?: {
    csrfToken?: string;
  };
  csrfToken?: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
});

const getRequestUrl = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url;

const isProtectedRequest = (args: string | FetchArgs) =>
  !PUBLIC_AUTH_URLS.has(getRequestUrl(args));

const withCsrfToken = (args: string | FetchArgs, csrfToken: string): FetchArgs => {
  const requestArgs = typeof args === "string" ? { url: args } : args;
  const headers = new globalThis.Headers(
    requestArgs.headers as ConstructorParameters<typeof globalThis.Headers>[0]
  );
  headers.set("x-csrf-token", csrfToken);

  return {
    ...requestArgs,
    headers,
  };
};

const requestCsrfToken = async (api, extraOptions) => {
  const result = await rawBaseQuery(CSRF_TOKEN_URL, api, extraOptions);

  if (result.error) {
    return { error: result.error };
  }

  const response = result.data as CsrfTokenResponse;
  const csrfToken = response.data?.csrfToken || response.csrfToken;

  if (!csrfToken) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: "CSRF token response did not include a csrfToken",
      } satisfies FetchBaseQueryError,
    };
  }

  cachedCsrfToken = csrfToken;
  return { data: csrfToken };
};

const fetchCsrfToken = async (api, extraOptions) => {
  if (cachedCsrfToken) return { data: cachedCsrfToken };
  if (!csrfRequest) {
    csrfRequest = requestCsrfToken(api, extraOptions).finally(() => {
      csrfRequest = undefined;
    });
  }
  return csrfRequest;
};

function rememberAuthToken(data: unknown) {
  const response = data as CsrfTokenResponse | undefined;
  const token = response?.data?.csrfToken || response?.csrfToken;
  if (token) cachedCsrfToken = token;
}

const baseQueryWithCsrf: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (!isProtectedRequest(args)) {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (!result.error) rememberAuthToken(result.data);
    return result;
  }

  const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return rawBaseQuery(args, api, extraOptions);

  const csrfResult = await fetchCsrfToken(api, extraOptions);

  if ("error" in csrfResult) {
    return { error: csrfResult.error };
  }

  let result = await rawBaseQuery(
    withCsrfToken(args, csrfResult.data),
    api,
    extraOptions
  );

  const errorData = result.error?.data as { error?: { message?: string } } | undefined;
  if (result.error?.status === 403 && errorData?.error?.message === "Invalid CSRF token") {
    if (cachedCsrfToken === csrfResult.data) cachedCsrfToken = undefined;
    const retryCsrfResult = await fetchCsrfToken(api, extraOptions);

    if ("error" in retryCsrfResult) {
      return { error: retryCsrfResult.error };
    }

    result = await rawBaseQuery(
      withCsrfToken(args, retryCsrfResult.data),
      api,
      extraOptions
    );
  }

  if (!result.error) {
    rememberAuthToken(result.data);
    if (getRequestUrl(args) === "/auth/logout") cachedCsrfToken = undefined;
  }

  return result;
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (refreshRequest) await refreshRequest;
  const requestGeneration = sessionGeneration;
  let result = await baseQueryWithCsrf(args, api, extraOptions);

  if (result?.error?.status === 401 && isProtectedRequest(args)) {
    // A delayed 401 may arrive after another request already refreshed.
    if (requestGeneration !== sessionGeneration) return baseQueryWithCsrf(args, api, extraOptions);
    if (!refreshRequest) {
      const refresh = () => baseQueryWithCsrf(
        { url: "/auth/refresh-token", method: "POST" }, api, extraOptions
      );
      const refreshAcrossTabs = typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request("crmlab-auth-refresh", async () => {
            // Another tab may have rotated the shared cookies while we waited.
            const currentSession = await rawBaseQuery("/auth/me", api, extraOptions);
            return currentSession.error ? refresh() : currentSession;
          })
        : refresh();
      refreshRequest = Promise.resolve(refreshAcrossTabs).then((refreshResult) => {
        if (!refreshResult.error) sessionGeneration += 1;
        return refreshResult;
      }).finally(() => { refreshRequest = undefined; });
    }
    const refreshResult = await refreshRequest;

    if (!refreshResult.error) {
      result = await baseQueryWithCsrf(args, api, extraOptions);
    } else {
      cachedCsrfToken = undefined;
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "FourLRetrospectives",
    "Auth",
    "Users",
    "Pentest",
    "DevOps",
    "Tickets",
    "QA",
    "Reports",
    "Upload",
    "Notifications",
    "Projects",
    "ProjectTableSettings",
    "AuditLogs",
    "AdminAnalytics",
    "PersonalDashboard",
    "Assets",
  ],
  endpoints: () => ({}),
});
