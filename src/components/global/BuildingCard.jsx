/* eslint-disable react/prop-types */
import Image from 'next/image';
import { IoLocationSharp } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BuildingCard = ({ data, loading = false }) => {
  const getButtonColor = type => {
    switch (type?.toLowerCase()) {
      case 'public':
        return 'bg-green-500';
      case 'private':
        return 'bg-red-500';
      case 'commercial':
        return 'bg-yellow-800';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    // Skeleton version
    return (
      <div className="overflow-hidden rounded-[20px] bg-gray-100">
        <div className="relative">
          <Skeleton height={200} width="100%" />
        </div>
        <div className="relative -top-6.25 rounded-t-[30px] rounded-b-[20px] bg-[#F7F7F7] p-4 md:p-6">
          <div className="flex w-full flex-wrap items-center justify-between">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1">
                <Skeleton width={80} height={12} />
              </div>
              <Skeleton width={120} height={20} />
            </div>
            <Skeleton width={60} height={24} className="rounded" />
          </div>

          <div className="gid-cols-1 mt-4 grid gap-4 lg:grid-cols-2">
            <div className="box flex flex-col items-center gap-2 rounded-[7px] bg-[#E8E2FF] p-2">
              <Skeleton width={40} height={24} />
              <Skeleton width={80} height={12} />
            </div>
            <div className="box flex flex-col items-center gap-2 rounded-[7px] bg-[#E8E2FF] p-2">
              <Skeleton width={40} height={24} />
              <Skeleton width={80} height={12} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal rendering
  return (
    <div className="overflow-hidden rounded-[20px]">
      <div>
        {data?.buildingThumbnail?.url && (
          <Image
            src={data?.buildingThumbnail?.url}
            width={400}
            height={200}
            className="h-50 w-full object-cover"
            alt="building image"
          />
        )}
      </div>
      <div className="relative -top-6.25 rounded-t-[30px] rounded-b-[20px] bg-[#F7F7F7] p-4 md:p-6">
        <div className="flex w-full flex-wrap items-center justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1">
              <IoLocationSharp />
              <p className="text-xs font-normal text-[#111111] sm:text-base">{data?.location}</p>
            </div>
            <h2 className="mt-1 text-sm font-medium text-[#111111] sm:text-xl">{data?.name}</h2>
          </div>

          <div
            className={`${getButtonColor(data?.type)} w-fit rounded-xl px-4 py-2 text-sm text-white capitalize`}
          >
            {data?.type}
          </div>
        </div>

        <div className="gid-cols-1 mt-4 grid gap-4 lg:grid-cols-2">
          <div className="box flex flex-col items-center gap-2 rounded-[7px] bg-[#E8E2FF] p-2">
            <p className="text-primary text-lg font-semibold md:text-2xl">{data?.totalFloors}</p>
            <p className="text-xs text-[#11111199] md:text-sm">Number Of Floors</p>
          </div>
          <div className="box flex flex-col items-center gap-2 rounded-[7px] bg-[#E8E2FF] p-2">
            <p className="text-primary text-lg font-semibold md:text-2xl">{data?.numberOfRooms}</p>
            <p className="text-xs text-[#11111199] md:text-sm">Number Of Restrooms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;
