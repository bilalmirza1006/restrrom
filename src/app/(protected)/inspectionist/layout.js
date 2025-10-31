'use client';

import Loader from '@/components/global/Loader';
import InspectionsHeader from '@/components/inspectionist/layout/InspectionsHeader';
import { useSelector } from 'react-redux';
import InspectionsAside from '@/components/inspectionist/layout/InspectionsAside';

const Inspector = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Only show the layout if the user is authenticated and has the correct role
  if (!isAuthenticated || !user || user.role !== 'building_inspector') return <Loader />;

  return (
    <section className="bg-[#F5F2FF] w-screen h-screen grid place-items-center overflow-hidden">
      <section className="h-[calc(100vh-16px)] w-[calc(100vw-16px)] flex gap-4">
        <InspectionsAside />
        <div className="flex-1">
          <InspectionsHeader />
          <main className="h-[calc(100vh-197px)] overflow-y-scroll overflow-x-hidden scroll-0 pt-4 rounded-lg">
            {children}
          </main>
        </div>
      </section>
    </section>
  );
};

export default Inspector;
