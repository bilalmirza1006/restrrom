'use client';

import { useEffect } from 'react';
import BuildingDetail from '@/components/user/buildings/BuildingDetail';
import { useGetBuildingQuery } from '@/features/building/buildingApi';
import { use } from 'react';

const BuildingDetailsPage = ({ params }) => {
  const { buildingId } = use(params); // ✅ unwrap params Promise

  const { data, isLoading, isError } = useGetBuildingQuery(buildingId);

  // ✅ Run when data changes
  useEffect(() => {
    if (data) {
      console.log('Building data changed:', data);
    }
  }, [data]); // 🔥 triggers whenever `data` updates

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong while fetching building details.</p>;

  return <BuildingDetail building={data?.data} />;
};

export default BuildingDetailsPage;
