'use client';
import Modal from '@/components/global/Modal';
import Button from '@/components/global/small/Button';
import ToggleButton from '@/components/global/small/ToggleButton';
import { historyTableStyles, tableStyles } from '@/data/data';
import {
  useDeleteSensorMutation,
  useGetAllSensorsQuery,
  useUpdateSensorMutation,
} from '@/features/sensor/sensorApi';
import Link from 'next/link';
import { useState } from 'react';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';
import { AiOutlineDelete } from 'react-icons/ai';
import { CiEdit } from 'react-icons/ci';
import { HiOutlineEye } from 'react-icons/hi2';
import { IoIosAddCircle } from 'react-icons/io';
// import AddSensor from './AddSensor';
// import EditSensor from './EditSensor';
import Spinner from '@/components/global/small/Spinner';
import Image from 'next/image';
import CircularProgressBar from './CircularProgressBar';
import ActiveSensors from './ActiveSensors';
const data = [
  {
    inspection: 'Daily Sanitation',
    inspectionImage: '/images/dashboard/building-icon.png',
    building: 'Block B',
    buildingImage: '/images/dashboard/building-icon.png',
    restRoom: 'RR-02',
    restRoomImage: '/images/dashboard/building-icon.png',
    officer: 'Alice Smith',
    officerImage: '/images/dashboard/building-icon.png',
    reason: 'Health Check',
    reasonImage: '/images/dashboard/building-icon.png',
    activity: 'Disinfected',
    activityImage: '/images/dashboard/building-icon.png',
    progress: 85,
  },
  {
    inspection: 'Monthly Maintenance',
    inspectionImage: '/images/dashboard/building-icon.png',
    building: 'Block C',
    buildingImage: '/images/dashboard/building-icon.png',
    restRoom: 'RR-03',
    restRoomImage: '/images/dashboard/building-icon.png',
    officer: 'Mark Johnson',
    officerImage: '/images/dashboard/building-icon.png',
    reason: 'Scheduled Maintenance',
    reasonImage: '/images/dashboard/building-icon.png',
    activity: 'Plumbing Check',
    activityImage: '/images/dashboard/building-icon.png',
    progress: 45,
  },
  {
    inspection: 'Quarterly Review',
    inspectionImage: '/images/dashboard/building-icon.png',
    building: 'Block D',
    buildingImage: '/images/dashboard/building-icon.png',
    restRoom: 'RR-04',
    restRoomImage: '/images/dashboard/building-icon.png',
    officer: 'Linda Brown',
    officerImage: '/images/dashboard/building-icon.png',
    reason: 'Inspection',
    reasonImage: '/images/dashboard/building-icon.png',
    activity: 'Report Submitted',
    activityImage: '/images/dashboard/building-icon.png',
    progress: 100,
  },
  {
    inspection: 'Emergency Cleanup',
    inspectionImage: '/images/dashboard/building-icon.png',
    building: 'Block E',
    buildingImage: '/images/dashboard/building-icon.png',
    restRoom: 'RR-05',
    restRoomImage: '/images/dashboard/building-icon.png',
    officer: 'Carlos Diaz',
    officerImage: '/images/dashboard/building-icon.png',
    reason: 'Spill Detected',
    reasonImage: '/images/dashboard/building-icon.png',
    activity: 'Cleaned & Sanitized',
    activityImage: '/images/dashboard/building-icon.png',
    progress: 65,
  },
  {
    inspection: 'Weekly Check',
    inspectionImage: '/images/dashboard/building-icon.png',
    building: 'Block F',
    buildingImage: '/images/dashboard/building-icon.png',
    restRoom: 'RR-06',
    restRoomImage: '/images/dashboard/building-icon.png',
    officer: 'Emma Wilson',
    officerImage: '/images/dashboard/building-icon.png',
    reason: 'Routine',
    reasonImage: '/images/dashboard/building-icon.png',
    activity: 'Restocked Supplies',
    activityImage: '/images/dashboard/building-icon.png',
    progress: 50,
  },
];

const AllHistory = () => {
  const [modalType, setModalType] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const { isLoading } = useGetAllSensorsQuery();
  const [updateSensor] = useUpdateSensorMutation();
  const [deleteSensor, { isLoading: deleteLoading }] = useDeleteSensorMutation();
  const modalOpenHandler = (type, sensor = null) => {
    setModalType(type);
    setSelectedSensor(sensor);
  };
  const modalCloseHandler = (type) => setModalType('');

  const deleteSensorHandler = async (sensorId) => {
    try {
      const res = await deleteSensor(sensorId).unwrap();
      toast.success(res.message || 'Sensor deleted successfully');

      modalCloseHandler();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      console.error('Error deleting sensor:', error);
      modalCloseHandler();
    }
  };
  const handleStatusHandler = async (sensor) => {
    const updatedStatus = !sensor.status;
    try {
      const res = await updateSensor({
        sensorId: sensor._id,
        data: { status: updatedStatus },
      }).unwrap();
      toast.success(res.message || 'Sensor status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      console.error('Error updating sensor status:', error);
    }
  };
  const data1 = [
    { name: 'Queuing', value: 80, color: '#FF6B6B' },
    { name: 'Flow Count', value: 70, color: '#00CFFF' },
    { name: 'Stall Occupancy', value: 60, color: '#00C49F' },
    { name: 'Toilet Paper', value: 50, color: '#A78BFA' },
    { name: 'Water Leakage', value: 40, color: '#FACC15' },
  ];

  return (
    <section className="bg-white p-4 md:p-5 rounded-[10px]">
      <div className="flex justify-between items-center">
        <h4 className="text-base md:text-xl font-semibold text-[#05004E]">All Sensors</h4>
      </div>
      <ActiveSensors data={data1} title={'hall'} />
      <div className="mt-6">
        {isLoading ? (
          <Spinner />
        ) : (
          <DataTable
            data={data}
            columns={tableColumns(handleStatusHandler, modalOpenHandler)}
            customStyles={historyTableStyles}
            pagination
            fixedHeader
            fixedHeaderScrollHeight="60vh"
            // selectableRows
          />
        )}
      </div>
    </section>
  );
};

export default AllHistory;

const tableColumns = () => [
  {
    name: 'Inspection',
    selector: (row) => row?.inspection,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Image
          src={row?.inspectionImage}
          alt="inspection"
          width={30}
          height={30}
          className="w-8 h-8 rounded-full"
        />
        <span>{row?.inspection}</span>
      </div>
    ),
  },
  {
    name: 'Building',
    selector: (row) => row?.building,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Image
          src={row?.buildingImage}
          alt="building"
          width={30}
          height={30}
          className="w-8 h-8 rounded-full"
        />
        <span>{row?.building}</span>
      </div>
    ),
  },
  {
    name: 'Rest Room',
    selector: (row) => row?.restRoom,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Image
          src={row?.restRoomImage}
          alt="restroom"
          width={30}
          height={30}
          className="w-8 h-8 rounded-full"
        />
        <span>{row?.restRoom}</span>
      </div>
    ),
  },
  {
    name: 'Inspection Officer',
    selector: (row) => row?.officer,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Image
          src={row?.officerImage}
          alt="officer"
          width={30}
          height={30}
          className="w-8 h-8 rounded-full"
        />
        <span>{row?.officer}</span>
      </div>
    ),
  },
  {
    name: 'Reason',
    selector: (row) => row?.reason,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Image
          src={row?.reasonImage}
          alt="reason"
          width={30}
          height={30}
          className="w-8 h-8 rounded-full"
        />
        <span>{row?.reason}</span>
      </div>
    ),
  },
  {
    name: 'Activity',
    selector: (row) => row?.activity,
    cell: (row) => (
      <div className="flex justify-between items-center  w-full">
        <CircularProgressBar percentage={row?.progress || 0} />
        <div className="cursor-pointer">
          <HiOutlineEye fontSize={20} />
        </div>
      </div>
    ),
  },
];
