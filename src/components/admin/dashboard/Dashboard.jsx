import CustomLineChart from '@/components/global/charts/CustomLineChart';
import UsersEngagment from "@/components/admin/dashboard/User'sEngagment";
import RestRoomPerformance from '@/components/admin/dashboard/RestRoomPerformance';
import ActiveSensors from '@/components/admin/dashboard/ActiveSensors';
import { buildingData, dashboardCardsData, lineChartData, pieChartData } from '@/data/data';
import BuildingCard from '@/components/global/BuildingCard';
import { BuildingIcon } from '@/assets/icon';
import PieChartComponent from '@/components/global/charts/PieChartComponent';
import FloorActivityChart from '@/components/user/buildings/FloorActivityChart';
import MostUsedRooms from '@/components/user/buildings/MostUsedRooms';
import DashboardCard from '@/components/user/dashboard/DashboardCard';
import Link from 'next/link';

const Dashboard = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {dashboardCardsData.map((card, i) => (
          <DashboardCard card={card} key={i} />
        ))}
      </div>
      <div className="mt-3 flex flex-col lg:flex-row lg:gap-0 gap-3 justify-between">
        <div className="basis-[100%] lg:basis-[67%] rounded-2xl bg-white p-4 md:p-5 shadow-md">
          <h6 className="text-base md:text-xl font-semibold text-black mb-5">
            Buildings Performance
          </h6>
          <CustomLineChart data={lineChartData} xaxis yaxis />
        </div>
        <div className="basis-[100%] lg:basis-[32%] rounded-2xl bg-white p-4 md:p-5 shadow-md flex flex-col justify-around">
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
      </div>
      <div className="flex flex-col lg:flex-row mt-3 gap-4 justify-between">
        <UsersEngagment />
        <RestRoomPerformance />
        <ActiveSensors />
      </div>
      <div className="flex flex-col gap-2 lg:gap-0 lg:flex-row mt-3 justify-between">
        <div>
          <FloorActivityChart />
        </div>
        <div className="lg:w-[30%]">
          <MostUsedRooms />
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-4 md:p-5 shadow-md">
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
