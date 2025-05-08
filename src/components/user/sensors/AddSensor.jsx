"use client";
import { useState } from "react";
import Input from "@/components/global/small/Input";
import Button from "@/components/global/small/Button";
import { useCreateSensorMutation } from "@/features/sensor/sensorApi";
import toast from "react-hot-toast";

const AddSensor = ({ onClose }) => {
  const [createSensor, { isLoading, isSuccess }] = useCreateSensorMutation();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    uniqueId: "",
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
      toast.success(res.messsage || "Sensor created successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error creating sensor:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-4"
    >
      <div className="lg:col-span-6">
        <Input
          label="Sensor Name"
          name="name"
          placeholder="e.g. Pressure Sensor"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="lg:col-span-6">
        <Input
          label="Type"
          name="type"
          placeholder="e.g. Pressure, Temperature"
          value={formData.type}
          onChange={handleChange}
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
        <Button
          onClick={onClose}
          text="Cancel"
          cn="border-primary bg-transparent !text-primary"
        />
        <Button
          type="submit"
          text={isLoading ? "Adding..." : "Add Sensor"}
          disabled={isLoading}
        />
      </div>
    </form>
  );
};

export default AddSensor;
