import { api } from "@/shared/api/baseApi";
import { unwrapApiData } from "@/shared/api/unwrapApiData";
import type {
  Asset,
  AssetFilters,
  AssetInput,
  AssetList,
  AssetSummary,
} from "../model/types";

function params(query: AssetFilters = {}) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== "")
  );
}

export const assetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query<AssetList, AssetFilters | void>({
      query: (query) => ({ url: "/assets", params: query ? params(query) : {} }),
      transformResponse: (response: unknown) => unwrapApiData<AssetList>(response),
      providesTags: (result) => [
        "Assets",
        ...(result?.items.map((asset) => ({ type: "Assets" as const, id: asset.id })) ||
          []),
      ],
    }),
    getAsset: builder.query<Asset, string>({
      query: (id) => `/assets/${id}`,
      transformResponse: (response: unknown) => unwrapApiData<Asset>(response),
      providesTags: (_result, _error, id) => [{ type: "Assets", id }],
    }),
    getAssetSummary: builder.query<AssetSummary, void>({
      query: () => "/assets/summary",
      transformResponse: (response: unknown) => unwrapApiData<AssetSummary>(response),
      providesTags: ["Assets"],
    }),
    createAsset: builder.mutation<Asset, Partial<AssetInput>>({
      query: (body) => ({ url: "/assets", method: "POST", body }),
      transformResponse: (response: unknown) => unwrapApiData<Asset>(response),
      invalidatesTags: ["Assets"],
    }),
    updateAsset: builder.mutation<Asset, { id: string; body: Partial<AssetInput> }>({
      query: ({ id, body }) => ({ url: `/assets/${id}`, method: "PATCH", body }),
      transformResponse: (response: unknown) => unwrapApiData<Asset>(response),
      invalidatesTags: (_result, _error, input) => [
        "Assets",
        { type: "Assets", id: input.id },
      ],
    }),
    assignAsset: builder.mutation<
      Asset,
      { id: string; assignedTo: string; assignedDate?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/assets/${id}/assign`, method: "POST", body }),
      transformResponse: (response: unknown) => unwrapApiData<Asset>(response),
      invalidatesTags: ["Assets"],
    }),
    unassignAsset: builder.mutation<Asset, string>({
      query: (id) => ({ url: `/assets/${id}/unassign`, method: "POST" }),
      transformResponse: (response: unknown) => unwrapApiData<Asset>(response),
      invalidatesTags: ["Assets"],
    }),
    retireAsset: builder.mutation<Asset, string>({
      query: (id) => ({ url: `/assets/${id}`, method: "DELETE" }),
      transformResponse: (response: unknown) => unwrapApiData<Asset>(response),
      invalidatesTags: ["Assets"],
    }),
    revealAssetLicense: builder.mutation<{ id: string; licenseKey?: string }, string>({
      query: (id) => ({ url: `/assets/${id}/license-key`, method: "GET" }),
      transformResponse: (response: unknown) =>
        unwrapApiData<{ id: string; licenseKey?: string }>(response),
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useGetAssetSummaryQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useAssignAssetMutation,
  useUnassignAssetMutation,
  useRetireAssetMutation,
  useRevealAssetLicenseMutation,
} = assetsApi;
