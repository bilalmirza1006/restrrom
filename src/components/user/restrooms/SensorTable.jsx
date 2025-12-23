'use client';
import React from 'react';
import DataTable from 'react-data-table-component';
import { tableStyles } from '@/data/data';
import Link from 'next/link';
import { HiOutlineEye } from 'react-icons/hi2';
import { useSelector } from 'react-redux';
import { useUpdateSensorMutation } from '@/features/sensor/sensorApi';
import ToggleButton from '@/components/global/small/ToggleButton';
import toast from 'react-hot-toast';
// import { toast } from 'react-toastify';

const tableColumns = (handleStatusHandler, user, getSensorRoute) => [
  {
    name: 'Sensor Name',
    selector: row => row?.name,
  },

  {
    name: 'Unique Id',
    selector: row => row?.uniqueId,
  },
  {
    name: 'Is Connected',
    cell: row => (
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${row?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span className={`font-semibold ${row?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {row?.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    ),
  },
  {
    name: 'Status',
    cell: row => (
      <div>
        <ToggleButton
          role={user?.role}
          isChecked={row.status === 'Activated'}
          onToggle={() => handleStatusHandler(row)}
        />
      </div>
    ),
  },
  {
    name: 'Action',
    cell: row => (
      <Link href={getSensorRoute(user?.role, row._id)}>
        <div className="cursor-pointer">
          <HiOutlineEye fontSize={20} />
        </div>
      </Link>
    ),
  },
];

function SensorTable({ data }) {
  const [updateSensor] = useUpdateSensorMutation();
  const { user } = useSelector(state => state.auth);

  const handleStatusHandler = async sensor => {
    try {
      const payload = {
        id: sensor._id,
        status: sensor.status === 'Activated' ? 'Deactivated' : 'Activated',
      };

      const res = await updateSensor(payload).unwrap();
      toast.success(res.message || 'Sensor status updated');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update status');
      console.error(error);
    }
  };

  const getSensorRoute = (role, id) => {
    switch (role) {
      case 'admin':
        return `/admin/sensors/sensor-details/${id}`;
      case 'super_admin':
        return `/super-admin/sensors/sensor-detail/${id}`;
      case 'building_inspector':
        return `/inspectionist/sensors/sensor-details/${id}`;
      default:
        return `/sensors/sensor-details/${id}`;
    }
  };

  return (
    <div>
      <DataTable
        data={data}
        columns={tableColumns(handleStatusHandler, user, getSensorRoute)}
        customStyles={tableStyles}
        pagination
        fixedHeader
        fixedHeaderScrollHeight="60vh"
        // selectableRows
      />
    </div>
  );
}

export default SensorTable;
