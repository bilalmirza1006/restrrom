'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import RestRoomDetails from '@/components/user/restrooms/RestRoomDetails';
import { useGetRestroomQuery } from '@/features/restroom/restroomApi';
import React, { use } from 'react';

function FloorDetail({ params }) {
  const { floorById } = use(params);
  // const [buildingId, floorId] = floorById.split('--');

  console.log('Building ID:', floorById);
  // console.log('Floor ID:', floorId);

  const { data: restroom, isLoading, isError, error } = useGetRestroomQuery(floorById);

  console.log('Restroom Data:', restroom);

  if (isLoading) {
    return <p>Loading restrooms...</p>; // Loading indicator
  }

  if (isError) {
    return (
      <p>Error loading restrooms: {error?.data?.message || error?.error || 'Unknown error'}</p>
    ); // Error message
  }

  if (!restroom || restroom.length === 0) {
    return <p>No restroom data available.</p>; // Null or empty check
  }

  return (
    <div>
      <RestRoomDetails restRoom={restroom} />
    </div>
  );
}

export default withPageGuard(FloorDetail, '/admin/floor/floor-detail/[floorById]');
