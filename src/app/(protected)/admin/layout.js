// app/(protected)/admin/layout.js - UPDATED
'use client';
import Aside from '@/components/user/layout/Aside';
import Header from '@/components/user/layout/Header';
import { useSelector } from 'react-redux';
import Loader from '@/components/global/Loader';

const Admins = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Normalize role names
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
  console.log('admin layout - user role:', userRole);

  // Define which roles can access the admin layout - UPDATED to match routingUtils.js
  const allowedRoles = ['admin', 'report_manager', 'subscription_manager', 'building_manager'];

  // Show loader if not authenticated or user doesn't have the correct role
  if (!isAuthenticated || !user || !allowedRoles.includes(userRole)) {
    console.log('❌ AdminLayout: Access denied - user role:', userRole);
    return <Loader />;
  }

  console.log('✅ AdminLayout: Access granted for role:', userRole);
  return (
    <section className="bg-[#F5F2FF] w-screen h-screen grid place-items-center overflow-hidden">
      <section className="h-[calc(100vh-16px)] w-[calc(100vw-16px)] flex gap-4">
        <Aside />
        <div className="flex-1">
          <Header />
          <main className="h-[calc(100vh-197px)] overflow-y-scroll overflow-x-hidden scroll-0 pt-4 rounded-lg">
            {children}
          </main>
        </div>
      </section>
    </section>
  );
};

export default Admins;
