'use client';

import BuildingDetail from '@/components/user/buildings/BuildingDetail';

const BuildingDetailsPage = ({ params }) => {
  const { buildingId } = params;
  console.log('const { buildingId } = params;', buildingId);

  return <BuildingDetail buildingId={buildingId} />;
};

export default BuildingDetailsPage;
