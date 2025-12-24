import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const alertsApi = createApi({
  reducerPath: 'alertsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/alert`,
    credentials: 'include',
  }),
  tagTypes: ['Alert'],
  endpoints: builder => ({
    // Create alert
    createAlert: builder.mutation({
      query: data => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Alert'],
    }),

    // Get all alerts
    getAllAlerts: builder.query({
      query: () => ({
        url: '',
        method: 'GET',
      }),
      providesTags: ['Alert'],
    }),

    // Get single alert
    getSingleAlert: builder.query({
      query: alertId => ({
        url: `?id=${alertId}`,
        method: 'GET',
      }),
      providesTags: ['Alert'],
    }),

    // Update alert
    updateAlert: builder.mutation({
      query: data => ({
        url: '',
        method: 'PUT',
        body: data, // must include id
      }),
      invalidatesTags: ['Alert'],
    }),

    // Delete alert
    deleteAlert: builder.mutation({
      query: alertId => ({
        url: `?id=${alertId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Alert'],
    }),
  }),
});

export const {
  useCreateAlertMutation,
  useGetAllAlertsQuery,
  useGetSingleAlertQuery,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
} = alertsApi;
