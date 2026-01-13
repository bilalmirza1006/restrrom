'use client';
import Modal from '@/components/global/Modal';
import Dropdown from '@/components/global/small/Dropdown';
import Input from '@/components/global/small/Input';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';
import { MdAddBox, MdDelete, MdEdit } from 'react-icons/md';

import RuleDropdown from '@/components/global/small/RuleDropdown';
import { useGetAllBuildingsQuery } from '@/features/building/buildingApi';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import {
  useCreateRuleMutation,
  useDeleteRuleMutation,
  useGetAllRulesQuery,
  useUpdateRuleMutation,
} from '@/features/ruleEngine/ruleEngine';
import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';

import {
  createBuildingOptions,
  createRestroomOptions,
  createSensorOptions,
} from '@/utils/alertFormatters';
import { initialFormState } from '@/utils/alertFormHelpers';
import { formatSensorType, getSensorFieldConfig, severityOptions } from '@/utils/sensorTypes';

export default function RuleEnginePage() {
  const [modalType, setModalType] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [inputEmail, setInputEmail] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRestroom, setSelectedRestroom] = useState('');
  const [selectedSensor, setSelectedSensor] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deleteAlertId, setDeleteAlertId] = useState(null);
  const openConfirmationModal = id => {
    console.log('idsdsddsdsd', id);
    setConfirmationModal(true);
    setDeleteAlertId(id);
  };
  const closeConfirmationModal = () => {
    setConfirmationModal(false);
  };
  const [formData, setFormData] = useState(initialFormState);
  console.log('formDataformDataformDataformData', formData);

  const { data: buildingsData } = useGetAllBuildingsQuery();
  const { data: restroomsData } = useGetAllRestroomsQuery(selectedBuilding, {
    skip: !selectedBuilding,
  });
  const { data: sensorsData } = useGetAllSensorsQuery();
  const { data: rulesData, refetch } = useGetAllRulesQuery();

  const [createRule, { isLoading: creating }] = useCreateRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();

  const buildingsList = buildingsData?.data || [];
  const restroomsList = restroomsData?.data?.restRooms || [];
  const allSensors = sensorsData?.data || [];

  const filteredSensors = selectedRestroom
    ? allSensors.filter(s => s.restroomId === selectedRestroom)
    : [];

  const buildingOptions = useMemo(() => createBuildingOptions(buildingsList), [buildingsList]);
  const restroomOptions = useMemo(() => createRestroomOptions(restroomsList), [restroomsList]);
  const sensorOptions = useMemo(
    () => createSensorOptions(filteredSensors, formatSensorType),
    [filteredSensors]
  );

  const isLoading = creating || updating;

  const handleConditionChange = (sensorId, field, value) => {
    console.log('handleConditionChange', sensorId, field, value);
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [sensorId]: {
          ...prev.conditions[sensorId],
          [field]: value,
        },
      },
    }));
  };

  const handleDelete = async id => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await deleteRule(id).unwrap();
        toast.success('Rule deleted successfully');
        refetch();
      } catch (err) {
        toast.error('Failed to delete rule');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedBuilding('');
    setSelectedRestroom('');
    setSelectedSensor([]);
    setInputEmail(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalType('add');
  };

  const openEditModal = rule => {
    setSelectedAlert(rule);

    const sensorObjects = (rule.sensorIds || [])
      .map(sensorId => {
        const sensor = allSensors.find(s => s._id === sensorId);
        if (!sensor) return null;
        return {
          id: sensor._id,
          name: sensor.name,
          type: sensor.sensorType,
        };
      })
      .filter(Boolean);

    setFormData({
      ruleName: rule.name,
      severity: rule.severity,
      platform: rule.platform,
      email: rule.email || '',
      conditions: rule.values?.value || {},
      status: rule.status || 'active',
    });

    setSelectedBuilding(rule.buildingId || '');
    setSelectedRestroom(rule.restroomId || '');
    setSelectedSensor(sensorObjects);
    setInputEmail(rule.platform === 'email');
    setModalType('edit');
  };

  const closeModal = () => {
    setModalType(null);
    resetForm();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSensorSelection = values => {
    setSelectedSensor(values);
  };

  const handleSave = async () => {
    if (
      !formData.ruleName ||
      !formData.severity ||
      !selectedBuilding ||
      !selectedRestroom ||
      selectedSensor.length === 0
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    const valuesPayload = {
      label: 'Rule Condition',
      id: 'rule_val_id',
      value: formData.conditions,
    };

    const sensorIdsArray = Array.isArray(selectedSensor)
      ? selectedSensor.map(sensor => (typeof sensor === 'string' ? sensor : sensor.id))
      : [];

    const payload = {
      name: formData.ruleName,
      buildingId: selectedBuilding,
      restroomId: selectedRestroom,
      sensorIds: sensorIdsArray,
      severity: formData.severity,
      status: formData.status || 'active',
      values: valuesPayload,
      platform: formData.platform,
      email: formData.platform === 'email' ? formData.email : undefined,
    };

    try {
      if (modalType === 'add') {
        await createRule(payload).unwrap();
        toast.success('Rule created');
      } else {
        await updateRule({ id: selectedAlert._id, ...payload }).unwrap();
        toast.success('Rule updated');
      }
      refetch();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save rule');
    }
  };

  const columns = [
    { name: 'Rule Name', selector: row => row.name, sortable: true },
    {
      name: 'Building',
      selector: row => row.buildingName || '-',
      sortable: true,
    },
    {
      name: 'Restroom',
      selector: row => row.restroomName || '-',
      sortable: true,
    },
    {
      name: 'Sensors',
      selector: row => {
        if (!row.sensors || !Array.isArray(row.sensors) || row.sensors.length === 0) return '-';
        return row.sensors.map(sensor => sensor.name).join(', ');
      },
      wrap: true,
    },
    { name: 'Severity', selector: row => row.severity },

    {
      name: 'Platform',
      selector: row => (row.platform === 'email' ? `Email: ${row.email}` : row.platform),
    },
    {
      name: 'Status',
      selector: row => row.status,
      cell: row => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
          <MdDelete className="cursor-pointer text-red-500" onClick={() => handleDelete(row._id)} />
        </div>
      ),
      width: '100px',
    },
  ];

  const renderConditionFields = () => {
    return selectedSensor.map(sensor => {
      const field = getSensorFieldConfig(sensor.type);
      console.log('fieldfieldfield', field);
      if (!field) {
        console.warn(`No field config for sensor type: ${sensor.type}`);
        return null;
      }

      const condition = formData.conditions?.[sensor.id] || {
        sensorId: sensor.id,
        sensorType: sensor.type,
        label: field?.label || sensor.name,
        min: '',
        max: '',
        type: field?.type || 'range',
      };

      return (
        <div key={sensor.id} className="space-y-3 rounded border p-4">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Sensor: {sensor.name}</h4>
            <p className="text-xs text-gray-500">Type: {formatSensorType(sensor.type)}</p>
          </div>

          {/* <Input
            label="Metric Label"
            value={condition.label}
            // onChange={e => handleConditionChange(sensor.id, 'label', e.target.value)}
            disabled
          /> */}
          {/* <label className="text-sm text-[#666666]">{condition.label}sd</label> */}
          {field.type === 'boolean' && (
            <Dropdown
              label="Value"
              options={[
                { option: 'Yes', value: 'true' },
                { option: 'No', value: 'false' },
              ]}
              value={condition.min}
              onSelect={value => handleConditionChange(sensor.id, 'min', value)}
            />
          )}

          {field.type === 'select' && (
            <Dropdown
              label="Status"
              options={field.options}
              value={condition.min}
              onSelect={value => handleConditionChange(sensor.id, 'min', value)}
            />
          )}

          {field.type === 'range' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label={`Min ${field.unit || ''}`}
                value={condition.min}
                onChange={e => handleConditionChange(sensor.id, 'min', e.target.value)}
                placeholder="Enter minimum value"
              />

              <Input
                type="number"
                label={`Max ${field.unit || ''}`}
                value={condition.max}
                onChange={e => handleConditionChange(sensor.id, 'max', e.target.value)}
                placeholder="Enter maximum value"
              />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rule Engine</h1>
        <MdAddBox
          size={32}
          className="cursor-pointer text-blue-500 hover:text-blue-600"
          onClick={openAddModal}
          title="Add New Rule"
        />
      </div>

      {(modalType === 'add' || modalType === 'edit') && (
        <Modal
          key={selectedAlert?._id || 'new'}
          title={modalType === 'add' ? 'Add New Rule' : 'Edit Rule'}
          onClose={closeModal}
          size="lg"
        >
          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-1">
            <Input
              label="Rule Name *"
              name="ruleName"
              value={formData.ruleName}
              onChange={handleChange}
              placeholder="Enter rule name"
              required
            />

            <Dropdown
              label="Select Building"
              options={buildingOptions}
              value={selectedBuilding}
              onSelect={value => {
                setSelectedBuilding(value);
                setSelectedRestroom('');
                setSelectedSensor([]);
                setFormData(prev => ({
                  ...prev,
                  buildingId: value,
                  restroomId: '',
                  sensors: [],
                  conditions: {},
                }));
              }}
              placeholder="Choose a building"
            />

            <Dropdown
              label="Select Restroom"
              options={selectedBuilding ? restroomOptions : []}
              value={selectedRestroom}
              onSelect={value => {
                setSelectedRestroom(value);
                setSelectedSensor([]);
                setFormData(prev => ({
                  ...prev,
                  restroomId: value,
                  sensors: [],
                  conditions: {},
                }));
              }}
              disabled={!selectedBuilding}
              placeholder="Choose a restroom"
            />

            <RuleDropdown
              multi
              label="Select Sensors *"
              options={selectedRestroom ? sensorOptions : []}
              value={selectedSensor}
              onSelect={handleSensorSelection}
              disabled={!selectedRestroom}
              placeholder="Choose sensors"
            />

            <Dropdown
              label="Severity *"
              options={severityOptions}
              value={formData.severity}
              onSelect={value => setFormData(prev => ({ ...prev, severity: value }))}
              placeholder="Select severity level"
              required
            />

            <Dropdown
              label="Status *"
              options={[
                { option: 'Active', value: 'active' },
                { option: 'Inactive', value: 'inactive' },
              ]}
              value={formData.status}
              onSelect={value => setFormData(prev => ({ ...prev, status: value }))}
              placeholder="Select status"
              required
            />

            {selectedSensor.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conditions for Each Sensor</h3>
                {renderConditionFields()}
              </div>
            )}

            <div className="space-y-3">
              <label className="font-semibold">Notification Platform *</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="platform"
                    checked={formData.platform === 'email'}
                    onChange={() => {
                      setFormData(prev => ({ ...prev, platform: 'email' }));
                      setInputEmail(true);
                    }}
                    className="h-4 w-4"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="platform"
                    checked={formData.platform === 'platform'}
                    onChange={() => {
                      setFormData(prev => ({ ...prev, platform: 'platform' }));
                      setInputEmail(false);
                    }}
                    className="h-4 w-4"
                  />
                  <span>Platform</span>
                </label>
              </div>
            </div>

            {inputEmail && (
              <Input
                type="email"
                label="Email Address *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email for notifications"
                required={formData.platform === 'email'}
              />
            )}

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                type="button"
              >
                {isLoading ? 'Saving...' : modalType === 'add' ? 'Create Rule' : 'Update Rule'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="rounded-lg bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={rulesData?.rules || []}
          pagination
          highlightOnHover
          responsive
          persistTableHead
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              No rules found. Click the + icon to create your first rule.
            </div>
          }
        />
      </div>
    </div>
  );
}
