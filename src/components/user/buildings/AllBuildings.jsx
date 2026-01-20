'use client';
import BuildingCard from '@/components/global/BuildingCard';
import { useGetAllBuildingsQuery } from '@/features/building/buildingApi';
import { useGetAllAssignBuildingQuery } from '@/features/inspection/inspectionApi';
import { useGetAllAdminBuildingsQuery } from '@/features/superAdmin/superAdminApi';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeletonCard = () => (
  <div className="lp-4 rounded-xl">
    <Skeleton height={150} className="mb-4" />
    <Skeleton height={20} width={`80%`} className="mb-2" />
    <Skeleton height={20} width={`60%`} />
  </div>
);

const AllBuildings = () => {
  const { user } = useSelector(state => state.auth);

  const { data: assignData, isLoading: isLoadingAssign } = useGetAllAssignBuildingQuery(undefined, {
    skip: user?.role !== 'building_inspector',
  });

  const { data: allData, isLoading: isLoadingAll } = useGetAllBuildingsQuery(undefined, {
    skip: user?.role !== 'admin' && user?.role !== 'building_manager',
  });
  console.log('allDataallData', allData);
  const { data: allAdminBuildings, isLoading: loadingAllAdminBuildings } =
    useGetAllAdminBuildingsQuery(undefined, {
      skip: user?.role !== 'super_admin',
    });

  const buildings = useMemo(() => {
    if (user?.role === 'building_inspector') return assignData?.data || [];
    if (['admin', 'building_manager'].includes(user?.role)) {
      return allData?.data || [];
    }
    if (user?.role === 'super_admin') return allAdminBuildings?.data || [];
    return [];
  }, [user, assignData, allData, allAdminBuildings]);
  console.log('buildingsbuildingsbuildings', buildings);

  const getRouteByRole = (role, buildingId) => {
    console.log('Navigating to building ID:', buildingId, role);

    switch (role) {
      case 'admin':
      case 'building_manager':
        console.log('Role is admin or building_manager');
        return `/admin/buildings/building-detail/${buildingId}`;

      case 'building_inspector':
        console.log('Role is building_inspector');
        return `/inspectionist/checkinlist/${buildingId}`;

      case 'super_admin':
        console.log('Role is super_admin');
        return `/super-admin/buildings/building-details/${buildingId}`;

      default:
        console.log('Role is unknown:', role);
        return '';
    }
  };

  const isLoading = isLoadingAssign || isLoadingAll || loadingAllAdminBuildings;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base leading-8 font-semibold md:text-lg">
          {user?.role === 'admin' ? 'All Buildings' : 'Assigned Buildings'}
        </h4>

        {['admin', 'building_manager'].includes(user?.role) && (
          <Link href="/admin/add-building">
            <FaPlus className="text-2xl text-blue-500 hover:text-blue-600" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <LoadingSkeletonCard key={i} />)
        ) : buildings.length > 0 ? (
          buildings.map((building, i) => {
            const buildingId =
              user?.role === 'building_inspector' ? building?.buildingId?._id : building?._id;

            const route = getRouteByRole(user?.role, buildingId);
            console.log('Route:', route);
            return route ? (
              <Link href={route} key={i} className="cursor-pointer">
                <BuildingCard data={building?.buildingId || building} />
              </Link>
            ) : (
              <BuildingCard data={building} key={i} />
            );
          })
        ) : (
          <p>No buildings found.</p>
        )}
      </div>
    </div>
  );
};

export default AllBuildings;
