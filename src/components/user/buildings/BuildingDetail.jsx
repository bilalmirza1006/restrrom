'use client';
import { floorListData, infoCardsData } from '@/data/data';
import BuildingCard from './BuildingCard';
import QueueingStatus from './QueueingStatus';
const FloorActivityChart = dynamic(() => import('./FloorActivityChart'), {
  ssr: false,
});
import dynamic from 'next/dynamic';
import MostUsedRooms from './MostUsedRooms';
import FloorList from './FloorList';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import CustomDropdown from '@/components/global/CustomDropdown';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const BuildingDetail = ({ buildingId }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  console.log('user', user.role);

  const AddFloorHandle = () => {
    router.push('/floor/add-floor');
  };
  const editBuildingHandle = () => {
    router.push(`/buildings/edit-building/${buildingId}`);
  };

  return (
    <div className="">
      {user.role === 'user' && (
        <div className="flex gap-4 justify-end my-2">
          <button
            onClick={AddFloorHandle}
            title="Add New Floor"
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow text-gray-800"
          >
            <MdAdd size={20} />
            <span className="ml-2">Add</span>
          </button>
          <button
            onClick={editBuildingHandle}
            title="Edit Building"
            className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg shadow text-blue-800"
          >
            <MdEdit size={20} />
            <span className="ml-2">Edit</span>
          </button>

          <button
            title="Delete Building"
            className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg shadow text-red-800"
          >
            <MdDelete size={20} />
            <span className="ml-2">Delete</span>
          </button>
        </div>
      )}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 ">
        <div className="lg:col-span-8 bg-white rounded-lg p-4 md:p-5">Building Details</div>
        <div className="lg:col-span-4">
          <QueueingStatus />
        </div>
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-4">
            {infoCardsData.map((item, i) => (
              <BuildingCard data={item} key={i} />
            ))}
          </div>

          <div className="mt-5 bg-white p-5 rounded-xl">
            <div className="flex justify-between">
              <h1 className="text-[24px] font-semibold">Floors Activity</h1>
              <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
            </div>
            <FloorActivityChart />
          </div>
        </div>
        <div className="lg:col-span-4">
          <MostUsedRooms />
        </div>
        <div className="lg:col-span-12 bg-white p-5 rounded-xl">
          <h6 className="text-lg md:text-2xl font-semibold text-black mb-6">All Floors</h6>
          <div className="flex flex-col gap-5">
            {floorListData.map((item, i) => (
              <FloorList key={i} data={item} buildingId={buildingId} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuildingDetail;
