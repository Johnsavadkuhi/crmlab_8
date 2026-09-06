import { api } from "@/shared/api/baseApi";
import { unwrapApiData } from "@/shared/api/unwrapApiData";
import type {
  BaseDashboardData,
  DevopsDashboardData,
  SecurityDashboardData,
  TestingDashboardData,
  WorkDashboardData,
} from "../model/types";

export const personalDashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBaseDashboard: builder.query<BaseDashboardData, void>({
      query: () => "/me/dashboard/base",
      transformResponse: (response) => unwrapApiData<BaseDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
    getTestingDashboard: builder.query<TestingDashboardData, void>({
      query: () => "/me/dashboard/testing",
      transformResponse: (response) => unwrapApiData<TestingDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
    getQaDashboard: builder.query<WorkDashboardData, void>({
      query: () => "/me/dashboard/qa",
      transformResponse: (response) => unwrapApiData<WorkDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
    getQualityDashboard: builder.query<WorkDashboardData, void>({
      query: () => "/me/dashboard/quality",
      transformResponse: (response) => unwrapApiData<WorkDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
    getDevopsDashboard: builder.query<DevopsDashboardData, void>({
      query: () => "/me/dashboard/devops",
      transformResponse: (response) => unwrapApiData<DevopsDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
    getSecurityDashboard: builder.query<SecurityDashboardData, void>({
      query: () => "/me/dashboard/security",
      transformResponse: (response) => unwrapApiData<SecurityDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
    getRepresentativeDashboard: builder.query<WorkDashboardData, void>({
      query: () => "/me/dashboard/representative",
      transformResponse: (response) => unwrapApiData<WorkDashboardData>(response),
      providesTags: ["PersonalDashboard"],
    }),
  }),
});

export const {
  useGetBaseDashboardQuery,
  useGetDevopsDashboardQuery,
  useGetQaDashboardQuery,
  useGetQualityDashboardQuery,
  useGetRepresentativeDashboardQuery,
  useGetSecurityDashboardQuery,
  useGetTestingDashboardQuery,
} = personalDashboardApi;
