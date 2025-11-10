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
  }),
});

export const { useGetAllAdminBuildingsQuery } = superAdminApis;

export const superAdminApiState = superAdminApis.util.resetApiState;
