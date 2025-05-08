"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBuilding } from "@/features/building/buildingSlice";
import Button from "@/components/global/small/Button";
import Input from "@/components/global/small/Input";
import UploadBuildingImage from "./UploadBuildingImage";
import toast from "react-hot-toast";
import { getFileCache, setFileCache } from "@/utils/fileStore";

const GeneralInfo = ({ setCurrentStep }) => {
  const dispatch = useDispatch();
  const building = useSelector((state) => state.building);
  console.log("building", building);

  const [image, setImage] = useState({
    file: null,
    imagePreview: null,
  });
  console.log("image", image);

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

  // Load redux values into form on mount
  useEffect(() => {
    if (building) {
      setBuildingInfo({
        buildingName: building.buildingName || "",
        buildingType: building.buildingType || "",
        location: building.location || "",
        area: building.area || "",
        totalFloors: building.totalFloors || "",
        totalRestrooms: building.totalRestrooms || "",
        buildingManager: building.buildingManager || "",
        phone: building.phone || "",
      });

      if (building.buildingImage) {
        setImage({
          file: getFileCache("buildingImage"),
          imagePreview: building.buildingImage,
        });
      }
    }
  }, [building]);

  const buildingInfoChangeHandler = (e) => {
    const { name, value } = e.target;
    setBuildingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextBtnHandler = (e) => {
    e.preventDefault();

    const hasEmptyField = Object.values(buildingInfo).some(
      (val) => !val?.toString().trim()
    );
    const hasImage = !!(image?.file || image?.imagePreview);

    if (hasEmptyField || !hasImage) {
      toast.error("Please fill all fields and upload building image.");
      return;
    }

    dispatch(
      setBuilding({
        ...buildingInfo,
        buildingImage: image.imagePreview,
      })
    );
    setFileCache("buildingImage", image.file);
    setCurrentStep((s) => s + 1);
  };

  return (
    <div>
      <h6 className="text-base text-primary font-medium">
        General Information
      </h6>
      <form
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mt-5"
        onSubmit={nextBtnHandler}
      >
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
          <Button text="Next" width="!w-[150px]" type="submit" />
        </div>
      </form>
    </div>
  );
};

export default GeneralInfo;
