// utils/routingUtils.js - FIXED VERSION
/**
 * Centralized routing utility for role-based access control
 */

// Define route configurations with role permissions - UPDATED
export const ROUTE_CONFIG = {
  // Super Admin routes (ONLY super_admin can access)
  '/super-admin': {
    roles: ['super_admin'],
    exactMatch: false,
  },

  // Inspection routes (building_inspector can access)
  '/inspectionist': {
    roles: ['building_inspector'],
    exactMatch: false,
  },

  // Admin routes - accessible to admin and all manager roles
  '/admin': {
    roles: ['admin', 'subscription_manager', 'building_manager', 'report_manager'],
    exactMatch: false, // Allow all nested routes under /admin
  },

  // Public routes
  '/login': { roles: [], exactMatch: true, public: true },
  '/signup': { roles: [], exactMatch: true, public: true },
  '/register': { roles: [], exactMatch: true, public: true },
  '/forgot-password': { roles: [], exactMatch: true, public: true },
  '/unauthorized': { roles: [], exactMatch: true, public: true },
};

/**
 * Gets the appropriate route an authenticated user should be redirected to
 */
export const getRedirectPath = (currentPath, role) => {
  if (!role) return '/login';

  console.log(`🔍 getRedirectPath: currentPath=${currentPath}, role=${role}`);

  // Handle root path - redirect to role-specific page
  if (currentPath === '/' || currentPath === '/dashboard') {
    const defaultRoute = getDefaultRouteForRole(role);
    console.log(`🏠 Root path redirect: ${currentPath} -> ${defaultRoute}`);
    return defaultRoute;
  }

  // Check if current path is public and user is authenticated
  const isPublicRoute = Object.entries(ROUTE_CONFIG).some(([route, config]) => {
    if (config.public) {
      return config.exactMatch ? currentPath === route : currentPath.startsWith(route);
    }
    return false;
  });

  if (isPublicRoute) {
    console.log(`🌐 Public route access granted: ${currentPath}`);
    return null; // No redirect needed for public routes
  }

  // Check if user has access to current path
  const hasAccess = hasRouteAccess(currentPath, role);

  if (!hasAccess) {
    const defaultRoute = getDefaultRouteForRole(role);
    console.log(`❌ No access to ${currentPath}, redirecting to: ${defaultRoute}`);
    return defaultRoute;
  }

  console.log(`✅ Access granted to: ${currentPath}`);
  return null; // No redirect needed
};

/**
 * Checks if user has access to a specific route based on their role
 */
export const hasRouteAccess = (pathname, role) => {
  if (!role) return false;

  console.log(`🔐 Checking access for path: ${pathname}, role: ${role}`);

  // Public routes are accessible to all
  const isPublicRoute = Object.entries(ROUTE_CONFIG).some(([route, config]) => {
    if (config.public) {
      return config.exactMatch ? pathname === route : pathname.startsWith(route);
    }
    return false;
  });

  if (isPublicRoute) {
    console.log(`🌐 Public route access granted: ${pathname}`);
    return true;
  }

  // Sort routes by specificity (longer paths first) to match most specific route
  const sortedRoutes = Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => !config.public)
    .sort(([routeA], [routeB]) => routeB.length - routeA.length);

  // Find the most specific matching route
  for (const [route, config] of sortedRoutes) {
    let pathMatches = false;

    if (config.exactMatch) {
      pathMatches = pathname === route;
    } else {
      // For non-exact matches, check if pathname starts with route
      pathMatches = pathname.startsWith(route);
    }

    if (pathMatches) {
      const hasRoleAccess = config.roles.includes(role);
      console.log(
        `📊 Route ${route} (exact: ${config.exactMatch}) - Access ${
          hasRoleAccess ? 'granted' : 'denied'
        } for role ${role}`
      );
      return hasRoleAccess;
    }
  }

  // Deny access to unknown routes
  console.log(`🚫 Unknown route, access denied: ${pathname}`);
  return false;
};

/**
 * Gets default route for a user based on their role
 */
export const getDefaultRouteForRole = role => {
  const defaultRoutes = {
    super_admin: '/super-admin',
    building_inspector: '/inspectionist',
    admin: '/admin',
    subscription_manager: '/admin',
    building_manager: '/admin',
    report_manager: '/admin',
  };

  const route = defaultRoutes[role] || '/admin';
  console.log(`🎯 Default route for ${role}: ${route}`);
  return route;
};

/**
 * Determine if a path should be protected by authentication
 */
export const isProtectedRoute = pathname => {
  // Check if path matches any public route
  for (const [route, config] of Object.entries(ROUTE_CONFIG)) {
    if (config.public) {
      const pathMatches = config.exactMatch ? pathname === route : pathname.startsWith(route);
      if (pathMatches) {
        console.log(`🔓 Public route: ${pathname}`);
        return false;
      }
    }
  }

  console.log(`🔒 Protected route: ${pathname}`);
  return true;
};
