import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/reports',
    credentials: 'include',
    prepareHeaders: headers => {
      headers.delete('Content-Type');
      return headers;
    },
  }),
  tagTypes: ['Reports'],
  endpoints: builder => ({
    getBuildingSensorsReport: builder.query({
      query: ({ buildingId, startDate, endDate, restroomId, sensorId, interval }) => {
        const params = new URLSearchParams();
        if (buildingId) params.append('buildingId', buildingId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (restroomId) params.append('restroomId', restroomId);
        if (sensorId) params.append('sensorId', sensorId);
        if (interval) params.append('interval', interval);

        return {
          url: `/building-sensors?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Reports'],
    }),
  }),
});

export const { useGetBuildingSensorsReportQuery } = reportsApi;

export const resetReportsApiState = reportsApi.util.resetApiState;
