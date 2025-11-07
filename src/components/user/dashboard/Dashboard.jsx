'use client';
import dynamic from 'next/dynamic';
import Alerts from './Alerts';
import DashboardCard from './DashboardCard';
import { buildingData, dashboardCardsData, lineChartData, pieChartData } from '@/data/data';
import CustomLineChart from '@/components/global/charts/CustomLineChart';
import { BuildingIcon } from '@/assets/icon';
import { FaSortDown } from 'react-icons/fa';
import Link from 'next/link';
import CustomDropdown from '@/components/global/CustomDropdown';
import BuildingCard from '@/components/global/BuildingCard';
const PieChartComponent = dynamic(() => import('@/components/global/charts/PieChartComponent'), {
  ssr: false,
});
const Map = dynamic(() => import('./Map'), { ssr: false });

const Dashboard = () => {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCardsData.map((card, i) => (
          <DashboardCard card={card} key={i} />
        ))}
      </div>
      <div className="col-span-12 lg:col-span-8">
        <Map location={'lahore'} name={'Dream house'} status={'free'} />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <Alerts />
      </div>
      <div className="col-span-12 rounded-2xl bg-white p-4 shadow-md md:p-5 lg:col-span-8">
        <div className="flex justify-between">
          <h6 className="mb-5 text-base font-semibold text-black md:text-xl">
            Overall Performance
          </h6>
          <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
        </div>
        <CustomLineChart data={lineChartData} xaxis yaxis />
      </div>
      <div className="col-span-12 flex flex-col justify-around rounded-2xl bg-white p-4 shadow-md md:p-5 lg:col-span-4">
        <h6 className="mb-5 flex items-center gap-1 text-base font-medium text-black md:text-xl">
          <BuildingIcon isLinkActive />
          Top Buildings
        </h6>
        <PieChartComponent
          data={pieChartData}
          COLORS={['#FF955A', '#7A5AF8', '#34C1FD']}
          icon="/images/dashboard/building.png"
        />
      </div>
      <div className="col-span-12 rounded-2xl bg-white p-4 shadow-md md:p-5 xl:col-span-12">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-[#05004E] md:text-lg">All Buildings</h4>
          <Link href="/buildings" className="text-sm font-medium text-[#05004E99]">
            See All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {buildingData.slice(0, 3).map((building, i) => (
            <Link href={`/buildings/${building?.id}`} key={i}>
              <BuildingCard data={building} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
