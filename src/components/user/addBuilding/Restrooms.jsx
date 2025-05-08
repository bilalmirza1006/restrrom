"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/global/small/Button";
import Input from "@/components/global/small/Input";
import Dropdown from "@/components/global/small/Dropdown";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { useGetAllSensorsQuery } from "@/features/sensor/sensorApi";
import MarkRestroomModel from "./MarkRestroomModel";
import {
  setRestrooms,
  updateRestroom,
} from "@/features/building/buildingSlice";
import { getFileCache, setFileCache } from "@/utils/fileStore";
import toast from "react-hot-toast";

const Restrooms = ({ setCurrentStep }) => {
  const dispatch = useDispatch();
  const building = useSelector((state) => state.building);
  const { data: sensorsData, isLoading } = useGetAllSensorsQuery();

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [restroomData, setRestroomData] = useState([]);
  const [availableSensors, setAvailableSensors] = useState([]);

  // Transform and set sensor data for dropdowns
  useEffect(() => {
    if (sensorsData?.data) {
      // Transform API data for dropdown use
      const formattedSensors = sensorsData.data.map((sensor) => ({
        label: `${sensor.id} - ${sensor.name}`,
        value: sensor.id,
      }));
      setAvailableSensors(formattedSensors);
    }
  }, [sensorsData]);

  // Initialize restroom data based on totalRestrooms from redux
  useEffect(() => {
    if (
      building?.totalRestrooms &&
      (!restroomData.length ||
        restroomData.length !== parseInt(building.totalRestrooms))
    ) {
      // If we already have restrooms in redux, use them
      if (building.restrooms && building.restrooms.length) {
        setRestroomData(building.restrooms);
      } else {
        // Otherwise create empty placeholders based on totalRestrooms
        const initialRestroomData = Array.from({
          length: parseInt(building.totalRestrooms),
        }).map((_, index) => ({
          name: `Restroom ${index + 1}`,
          type: "",
          status: "",
          area: "",
          toilets: "",
          restroomImage: null,
          restroomCoordinates: [],
        }));
        setRestroomData(initialRestroomData);
      }
    }
  }, [building?.totalRestrooms, building.restrooms]);

  // Filter out sensors already used in any restroom
  useEffect(() => {
    if (restroomData.length && availableSensors.length) {
      // Extract all sensors used across all restrooms
      const usedSensors = restroomData
        .flatMap(
          (restroom) =>
            restroom.restroomCoordinates?.map((polygon) => polygon.sensor) || []
        )
        .filter((sensor) => sensor && sensor !== "No sensor");

      // Filter available sensors
      const filteredSensors = availableSensors.filter(
        (sensor) => !usedSensors.includes(sensor.value)
      );

      setAvailableSensors(filteredSensors);
    }
  }, [restroomData]);

  const toggleAccordion = (index) => {
    // If we're closing an accordion, save its data first
    if (activeAccordion === index) {
      saveRestroomData(index);
    }
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleRestroomChange = (index, field, value) => {
    const updatedRestroomData = [...restroomData];
    updatedRestroomData[index] = {
      ...updatedRestroomData[index],
      [field]: value,
    };
    setRestroomData(updatedRestroomData);
  };

  const handleImageChange = (index, image, file, coordinates) => {
    const updatedRestroomData = [...restroomData];

    if (image) {
      updatedRestroomData[index] = {
        ...updatedRestroomData[index],
        restroomImage: image,
      };
    }

    if (coordinates) {
      updatedRestroomData[index] = {
        ...updatedRestroomData[index],
        restroomCoordinates: coordinates,
      };
    }

    setRestroomData(updatedRestroomData);

    // Cache the file for later use
    if (file) {
      setFileCache(`restroom-${index}`, file);
    }
  };

  const saveRestroomData = (index) => {
    const restroom = restroomData[index];

    // Validate required fields
    if (
      !restroom.name ||
      !restroom.type ||
      !restroom.status ||
      !restroom.area ||
      !restroom.toilets
    ) {
      toast.error("Please fill all required fields for this restroom");
      return false;
    }

    // Update single restroom in Redux
    dispatch(
      updateRestroom({
        index,
        data: restroom,
      })
    );

    toast.success(`${restroom.name} data saved`);
    return true;
  };

  const saveBuilding = () => {
    // Validate all restrooms have required fields
    const isRestroomDataComplete = restroomData.every(
      (restroom) =>
        restroom.name &&
        restroom.type &&
        restroom.status &&
        restroom.area &&
        restroom.toilets
    );

    if (!isRestroomDataComplete) {
      toast.error("Please fill all required fields for all restrooms");
      return;
    }

    // Save to redux
    dispatch(setRestrooms(restroomData));

    // TODO: Add API call to save the building with all information
    console.log("Building saved:", { ...building, restrooms: restroomData });
    toast.success("Building data saved successfully");
  };

  if (!restroomData.length) {
    return (
      <div className="py-10 text-center">
        <p>
          No restrooms to display. Please add restrooms in the General
          Information step.
        </p>
        <div className="flex items-center justify-end gap-4 mt-5">
          <Button
            text="Back"
            width="!w-[150px]"
            onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
            cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h6 className="text-base text-primary font-medium">Restrooms</h6>
      <div className="py-6">
        {restroomData.map((restroom, index) => (
          <div
            key={index}
            className="border border-[#DFDFDF] rounded-md mb-4 overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <h6 className="font-medium">
                {restroom.name || `Restroom ${index + 1}`}
              </h6>
              <span>
                {activeAccordion === index ? (
                  <BiChevronUp size={20} />
                ) : (
                  <BiChevronDown size={20} />
                )}
              </span>
            </div>

            {activeAccordion === index && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Restroom Name"
                    placeholder="Enter name"
                    value={restroom.name || ""}
                    onChange={(e) =>
                      handleRestroomChange(index, "name", e.target.value)
                    }
                  />

                  <Dropdown
                    label="Type"
                    placeholder="Select type"
                    value={restroom.type}
                    setValue={(value) =>
                      handleRestroomChange(index, "type", value)
                    }
                    options={[
                      { label: "Public", value: "public" },
                      { label: "Private", value: "private" },
                    ]}
                  />

                  <Dropdown
                    label="Status"
                    placeholder="Select status"
                    value={restroom.status}
                    setValue={(value) =>
                      handleRestroomChange(index, "status", value)
                    }
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                  />

                  <Input
                    label="Area (sq ft)"
                    placeholder="Enter area"
                    type="number"
                    value={restroom.area || ""}
                    onChange={(e) =>
                      handleRestroomChange(index, "area", e.target.value)
                    }
                  />

                  <Input
                    label="Number of Toilets"
                    placeholder="Enter toilets"
                    type="number"
                    value={restroom.toilets || ""}
                    onChange={(e) =>
                      handleRestroomChange(index, "toilets", e.target.value)
                    }
                  />
                </div>

                <div className="mt-6">
                  <h6 className="font-medium mb-3">Restroom Layout</h6>
                  <div className="py-4 grid place-items-center">
                    <MarkRestroomModel
                      restroomIndex={index}
                      setFile={(file) =>
                        handleImageChange(index, null, file, null)
                      }
                      restroomImage={restroom.restroomImage}
                      setRestroomImage={(image) =>
                        handleImageChange(index, image, null, null)
                      }
                      polygons={restroom.restroomCoordinates || []}
                      setPolygons={(coordinates) =>
                        handleImageChange(index, null, null, coordinates)
                      }
                      availableSensors={availableSensors}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    text="Save Restroom"
                    width="!w-[160px]"
                    onClick={() => saveRestroomData(index)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button
          text="Back"
          width="!w-[150px]"
          onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
        />
        <Button
          text="Save Building"
          width="!w-[200px]"
          onClick={saveBuilding}
        />
      </div>
    </div>
  );
};

export default Restrooms;
