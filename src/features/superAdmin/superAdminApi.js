import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const superAdminApis = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/super-admin`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      headers.delete('Content-Type');
      return headers;
    },
  }),

  endpoints: builder => ({
    getAllAdminBuildings: builder.query({
      query: () => ({
        url: `/get-all-buildings`,
        method: 'GET',
      }),
    }),
    getAllAdminSensors: builder.query({
      query: () => ({
        url: `/get-all-sensors`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetAllAdminBuildingsQuery, useGetAllAdminSensorsQuery } = superAdminApis;

export const superAdminApiState = superAdminApis.util.resetApiState;
