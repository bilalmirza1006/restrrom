'use client';
import { useGetAllInspectionHistoryQuery } from '@/features/inspection/inspectionApi';
import Image from 'next/image';
import React, { useState } from 'react';
import { IoLocationSharp } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import CheckInCard from '../checkinlist/CheckInCard';
import HistoryCard from './HistoryCard';
import Button from '@/components/global/small/Button';

function AllBuildingHistory() {
  const { user } = useSelector(state => state.auth);
  console.log('Logged-in User:', user);

  const [restroom, setRestroom] = useState([]);
  const [showRestrooms, setShowRestrooms] = useState(false);

  // ✅ Determine query params based on user role
  const queryParams =
    user?.user?.role === 'admin'
      ? { ownerId: user?.user?._id }
      : user?.user?.role === 'building_inspector'
        ? { inspectorId: user?.user?._id }
        : {};

  console.log('queryParams:', queryParams);

  // ✅ Call RTK Query
  const { data, isLoading, isError } = useGetAllInspectionHistoryQuery(queryParams, {
    skip: !user?.user?._id, // prevents API call before user is loaded
  });

  console.log('Inspection History Data:', data);

  const showBuildingHistory = room => {
    setRestroom(room);
    setShowRestrooms(true);
  };

  console.log('restroom:', restroom);
  console.log('showRestrooms:', showRestrooms);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base leading-[32px] font-semibold md:text-lg">Buildings</h4>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load inspection history.</p>
      ) : showRestrooms ? ( // ✅ Correct conditional rendering
        <div>
          <div className="flex items-center justify-between">
            <h4 className="mb-4 text-lg font-semibold">Restroom Inspections</h4>
            <div>
              <Button
                text="Back"
                onClick={() => {
                  setRestroom(null);
                  setShowRestrooms(false);
                }}
                className={'w-full'}
              />
            </div>
          </div>

          <div>
            <div className="w-[720px] overflow-auto sm:w-full">
              <HistoryCard restroom={restroom} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {data?.data?.length > 0 ? (
            data.data.map((item, i) => (
              <div
                key={i}
                onClick={() => showBuildingHistory(item)}
                className="cursor-pointer overflow-hidden rounded-[20px]"
              >
                <div>
                  {item?.building?.buildingThumbnail?.url && (
                    <Image
                      src={item?.building?.buildingThumbnail?.url}
                      width={400}
                      height={200}
                      className="h-[200px] w-full object-cover"
                      alt="building image"
                    />
                  )}
                </div>

                <div className="relative top-[-25px] rounded-t-[30px] rounded-b-[20px] bg-[#F7F7F7] p-4 md:p-6">
                  <div className="flex w-full flex-wrap items-center justify-between">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-1">
                        <IoLocationSharp />
                        <p className="text-xs font-[400] text-[#111111] sm:text-base">
                          {item?.building?.location}
                        </p>
                      </div>
                      <h2 className="mt-1 text-sm font-[500] text-[#111111] sm:text-xl">
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
                      } w-fit rounded-[11px] px-4 py-2 text-sm text-white capitalize`}
                    >
                      {item?.building?.type}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="box flex flex-col items-center gap-2 rounded-[7px] bg-[#E8E2FF] p-2">
                      <p className="text-primary text-lg font-semibold md:text-2xl">
                        {item?.building?.totalFloors}
                      </p>
                      <p className="text-xs text-[#11111199] md:text-sm">Number Of Floors</p>
                    </div>
                    <div className="box flex flex-col items-center gap-2 rounded-[7px] bg-[#E8E2FF] p-2">
                      <p className="text-primary text-lg font-semibold md:text-2xl">
                        {item?.building?.numberOfRooms}
                      </p>
                      <p className="text-xs text-[#11111199] md:text-sm">Number Of Restrooms</p>
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
