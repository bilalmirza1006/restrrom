import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ruleEngineApi = createApi({
  reducerPath: 'ruleEngineApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/rule', // matches your Next.js API
    credentials: 'include',
  }),
  tagTypes: ['Rule'],
  endpoints: builder => ({
    // Create a new rule
    createRule: builder.mutation({
      query: data => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Rule'],
    }),

    // Get all rules (can also pass filters via query params)
    getAllRules: builder.query({
      query: params => {
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        return {
          url: queryString,
          method: 'GET',
        };
      },
      providesTags: ['Rule'],
    }),

    // Get single rule by ID
    getSingleRule: builder.query({
      query: id => ({
        url: `?id=${id}`,
        method: 'GET',
      }),
      providesTags: ['Rule'],
    }),

    // Update a rule
    updateRule: builder.mutation({
      query: data => ({
        url: '',
        method: 'PUT',
        body: data, // expects { id: ruleId, ...fieldsToUpdate }
      }),
      invalidatesTags: ['Rule'],
    }),

    // Delete a rule
    deleteRule: builder.mutation({
      query: id => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rule'],
    }),
  }),
});

export const {
  useCreateRuleMutation,
  useGetAllRulesQuery,
  useGetSingleRuleQuery,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} = ruleEngineApi;
