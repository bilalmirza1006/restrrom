import React from 'react';

function FloorDetail({ params }) {
  const { floorById } = params;
  const [buildingId, floorId] = floorById.split('--');

  console.log('Building ID:', buildingId);
  console.log('Floor ID:', floorId);
  return <div>FloorDetail</div>;
}

export default FloorDetail;
