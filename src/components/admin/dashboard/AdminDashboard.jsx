import CustomLineChart from '@/components/global/charts/CustomLineChart';
import UsersEngagment from "@/components/admin/dashboard/User'sEngagment";
import RestRoomPerformance from '@/components/admin/dashboard/RestRoomPerformance';
import ActiveSensors from '@/components/admin/dashboard/ActiveSensors';
import { buildingData, dashboardCardsData, lineChartData, pieChartData } from '@/data/data';
import BuildingCard from '@/components/global/BuildingCard';
import { BuildingIcon } from '@/assets/icon';
import { FaSortDown } from 'react-icons/fa';
import PieChartComponent from '@/components/global/charts/PieChartComponent';
import FloorActivityChart from '@/components/user/buildings/FloorActivityChart';
import MostUsedRooms from '@/components/user/buildings/MostUsedRooms';
import DashboardCard from '@/components/user/dashboard/DashboardCard';
import Link from 'next/link';
import CustomDropdown from '@/components/global/CustomDropdown';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCardsData.map((card, i) => (
          <DashboardCard card={card} key={i} />
        ))}
      </div>
      <div className="col-span-12 rounded-2xl bg-white p-4 shadow-md md:p-5 lg:col-span-8">
        <div className="flex justify-between">
          <h6 className="mb-5 text-base font-semibold text-black md:text-xl">
            Buildings Performance
          </h6>
          <div className="">
            <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
          </div>
        </div>
        <CustomLineChart data={lineChartData} xaxis yaxis />
      </div>
      <div className="col-span-12 flex flex-col justify-around rounded-2xl bg-white p-4 shadow-md md:p-5 lg:col-span-4">
        <h6 className="mb-5 flex items-center gap-1 text-base font-medium text-black md:text-xl">
          <BuildingIcon />
          Top Buildings
        </h6>
        <PieChartComponent
          data={pieChartData}
          COLORS={['#FF955A', '#7A5AF8', '#34C1FD']}
          icon="/images/dashboard/building.png"
        />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <UsersEngagment />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <RestRoomPerformance />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <ActiveSensors />
      </div>
      <div className="col-span-12 h-fit rounded-[12px] bg-white lg:col-span-8">
        <div className="mb-4 flex items-center justify-between px-5 pt-5">
          <div>
            <div className="flex h-fit w-fit cursor-pointer items-center justify-between gap-2 border-[#A449EB] text-[12px] text-[#A449EB]">
              <span>Building 1</span>
              <FaSortDown className="relative top-[-3px]" />
            </div>
            <h6 className="text-lg font-semibold text-black md:text-2xl">Restrooms Activity</h6>
          </div>
          <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
        </div>
        <FloorActivityChart />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <MostUsedRooms />
      </div>
      <div className="col-span-12 mt-3 rounded-2xl bg-white p-4 shadow-md md:p-5">
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
