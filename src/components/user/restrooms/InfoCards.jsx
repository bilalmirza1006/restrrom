import Image from 'next/image';
import React from 'react';
function InfoCards({ title, borderColor, hoverColor, count, icon }) {
  return (
    <div
      className={`p-5 border-t-[10px] transition-all duration-200 bg-white rounded-xl grow ${borderColor} ${hoverColor}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-medium">{title}</h4>
          <h2 className="font-medium text-3xl">{count}</h2>
        </div>
        <div>
          <Image src={icon} width={40} height={40} alt="icon" />
        </div>
      </div>
    </div>
  );
}

export default InfoCards;
