import Image from "next/image";
import React from "react";

const BuildingCard = ({ data }) => {
  return (
    <div
      className={`p-5 border-t-[10px] transition-all duration-200 bg-white rounded-xl grow ${data.borderColor} ${data.hoverColor}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h4 className="font-[500] leading-[24px] text-[16px]">
            {data.title}
          </h4>
          <h2 className="font-[500] leading-[45px] text-[30px] text-[#131215]">
            {data.count}
          </h2>
        </div>
        <div>
          <Image src={data?.icon} width={40} height={40} alt="icon" />
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;
