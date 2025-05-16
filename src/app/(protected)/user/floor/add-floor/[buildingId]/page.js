"use client";
import Button from "@/components/global/small/Button";
import Dropdown from "@/components/global/small/Dropdown";
import Input from "@/components/global/small/Input";
import MarkRestroomModel from "@/components/user/addBuilding/MarkRestroomModel";
import { useCreateRestroomMutation } from "@/features/restroom/restroomApi";
import { useGetAllSensorsQuery } from "@/features/sensor/sensorApi";
import { setFileCache } from "@/utils/fileStore";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddFloor = ({}) => {
  const router = useRouter();
  const buildingId = useParams()?.buildingId;
  const [addNewRestroom, { isLoading }] = useCreateRestroomMutation();
  const { data: sensorData } = useGetAllSensorsQuery();
  const [restroom, setRestroom] = useState({
    name: "",
    type: "",
    status: "",
    area: "",
    toilets: "",
    restroomImage: null,
  });

  const handleRestroomChange = (index, field, value) => {
    setRestroom((prev) => ({ ...prev, [field]: value }));
  };

  const [polygons, setPolygons] = useState([]);
  const [availableSensors, setAvailableSensors] = useState([]);

  const handleChange = (field, value) => {
    setRestroom((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (image, file, coordinates) => {
    if (image) handleChange("restroomImage", image);
    if (coordinates) handleChange("restroomCoordinates", coordinates);
    if (file) setFileCache(`restroom`, file);
  };

  const handleSave = async () => {
    const { name, type, status, area, toilets, restroomImage } = restroom;
    console.log("this is new rest room data ", restroom, polygons);
    if (!name || !type || !status || !area || !toilets || !restroomImage || !polygons?.length)
      return toast.error("Please fill all required fields");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("status", status);
      formData.append("area", area);
      formData.append("numOfToilets", toilets);
      formData.append("coordinates", JSON.stringify(polygons));
      formData.append("buildingId", buildingId);
      formData.append("modelImage", restroomImage);
      const res = await addNewRestroom(formData).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Restroom added successfully");
        setFileCache("restroom", null);
        setRestroom({
          name: "",
          type: "",
          status: "",
          area: "",
          toilets: "",
          restroomImage: null,
        });
        setPolygons([]);
      }
      // navigate back
      router.push(`/user/buildings/building-detail/${buildingId}`);

      console.log("res", res);
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong When Adding Restroom");
      console.log("Error adding restroom:", error);
    }
  };

  useEffect(() => {
    if (sensorData?.data) {
      const formattedSensors = [];
      sensorData?.data?.forEach((sensor) => {
        if (!sensor?.isConnected) formattedSensors.push({ option: sensor?.name, value: sensor?._id });
      });
      setAvailableSensors(formattedSensors);
    }
  }, [sensorData]);

  return (
    <div>
      <h6 className="text-base text-primary font-medium">Restroom</h6>
      <div className="py-6 p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Restroom Name"
            placeholder="Enter name"
            value={restroom.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <Dropdown
            label="Type"
            placeholder="Select type"
            value={restroom.type}
            onSelect={(value) => handleChange("type", value)}
            options={[
              { option: "Public", value: "public" },
              { option: "Private", value: "private" },
            ]}
          />

          <Dropdown
            label="Status"
            placeholder="Select status"
            onSelect={(value) => handleChange("status", value)}
            options={[
              { option: "Active", value: "active" },
              { option: "Inactive", value: "inactive" },
            ]}
          />

          <Input
            label="Area (sq ft)"
            placeholder="Enter area"
            type="number"
            value={restroom.area}
            onChange={(e) => handleChange("area", e.target.value)}
          />

          <Input
            label="Number of Toilets"
            placeholder="Enter toilets"
            type="number"
            value={restroom.toilets}
            onChange={(e) => handleChange("toilets", e.target.value)}
          />
        </div>

        <div>
          <h6 className="font-medium mb-3">Restroom Layout</h6>
          <div className="py-4 grid place-items-center">
            <MarkRestroomModel
              restroomIndex={"1"}
              updateRestRoomHandler={handleRestroomChange}
              setFile={(file) => handleImageChange(null, file, null)}
              restroomImage={restroom.restroomImage}
              setRestroomImage={(image) => handleImageChange(image, null, null)}
              polygons={polygons}
              setPolygons={setPolygons}
              availableSensors={availableSensors}
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button text="Save Restroom" width="!w-[200px]" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default AddFloor;
