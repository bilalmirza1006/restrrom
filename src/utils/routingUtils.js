/**
 * Centralized routing utility for role-based access control
 */

// Define route configurations with role permissions
export const ROUTE_CONFIG = {
  // User routes
  '/': { roles: ['user'], exactMatch: true, redirectTo: (role) => getDefaultRouteForRole(role) },
  '/user': { roles: ['user'], exactMatch: false },

  // Admin routes
  '/admin': { roles: ['admin'], exactMatch: false },

  // Inspector routes
  '/inspectionist': { roles: ['inspector'], exactMatch: false },
  '/inspector': { roles: ['inspector'], exactMatch: false },

  // Shared routes (authenticated users)
  '/profile': { roles: ['user', 'admin', 'inspector'], exactMatch: true },

  // Public routes (no auth required)
  '/login': { roles: [], exactMatch: true, public: true },
  '/signup': { roles: [], exactMatch: true, public: true },
  '/register': { roles: [], exactMatch: true, public: true },
  '/forgot-password': { roles: [], exactMatch: true, public: true },
};

/**
 * Gets the appropriate route an authenticated user should be redirected to
 * @param {string} currentPath - Current route user is trying to access
 * @param {string} role - User role
 * @returns {string|null} - Redirect path or null if no redirect needed
 */
export const getRedirectPath = (currentPath, role) => {
  if (!role) return '/login';

  // If user is trying to access public route while authenticated
  const matchedRoute = Object.entries(ROUTE_CONFIG).find(([path, config]) => {
    if (config.public) {
      return (
        (config.exactMatch && currentPath === path) ||
        (!config.exactMatch && currentPath.startsWith(path))
      );
    }
    return false;
  });

  if (matchedRoute) {
    // Redirect authenticated users away from public routes
    return getDefaultRouteForRole(role);
  }

  // Check if user has access to current path
  const hasAccess = hasRouteAccess(currentPath, { role }, true);

  if (!hasAccess) {
    // Send to role-specific home if no access
    return getDefaultRouteForRole(role);
  }

  // Special case for root path - redirect to role-specific dashboard
  if (currentPath === '/' && getDefaultRouteForRole(role) !== '/') {
    return getDefaultRouteForRole(role);
  }

  // No redirect needed
  return null;
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
  const matchedPublicRoute = Object.entries(ROUTE_CONFIG).find(([route, config]) => {
    return (
      config.public &&
      ((config.exactMatch && pathname === route) ||
        (!config.exactMatch && pathname.startsWith(route)))
    );
  });

  if (matchedPublicRoute) {
    return true;
  }

  // If not authenticated, deny access to protected routes
  if (!isAuthenticated || !user || !user.role) {
    return false;
  }

  // Find matching route configuration
  for (const [route, config] of Object.entries(ROUTE_CONFIG)) {
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
    case 'admin':
      return '/admin';
    case 'inspector':
      return '/inspectionist';
    case 'user':
      return '/user';
    default:
      return '/login';
  }
};

/**
 * Determine if a path should be protected by authentication
 * @param {string} pathname - Current path
 * @returns {boolean} - Whether path requires authentication
 */
export const isProtectedRoute = (pathname) => {
  // Check if path matches any public route
  for (const [route, config] of Object.entries(ROUTE_CONFIG)) {
    if (config.public) {
      const pathMatches = config.exactMatch ? pathname === route : pathname.startsWith(route);
      if (pathMatches) return false;
    }
  }

  // All non-public routes require authentication
  return true;
};
