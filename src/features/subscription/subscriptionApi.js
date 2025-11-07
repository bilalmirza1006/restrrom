import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const subscriptionApis = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/subscription`,
    credentials: 'include',
  }),
  tagTypes: ['subscription', 'history', 'webhook'],
  endpoints: builder => ({
    // POST /api/subscription/create-session
    createCheckoutSession: builder.mutation({
      query: data => ({
        url: '/create-session',
        method: 'POST',
        body: data, // { plan: 'monthly' | 'yearly' | 'lifetime' }
      }),
      invalidatesTags: ['subscription'],
    }),

    // POST /api/subscription/cancel
    // cancelSubscription: builder.mutation({
    //   query: (data) => ({
    //     url: '/cancel',
    //     method: 'POST',
    //     body: data, // { subscriptionId, cancelAtPeriodEnd?: boolean }
    //   }),
    //   invalidatesTags: ['subscription', 'history'],
    // }),
    cancelSubscription: builder.mutation({
      query: data => ({
        url: '/cancel',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['subscription', 'history'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Force refetch after successful cancel
          dispatch(
            subscriptionApis.endpoints.getCurrentSubscription.initiate(undefined, {
              forceRefetch: true,
            })
          );
        } catch (err) {
          console.error('Cancel subscription failed:', err);
        }
      },
    }),

    // GET /api/subscription/current
    getCurrentSubscription: builder.query({
      query: () => ({
        url: '/current',
        method: 'GET',
      }),
      providesTags: ['subscription'],
    }),

    // GET /api/subscription/all (admin)
    getAllSubscribers: builder.query({
      query: () => ({
        url: '/all',
        method: 'GET',
      }),
      providesTags: ['subscription'],
    }),

    // GET /api/subscription/history/:userId
    getSubscriptionHistory: builder.query({
      query: userId => ({
        url: `/history/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'history', id: userId }],
    }),

    // GET /api/subscription/webhooks (admin)
    getAllWebhooks: builder.query({
      query: () => ({
        url: `/webhooks`,
        method: 'GET',
      }),
      providesTags: ['webhook'],
    }),

    // GET /api/subscription/webhooks/:userId
    getWebhooksByUser: builder.query({
      query: userId => ({
        url: `/webhooks/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'webhook', id: userId }],
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  useGetAllSubscribersQuery,
  useGetSubscriptionHistoryQuery,
  useGetAllWebhooksQuery,
  useGetWebhooksByUserQuery,
} = subscriptionApis;

export const resetSubscriptionApiState = subscriptionApis.util.resetApiState;
