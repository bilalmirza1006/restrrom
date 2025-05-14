'use client';

import { useGetProfileQuery } from '@/features/auth/authApi';
import { setUser } from '@/features/auth/authSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import Loader from '@/components/global/Loader';
import { useRouter } from 'next/navigation';
import { getDefaultRouteForRole } from '@/utils/routingUtils';

const ProtectedLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data, isSuccess, isLoading, isError } = useGetProfileQuery();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // This useEffect handles fetching the user profile and setting up initial routing
  useEffect(() => {
    if (data?.data && isSuccess) {
      // Dispatch user data to Redux store
      dispatch(setUser(data.data));

      // If we're at the root path '/' and user has a different role than 'user',
      // redirect them to their role-specific route
      if (window.location.pathname === '/') {
        const role = data.data.role;
        if (role !== 'user') {
          const redirectPath = getDefaultRouteForRole(role);
          router.replace(redirectPath);
        }
      }
    }
  }, [data, isSuccess, dispatch, router]);

  // Show loader while loading the profile
  if (isLoading) {
    return <Loader />;
  }

  // AuthGuard will handle the role-based routing
  return <AuthGuard>{children}</AuthGuard>;
};

export default ProtectedLayout;
