'use client';
import dynamic from 'next/dynamic';
import Alerts from './Alerts';
import DashboardCard from './DashboardCard';
import { buildingData, dashboardCardsData, pieChartData } from '@/data/data';
import { BuildingIcon } from '@/assets/icon';
import Link from 'next/link';
import BuildingCard from '@/components/global/BuildingCard';
import BuildingMap from './Map';
import { useSelector } from 'react-redux';
import {
  useGetDashboardQuery,
  useGetDashboardByPeriodQuery,
  useGetLatestBuildingPerformanceQuery,
} from '@/features/admin/adminApi';
import { useEffect, useState } from 'react';
import AdminCustomLineChart from './AdminCustomLineChart';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PieChartComponent = dynamic(() => import('@/components/global/charts/PieChartComponent'), {
  ssr: false,
});

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [period, setPeriod] = useState('day');
  const [showLatest, setShowLatest] = useState(false);

  // 🔹 First load: Full dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  // 🔹 Period-based performance (only when period changes)
  const {
    data: periodData,
    isFetching,
    isLoading: periodLoading,
  } = useGetDashboardByPeriodQuery(period, {
    skip: !period,
  });

  // 🔹 Latest buildings (only when requested)
  const { data: latestData, isLoading: latestLoading } = useGetLatestBuildingPerformanceQuery(
    undefined,
    {
      skip: !showLatest,
    }
  );
  console.log('dashboardDatadashboardData', dashboardData);

  // Decide which data to show in charts
  const overAllBuildingPerformance =
    periodData?.data?.overAllBuildingPerformance ||
    dashboardData?.data?.overAllBuildingPerformance ||
    [];

  const topBuildings = latestData?.data?.topBuildings || dashboardData?.data?.topBuildings || [];

  // Example location data (can come from API as well)
  const arraylocationData = [
    {
      buildingId: '69453eaf6f35df74d79d4d28',
      locationName: 'Lahore, Pakistan',
      latitude: 31.5204,
      longitude: 74.3587,
      buildingThumbnail:
        'https://res.cloudinary.com/hamzanafasat/image/upload/v1766146436/rest-room/building-thumbnails/mbaugvyhpxynccd2gnub.png',
    },
    {
      buildingId: '694cf2f9ae53a38016617939',
      locationName: 'Karachi, Pakistan',
      latitude: 24.8607,
      longitude: 67.0011,
      buildingThumbnail:
        'https://res.cloudinary.com/hamzanafasat/image/upload/v1766650617/rest-room/building-thumbnails/ijfqz0a4nxkuktaqrkq5.png',
    },
  ];
  console.log('arraylocationData', dashboardData?.data?.counts?.totalSubscriptions);
  const dashboardCardData = [
    {
      title: 'Total Buildings',
      value: dashboardData?.data?.counts?.totalBuildings || 125, // just the number, no {}
      icon: '/images/dashboard/total-buildings.png',
      percentageChange: "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
    },
    {
      title: 'Total Restrooms',
      value: dashboardData?.data?.counts?.totalRestrooms || 212,
      icon: '/images/dashboard/total-restroom.png', // removed {}
      percentageChange: "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
    },
    {
      title: 'Total Sensors',
      value: dashboardData?.data?.counts?.totalSensors || 223,
      icon: '/images/dashboard/total-sensors.png',
      percentageChange: "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
    },
    {
      title: 'Total Subscriptions',
      value: dashboardData?.data?.counts?.totalSubscriptions || 0,
      icon: '/images/dashboard/total-subscription.png',
      percentageChange: "<span class='text-[#00B69B]'>8.5%</span> Up from yesterday",
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Dashboard Cards */}
      <div className="col-span-12 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {(dashboardCardData || dashboardCardsData).map((card, i) => (
          <DashboardCard card={card} key={i} loading={dashboardLoading} />
        ))}
      </div>

      {/* Map */}
      <div className="col-span-12 rounded-2xl bg-white lg:col-span-8">
        <BuildingMap
          user={user}
          locationData={dashboardData?.data?.locationData}
          loading={dashboardLoading}
        />
      </div>

      {/* Alerts */}
      <div className="col-span-12 lg:col-span-4">
        <Alerts />
      </div>

      {/* Overall Performance Chart */}
      <div className="col-span-12 rounded-2xl bg-white p-4 shadow-md md:p-5 lg:col-span-8">
        <AdminCustomLineChart
          setPeriod={setPeriod}
          period={period}
          loading={periodLoading || isFetching}
          apiData={overAllBuildingPerformance}
        />
      </div>

      {/* Top Buildings Pie Chart */}
      <div className="col-span-12 flex flex-col justify-between rounded-2xl bg-white p-4 shadow-md md:p-5 lg:col-span-4">
        <div className="">
          <h6 className="mb-5 flex items-center gap-1 text-base font-medium text-black md:text-xl">
            <BuildingIcon isLinkActive />
            Top Buildings
          </h6>
        </div>
        <div className="mx-auto flex max-w-125 items-center justify-center">
          {dashboardLoading ? (
            <div className="mx-auto mt-4 flex flex-col items-center">
              {/* Skeleton Pie */}
              <Skeleton circle width={200} height={200} />
              {/* Skeleton Legend */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {(dashboardData?.data?.topBuildings?.length || 3) &&
                  Array.from({ length: dashboardData?.data?.topBuildings?.length || 3 }).map(
                    (_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Skeleton circle width={12} height={12} />
                        <Skeleton width={80} height={12} />
                      </div>
                    )
                  )}
              </div>
            </div>
          ) : (
            <PieChartComponent
              loading={true}
              data={dashboardData?.data?.topBuildings || pieChartData}
              COLORS={['#FF955A', '#7A5AF8', '#34C1FD']}
              icon="/images/dashboard/building.png"
            />
          )}
        </div>
      </div>

      {/* All Buildings */}
      <div className="col-span-12 rounded-2xl bg-white p-4 shadow-md md:p-5 xl:col-span-12">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-[#05004E] md:text-lg">All Buildings</h4>
          <Link href="/buildings" className="text-sm font-medium text-[#05004E99]">
            See All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {(dashboardData?.data?.buildings.slice(0, 3) || arraylocationData).map((building, i) => (
            <Link href={`/buildings/${building?.id}`} key={i}>
              <BuildingCard data={building} loading={dashboardLoading} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
