/**
 * Centralized routing utility for role-based access control
 */

// Define route configurations with role permissions
export const ROUTE_CONFIG = {
  // User routes
  '/': { roles: ['user'], exactMatch: false },
  '/profile': { roles: ['user', 'admin', 'inspector'], exactMatch: true },

  // Admin routes
  '/admin': { roles: ['admin'], exactMatch: false },

  // Inspector routes
  '/inspectionist': { roles: ['inspector'], exactMatch: false },

  // Public routes (no auth required)
  '/login': { roles: [], exactMatch: true, public: true },
  '/register': { roles: [], exactMatch: true, public: true },
  '/forgot-password': { roles: [], exactMatch: true, public: true },
};

/**
 * Checks if user has access to a specific route based on their role
 * @param {string} pathname - Current route path
 * @param {object} user - User object containing role information
 * @param {boolean} isAuthenticated - Authentication status
 * @returns {boolean} - Whether user has access to route
 */
export const hasRouteAccess = (pathname, user, isAuthenticated) => {
  // Public routes are accessible without authentication
  const matchedRouteKey = Object.keys(ROUTE_CONFIG).find((route) => {
    const config = ROUTE_CONFIG[route];
    return (
      config.public &&
      ((config.exactMatch && pathname === route) ||
        (!config.exactMatch && pathname.startsWith(route)))
    );
  });

  if (matchedRouteKey && ROUTE_CONFIG[matchedRouteKey].public) {
    return true;
  }

  // If not authenticated, deny access to protected routes
  if (!isAuthenticated || !user) {
    return false;
  }

  // Find matching route configuration
  for (const route in ROUTE_CONFIG) {
    const config = ROUTE_CONFIG[route];
    const pathMatches = config.exactMatch ? pathname === route : pathname.startsWith(route);

    if (pathMatches) {
      // If route requires roles and user has one of them, grant access
      return !config.roles.length || config.roles.includes(user.role);
    }
  }

  // Default to denying access
  return false;
};

/**
 * Gets default route for a user based on their role
 * @param {string} role - User role
 * @returns {string} - Default route for role
 */
export const getDefaultRouteForRole = (role) => {
  switch (role) {
    case 'user':
      return '/';
    case 'admin':
      return '/admin';
    case 'inspector':
      return '/inspectionist';
    default:
      return '/login';
  }
};
