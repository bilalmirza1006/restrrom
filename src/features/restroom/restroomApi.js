import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const restroomApis = createApi({
  reducerPath: 'restroomApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/restroom`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      headers.delete('Content-Type');
      return headers;
    },
  }),
  tagTypes: ['restroom'],
  endpoints: builder => ({
    createRestroom: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['restroom'],
    }),
    createMultipleRestrooms: builder.mutation({
      query: data => ({
        url: '/create-multiple',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['restroom'],
    }),
    getAllRestrooms: builder.query({
      query: buildingId => ({
        url: `/all?buildingId=${buildingId}`,
        method: 'GET',
      }),
      providesTags: ['restroom'],
    }),
    getRestroom: builder.query({
      query: buildingId => ({
        url: `/single/${buildingId}`,
        method: 'GET',
      }),
      providesTags: ['restroom'],
    }),
    updateRestroom: builder.mutation({
      query: ({ restroomId, data }) => ({
        url: `/single/${restroomId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['restroom'],
    }),
    deleteRestroom: builder.mutation({
      query: restroomId => ({
        url: `/single/${restroomId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['restroom'],
    }),
  }),
});

export const {
  useCreateRestroomMutation,
  useGetAllRestroomsQuery,
  useGetRestroomQuery,
  useUpdateRestroomMutation,
  useDeleteRestroomMutation,
  useCreateMultipleRestroomsMutation,
} = restroomApis;

export const resetRestroomApiState = restroomApis.util.resetApiState;
