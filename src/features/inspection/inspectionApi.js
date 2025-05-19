import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const inspectionApis = createApi({
  reducerPath: "inspectionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/inspection`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.delete("Content-Type");
      return headers;
    },
  }),
  tagTypes: ["inspections"],
  endpoints: (builder) => ({
    getAllInspectors: builder.query({
      query: () => ({
        url: "/all-inspectors",
        method: "GET",
      }),
      providesTags: ["inspections"],
    }),
    assignBuildingToInspector: builder.mutation({
      query: (data) => ({
        url: "/assign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["inspections"],
    }),
    getAllAssignBuilding: builder.query({
      query: () => ({
        url: `/assigned-buildings`,
        method: "GET",
      }),
      providesTags: ["inspections"],
    }),
  }),
});

export const { useGetAllInspectorsQuery, useAssignBuildingToInspectorMutation, useGetAllAssignBuildingQuery } =
  inspectionApis;

export const resetRestroomApiState = inspectionApis.util.resetApiState;
