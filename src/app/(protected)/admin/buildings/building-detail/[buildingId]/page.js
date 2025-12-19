'use client';

import withPageGuard from '@/components/auth/withPageGuard';
import BuildingDetail from '@/components/user/buildings/BuildingDetail';
import { useGetBuildingQuery } from '@/features/building/buildingApi';
import { use } from 'react';

const BuildingDetailsPage = ({ params }) => {
  const { buildingId } = use(params);
  const { data, isLoading, isError } = useGetBuildingQuery(buildingId);

  if (isLoading) {
    return <p>Loading building details...</p>; // Show loading state
  }

  if (isError) {
    return <p>Error loading building details.</p>; // Show error state
  }

  return <BuildingDetail building={data?.data} />;
};

export default withPageGuard(BuildingDetailsPage, '/admin/buildings/building-detail/[buildingId]');
