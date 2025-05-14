'use client';

import BuildingDetail from '@/components/user/buildings/BuildingDetail';
import { use } from 'react';

const BuildingDetailsPage = ({ params }) => {
  const { buildingId } = use(params); // ✅ unwrap the params Promise

  console.log('Building ID:', buildingId);

  return <BuildingDetail buildingId={buildingId} />;
};

export default BuildingDetailsPage;
