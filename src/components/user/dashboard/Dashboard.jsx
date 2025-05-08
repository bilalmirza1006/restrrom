"use client";
import dynamic from "next/dynamic";
import Alerts from "./Alerts";
import DashboardCard from "./DashboardCard";
import {
  buildingData,
  dashboardCardsData,
  lineChartData,
  pieChartData,
} from "@/data/data";
import CustomLineChart from "@/components/global/charts/CustomLineChart";
import { BuildingIcon } from "@/assets/icon";
import Link from "next/link";
import BuildingCard from "@/components/global/BuildingCard";
const PieChartComponent = dynamic(
  () => import("@/components/global/charts/PieChartComponent"),
  { ssr: false }
);
const Map = dynamic(() => import("./Map"), { ssr: false });

const Dashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {dashboardCardsData.map((card, i) => (
          <DashboardCard card={card} key={i} />
        ))}
      </div>
      <section className=" grid grid-cols-1 lg:grid-cols-12  gap-4 ">
        <div className="xl:col-span-8">
          <Map />
        </div>
        <div className="xl:col-span-4">
          <Alerts />
        </div>
        <div className="xl:col-span-8 rounded-2xl bg-white p-4 md:p-5 shadow-md">
          <h6 className="text-base md:text-xl font-semibold text-black mb-5">
            Overall Performance
          </h6>
          <CustomLineChart data={lineChartData} xaxis yaxis />
        </div>
        <div className="xl:col-span-4 rounded-2xl bg-white p-4 md:p-5 shadow-md flex flex-col justify-around">
          <h6 className="text-base md:text-xl font-medium text-black mb-5 flex items-center gap-1">
            <BuildingIcon isLinkActive />
            Top Buildings
          </h6>
          <PieChartComponent
            data={pieChartData}
            COLORS={["#FF955A", "#7A5AF8", "#34C1FD"]}
            icon="/images/dashboard/building.png"
          />
        </div>
        <div className="xl:col-span-12 rounded-2xl bg-white p-4 md:p-5 shadow-md">
          <div className="mb-4 flex justify-between items-center">
            <h4 className="text-base md:text-lg font-semibold text-[#05004E]">
              All Buildings
            </h4>
            <Link
              href="/buildings"
              className="text-[#05004E99] text-sm font-medium"
            >
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
      </section>
    </>
  );
};

export default Dashboard;
