// features/auth/authApi.js - UPDATED
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api`,
    credentials: 'include',
  }),
  tagTypes: ['Profile', 'Users', 'User'],
  endpoints: (builder) => ({
    // 🔐 AUTH ENDPOINTS
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      providesTags: ['Profile'],
    }),

    getProfile: builder.query({
      query: () => ({
        url: '/auth/get-profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'GET',
      }),
      invalidatesTags: ['Profile', 'Users'],
    }),

    // 👤 USER PROFILE ENDPOINTS
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/user/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    deleteMyAccount: builder.mutation({
      query: () => ({
        url: '/user/profile',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile', 'Users'],
    }),

    // 👥 USER MANAGEMENT ENDPOINTS (Admin only)
    getAllUsersByCreatorId: builder.query({
      query: (creatorId) => ({
        url: `/user/all-users-by-id/${creatorId}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    // 🔍 GET User by ID
    getUserById: builder.query({
      query: (userId) => ({
        url: `/user/profile/${userId}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    // ✏️ UPDATE User by ID
    updateUserById: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/user/profile/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users', 'User'],
    }),

    // 🗑️ DELETE User by ID
    deleteUserById: builder.mutation({
      query: (userId) => ({
        url: `/user/profile/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,

  // Profile
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteMyAccountMutation,

  // Users
  useGetAllUsersByCreatorIdQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useDeleteUserByIdMutation,
} = authApi;

export const resetAuthApiState = authApi.util.resetApiState;
///////////////////////////////////////////////////
