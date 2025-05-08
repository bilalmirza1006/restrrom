"use client";
import { useState } from "react";
import Input from "@/components/global/small/Input";
import Button from "@/components/global/small/Button";
import { useUpdateSensorMutation } from "@/features/sensor/sensorApi";
import toast from "react-hot-toast";

const EditSensor = ({ onClose, selectedSensor }) => {
  console.log("Selected Sensor:", selectedSensor);
  const [updateSensor, { isLoading }] = useUpdateSensorMutation();
  const [formData, setFormData] = useState({
    name: selectedSensor?.name || "",
    type: selectedSensor?.type || "",
    uniqueId: selectedSensor?.uniqueId || "",
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
      const res = await updateSensor({
        sensorId: selectedSensor._id,
        data: formData,
      }).unwrap();
      toast.success(res.message || "Sensor updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error updating sensor:", error);
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
          text={isLoading ? "Saving..." : "Save Sensor"}
          disabled={isLoading}
        />
      </div>
    </form>
  );
};

export default EditSensor;
