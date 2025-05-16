"use client";
import Button from "@/components/global/small/Button";
import Input from "@/components/global/small/Input";
import UploadBuildingImage from "@/components/user/addBuilding/UploadBuildingImage";
import { useGetBuildingQuery, useUpdateBuildingMutation } from "@/features/building/buildingApi";
import { getFileCache, setFileCache } from "@/utils/fileStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function EditBuildingById() {
  const params = useParams();
  const buildingId = params.buildingId;
  const { data: buildingData } = useGetBuildingQuery(buildingId);
  const [updateBuilding, { isLoading }] = useUpdateBuildingMutation();
  const [image, setImage] = useState({ file: null, imagePreview: null });
  const [buildingInfo, setBuildingInfo] = useState({
    buildingName: "",
    buildingType: "",
    location: "",
    area: "",
    totalFloors: "",
    totalRestrooms: "",
    buildingManager: "",
    phone: "",
  });

  const buildingInfoChangeHandler = (e) => {
    const { name, value } = e.target;
    setBuildingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateBuildingHandler = async (e) => {
    e.preventDefault();
    const hasEmptyField = Object.values(buildingInfo).some((val) => !val?.toString().trim());
    const hasImage = !!(image?.file || image?.imagePreview);
    if (hasEmptyField || !hasImage) return toast.error("Please fill all fields and upload building image.");
    setFileCache("buildingImage", image?.file);

    try {
      const formData = new FormData();
      if (buildingInfo?.buildingName) formData.append("name", buildingInfo.buildingName);
      if (buildingInfo?.buildingType) formData.append("type", buildingInfo.buildingType);
      if (buildingInfo?.location) formData.append("location", buildingInfo.location);
      if (buildingInfo?.area) formData.append("area", buildingInfo.area);
      if (buildingInfo?.totalFloors) formData.append("totalFloors", buildingInfo.totalFloors);
      if (buildingInfo?.totalRestrooms) formData.append("numberOfRooms", buildingInfo.totalRestrooms);
      if (buildingInfo?.buildingManager) formData.append("buildingManager", buildingInfo.buildingManager);
      if (buildingInfo?.phone) formData.append("phone", buildingInfo.phone);
      if (image?.file) formData.append("buildingThumbnail", image?.file);

      const res = await updateBuilding({ buildingId, data: formData }).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Building updated successfully");
        setFileCache("buildingImage", null);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong When Updating Building");
      console.log("Error updating building:", error);
    }
  };

  useEffect(() => {
    if (buildingData?.data) {
      const building = buildingData?.data;
      setBuildingInfo({
        buildingName: building?.name || "",
        buildingType: building?.type || "",
        location: building?.location || "",
        area: building?.area || "",
        totalFloors: building?.totalFloors || "",
        totalRestrooms: building?.numberOfRooms || "",
        buildingManager: building?.buildingManager || "",
        phone: building?.phone || "",
      });
      if (building?.buildingThumbnail) {
        setImage({
          imagePreview: building?.buildingThumbnail?.url,
        });
      }
    }
  }, [buildingData?.data]);

  return (
    <div>
      <div>
        <h6 className="text-base text-primary font-medium">General Information</h6>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mt-5" onSubmit={updateBuildingHandler}>
          <div className="lg:col-span-3">
            <UploadBuildingImage image={image} setImage={setImage} />
          </div>
          <Input
            type="text"
            name="buildingName"
            label="Building Name"
            placeholder="Building Name"
            value={buildingInfo.buildingName}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="text"
            name="buildingType"
            label="Building Type"
            placeholder="Building Type"
            value={buildingInfo.buildingType}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="text"
            name="location"
            label="Location"
            placeholder="Warehouse 01, UK"
            value={buildingInfo.location}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="text"
            name="area"
            label="Area"
            placeholder="Sq Ft"
            value={buildingInfo.area}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="number"
            name="totalFloors"
            label="Total Floors"
            placeholder="45"
            value={buildingInfo.totalFloors}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="number"
            name="totalRestrooms"
            label="Total Restrooms"
            placeholder="3"
            value={buildingInfo.totalRestrooms}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="text"
            name="buildingManager"
            label="Building Manager"
            placeholder="John Doe"
            value={buildingInfo.buildingManager}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="text"
            name="phone"
            label="Phone"
            placeholder="+44 123 4567 890"
            value={buildingInfo.phone}
            onChange={buildingInfoChangeHandler}
          />

          <div className="lg:col-span-3 flex justify-end">
            <Button text="Update Building" width="!w-[250px]" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBuildingById;
