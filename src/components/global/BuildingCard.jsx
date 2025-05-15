/* eslint-disable react/prop-types */
import Image from "next/image";
import { IoLocationSharp } from "react-icons/io5";

const BuildingCard = ({ data }) => {
  const getButtonColor = (type) => {
    switch (type?.toLowerCase()) {
      case "public":
        return "bg-green-500";
      case "private":
        return "bg-red-500";
      case "commercial":
        return "bg-yellow-800";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className=" rounded-[20px] overflow-hidden">
      <div>
        {data?.buildingThumbnail?.url && (
          <Image
            src={data?.buildingThumbnail?.url}
            width={400}
            height={200}
            className="w-full h-[200px] object-cover"
            alt="building image"
          />
        )}
      </div>
      <div className="p-4 md:p-6 rounded-b-[20px]  rounded-t-[30px] relative top-[-25px] bg-[#F7F7F7]">
        <div className="flex justify-between w-full items-center flex-wrap">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1">
              <IoLocationSharp />
              <p className="text-xs sm:text-base text-[#111111] font-[400]">{data?.location}</p>
            </div>
            <h2 className="text-sm sm:text-xl mt-1 text-[#111111] font-[500]">{data?.name}</h2>
          </div>

          <div
            className={`${
              data?.type == "Commercial"
                ? "bg-secondary"
                : data?.type === "Private"
                ? "bg-red-600"
                : data?.type === "Public"
                ? "bg-yellow-600"
                : ""
            }  w-fit px-4 py-2 capitalize text-white text-sm rounded-[11px]`}
          >
            {data?.type}
          </div>
        </div>

        <div className="grid gid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="box p-2 flex flex-col gap-2 items-center bg-[#E8E2FF] rounded-[7px]">
            <p className="text-lg md:text-2xl font-semibold  text-primary">{data?.totalFloors}</p>
            <p className="text-xs md:text-sm text-[#11111199]">Number Of Floors</p>
          </div>
          <div className="box p-2 flex flex-col gap-2 items-center bg-[#E8E2FF] rounded-[7px]">
            <p className="text-lg md:text-2xl font-semibold  text-primary">{data?.numberOfRooms}</p>
            <p className="text-xs md:text-sm text-[#11111199]">Number Of Restrooms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;
