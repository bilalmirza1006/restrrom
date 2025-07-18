"use client";
import BuildingCard from "@/components/global/BuildingCard";
import { buildingData } from "@/data/data";
import { useGetAllBuildingsQuery } from "@/features/building/buildingApi";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";

const AllBuildings = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data } = useGetAllBuildingsQuery();
  const getRouteByRole = (role, id) => {
    switch (role) {
      case "admin":
        return `/admin/buildings/building-details/${id}`;
      case "user":
        return `/user/buildings/building-detail/${id}`;
      case "inspector":
        return `/inspectionist/checkinlist/${id}`;
      default:
        return ``;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-5">
      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-base md:text-lg font-semibold leading-[32px]">
          All Buildings
        </h4>
        {user?.role === "user" && (
          <Link href="/user/add-building">
            <FaPlus className="text-blue-500 hover:text-blue-600 text-2xl" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {data?.data?.map((building, i) => {
          const route = getRouteByRole(user?.role, building?._id);
          console.log("route", route);
          return route ? (
            <Link href={route} key={i}>
              <BuildingCard data={building} />
            </Link>
          ) : (
            <BuildingCard data={building} key={i} />
          );
        })}
      </div>
    </div>
  );
};

export default AllBuildings;
