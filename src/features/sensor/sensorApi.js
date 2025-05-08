import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sensorApi = createApi({
  reducerPath: "sensorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/sensor`,
    credentials: "include",
  }),
  tagTypes: ["Sensor"],
  endpoints: (builder) => ({
    createSensor: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sensor"],
    }),
    getAllSensors: builder.query({
      query: () => ({
        url: "/get-all",
        method: "GET",
      }),
      providesTags: ["Sensor"],
    }),
    getSingleSensor: builder.query({
      query: (sensorId) => ({
        url: `/single/${sensorId}`,
        method: "GET",
      }),
      providesTags: ["Sensor"],
    }),
    updateSensor: builder.mutation({
      query: ({ sensorId, data }) => ({
        url: `/single/${sensorId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Sensor"],
    }),
    deleteSensor: builder.mutation({
      query: (sensorId) => ({
        url: `/single/${sensorId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sensor"],
    }),
  }),
});

export const {
  useCreateSensorMutation,
  useGetAllSensorsQuery,
  useGetSingleSensorQuery,
  useUpdateSensorMutation,
  useDeleteSensorMutation,
} = sensorApi;
