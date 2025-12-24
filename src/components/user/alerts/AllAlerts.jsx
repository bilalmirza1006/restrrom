'use client';
import React, { useState } from 'react';
import Modal from '@/components/global/Modal';
import Input from '@/components/global/small/Input';
// import Dropdown from '@/components/shared/small/Dropdown';
import { MdAddBox, MdEdit, MdDelete } from 'react-icons/md';
// import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import {
  useDeleteAlertMutation,
  useCreateAlertMutation,
  useGetAllAlertsQuery,
  useUpdateAlertMutation,
} from '@/features/alerts/alertsApi';
import Dropdown from '@/components/global/small/Dropdown';
import toast from 'react-hot-toast';
// import {
//   useCreateAlertMutation,
//   useUpdateAlertMutation,
//   useDeleteAlertMutation,
//   useGetAllAlertsQuery,
// } from '../../../../redux/apis/alertApi';

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

export default function AllAlerts() {
  const [modalType, setModalType] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [inputEmail, setInputEmail] = useState(false);
  const [formData, setFormData] = useState({
    alertName: '',
    alertType: '',
    severityType: '',
    value: '',
    sensorId: '',
    platform: '',
    email: '',
  });

  const { data: alertsData, refetch } = useGetAllAlertsQuery();
  const [createAlert, { isLoading: creating }] = useCreateAlertMutation();
  const [updateAlert, { isLoading: updating }] = useUpdateAlertMutation();
  const [deleteAlert, { isLoading: deleting }] = useDeleteAlertMutation();

  const openAddModal = () => {
    setFormData({
      alertName: '',
      alertType: '',
      severityType: '',
      value: '',
      sensorId: '',
      platform: '',
      email: '',
    });
    setInputEmail(false);
    setModalType('add');
  };

  const openEditModal = alert => {
    setSelectedAlert(alert);
    setFormData({
      alertName: alert.name,
      alertType: alert.alertType,
      severityType: alert.severity,
      value: alert.value,
      sensorId: alert.sensorId || '',
      platform: alert.platform,
      email: alert.email || '',
    });
    setInputEmail(alert.platform === 'email');
    setModalType('edit');
  };

  const closeModal = () => setModalType(null);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    const { alertName, alertType, severityType, value, platform, email, sensorId } = formData;
    console.log('formData', formData);
    if (!alertName || !alertType || !severityType || !value || !platform) {
      return toast.error('All required fields must be filled.');
    }

    if (!sensorTypes.find(s => s.value === alertType)) {
      return toast.error('Please select a valid sensor type');
    }

    if (!severityOptions.find(s => s.value === severityType)) {
      return toast.error('Please select a valid severity type');
    }

    const payload = {
      name: alertName,
      alertType,
      severity: severityType,
      value,
      sensorId: sensorId || null,
      platform,
    };
    if (inputEmail && email) payload.email = email;

    try {
      if (modalType === 'add') {
        await createAlert(payload).unwrap();
        toast.success('Alert created successfully');
      } else if (modalType === 'edit') {
        await updateAlert({ id: selectedAlert._id, ...payload }).unwrap();
        toast.success('Alert updated successfully');
      }
      refetch();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async alertId => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      await deleteAlert(alertId).unwrap();
      toast.success('Alert deleted successfully');
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to delete alert');
    }
  };

  const columns = [
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Sensor Type', selector: row => row.alertType, sortable: true },
    { name: 'Severity', selector: row => row.severity, sortable: true },
    { name: 'Value', selector: row => row.value, sortable: true },
    { name: 'Platform', selector: row => row.platform, sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex gap-2">
          <MdEdit
            fontSize={20}
            className="cursor-pointer text-blue-500"
            onClick={() => openEditModal(row)}
          />
          <MdDelete
            fontSize={20}
            className="cursor-pointer text-red-500"
            onClick={() => handleDelete(row._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal title={modalType === 'add' ? 'Add Alert' : 'Edit Alert'} onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Input
              name="alertName"
              label="Alert Name"
              placeholder="Enter alert name"
              value={formData.alertName}
              onChange={handleChange}
            />
            <Dropdown
              label="Sensor Type"
              options={sensorTypes}
              value={formData.alertType}
              onSelect={value => setFormData({ ...formData, alertType: value })}
            />

            <Dropdown
              label="Severity"
              options={severityOptions}
              value={formData.severityType}
              onSelect={value => setFormData({ ...formData, severityType: value })}
            />

            <Input
              name="value"
              label="Value"
              placeholder="Enter value"
              value={formData.value}
              onChange={handleChange}
            />
            <div className="mt-4 flex flex-col items-center justify-between sm:flex-row">
              <h3 className="font-semibold text-gray-900">Notification Type*</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 font-medium text-gray-900">
                  <input
                    type="radio"
                    checked={formData.platform === 'email'}
                    onChange={() => {
                      setFormData({ ...formData, platform: 'email' });
                      setInputEmail(true);
                    }}
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 font-medium text-gray-900">
                  <input
                    type="radio"
                    checked={formData.platform === 'platform'}
                    onChange={() => {
                      setFormData({ ...formData, platform: 'platform' });
                      setInputEmail(false);
                    }}
                  />
                  Platform
                </label>
              </div>
            </div>
            {inputEmail && (
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
              />
            )}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="rounded-md bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={creating || updating}
                className={`rounded-md px-6 py-2 text-white ${
                  creating || updating ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {creating || updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Header Add Button */}
      <div className="mb-4 flex justify-end">
        <div className="cursor-pointer" onClick={openAddModal}>
          <MdAddBox fontSize={30} color="#03A5E0" />
        </div>
      </div>

      {/* Alerts Table */}
      <DataTable
        columns={columns}
        data={alertsData?.alerts || []}
        pagination
        highlightOnHover
        selectableRows={false}
        persistTableHead
      />
    </div>
  );
}
