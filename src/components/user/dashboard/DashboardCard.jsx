import { ArrowUpIcon } from '@/assets/icon';
import Image from 'next/image';

const DashboardCard = ({ card }) => {
  return (
    <div className="rounded-[14px] bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h6 className="text-sm font-medium text-[#202224c5] md:text-base">{card.title}</h6>
          <p className="mt-4 text-xl font-semibold text-[#202224] md:text-[28px]">{card.value}</p>
        </div>
        <Image src={card.icon} width={60} height={60} alt="icon" />
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-[#606060] md:text-base">
        <ArrowUpIcon />
        <span dangerouslySetInnerHTML={{ __html: card.percentageChange }} />
      </p>
    </div>
  );
};

export default DashboardCard;
