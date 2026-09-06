import { api } from "@/shared/api/baseApi";
import { unwrapApiData } from "@/shared/api/unwrapApiData";
import type { AdminAnalytics, AnalyticsQuery } from "../model/types";

function compactParams(query: AnalyticsQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== "")
  );
}

export const adminAnalyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnalytics: builder.query<AdminAnalytics, AnalyticsQuery>({
      query: (query) => ({ url: "/admin/analytics/overview", params: compactParams(query) }),
      transformResponse: (response) => unwrapApiData<AdminAnalytics>(response),
      providesTags: ["AdminAnalytics"],
    }),
  }),
});

export const { useGetAdminAnalyticsQuery } = adminAnalyticsApi;
