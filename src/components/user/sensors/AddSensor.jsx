'use client';
import { useState } from 'react';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import { useCreateSensorMutation } from '@/features/sensor/sensorApi';
import toast from 'react-hot-toast';
import Dropdown from '@/components/global/small/Dropdown';

const AddSensor = ({ onClose }) => {
  const [createSensor, { isLoading, isSuccess }] = useCreateSensorMutation();
  const [formData, setFormData] = useState({
    name: '',
    uniqueId: '',
    sensorType: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await createSensor(formData).unwrap();
      toast.success(res.message || 'Sensor created successfully');
      onClose();
    } catch (error) {
      toast.error(error.data.message || 'Something went wrong');
      console.error('Error creating sensor:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <Input
          label="Sensor Name"
          name="name"
          placeholder="e.g. Pressure Sensor"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="mt-1 lg:col-span-6">
        <Dropdown
          multi={false}
          defaultText={'Select Sensor Type'}
          initialValue={formData.sensorType}
          options={[
            { value: 'door_queue', option: 'Door Queue' },
            { value: 'stall_status', option: 'Stall Status' },
            { value: 'occupancy', option: 'Occupancy' },
            { value: 'air_quality', option: 'Air Quality' },
            { value: 'toilet_paper', option: 'Toilet Paper' },
            { value: 'soap_dispenser', option: 'Soap Dispenser' },
            { value: 'water_leakage', option: 'Water Leakage' },
          ]}
          label="Sensor Type"
          onSelect={value => setFormData(prev => ({ ...prev, sensorType: value }))}
        />
      </div>
      <div className="lg:col-span-12">
        <Input
          label="Unique ID"
          name="uniqueId"
          placeholder="e.g. SN-872364923"
          value={formData.uniqueId}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 lg:col-span-12">
        <Button onClick={onClose} text="Cancel" cn="border-primary bg-transparent !text-primary" />
        <Button type="submit" text={isLoading ? 'Adding...' : 'Add Sensor'} disabled={isLoading} />
      </div>
    </form>
  );
};

export default AddSensor;
