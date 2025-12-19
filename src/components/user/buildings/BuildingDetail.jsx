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
import {
  useGetAllInspectorsQuery,
  useAssignBuildingToInspectorMutation,
  useUnAssignBuildingToInspectorMutation,
} from '@/features/inspection/inspectionApi';
import ShowCanvasData from './ShowCanvasData';
import Button from '@/components/global/small/Button';
import Dropdown from '@/components/global/small/Dropdown';
import Skeleton from 'react-loading-skeleton';
// import { toast } from 'react-toastify';

const FloorActivityChart = dynamic(() => import('./FloorActivityChart'), {
  ssr: false,
  loading: () => <Skeleton height={300} />,
});

const BuildingDetail = ({ building }) => {
  const router = useRouter();
  const [inspectorModel, setInspectorModel] = useState(false);
  const { data: inspectorsData, isLoading: inspectorsLoading } = useGetAllInspectorsQuery();
  const [assignBuilding, { isLoading: isAssigning }] = useAssignBuildingToInspectorMutation();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { data: restroom } = useGetAllRestroomsQuery(building?._id);
  const AddFloorHandle = () => router.push(`/admin/floor/add-floor/${building?._id}`);
  const editBuildingHandle = () => router.push(`/admin/buildings/edit-building/${building?._id}`);
  const [polygons, setPolygons] = useState([]);
  const [image, setImage] = useState('');
  const [range, setRange] = useState('day');
  console.log('range', range);

  const options = [
    { option: 'Day', value: 'day' },
    { option: 'This Week', value: 'week' },
    { option: 'This Month', value: 'month' },
  ];
  console.log('buildingbuilding', building);
  console.log('inspectors data', inspectorsData?.data);

  useEffect(() => {
    if (building) {
      setImage(building?.buildingModelImage?.url || '');
      setPolygons(building?.buildingCoordinates || []);
    }
  }, [building]);

  const handleAssignInspector = async inspectorId => {
    try {
      const assignmentData = {
        inspectorId: inspectorId,
        buildingId: building?._id,
      };

      const result = await assignBuilding(assignmentData).unwrap();

      toast.success(`Inspector ${inspectorName} assigned successfully!`);
      setInspectorModel(false);
    } catch (error) {
      console.error('Failed to assign inspector:', error);
      toast.error(error?.data?.message || 'Failed to assign inspector');
    }
  };

  return (
    <div>
      {user?.role === 'admin' && (
        <div className="my-2 flex justify-end gap-4">
          <button
            onClick={() => setInspectorModel(true)}
            title="Assign Inspector"
            className="flex items-center rounded-lg bg-orange-100 px-4 py-2 text-gray-800 shadow hover:bg-orange-200"
          >
            <MdAdd size={20} />
            <span className="ml-2">Assign Inspector</span>
          </button>
          <button
            onClick={AddFloorHandle}
            title="Add New Floor"
            className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-800 shadow hover:bg-gray-200"
          >
            <MdAdd size={20} />
            <span className="ml-2">Add</span>
          </button>
          <button
            onClick={editBuildingHandle}
            title="Edit Building"
            className="flex items-center rounded-lg bg-blue-100 px-4 py-2 text-blue-800 shadow hover:bg-blue-200"
          >
            <MdEdit size={20} />
            <span className="ml-2">Edit</span>
          </button>

          <button
            title="Delete Building"
            className="flex items-center rounded-lg bg-red-100 px-4 py-2 text-red-800 shadow hover:bg-red-200"
          >
            <MdDelete size={20} />
            <span className="ml-2">Delete</span>
          </button>
        </div>
      )}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex items-center justify-center rounded-lg bg-white p-4 md:p-5 lg:col-span-8">
          {building?.buildingModelImage?.url && (
            <ShowCanvasData image={image} polygons={polygons} />
          )}
        </div>
        <div className="lg:col-span-4">
          <QueueingStatus building={building} />
        </div>
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-4">
            <BuildingCard
              title="Total Toilets"
              borderColor="border-[#078E9B]"
              hoverColor="hover:bg-[#078E9B15]"
              count={building?.totalToilets || 0}
              icon="/svgs/user/green-step.svg"
            />
            <BuildingCard
              title="Total Restrooms"
              borderColor="border-[#A449EB]"
              hoverColor="hover:bg-[#A449EB15]"
              count={building?.numberOfRooms || 0}
              icon="/svgs/user/purple-restroom.svg"
            />
            <BuildingCard
              title="Restrooms In Use"
              borderColor="border-[#FF9500]"
              hoverColor="hover:bg-[#FF950015]"
              count={building?.queuingStats?.totalOccupied || 0}
              icon="/svgs/user/yellow-toilet.svg"
            />
            <BuildingCard
              title="Total Sensors"
              borderColor="border-[#FF4D85]"
              hoverColor="hover:bg-[#FF4D8515]"
              count={building?.totalSensors || 0}
              icon="/svgs/user/pink-buzzer.svg"
            />
          </div>
          <div className="mt-5 rounded-xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-semibold">Water leakage activity</h1>
              <Dropdown
                options={options}
                defaultText="day"
                initialValue="day"
                width="180px"
                onSelect={value => setRange(value)}
              />
            </div>

            <FloorActivityChart range={range} sensorData={building?.sensorData} />
          </div>
        </div>

        <div className="lg:col-span-4">
          <MostUsedRooms mostUsedRestroom={building?.mostUsedRestroom} />
        </div>
        <div className="rounded-xl bg-white p-5 lg:col-span-12">
          <h6 className="mb-6 text-lg font-semibold text-black md:text-2xl">All Floors</h6>
          <div className="flex flex-col gap-5">
            {restroom?.data?.restRooms?.map((item, i) => (
              <FloorList key={i} data={item} buildingId={building?._id} />
            ))}
          </div>
        </div>
      </section>

      {/* Inspector Assignment Modal */}
      {inspectorModel && (
        <Modal
          title="Assign Inspector"
          isOpen={inspectorModel}
          onClose={() => setInspectorModel(false)}
        >
          <div className="max-h-[600px] w-full overflow-y-auto p-5 md:min-w-[500px]">
            {inspectorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : inspectorsData?.data?.length > 0 ? (
              <div className="grid gap-4">
                {inspectorsData.data.map(inspector => (
                  <InspectorCard
                    key={inspector._id}
                    data={inspector}
                    onAssign={handleAssignInspector}
                    isAssigning={isAssigning}
                    buildingId={building?._id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">No inspectors available</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// InspectorCard remains unchanged, only make sure toast is imported
const InspectorCard = ({ data, onAssign, buildingId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [unAssignBuilding] = useUnAssignBuildingToInspectorMutation();
  const isAlreadyAssigned = data?.assignedBuildings?.includes(buildingId);

  const handleAssignClick = async () => {
    if (!buildingId) {
      toast.error('Building ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      await onAssign(data._id); // this triggers assign mutation
      toast.success('Building assigned successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to assign building');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignClick = async () => {
    if (!buildingId) {
      toast.error('Building ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      await unAssignBuilding({ inspectorId: data._id, buildingId }).unwrap();
      toast.success('Building unassigned successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to unassign building');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-semibold text-white">
                {data?.fullName?.charAt(0) || 'I'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {data?.fullName || 'Unknown Inspector'}
              </h3>
              {/* <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    data?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : data?.status === 'busy'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {data?.status || 'Unknown'}
                </span>
                {data?.experience && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {data.experience}+ years
                  </span>
                )}
              </div> */}
              <div className="space-y-1">
                {/* <p className="text-xs text-gray-500">Email</p> */}
                <p className="truncate text-sm font-medium text-gray-900">{data?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Assigned Buildings</p>
            <p className="text-sm font-medium text-gray-900">
              {data?.assignedBuildings?.length || 0}
            </p>
          </div>
          {/* Assign / Unassign Button */}
          <div>
            <Button
              onClick={isAlreadyAssigned ? handleUnassignClick : handleAssignClick}
              disabled={isLoading}
              className={`min-w-[100px] rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-100 text-gray-500'
                  : isAlreadyAssigned
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              text={isLoading ? 'Please wait...' : isAlreadyAssigned ? 'Unassign' : 'Assign'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingDetail;
