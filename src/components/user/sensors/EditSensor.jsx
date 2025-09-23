'use client';
import { useState } from 'react';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import { useUpdateSensorMutation } from '@/features/sensor/sensorApi';
import toast from 'react-hot-toast';
import Dropdown from '@/components/global/small/Dropdown';

const validate = (formData) => {
  if (!formData.name.trim()) return 'Sensor name is required';
  if (!formData.uniqueId.trim()) return 'Unique ID is required';
  if (!formData.parameters || formData.parameters.length === 0)
    return 'At least one parameter is required';
  return null;
};

const EditSensor = ({ onClose, selectedSensor }) => {
  console.log('Selected Sensor:', selectedSensor);
  const [updateSensor, { isLoading }] = useUpdateSensorMutation();
  const [formData, setFormData] = useState({
    id: selectedSensor._id,
    name: selectedSensor?.name || '',
    uniqueId: selectedSensor?.uniqueId || '',
    parameters: selectedSensor?.parameters || [],
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
    const errorMsg = validate(formData);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    try {
      const payload = {
        id: selectedSensor._id,
        ...formData,
        parameters: formData.parameters.map((p) =>
          typeof p === 'string' ? p.toLowerCase() : p.value.toLowerCase()
        ),
      };
      console.log('Updating sensor:', payload);
      const res = await updateSensor(payload).unwrap();
      toast.success(res.message || 'Sensor updated successfully');
      onClose();
    } catch (error) {
      toast.error(error.data.message || 'Something went wrong');
      console.error('Error updating sensor:', error);
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
        <Button type="submit" text={isLoading ? 'Saving...' : 'Save Sensor'} disabled={isLoading} />
      </div>
    </form>
  );
};

export default EditSensor;
