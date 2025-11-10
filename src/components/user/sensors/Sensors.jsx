'use client';
import Modal from '@/components/global/Modal';
import Button from '@/components/global/small/Button';
import ToggleButton from '@/components/global/small/ToggleButton';
import { tableStyles } from '@/data/data';
import {
  useDeleteSensorMutation,
  useGetAllSensorsQuery,
  useUpdateSensorMutation,
} from '@/features/sensor/sensorApi';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';
import { AiOutlineDelete } from 'react-icons/ai';
import { CiEdit } from 'react-icons/ci';
import { HiOutlineEye } from 'react-icons/hi2';
import { IoIosAddCircle } from 'react-icons/io';
import AddSensor from './AddSensor';
import EditSensor from './EditSensor';
import Spinner from '@/components/global/small/Spinner';
import { useGetAllAdminSensorsQuery } from '@/features/superAdmin/superAdminApi';
import { useSelector } from 'react-redux';

const PARAMETER_LABELS = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  co: 'Co',
  co2: 'Co2',
  ch: 'Ch',
  tvoc: 'Tvoc',
};

const Sensors = () => {
  const { user } = useSelector(state => state.auth);

  const [modalType, setModalType] = useState('');
  const [selectedSensor, setSelectedSensor] = useState(null);

  const { data: adminSensors, isLoading } = useGetAllSensorsQuery({
    skip: user?.role !== 'admin',
  });
  const { data: getAllSensors, isLoading: loading } = useGetAllAdminSensorsQuery({
    skip: user?.role !== 'super_admin',
  });

  const [updateSensor] = useUpdateSensorMutation();
  const [deleteSensor, { isLoading: deleteLoading }] = useDeleteSensorMutation();

  // ✅ Dynamic sensors based on user role
  const sensors = useMemo(() => {
    if (user?.role === 'admin') return adminSensors?.data || [];
    if (user?.role === 'super_admin') return getAllSensors?.data || [];
    return [];
  }, [user, adminSensors, getAllSensors]);

  // ✅ Modal control
  const modalOpenHandler = (type, sensor = null) => {
    setModalType(type);
    setSelectedSensor(sensor);
  };

  const modalCloseHandler = () => setModalType('');

  // ✅ Delete handler
  const deleteSensorHandler = async sensorId => {
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

  // ✅ Status toggle
  const handleStatusHandler = async sensor => {
    try {
      const payload = {
        id: sensor._id,
        name: sensor.name,
        uniqueId: sensor.uniqueId,
        status: !sensor.status,
        parameters: sensor.parameters.map(p =>
          typeof p === 'string' ? p.toLowerCase() : p.value.toLowerCase()
        ),
      };

      const res = await updateSensor(payload).unwrap();
      toast.success(res.message || 'Sensor status updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
      console.error('Status update error:', error);
    }
  };

  // ✅ Role-based route generator
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
    <section className="rounded-[10px] bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-[#05004E] md:text-xl">All Sensors</h4>
        <button onClick={() => modalOpenHandler('add')}>
          <IoIosAddCircle className="text-primary text-2xl" />
        </button>
      </div>

      <div className="mt-6">
        {isLoading || loading ? (
          <Spinner />
        ) : (
          <DataTable
            data={sensors || []}
            columns={tableColumns(handleStatusHandler, modalOpenHandler, user, getSensorRoute)}
            customStyles={tableStyles}
            pagination
            fixedHeader
            fixedHeaderScrollHeight="60vh"
            selectableRows
          />
        )}
      </div>

      {/* Add Sensor */}
      {modalType === 'add' && (
        <Modal onClose={modalCloseHandler} title={'Add Sensor'}>
          <AddSensor onClose={modalCloseHandler} />
        </Modal>
      )}

      {/* Edit Sensor */}
      {modalType === 'edit' && (
        <Modal onClose={modalCloseHandler} title={'Edit Sensor'}>
          <EditSensor onClose={modalCloseHandler} selectedSensor={selectedSensor} />
        </Modal>
      )}

      {/* Delete Sensor */}
      {modalType === 'delete' && (
        <Modal onClose={modalCloseHandler} title={'Confirmation'} width="w-[300px] md:w-[600px]">
          <div>
            <p className="text-[16px] text-[#00000090]">
              Are you sure you want to delete this sensor?
            </p>
            <div className="mt-5 flex items-center justify-end gap-4">
              <Button
                onClick={modalCloseHandler}
                text="Cancel"
                cn="border-primary bg-transparent !text-primary"
              />
              <Button
                onClick={() => deleteSensorHandler(selectedSensor?._id)}
                text={deleteLoading ? 'Deleting...' : 'Delete Sensor'}
                disabled={deleteLoading}
              />
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Sensors;

// ✅ Updated tableColumns with role-based routing
const tableColumns = (handleStatusHandler, modalOpenHandler, user, getSensorRoute) => [
  {
    name: 'Sensor Name',
    selector: row => row?.name,
  },
  {
    name: 'Parameters',
    selector: row =>
      Array.isArray(row?.parameters) && row.parameters.length > 0
        ? row.parameters.map(p => PARAMETER_LABELS[p] || p).join(', ')
        : '-',
  },
  {
    name: 'Unique Id',
    selector: row => row?.uniqueId,
  },
  {
    name: 'Is Connected',
    selector: row =>
      row?.isConnected === true ? <span>Connected</span> : <span>Disconnected</span>,
  },
  {
    name: 'Status',
    cell: row => (
      <div>
        {user?.role === 'admin' ? (
          <ToggleButton
            role={user?.role}
            isChecked={row.status}
            onToggle={() => handleStatusHandler(row)}
          />
        ) : (
          <ToggleButton role={user?.role} isChecked={row.status} />
        )}
      </div>
    ),
  },
  {
    name: 'Action',
    cell: row => (
      <div className="flex items-center justify-center gap-3">
        {/* ✅ Dynamic link based on user role */}
        <Link href={getSensorRoute(user?.role, row._id)}>
          <div className="cursor-pointer">
            <HiOutlineEye fontSize={20} />
          </div>
        </Link>
        {user?.role === 'admin' && (
          <div className="flex gap-3">
            <div className="cursor-pointer" onClick={() => modalOpenHandler('edit', row)}>
              <CiEdit fontSize={23} />
            </div>
            <div className="cursor-pointer" onClick={() => modalOpenHandler('delete', row)}>
              <AiOutlineDelete fontSize={23} style={{ color: 'red' }} />
            </div>
          </div>
        )}
      </div>
    ),
  },
];
