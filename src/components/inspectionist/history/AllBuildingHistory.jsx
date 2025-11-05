'use client';
import { useGetAllInspectionHistoryQuery } from '@/features/inspection/inspectionApi';
import Image from 'next/image';
import React, { useState } from 'react';
import { IoLocationSharp } from 'react-icons/io5';
import { useSelector } from 'react-redux';

function AllBuildingHistory() {
  const { user } = useSelector((state) => state.auth);
  console.log('Logged-in User:', user);

  const [restroom, setRestroom] = useState([]);
  const [showRestrooms, setShowRestrooms] = useState(false);

  // ✅ Properly determine query params based on role
  const queryParams =
    user?.user?.role === 'admin'
      ? { ownerId: user?.user?._id }
      : user?.user?.role === 'building_inspector'
      ? { inspectorId: user?.user?._id }
      : {};

  console.log('queryParams:', queryParams);

  // ✅ Call RTK Query correctly
  const { data, isLoading, isError } = useGetAllInspectionHistoryQuery(queryParams, {
    skip: !user?.user?._id, // prevents calling before user is loaded
  });

  console.log('Inspection History Data:', data);

  // ✅ Fix: wrap the function call inside an arrow function
  const showBuildingHistory = (room) => {
    setRestroom(room);
    setShowRestrooms(true);
  };
  console.log('restroom', restroom);
  console.log('showRestrooms', showRestrooms);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-5">
      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-base md:text-lg font-semibold leading-[32px]">Buildings</h4>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load inspection history.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {data?.data?.length > 0 ? (
            data.data.map((item, i) => (
              <div
                key={i}
                onClick={() => showBuildingHistory(item?.restroomInspections)} // ✅ FIXED
                className="cursor-pointer rounded-[20px] overflow-hidden"
              >
                <div>
                  {item?.building?.buildingThumbnail?.url && (
                    <Image
                      src={item?.building?.buildingThumbnail?.url}
                      width={400}
                      height={200}
                      className="w-full h-[200px] object-cover"
                      alt="building image"
                    />
                  )}
                </div>
                <div className="p-4 md:p-6 rounded-b-[20px] rounded-t-[30px] relative top-[-25px] bg-[#F7F7F7]">
                  <div className="flex justify-between w-full items-center flex-wrap">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-1">
                        <IoLocationSharp />
                        <p className="text-xs sm:text-base text-[#111111] font-[400]">
                          {item?.building?.location}
                        </p>
                      </div>
                      <h2 className="text-sm sm:text-xl mt-1 text-[#111111] font-[500]">
                        {item?.building?.name}
                      </h2>
                    </div>

                    <div
                      className={`${
                        item?.building?.type === 'Commercial'
                          ? 'bg-secondary'
                          : item?.building?.type === 'Private'
                          ? 'bg-red-600'
                          : item?.building?.type === 'Public'
                          ? 'bg-yellow-600'
                          : ''
                      } w-fit px-4 py-2 capitalize text-white text-sm rounded-[11px]`}
                    >
                      {item?.building?.type}
                    </div>
                  </div>

                  <div className="grid gid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="box p-2 flex flex-col gap-2 items-center bg-[#E8E2FF] rounded-[7px]">
                      <p className="text-lg md:text-2xl font-semibold text-primary">
                        {item?.building?.totalFloors}
                      </p>
                      <p className="text-xs md:text-sm text-[#11111199]">Number Of Floors</p>
                    </div>
                    <div className="box p-2 flex flex-col gap-2 items-center bg-[#E8E2FF] rounded-[7px]">
                      <p className="text-lg md:text-2xl font-semibold text-primary">
                        {item?.building?.numberOfRooms}
                      </p>
                      <p className="text-xs md:text-sm text-[#11111199]">Number Of Restrooms</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No inspection history found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AllBuildingHistory;
