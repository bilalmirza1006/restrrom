'use client';
import BuildingCard from '@/components/global/BuildingCard';
import { useGetAllBuildingsQuery } from '@/features/building/buildingApi';
import { useGetAllAssignBuildingQuery } from '@/features/inspection/inspectionApi';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';

const AllBuildings = () => {
  const { user } = useSelector(state => state.auth);

  // 🧠 Fetch only for relevant role
  const { data: assignData, isLoading: isLoadingAssign } = useGetAllAssignBuildingQuery(undefined, {
    skip: user?.role !== 'building_inspector',
  });

  const { data: allData, isLoading: isLoadingAll } = useGetAllBuildingsQuery(undefined, {
    skip: user?.role !== 'admin',
  });

  // 🧩 Choose correct dataset based on role
  const buildings = useMemo(() => {
    if (user?.role === 'building_inspector') {
      return assignData?.data || [];
    }
    if (user?.role === 'admin') {
      return allData?.data || [];
    }
    return [];
  }, [user, assignData, allData]);
  console.log('buildingsbuildingsbuildings', buildings);

  // 🚀 Route by role
  const getRouteByRole = (role, id) => {
    switch (role) {
      case 'admin':
        return `/admin/buildings/building-detail/${id}`;
      case 'building_inspector':
        return `/inspectionist/checkinlist/${id}`;
      default:
        return '';
    }
  };

  // 🕐 Handle loading state
  if (isLoadingAssign || isLoadingAll) return <p>Loading buildings...</p>;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base leading-[32px] font-semibold md:text-lg">
          {user?.role === 'admin' ? 'All Buildings' : 'Assigned Buildings'}
        </h4>

        {user?.role === 'admin' && (
          <Link href="/admin/add-building">
            <FaPlus className="text-2xl text-blue-500 hover:text-blue-600" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {buildings.length > 0 ? (
          buildings.map((building, i) => {
            const buildingId =
              user?.role === 'building_inspector' ? building?.buildingId?._id : building?._id;

            const route = getRouteByRole(user?.role, buildingId);

            return route ? (
              <Link href={route} key={i}>
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
