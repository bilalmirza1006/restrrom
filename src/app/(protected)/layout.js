'use client';

import { useGetProfileQuery } from '@/features/auth/authApi';
import { setUser } from '@/features/auth/authSlice';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import Loader from '@/components/global/Loader';
import { useRouter } from 'next/navigation';
import { getRedirectPath, isProtectedRoute } from '@/utils/routingUtils';
import { isEqual } from 'lodash';

const ProtectedLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data, isSuccess, isLoading, isError, isUninitialized } = useGetProfileQuery();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isRedirectingRef = useRef(false);
  console.log('datadatadatadata', data);

  // Helper to determine if redirection is crossing role boundaries
  const isCrossingRoleBoundaries = (currentPath, targetPath) => {
    // Extract the role segment from path
    const getRoleFromPath = (path) => {
      if (path.startsWith('/admin')) return 'admin';
      if (path.startsWith('/inspectionist') || path.startsWith('/inspector')) return 'inspector';
      if (path.startsWith('/user')) return 'user';
      return null;
    };

    const currentRole = getRoleFromPath(currentPath);
    const targetRole = getRoleFromPath(targetPath);

    return currentRole !== targetRole && currentRole !== null && targetRole !== null;
  };

  useEffect(() => {
    // Skip if a redirect is already in progress
    if (isRedirectingRef.current) {
      return;
    }

    if (isSuccess && data?.data) {
      console.log('Profile data received in ProtectedLayout:', data.data);

      // Update Redux store if needed
      const userData = data.data;
      const storeUser = user?.user || user;

      // Compare entire objects
      if (!storeUser || !isEqual(storeUser, userData)) {
        console.log('dispatch setUser - user changed');
        dispatch(setUser(userData));
      }

      // Get user role and determine if redirect needed
      const userRole = userData.role;
      const currentPath = window.location.pathname;

      if (userRole && isAuthenticated) {
        const redirectPath = getRedirectPath(currentPath, userRole);

        if (redirectPath) {
          isRedirectingRef.current = true;

          // Use window.location for cross-role redirects to ensure UI updates
          if (isCrossingRoleBoundaries(currentPath, redirectPath)) {
            console.log('Cross-role redirect in ProtectedLayout - using hard refresh');
            window.location.href = redirectPath;
          } else {
            router.replace(redirectPath);
          }
          return;
        }
      }
    } else if (!isLoading && !isUninitialized && isAuthenticated && user) {
      // Handle case where we already have user in Redux
      // Extract role safely from potentially different user object structures
      const userRole = user?.role || user?.user?.role;

      if (userRole) {
        const currentPath = window.location.pathname;
        const redirectPath = getRedirectPath(currentPath, userRole);

        if (redirectPath) {
          isRedirectingRef.current = true;

          // Use window.location for cross-role redirects to ensure UI updates
          if (isCrossingRoleBoundaries(currentPath, redirectPath)) {
            console.log('Cross-role redirect in ProtectedLayout - using hard refresh');
            window.location.href = redirectPath;
          } else {
            router.replace(redirectPath);
          }
          return;
        }
      }
    }

    // Reset redirect flag when done
    isRedirectingRef.current = false;
  }, [data, isSuccess, isLoading, isUninitialized, dispatch, router, user, isAuthenticated]);

  // Show loader during initial data fetch
  if (isLoading || isUninitialized) {
    return <Loader />;
  }

  // For error cases when user is not authenticated, let AuthGuard handle it
  if (isError && !isAuthenticated) {
    console.error('Error fetching profile:', isError);
  }

  // Let AuthGuard handle the role-based protection
  return <AuthGuard>{children}</AuthGuard>;
};

export default ProtectedLayout;
