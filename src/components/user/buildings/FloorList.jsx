'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';

const FloorList = ({ data, buildingId }) => {
  const { user } = useSelector(state => state.auth);
  const userRole = user?.role;

  const getRouteByRole = (role, buildingId, floorId) => {
    switch (role) {
      case 'admin':
        return `/admin/floor/floor-detail/${floorId}`;
      case 'super_admin':
        return `/super-admin/floor/floor-detail/${floorId}`;
      default:
        return ''; // Unknown or unauthorized role
    }
  };

  const route = getRouteByRole(userRole, buildingId, data?._id);

  return (
    <div className="grid grid-cols-1 gap-5 rounded-xl p-4 shadow-md lg:grid-cols-6 xl:gap-10">
      {data?.modelImage?.[0]?.url && (
        <Image
          src={data?.modelImage?.[0]?.url}
          width={248}
          height={150}
          alt="Floor image"
          className="size-full h-[150px] rounded-xl border border-[#414141] object-cover sm:w-[250px]"
        />
      )}
      <div>
        <h5 className="text-base font-bold text-black md:text-xl">{data?.name}</h5>
        <div className="flex items-center gap-1">
          <Image src="/svgs/user/basement.svg" width={18} height={18} alt="icon" />
          <p className="text-sm font-semibold text-[#414141]">Basement Floor</p>
        </div>
        <List
          icon="/svgs/user/total-restrooms.svg"
          title="Total Toilets"
          value={data?.numOfToilets}
        />
      </div>

      <List icon="/svgs/user/occupied.svg" title="Occupied Restrooms" value={1} />
      <List icon="/svgs/user/toilet.svg" title="Free Restrooms" value={1} />
      <List icon="/svgs/user/sensors.svg" title="Active Sensors" value={data?.sensors?.length} />

      <div className="mt-4 flex items-center justify-center md:mt-6">
        {route ? (
          <Link
            href={route}
            className="text-primary rounded-lg bg-[#EED8FF] px-5 py-2 text-sm font-bold underline"
          >
            View Details
          </Link>
        ) : (
          <span className="text-sm text-gray-400">No access to view</span>
        )}
      </div>
    </div>
  );
};

export default FloorList;

const List = ({ icon, title, value }) => (
  <div className="mt-4 flex items-center gap-2 md:mt-6">
    <Image src={icon} width={26} height={26} alt="icon" />
    <div>
      <h6 className="text-base font-bold text-[#292D32]">{title}</h6>
      <p className="text-base font-medium text-[#000000CC]">{value}</p>
    </div>
  </div>
);
