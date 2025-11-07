import Image from 'next/image';
import React from 'react';

const BuildingCard = ({ title, borderColor, hoverColor, count, icon }) => {
  return (
    <div
      className={`grow rounded-xl border-t-[10px] bg-white p-5 transition-all duration-200 ${borderColor} ${hoverColor}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h4 className="text-[16px] leading-[24px] font-[500]">{title}</h4>
          <h2 className="text-[30px] leading-[45px] font-[500] text-[#131215]">{count}</h2>
        </div>
        <div>
          <Image src={icon} width={40} height={40} alt="icon" />
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;
