// src/app/unauthorized/page.js - UPDATED
'use client';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  // Define accessible routes for each role
  const getAccessibleRoutes = (role) => {
    const routes = {
      super_admin: ['/super-admin', '/admin', '/inspectionist'],
      admin: ['/admin'],
      subscription_manager: ['/admin'],
      building_manager: ['/admin'],
      report_manager: ['/admin'],
      building_inspector: ['/inspectionist'],
    };
    return routes[role] || ['/'];
  };

  const userRole = user?.role;
  const accessibleRoutes = userRole ? getAccessibleRoutes(userRole) : [];

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-9V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v2m6 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v2m6 0h2a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1h2"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Access Denied</h1>
        <p className="text-gray-600 mb-6 text-center">
          You don't have permission to access this page with your current role.
        </p>

        {/* Current Role Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Your Current Role</h3>
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium capitalize">
              {userRole?.replace('_', ' ') || 'Unknown'}
            </span>
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">Current</span>
          </div>
        </div>

        {/* Accessible Routes */}
        {accessibleRoutes.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Pages You Can Access</h3>
            <div className="space-y-2">
              {accessibleRoutes.map((route) => (
                <Link
                  key={route}
                  href={route}
                  className="block p-2 bg-green-100 rounded hover:bg-green-200 transition duration-200"
                >
                  <span className="text-green-700 font-medium capitalize">
                    {route === '/' ? 'Home' : route.replace('/', '').replace('-', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Go Back
          </button>

          <Link
            href={accessibleRoutes[0] || '/'}
            className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition duration-200 text-center font-medium"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Contact Admin */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 text-center">
            Need different permissions? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
