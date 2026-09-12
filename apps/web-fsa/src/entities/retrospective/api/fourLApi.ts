import type {
  FourLDraftInputContract,
  FourLRetrospectiveContract,
  FourLWorkGateContract,
} from "@role-dashboard/contracts";
import { api } from "@/shared/api/baseApi";
import { unwrapApiData } from "@/shared/api/unwrapApiData";

type ItemResponse = FourLRetrospectiveContract | { data?: FourLRetrospectiveContract };
type ListResponse =
  | FourLRetrospectiveContract[]
  | { data?: FourLRetrospectiveContract[] };
type GateResponse = FourLWorkGateContract | { data?: FourLWorkGateContract };

export const fourLApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFourLRetrospectives: builder.query<FourLRetrospectiveContract[], void>({
      query: () => "/retrospectives/4l",
      transformResponse: (response: ListResponse) =>
        unwrapApiData<FourLRetrospectiveContract[]>(response) || [],
      providesTags: (items) => [
        { type: "FourLRetrospectives", id: "LIST" },
        ...(items || []).map((item) => ({
          type: "FourLRetrospectives" as const,
          id: item.id,
        })),
      ],
    }),
    getFourLRetrospective: builder.query<FourLRetrospectiveContract, string>({
      query: (id) => `/retrospectives/4l/${id}`,
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      providesTags: (_item, _error, id) => [{ type: "FourLRetrospectives", id }],
    }),
    getMyFourLWorkGate: builder.query<FourLWorkGateContract, void>({
      query: () => "/retrospectives/4l/work-gate",
      transformResponse: (response: GateResponse) =>
        unwrapApiData<FourLWorkGateContract>(response),
      providesTags: [{ type: "FourLRetrospectives", id: "WORK_GATE" }],
    }),
    saveFourLDraft: builder.mutation<
      FourLRetrospectiveContract,
      { id: string; draft: FourLDraftInputContract }
    >({
      query: ({ id, draft }) => ({
        url: `/retrospectives/4l/${id}/draft`,
        method: "PUT",
        body: draft,
      }),
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      invalidatesTags: (_item, _error, { id }) => [
        { type: "FourLRetrospectives", id },
        { type: "FourLRetrospectives", id: "LIST" },
      ],
    }),
    submitFourL: builder.mutation<FourLRetrospectiveContract, string>({
      query: (id) => ({ url: `/retrospectives/4l/${id}/submit`, method: "POST" }),
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      invalidatesTags: (_item, _error, id) => [
        { type: "FourLRetrospectives", id },
        { type: "FourLRetrospectives", id: "LIST" },
        { type: "FourLRetrospectives", id: "WORK_GATE" },
      ],
    }),
    requestFourLChanges: builder.mutation<
      FourLRetrospectiveContract,
      { id: string; note: string }
    >({
      query: ({ id, note }) => ({
        url: `/retrospectives/4l/${id}/request-changes`,
        method: "POST",
        body: { note },
      }),
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      invalidatesTags: (_item, _error, { id }) => [
        { type: "FourLRetrospectives", id },
        { type: "FourLRetrospectives", id: "LIST" },
        { type: "FourLRetrospectives", id: "WORK_GATE" },
      ],
    }),
    approveFourL: builder.mutation<
      FourLRetrospectiveContract,
      { id: string; note?: string }
    >({
      query: ({ id, note }) => ({
        url: `/retrospectives/4l/${id}/approve`,
        method: "POST",
        body: { note },
      }),
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      invalidatesTags: (_item, _error, { id }) => [
        { type: "FourLRetrospectives", id },
        { type: "FourLRetrospectives", id: "LIST" },
      ],
    }),
    sendFourLToAdmin: builder.mutation<FourLRetrospectiveContract, string>({
      query: (id) => ({
        url: `/retrospectives/4l/${id}/send-to-admin`,
        method: "POST",
      }),
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      invalidatesTags: (_item, _error, id) => [
        { type: "FourLRetrospectives", id },
        { type: "FourLRetrospectives", id: "LIST" },
      ],
    }),
    reopenFourL: builder.mutation<
      FourLRetrospectiveContract,
      { id: string; note: string }
    >({
      query: ({ id, note }) => ({
        url: `/retrospectives/4l/${id}/reopen`,
        method: "POST",
        body: { note },
      }),
      transformResponse: (response: ItemResponse) =>
        unwrapApiData<FourLRetrospectiveContract>(response),
      invalidatesTags: (_item, _error, { id }) => [
        { type: "FourLRetrospectives", id },
        { type: "FourLRetrospectives", id: "LIST" },
        { type: "FourLRetrospectives", id: "WORK_GATE" },
      ],
    }),
  }),
});

export const {
  useApproveFourLMutation,
  useGetFourLRetrospectiveQuery,
  useGetFourLRetrospectivesQuery,
  useGetMyFourLWorkGateQuery,
  useReopenFourLMutation,
  useRequestFourLChangesMutation,
  useSaveFourLDraftMutation,
  useSendFourLToAdminMutation,
  useSubmitFourLMutation,
} = fourLApi;
