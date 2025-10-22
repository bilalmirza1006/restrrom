// src/components/auth/RoleGuard.js - UPDATED
'use client';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

// Define role hierarchies and permissions - UPDATED
export const ROLE_PERMISSIONS = {
  super_admin: ['*'], // Access to everything
  admin: ['admin', 'subscription_manager', 'building_manager', 'report_manager'],
  building_manager: ['admin'],
  building_inspector: ['inspectionist'],
  report_manager: ['admin'],
  subscription_manager: ['admin'],
};

export const ROLE_HIERARCHY = {
  super_admin: [
    'admin',
    'building_manager',
    'building_inspector',
    'report_manager',
    'subscription_manager',
  ],
  admin: ['building_manager', 'report_manager', 'subscription_manager'],
  building_manager: [],
  building_inspector: [],
  report_manager: [],
  subscription_manager: [],
};

export function canAccess(userRole, requiredRole) {
  if (!userRole) return false;

  // Super admin can access everything
  if (userRole === 'super_admin') return true;

  // Check if user has direct permission
  if (
    ROLE_PERMISSIONS[userRole]?.includes('*') ||
    ROLE_PERMISSIONS[userRole]?.includes(requiredRole)
  ) {
    return true;
  }

  // Check role hierarchy
  return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
}

export default function RoleGuard({ children, requiredRole }) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Normalize user role
  const getUserRole = () => {
    const role = user?.role;
    const roleMap = {
      reporter: 'report_manager',
      reporter_manager: 'report_manager',
      subscription: 'subscription_manager',
      subscription_manager: 'subscription_manager',
    };
    return roleMap[role] || role;
  };

  const userRole = getUserRole();

  useEffect(() => {
    if (isAuthenticated && userRole && requiredRole) {
      const hasAccess = canAccess(userRole, requiredRole);

      if (!hasAccess) {
        console.log(
          `🚫 RoleGuard: ${userRole} cannot access ${requiredRole}, redirecting to unauthorized`
        );
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, userRole, requiredRole, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiredRole && !canAccess(userRole, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
}
