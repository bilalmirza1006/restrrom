import { ArrowUpIcon } from "@/assets/icon";
import Image from "next/image";

const DashboardCard = ({ card }) => {
  return (
    <div className="bg-white rounded-[14px] p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h6 className="text-sm md:text-base font-medium text-[#202224c5]">
            {card.title}
          </h6>
          <p className="mt-4 text-xl md:text-[28px] font-semibold text-[#202224]">
            {card.value}
          </p>
        </div>
        <Image src={card.icon} width={60} height={60} alt="icon" />
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm md:text-base text-[#606060]">
        <ArrowUpIcon />
        <span dangerouslySetInnerHTML={{ __html: card.percentageChange }} />
      </p>
    </div>
  );
};

export default DashboardCard;
