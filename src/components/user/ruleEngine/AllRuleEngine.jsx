'use client';

import React, { useState } from 'react';
import Modal from '@/components/global/Modal';
import Input from '@/components/global/small/Input';
import Dropdown from '@/components/global/small/Dropdown';
import DataTable from 'react-data-table-component';
import { MdAddBox, MdEdit, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';

// import {
//   useCreateRuleMutation,
//   useGetAllRulesQuery,
//   useUpdateRuleMutation,
//   useDeleteRuleMutation,
// } from '@/features/rules/ruleEngineApi';
import { RULE_SENSOR_CONFIG } from '../sensors/SensorConfig';
import {
  useCreateRuleMutation,
  useDeleteRuleMutation,
  useGetAllRulesQuery,
  useUpdateRuleMutation,
} from '@/features/ruleEngine/ruleEngine';

// import { RULE_SENSOR_CONFIG } from '@/config/ruleSensorConfig';

/* ------------------ CONSTANTS ------------------ */

const severityOptions = [
  { option: 'Low', value: 'low' },
  { option: 'Medium', value: 'medium' },
  { option: 'High', value: 'high' },
  { option: 'Critical', value: 'critical' },
];

const sensorTypeOptions = Object.entries(RULE_SENSOR_CONFIG).map(([key, val]) => ({
  option: val.label,
  value: key,
}));

/* ------------------ COMPONENT ------------------ */

export default function RuleEnginePage() {
  const [modalType, setModalType] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    alertType: '',
    severity: '',
    sensorId: '',
  });

  const [conditions, setConditions] = useState([]);

  /* ------------------ API ------------------ */

  const { data, refetch } = useGetAllRulesQuery();
  const [createRule, { isLoading: creating }] = useCreateRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();

  /* ------------------ HANDLERS ------------------ */

  const openAddModal = () => {
    setFormData({ name: '', alertType: '', severity: '', sensorId: '' });
    setConditions([]);
    setSelectedRule(null);
    setModalType('add');
  };

  const openEditModal = rule => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      alertType: rule.alertType,
      severity: rule.severity,
      sensorId: rule.sensorId || '',
    });
    setConditions(
      rule.conditions.map(c => ({
        ...c,
        type:
          RULE_SENSOR_CONFIG[rule.alertType].fields.find(f => f.field === c.field)?.type ||
          'number',
      }))
    );
    setModalType('edit');
  };

  const closeModal = () => setModalType(null);

  const handleSensorChange = sensorType => {
    const fields = RULE_SENSOR_CONFIG[sensorType]?.fields || [];
    setFormData(prev => ({ ...prev, alertType: sensorType }));

    setConditions(
      fields.map(f => ({
        field: f.field,
        operator: f.operators[0],
        value: '',
        type: f.type,
      }))
    );
  };

  const handleConditionChange = (index, key, value) => {
    const updated = [...conditions];
    updated[index][key] = value;
    setConditions(updated);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.alertType || !formData.severity) {
      return toast.error('All required fields must be filled');
    }

    const payload = {
      ...formData,
      conditions: conditions.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.type === 'number' ? Number(c.value) : c.value,
      })),
    };

    try {
      if (modalType === 'add') {
        await createRule(payload).unwrap();
        toast.success('Rule created');
      } else {
        await updateRule({ id: selectedRule._id, ...payload }).unwrap();
        toast.success('Rule updated');
      }
      refetch();
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this rule?')) return;
    await deleteRule(id).unwrap();
    toast.success('Rule deleted');
    refetch();
  };

  /* ------------------ TABLE ------------------ */

  const columns = [
    { name: 'Name', selector: r => r.name, sortable: true },
    { name: 'Sensor', selector: r => r.alertType, sortable: true },
    { name: 'Severity', selector: r => r.severity },
    { name: 'Status', selector: r => r.status },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex gap-2">
          <MdEdit className="cursor-pointer text-blue-500" onClick={() => openEditModal(row)} />
          <MdDelete className="cursor-pointer text-red-500" onClick={() => handleDelete(row._id)} />
        </div>
      ),
    },
  ];

  /* ------------------ UI ------------------ */

  return (
    <div className="p-4">
      {/* MODAL */}
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal title={modalType === 'add' ? 'Add Rule' : 'Edit Rule'} onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <Input
              label="Rule Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <Dropdown
              label="Sensor Type"
              options={sensorTypeOptions}
              value={formData.alertType}
              onSelect={handleSensorChange}
            />

            <Dropdown
              label="Severity"
              options={severityOptions}
              value={formData.severity}
              onSelect={v => setFormData({ ...formData, severity: v })}
            />

            <Input
              label="Sensor ID (optional)"
              value={formData.sensorId}
              onChange={e => setFormData({ ...formData, sensorId: e.target.value })}
            />

            {/* DYNAMIC CONDITIONS */}
            {conditions.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="mb-3 font-semibold">Conditions</h3>

                {conditions.map((c, i) => {
                  const fieldMeta = RULE_SENSOR_CONFIG[formData.alertType].fields.find(
                    f => f.field === c.field
                  );

                  return (
                    <div key={i} className="mb-3 grid grid-cols-3 items-center gap-3">
                      <span className="font-medium">{fieldMeta.label}</span>

                      <Dropdown
                        options={fieldMeta.operators.map(o => ({
                          option: o,
                          value: o,
                        }))}
                        value={c.operator}
                        onSelect={v => handleConditionChange(i, 'operator', v)}
                      />

                      {c.type === 'boolean' ? (
                        <Dropdown
                          options={[
                            { option: 'True', value: true },
                            { option: 'False', value: false },
                          ]}
                          value={c.value}
                          onSelect={v => handleConditionChange(i, 'value', v)}
                        />
                      ) : (
                        <Input
                          value={c.value}
                          onChange={e => handleConditionChange(i, 'value', e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeModal} className="rounded bg-gray-500 px-5 py-2 text-white">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={creating || updating}
                className="rounded bg-blue-600 px-5 py-2 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* HEADER */}
      <div className="mb-4 flex justify-end">
        <MdAddBox fontSize={30} className="cursor-pointer text-blue-500" onClick={openAddModal} />
      </div>

      {/* TABLE */}
      <DataTable columns={columns} data={data?.rules || []} pagination highlightOnHover />
    </div>
  );
}
