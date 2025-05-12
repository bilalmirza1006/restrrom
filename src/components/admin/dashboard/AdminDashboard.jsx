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
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {dashboardCardsData.map((card, i) => (
          <DashboardCard card={card} key={i} />
        ))}
      </div>
      <div className="col-span-12 lg:col-span-8 rounded-2xl bg-white p-4 md:p-5 shadow-md">
        <div className="flex justify-between">
          <h6 className="text-base md:text-xl font-semibold text-black mb-5">
            Buildings Performance
          </h6>
          <div className="">
            <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
          </div>
        </div>
        <CustomLineChart data={lineChartData} xaxis yaxis />
      </div>
      <div className="col-span-12 lg:col-span-4 rounded-2xl bg-white p-4 md:p-5 shadow-md flex flex-col justify-around">
        <h6 className="text-base md:text-xl font-medium text-black mb-5 flex items-center gap-1">
          <BuildingIcon isLinkActive />
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
      <div className="bg-white rounded-[12px] h-fit col-span-12 lg:col-span-8">
        <div className="pt-5 px-5 flex items-center justify-between mb-4">
          <div>
            <div className="cursor-pointer text-[12px] flex gap-2 text-[#A449EB] border-[#A449EB] h-fit w-fit justify-between items-center">
              <span>Building 1</span>
              <FaSortDown className="relative top-[-3px]" />
            </div>
            <h6 className="text-lg md:text-2xl font-semibold  text-black">Restrooms Activity</h6>
          </div>
          <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
        </div>
        <FloorActivityChart />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <MostUsedRooms />
      </div>
      <div className="col-span-12 mt-3 rounded-2xl bg-white p-4 md:p-5 shadow-md">
        <div className="mb-4 flex justify-between items-center">
          <h4 className="text-base md:text-lg font-semibold text-[#05004E]">All Buildings</h4>
          <Link href="/buildings" className="text-[#05004E99] text-sm font-medium">
            See All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
