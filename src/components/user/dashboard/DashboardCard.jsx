import { ArrowUpIcon } from '@/assets/icon';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DashboardCard = ({ card, loading = false }) => {
  if (loading) {
    // Render skeleton placeholders
    return (
      <div className="rounded-[14px] bg-white p-4 md:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton width={120} height={18} /> {/* title */}
            <div className="mt-4">
              <Skeleton width={80} height={28} /> {/* value */}
            </div>
          </div>
          <Skeleton circle width={60} height={60} /> {/* icon */}
        </div>
        <div className="mt-5 flex items-center gap-2">
          <Skeleton width={100} height={16} /> {/* percentage */}
        </div>
      </div>
    );
  }

  // Normal card rendering
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
