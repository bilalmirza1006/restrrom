'use client';

import Loader from '@/components/global/Loader';
import { useSelector } from 'react-redux';
import AdminAside from '@/components/admin/layout/AdminAside';
import AdminHeader from '@/components/admin/layout/AdminHeader';

const SuperAdmin = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Only show the layout if the user is authenticated and has the correct role
  if (!isAuthenticated || !user || user.role !== 'super_admin') return <Loader />;

  return (
    <section className="grid h-screen w-screen place-items-center overflow-hidden bg-[#F5F2FF]">
      <section className="flex h-[calc(100vh-16px)] w-[calc(100vw-16px)] gap-4">
        <AdminAside />
        <div className="flex-1">
          <AdminHeader />
          <main className="scroll-0 h-[calc(100vh-197px)] overflow-x-hidden overflow-y-scroll rounded-lg pt-4">
            {children}
          </main>
        </div>
      </section>
    </section>
  );
};

export default SuperAdmin;
