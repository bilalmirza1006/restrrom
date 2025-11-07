// components/auth/AuthGuard.js - UPDATED
'use client';

import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Loader from '@/components/global/Loader';
import toast from 'react-hot-toast';
import { getRedirectPath, hasRouteAccess, isProtectedRoute } from '@/utils/routingUtils';

const AuthGuard = ({ children }) => {
  const auth = useSelector(state => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const isRedirectingRef = useRef(false);

  // Normalize user role to match routingUtils.js
  const getUserRole = useCallback(() => {
    const user = auth?.user || {};
    const role = user.role || user.user?.role;

    const roleMap = {
      reporter: 'report_manager',
      reporter_manager: 'report_manager',
      subscription: 'subscription_manager',
      subscription_manager: 'subscription_manager',
      building_inspector: 'building_inspector',
      admin: 'admin',
      building_manager: 'building_manager',
      super_admin: 'super_admin',
    };

    return roleMap[role] || role;
  }, [auth]);

  console.log('🛡️ AuthGuard - State:', {
    pathname,
    isAuthenticated: auth?.isAuthenticated,
    userRole: getUserRole(),
    isChecking,
    isAuthorized,
  });

  useEffect(() => {
    if (isRedirectingRef.current) return;

    const checkAuthorization = async () => {
      const isAuthenticated = auth?.isAuthenticated || false;
      const userRole = getUserRole();

      console.log(
        `🔍 AuthGuard Check: path=${pathname}, authenticated=${isAuthenticated}, role=${userRole}`
      );

      // Case 1: Not authenticated and trying to access protected route
      if (!isAuthenticated && isProtectedRoute(pathname)) {
        console.log('🚫 AuthGuard: Not authenticated for protected route, redirecting to login');
        isRedirectingRef.current = true;
        toast.error('Please log in to access this page');
        router.replace('/login');
        return;
      }

      // Case 2: Authenticated but accessing public routes - redirect to appropriate dashboard
      if (isAuthenticated && !isProtectedRoute(pathname)) {
        const defaultRoute = getDefaultRouteForRole(userRole);
        console.log(`🔀 AuthGuard: Authenticated on public route, redirecting to: ${defaultRoute}`);
        isRedirectingRef.current = true;
        router.replace(defaultRoute);
        return;
      }

      // Case 3: Authenticated but no user role
      if (isAuthenticated && !userRole) {
        console.error('❌ AuthGuard: Authenticated but no role found');
        toast.error('User role not found. Please log in again.');
        isRedirectingRef.current = true;
        router.replace('/login');
        return;
      }

      // Case 4: Check route access for authenticated users
      if (isAuthenticated && userRole) {
        const hasAccess = hasRouteAccess(pathname, userRole);

        if (!hasAccess) {
          console.log(
            `🚫 AuthGuard: No access to ${pathname} for role ${userRole}, redirecting to unauthorized`
          );
          isRedirectingRef.current = true;
          toast.error('You are not authorized to access this page');
          router.replace('/unauthorized');
          return;
        }

        // Case 5: User is authorized for current route
        console.log('✅ AuthGuard: User authorized for current route');
        setIsAuthorized(true);
        setIsChecking(false);
        isRedirectingRef.current = false;
        return;
      }

      // Case 6: Public route for non-authenticated users
      console.log('🔓 AuthGuard: Public route access granted');
      setIsAuthorized(true);
      setIsChecking(false);
      isRedirectingRef.current = false;
    };

    checkAuthorization();
  }, [auth, pathname, router, getUserRole]);

  if (isChecking) {
    console.log('⏳ AuthGuard showing loader');
    return <Loader />;
  }

  if (isAuthorized) {
    console.log('✅ AuthGuard rendering children');
    return children;
  }

  console.log('❌ AuthGuard not rendering - unauthorized');
  return null;
};

export default AuthGuard;
