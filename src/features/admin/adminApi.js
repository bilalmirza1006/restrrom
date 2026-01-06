import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin',
    credentials: 'include',
  }),
  tagTypes: ['Dashboard'],
  endpoints: builder => ({
    /**
     * =========================
     * FULL DASHBOARD (FIRST HIT)
     * =========================
     */
    getDashboard: builder.query({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),

    /**
     * =========================
     * PERIOD BASED PERFORMANCE
     * =========================
     */
    getDashboardByPeriod: builder.query({
      query: period => `/dashboard?period=${period}`,
    }),

    /**
     * =========================
     * LATEST BUILDING PERFORMANCE
     * =========================
     */
    getLatestBuildingPerformance: builder.query({
      query: () => '/dashboard?latest=true',
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetDashboardByPeriodQuery,
  useGetLatestBuildingPerformanceQuery,
} = adminApi;
