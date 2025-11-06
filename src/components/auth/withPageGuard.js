// components/auth/withPageGuard.js - ENHANCED VERSION
'use client';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Loader from '@/components/global/Loader';

export const PAGE_PERMISSIONS = {
  // Dashboard - exact match only
  '/admin': {
    roles: ['admin', 'report_manager', 'subscription_manager', 'building_manager'],
    exact: true, // Only matches exactly /admin
  },
  // Specific routes with their own permissions
  '/admin/all-managers': {
    roles: ['admin', 'building_manager'],
    exact: false,
  },
  '/admin/buildings': {
    roles: ['admin', 'building_manager'],
    exact: false, // Matches /admin/buildings and all sub-routes
  },
  '/admin/floor/floor-detail/[floorById]': {
    roles: ['admin', 'building_manager'],
    exact: false,
  },
  '/admin/add-building': {
    roles: ['admin', 'building_manager'],
    exact: false,
  },
  '/admin/sensors': {
    roles: ['admin', 'building_manager'], // subscription_manager NOT included
    exact: false, // Matches /admin/sensors and all sub-routes
  },
  '/admin/reports': {
    roles: ['admin', 'report_manager'],
    exact: false,
  },
  '/admin/plans': {
    roles: ['admin', 'subscription_manager'],
    exact: false,
  },
  '/admin/settings': {
    roles: ['admin', 'report_manager', 'subscription_manager', 'building_manager'],
    exact: false,
  },
  '/admin/history': {
    roles: ['admin', 'report_manager', 'subscription_manager', 'building_manager'],
    exact: false,
  },
  '/admin/inspection-details/[inspectionId]': {
    roles: ['admin', 'report_manager', 'subscription_manager', 'building_manager'],
    exact: false,
  },
};

const withPageGuard = (WrappedComponent, requiredPath) => {
  return function ProtectedComponent(props) {
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
    console.log('ddsdsdsdsdsdssssss', userRole);

    useEffect(() => {
      if (isAuthenticated && userRole && requiredPath) {
        let hasAccess = false;

        // Check each permission rule
        for (const [path, config] of Object.entries(PAGE_PERMISSIONS)) {
          let pathMatches = false;

          if (config.exact) {
            // Exact match required
            pathMatches = requiredPath === path;
          } else {
            // Match path and all sub-routes
            pathMatches = requiredPath.startsWith(path);
          }

          if (pathMatches && config.roles.includes(userRole)) {
            hasAccess = true;
            break;
          }
        }

        if (!hasAccess) {
          console.log(`🚫 HOC Guard: ${userRole} cannot access ${requiredPath}`);
          router.replace('/unauthorized');
        } else {
          console.log(`✅ HOC Guard: ${userRole} can access ${requiredPath}`);
        }
      }
    }, [isAuthenticated, userRole, router]);

    // Show loader while checking permissions
    if (!isAuthenticated || !user) {
      return <Loader />;
    }

    if (requiredPath && !userRole) {
      return <Loader />;
    }

    // Render the wrapped component if authorized
    return <WrappedComponent {...props} />;
  };
};

export default withPageGuard;
