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
    parameters: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-6">
        <Input
          label="Sensor Name"
          name="name"
          placeholder="e.g. Pressure Sensor"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="lg:col-span-6 mt-1">
        <Dropdown
          multi={true}
          defaultText={'Select'}
          initialValue={formData.parameters}
          options={[
            { value: 'temperature', option: 'Temperature' },
            { value: 'humidity', option: 'Humidity' },
            { value: 'co', option: 'Co' },
            { value: 'co2', option: 'Co2' },
            { value: 'ch', option: 'Ch' },
            { value: 'tvoc', option: 'Tvoc' },
          ]}
          label="Sensor Parameters"
          onSelect={(values) => setFormData((prev) => ({ ...prev, parameters: values }))}
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

      <div className="lg:col-span-12 flex items-center justify-center gap-4 mt-4">
        <Button onClick={onClose} text="Cancel" cn="border-primary bg-transparent !text-primary" />
        <Button type="submit" text={isLoading ? 'Adding...' : 'Add Sensor'} disabled={isLoading} />
      </div>
    </form>
  );
};

export default AddSensor;
