'use client';
import React, { useState } from 'react';
import Modal from '@/components/global/Modal';
import Input from '@/components/global/small/Input';
import Dropdown from '@/components/global/small/Dropdown';
import { MdAddBox, MdEdit, MdDelete } from 'react-icons/md';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';

import {
  useDeleteAlertMutation,
  useCreateAlertMutation,
  useGetAllAlertsQuery,
  useUpdateAlertMutation,
} from '@/features/alerts/alertsApi';
import ConfirmationModal from '@/components/global/small/ConfirmationModal';
import { set } from 'lodash';
import { useSelector } from 'react-redux';

const severityOptions = [
  { option: 'Low', value: 'low' },
  { option: 'Medium', value: 'medium' },
  { option: 'High', value: 'high' },
  { option: 'Critical', value: 'critical' },
];

const sensorTypes = [
  { option: 'Occupancy', value: 'occupancy' },
  { option: 'Air Quality', value: 'airQuality' },
  { option: 'Water Leakage', value: 'waterLeakage' },
  { option: 'Toilet Paper', value: 'toiletPaper' },
  { option: 'Soap Dispenser', value: 'soapDispenser' },
  { option: 'Door Queue', value: 'doorQueue' },
  { option: 'Stall Status', value: 'stallStatus' },
];

const SENSOR_ALERT_FIELDS = {
  occupancy: {
    label: 'Occupancy Status',
    type: 'boolean',
  },
  airQuality: {
    label: 'Air Quality Index (AQI)',
    type: 'range',
    unit: 'AQI',
  },
  waterLeakage: {
    label: 'Water Detected',
    type: 'boolean',
  },
  toiletPaper: {
    label: 'Toilet Paper Level',
    type: 'range',
    unit: '%',
  },
  soapDispenser: {
    label: 'Soap Level',
    type: 'range',
    unit: '%',
  },
  doorQueue: {
    label: 'Queue Count',
    type: 'range',
    unit: 'People',
  },
  stallStatus: {
    label: 'Stall Status',
    type: 'select',
    options: [
      { option: 'Occupied', value: 'occupied' },
      { option: 'Vacant', value: 'vacant' },
      { option: 'Out of Order', value: 'out_of_order' },
    ],
  },
};

export default function AllAlerts() {
  const [modalType, setModalType] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [inputEmail, setInputEmail] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deleteAlertId, setDeleteAlertId] = useState(null);
  const { user } = useSelector(state => state.auth);

  const openConfirmationModal = id => {
    console.log('idsdsddsdsd', id);
    setConfirmationModal(true);
    setDeleteAlertId(id);
  };
  const closeConfirmationModal = () => {
    setConfirmationModal(false);
  };

  const [formData, setFormData] = useState({
    alertName: '',
    alertType: '',
    severityType: '',
    label: '',
    min: '',
    max: '',
    sensorId: '',
    platform: '',
    email: '',
    status: 'active',
  });

  const { data, refetch } = useGetAllAlertsQuery({
    skip: user?.role !== 'admin' && user?.role !== 'building_manager',
  });
  const [createAlert, { isLoading: creating }] = useCreateAlertMutation();
  const [updateAlert, { isLoading: updating }] = useUpdateAlertMutation();
  const [deleteAlert] = useDeleteAlertMutation();

  const resetForm = () => {
    setFormData({
      alertName: '',
      alertType: '',
      severityType: '',
      label: '',
      min: '',
      max: '',
      sensorId: '',
      platform: '',
      email: '',
      status: 'active',
    });
    setInputEmail(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalType('add');
  };

  const openEditModal = alert => {
    setSelectedAlert(alert);

    setFormData({
      alertName: alert.name,
      alertType: alert.alertType,
      severityType: alert.severity,
      label: alert.label || '',
      min: alert.value?.min ?? '',
      max: alert.value?.max ?? '',
      sensorId: alert.sensorId || '',
      platform: alert.platform,
      email: alert.email || '',
      status: alert.status || 'active',
    });

    setInputEmail(alert.platform === 'email');
    setModalType('edit');
  };

  const closeModal = () => setModalType(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSensorChange = value => {
    const config = SENSOR_ALERT_FIELDS[value];
    setFormData(prev => ({
      ...prev,
      alertType: value,
      label: config?.label || '',
      min: '',
      max: '',
    }));
  };

  const handleSave = async () => {
    const { alertName, alertType, severityType, label, min, max, platform, email } = formData;
    const config = SENSOR_ALERT_FIELDS[alertType];

    if (!alertName || !alertType || !severityType || !label || !platform) {
      return toast.error('Please fill all required fields');
    }

    if (config?.type === 'range') {
      if (min === '' || max === '') {
        return toast.error('Min and Max values are required');
      }
      if (Number(min) >= Number(max)) {
        return toast.error('Min must be less than Max');
      }
    }

    const payload = {
      name: alertName,
      alertType,
      severity: severityType,
      label,
      value: { min, max },
      platform,
      sensorId: formData.sensorId || null,
      status: formData.status || 'active',
    };

    if (inputEmail && email) payload.email = email;

    try {
      if (modalType === 'add') {
        await createAlert(payload).unwrap();
        toast.success('Alert created');
      } else {
        await updateAlert({ id: selectedAlert._id, ...payload }).unwrap();
        toast.success('Alert updated');
      }
      refetch();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteAlert(deleteAlertId).unwrap();
      toast.success('Alert deleted');
      closeConfirmationModal();
      refetch();
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  const columns = [
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Sensor', selector: row => row.alertType },
    { name: 'Severity', selector: row => row.severity },
    {
      name: 'Condition',
      selector: row => (row.value ? `${row.label} (${row.value.min} - ${row.value.max})` : '-'),
    },
    { name: 'Platform', selector: row => row.platform },
    {
      name: 'Status',
      selector: row => row.status,
      cell: row => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex gap-2">
          <MdEdit className="cursor-pointer text-blue-500" onClick={() => openEditModal(row)} />
          {/* <MdDelete className="cursor-pointer text-red-500" onClick={() => handleDelete(row._id)} /> */}
          <MdDelete
            className="cursor-pointer text-red-500"
            onClick={() => openConfirmationModal(row._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {confirmationModal && (
        <Modal
          onClose={closeConfirmationModal}
          title="Database Storage Confirmation"
          width="w-[320px] md:w-[450px]"
        >
          <ConfirmationModal
            title="Are you sure you want to delete"
            confirmText="Yes, Delete"
            cancelText="No"
            onCancel={closeConfirmationModal}
            onConfirm={handleDelete}
          />
        </Modal>
      )}
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal
          key={selectedAlert?._id || 'new'}
          title={modalType === 'add' ? 'Add Alert' : 'Edit Alert'}
          onClose={closeModal}
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Alert Name"
              name="alertName"
              value={formData.alertName}
              onChange={handleChange}
            />

            <Dropdown
              label="Sensor Type"
              options={sensorTypes}
              value={formData.alertType}
              onSelect={handleSensorChange}
            />

            <Dropdown
              label="Severity"
              options={severityOptions}
              value={formData.severityType}
              onSelect={value => setFormData({ ...formData, severityType: value })}
            />

            <Dropdown
              label="Status"
              options={[
                { option: 'Active', value: 'active' },
                { option: 'Inactive', value: 'inactive' },
              ]}
              value={formData.status}
              onSelect={value => setFormData({ ...formData, status: value })}
            />

            {formData.alertType && (
              <>
                {/* <Input
                  label="Metric Label"
                  name="label"
                  value={formData.label}
                  // onChange={handleChange}
                  disabled
                /> */}
                <label className="text-sm font-semibold text-gray-700">{formData.label}</label>
                {(() => {
                  const field = SENSOR_ALERT_FIELDS[formData.alertType];

                  if (field.type === 'boolean') {
                    return (
                      <Dropdown
                        // label={field.label}
                        options={[
                          { option: 'Yes', value: true },
                          { option: 'No', value: false },
                        ]}
                        value={formData.min}
                        onSelect={value =>
                          setFormData(prev => ({ ...prev, min: value, max: null }))
                        }
                      />
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <Dropdown
                        // label={field.label}
                        options={field.options}
                        value={formData.min}
                        onSelect={value =>
                          setFormData(prev => ({ ...prev, min: value, max: null }))
                        }
                      />
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        name="min"
                        label={`Min ${field.unit || ''}`}
                        value={formData.min}
                        onChange={handleChange}
                      />
                      <Input
                        type="number"
                        name="max"
                        label={`Max ${field.unit || ''}`}
                        value={formData.max}
                        onChange={handleChange}
                      />
                    </div>
                  );
                })()}
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="font-semibold">Notification Type</span>
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    checked={formData.platform === 'email'}
                    onChange={() => {
                      setFormData({ ...formData, platform: 'email' });
                      setInputEmail(true);
                    }}
                  />{' '}
                  Email
                </label>
                <label>
                  <input
                    type="radio"
                    checked={formData.platform === 'platform'}
                    onChange={() => {
                      setFormData({ ...formData, platform: 'platform' });
                      setInputEmail(false);
                    }}
                  />{' '}
                  Platform
                </label>
              </div>
            </div>

            {inputEmail && (
              <Input
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="rounded bg-gray-500 px-4 py-2 text-white">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={creating || updating}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {creating || updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <MdAddBox size={32} className="cursor-pointer text-blue-500" onClick={openAddModal} />
      </div>

      <DataTable columns={columns} data={data?.alerts || []} pagination highlightOnHover />
    </div>
  );
}
