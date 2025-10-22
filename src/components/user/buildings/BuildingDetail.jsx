'use client';
import CustomDropdown from '@/components/global/CustomDropdown';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import { useSelector } from 'react-redux';
import BuildingCard from './BuildingCard';
import FloorList from './FloorList';
import MostUsedRooms from './MostUsedRooms';
import QueueingStatus from './QueueingStatus';
import { useEffect, useState } from 'react';
import Modal from '@/components/global/Modal';
import { useGetAllInspectorsQuery } from '@/features/inspection/inspectionApi';
import ShowCanvasData from './ShowCanvasData';
const FloorActivityChart = dynamic(() => import('./FloorActivityChart'), { ssr: false });

const BuildingDetail = ({ building }) => {
  const router = useRouter();
  const [inspectorModel, setInspectorModel] = useState(false);
  const { data } = useGetAllInspectorsQuery();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data: restroom } = useGetAllRestroomsQuery(building?._id);
  const AddFloorHandle = () => router.push(`/admin/floor/add-floor/${building?._id}`);
  const editBuildingHandle = () => router.push(`/admin/buildings/edit-building/${building?._id}`);
  const [polygons, setPolygons] = useState([]);
  const [image, setImage] = useState('');
  console.log('building', building);
  console.log('data', data);
  useEffect(() => {
    if (building) {
      setImage(building?.buildingModelImage?.url || '');
      setPolygons(building?.buildingCoordinates || []);
    }
  }, [building]);

  useEffect(() => {
    console.log('Updated polygons:', polygons);
  }, [polygons]);

  useEffect(() => {
    console.log('Updated image:', image);
  }, [image]);

  return (
    <div className="">
      {user?.role === 'admin' && (
        <div className="flex gap-4 justify-end my-2">
          <button
            onClick={() => setInspectorModel(true)}
            title="Assign Inspector"
            className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg shadow text-gray-800"
          >
            <MdAdd size={20} />
            <span className="ml-2">Assign Inspector</span>
          </button>
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
        {/* <div className="lg:col-span-8 bg-white rounded-lg p-4 md:p-5">Building Details</div> */}
        <div className="lg:col-span-8 flex items-center justify-center bg-white rounded-lg p-4 md:p-5 ">
          {building?.buildingModelImage?.url && (
            // <Image
            //   src={building.buildingThumbnail.url}
            //   height={400}
            //   width={400}
            //   className="w-full h-[400px] object-contain"
            //   alt="Building Thumbnail"
            // />

            <ShowCanvasData image={image} polygons={polygons} />
          )}
        </div>
        <div className="lg:col-span-4">
          <QueueingStatus building={building} />
        </div>
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-4">
            <BuildingCard
              title={'Total Floors'}
              borderColor={'border-[#078E9B]'}
              hoverColor={'hover:bg-[#078E9B15]'}
              count={building?.totalFloors}
              icon={'/svgs/user/green-step.svg'}
            />
            <BuildingCard
              title={'Total Restrooms'}
              borderColor={'border-[#A449EB]'}
              hoverColor={'hover:bg-[#A449EB15]'}
              count={building?.numberOfRooms}
              icon={'/svgs/user/purple-restroom.svg'}
            />
            <BuildingCard
              title={'Restrooms In Use'}
              borderColor={'border-[#FF9500]'}
              hoverColor={'hover:bg-[#FF950015]'}
              count={building?.totalFloors}
              icon={'/svgs/user/yellow-toilet.svg'}
            />
            <BuildingCard
              title={'Total Sensors'}
              borderColor={'border-[#FF4D85]'}
              hoverColor={'hover:bg-[#FF4D8515]'}
              count={building?.totalFloors}
              icon={'/svgs/user/pink-buzzer.svg'}
            />
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
            {restroom?.data?.map((item, i) => (
              <FloorList key={i} data={item} buildingId={building?._id} />
            ))}
          </div>
        </div>
      </section>
      {inspectorModel && (
        <Modal
          title={'Add Inspector'}
          isOpen={inspectorModel}
          onClose={() => setInspectorModel(false)}
        >
          <div className="w-full md:min-w-[500px] p-5">
            {data?.data?.map((item, i) => (
              <InspectorCard key={i} data={item} />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

const InspectorCard = ({ data }) => {
  return (
    <div className="flex items-center gap-3 border-2 ">
      <div className="h-[200px]">
        <div className="bg-red-500 text-green-500">{data?.fullName}</div>;
      </div>
      ;
    </div>
  );
};

export default BuildingDetail;
