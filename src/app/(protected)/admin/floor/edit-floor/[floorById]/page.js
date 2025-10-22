'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import React from 'react';

function EditFloorById() {
  return <div>EditFloorById</div>;
}

// export default EditFloorById;
export default withPageGuard(EditFloorById, '/admin/floor/edit-floor/[floorById]');
