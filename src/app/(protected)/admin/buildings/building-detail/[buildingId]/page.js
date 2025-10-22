'use client';

import withPageGuard from '@/components/auth/withPageGuard';
import BuildingDetail from '@/components/user/buildings/BuildingDetail';
import { useGetBuildingQuery } from '@/features/building/buildingApi';
import { use } from 'react';

const BuildingDetailsPage = ({ params }) => {
  const { buildingId } = use(params);
  const { data } = useGetBuildingQuery(buildingId);
  return <BuildingDetail building={data?.data} />;
};

// export default BuildingDetailsPage;
export default withPageGuard(BuildingDetailsPage, '/admin/buildings/building-detail/[buildingId]');
