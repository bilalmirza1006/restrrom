'use client';

import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '@/components/global/Loader';
import toast from 'react-hot-toast';

/**
 * AuthGuard component for protecting routes based on user roles
 * Simpler implementation with direct path checks
 */
const AuthGuard = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Debug the auth state
    console.log('Auth state in AuthGuard:', auth);

    // Extract user and authentication status safely
    const isAuthenticated = auth?.isAuthenticated || false;
    const user = auth?.user || null;

    // Handle non-authenticated users
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login');
      router.replace('/login');
      setIsChecking(false);
      return;
    }

    // Get user role with proper null checks
    let role = null;

    // Try different paths to find the role
    if (user.role) {
      role = user.role;
    } else if (user.user && user.user.role) {
      role = user.user.role;
    }

    if (!role) {
      console.error('No role found in user object:', user);
      toast.error('User role not found. Please log in again.');
      router.replace('/login');
      setIsChecking(false);
      return;
    }

    console.log('Current role:', role, 'Current path:', pathname);

    // Handle role-based access for specific paths
    let isAllowed = false;

    // Admin paths
    if (pathname.startsWith('/admin')) {
      isAllowed = role === 'admin';
    }
    // Inspector paths
    else if (pathname.startsWith('/inspectionist')) {
      isAllowed = role === 'inspector';
    }
    // User paths (root path or explicitly user paths)
    else if (pathname === '/' || pathname.startsWith('/user')) {
      isAllowed = role === 'user';
    }
    // Shared paths that all roles can access
    else if (pathname === '/profile') {
      isAllowed = true;
    }

    console.log('Path access allowed:', isAllowed);

    if (!isAllowed) {
      // Redirect to appropriate home based on role
      let redirectPath = '/';
      if (role === 'admin') redirectPath = '/admin';
      if (role === 'inspector') redirectPath = '/inspectionist';

      console.log('Redirecting to:', redirectPath);
      toast.error('You are not authorized to access this page');
      router.replace(redirectPath);
      setIsChecking(false);
    } else {
      setIsAuthorized(true);
      setIsChecking(false);
    }
  }, [auth, pathname, router]);

  // Show loader while checking authorization
  if (isChecking) {
    return <Loader />;
  }

  // Only render children if user is authorized
  return isAuthorized ? children : null;
};

export default AuthGuard;
