'use client';
import CheckInList from '@/components/inspectionist/checkinlist/CheckInList';
import React, { use } from 'react';

function CheckinlistMain({ params }) {
  const { buildingId } = use(params);
  return (
    <div className="w-[97vw] overflow-auto rounded-2xl border border-[#63636321] bg-white px-4 py-4 shadow-sm sm:w-full">
      <CheckInList buildingId={buildingId} />
    </div>
  );
}

export default CheckinlistMain;
