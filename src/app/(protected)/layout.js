// app/(protected)/layout.js - UPDATED WITH DEBUGGING
'use client';

import { useGetProfileQuery } from '@/features/auth/authApi';
import { setUser } from '@/features/auth/authSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import Loader from '@/components/global/Loader';
import DebugComponent from '@/components/global/DebugComponent';
import ErrorBoundary from '@/components/global/ErrorBoundary';

// Debug: Check if components are imported correctly
console.log('🔍 ProtectedLayout imports:', {
  AuthGuard: typeof AuthGuard,
  Loader: typeof Loader,
  useGetProfileQuery: typeof useGetProfileQuery,
  setUser: typeof setUser,
});

// In browser console, check if components exist
console.log('Component check:');
console.log('Loader:', require('@/components/global/Loader').default);
console.log('AuthGuard:', require('@/components/auth/AuthGuard').default);

const ProtectedLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { data, isSuccess, isLoading, isUninitialized } = useGetProfileQuery();
  const { user } = useSelector(state => state.auth);

  console.log('🛡️ ProtectedLayout - Auth state:', {
    user: user?.role || user?.user?.role,
    isLoading,
  });

  useEffect(() => {
    if (isSuccess && data?.data) {
      console.log('✅ ProtectedLayout: Profile data received');
      const userData = data.data;
      const currentUserRole = userData.role || userData.user?.role;

      if (!user || user.role !== currentUserRole) {
        console.log('🔄 ProtectedLayout: Dispatching setUser');
        dispatch(setUser(userData));
      }
    }
  }, [data, isSuccess, dispatch, user]);

  if (isLoading || isUninitialized) {
    console.log('⏳ ProtectedLayout showing loader');
    return (
      <DebugComponent name="Loader">
        <Loader />
      </DebugComponent>
    );
  }

  console.log('✅ ProtectedLayout rendering AuthGuard');

  return (
    <ErrorBoundary>
      <DebugComponent name="AuthGuard">
        <AuthGuard>
          <DebugComponent name="ProtectedLayoutChildren">{children}</DebugComponent>
        </AuthGuard>
      </DebugComponent>
    </ErrorBoundary>
  );
};

export default ProtectedLayout;
