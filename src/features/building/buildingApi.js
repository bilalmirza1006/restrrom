import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const buildingApis = createApi({
  reducerPath: "buildingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/building`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.delete("Content-Type");
      return headers;
    },
  }),
  tagTypes: ["building"],
  endpoints: (builder) => ({
    createBuilding: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["building"],
    }),
    getAllBuildings: builder.query({
      query: () => ({
        url: "/all",
        method: "GET",
      }),
      providesTags: ["building"],
    }),
    getBuilding: builder.query({
      query: (buildingId) => ({
        url: `/single/${buildingId}`,
        method: "GET",
      }),
      providesTags: ["building"],
    }),
    updateBuilding: builder.mutation({
      query: ({ buildingId, data }) => ({
        url: `/single/${buildingId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["building"],
    }),
    deleteBuilding: builder.mutation({
      query: (buildingId) => ({
        url: `/single/${buildingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["building"],
    }),
  }),
});

export const {
  useCreateBuildingMutation,
  useGetAllBuildingsQuery,
  useGetBuildingQuery,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
} = buildingApis;

export const resetBuildingApiState = buildingApis.util.resetApiState;
