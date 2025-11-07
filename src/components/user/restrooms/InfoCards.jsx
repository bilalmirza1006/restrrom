import Image from 'next/image';
import React from 'react';
function InfoCards({ title, borderColor, hoverColor, count, icon }) {
  return (
    <div
      className={`grow rounded-xl border-t-[10px] bg-white p-5 transition-all duration-200 ${borderColor} ${hoverColor}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-medium">{title}</h4>
          <h2 className="text-3xl font-medium">{count}</h2>
        </div>
        <div>
          <Image src={icon} width={40} height={40} alt="icon" />
        </div>
      </div>
    </div>
  );
}

export default InfoCards;
