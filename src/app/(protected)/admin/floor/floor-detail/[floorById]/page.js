'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import RestRoomDetails from '@/components/user/restrooms/RestRoomDetails';
import React from 'react';

function FloorDetail({ params }) {
  const { floorById } = params;
  const [buildingId, floorId] = floorById.split('--');

  console.log('Building ID:', buildingId);
  console.log('Floor ID:', floorId);
  return (
    <div>
      <RestRoomDetails restRoom={[]} />
    </div>
  );
}

// export default FloorDetail;
export default withPageGuard(FloorDetail, '/admin/floor/floor-detail/[floorById]');
