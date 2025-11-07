'use client';

import Loader from '@/components/global/Loader';
import InspectionsHeader from '@/components/inspectionist/layout/InspectionsHeader';
import { useSelector } from 'react-redux';
import InspectionsAside from '@/components/inspectionist/layout/InspectionsAside';

const Inspector = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Only show the layout if the user is authenticated and has the correct role
  if (!isAuthenticated || !user || user.role !== 'building_inspector') return <Loader />;

  return (
    <section className="grid h-screen w-screen place-items-center overflow-hidden bg-[#F5F2FF]">
      <section className="flex h-[calc(100vh-16px)] w-[calc(100vw-16px)] gap-4">
        <InspectionsAside />
        <div className="flex-1">
          <InspectionsHeader />
          <main className="scroll-0 h-[calc(100vh-197px)] overflow-x-hidden overflow-y-scroll rounded-lg pt-4">
            {children}
          </main>
        </div>
      </section>
    </section>
  );
};

export default Inspector;
