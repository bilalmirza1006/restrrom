import BuildingCard from "@/components/global/BuildingCard";
import { buildingData } from "@/data/data";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

const AllBuildings = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-5">
      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-base md:text-lg font-semibold leading-[32px]">
          All Buildings
        </h4>
        <Link href="/add-building">
          <FaPlus className="text-blue-500 hover:text-blue-600 text-2xl" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {buildingData.map((building, i) => (
          <Link href={`/buildings/${building?.id}`} key={i}>
            <BuildingCard data={building} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllBuildings;
