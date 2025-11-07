// src/app/unauthorized/page.js - UPDATED
'use client';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const router = useRouter();

  // Define accessible routes for each role
  const getAccessibleRoutes = role => {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
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

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-center text-gray-600">
          You don&apos;t have permission to access this page with your current role.
        </p>

        {/* Current Role Info */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">Your Current Role</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-700 capitalize">
              {userRole?.replace('_', ' ') || 'Unknown'}
            </span>
            <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-600">Current</span>
          </div>
        </div>

        {/* Accessible Routes */}
        {accessibleRoutes.length > 0 && (
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-900">Pages You Can Access</h3>
            <div className="space-y-2">
              {accessibleRoutes.map(route => (
                <Link
                  key={route}
                  href={route}
                  className="block rounded bg-green-100 p-2 transition duration-200 hover:bg-green-200"
                >
                  <span className="font-medium text-green-700 capitalize">
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
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition duration-200 hover:bg-blue-700"
          >
            Go Back
          </button>

          <Link
            href={accessibleRoutes[0] || '/'}
            className="block w-full rounded-md bg-gray-200 px-4 py-3 text-center font-medium text-gray-800 transition duration-200 hover:bg-gray-300"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Contact Admin */}
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-center text-sm text-yellow-800">
            Need different permissions? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
