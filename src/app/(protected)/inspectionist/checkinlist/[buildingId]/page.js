'use client';
import CheckInList from '@/components/inspectionist/checkinlist/CheckInList';
import React, { use } from 'react';

function CheckinlistMain({ params }) {
  const { buildingId } = use(params);
  return (
    <div className="bg-white w-[97vw] sm:w-full overflow-auto rounded-2xl py-4 px-4 border border-[#63636321] shadow-sm">
      <CheckInList buildingId={buildingId} />
    </div>
  );
}

export default CheckinlistMain;
