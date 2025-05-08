import Button from "@/components/global/small/Button";
import MarkBuildingModel from "./MarkBuildingModel";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBuilding } from "@/features/building/buildingSlice";
import { setFileCache } from "@/utils/fileStore";
import toast from "react-hot-toast";

const BuildingModel = ({ setCurrentStep }) => {
  const dispatch = useDispatch();
  const [buildingModelImage, setBuildingModelImage] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [file, setFile] = useState(null);
  const building = useSelector((state) => state.building);

  const nextBtnHandler = () => {
    if (polygons.length > 0 && buildingModelImage) {
      // Store the file in cache
      if (file) {
        setFileCache("buildingModelImage", file);
      }

      // Update Redux store
      dispatch(
        setBuilding({
          buildingModelPreview: buildingModelImage,
          buildingModelCoordinates: polygons,
        })
      );

      // Proceed to next step
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      toast.error(
        "Please upload a building model image and mark at least one floor"
      );
    }
  };

  useEffect(() => {
    if (building?.buildingModelPreview && building?.buildingModelCoordinates) {
      setBuildingModelImage(building?.buildingModelPreview);
      setPolygons(building.buildingModelCoordinates);
    }
  }, [building]);

  return (
    <div>
      <h6 className="text-base text-primary font-medium">Building Model</h6>
      <p className="text-sm text-gray-600 mt-2">
        Upload your building model and mark each floor by creating a polygon.
        Each polygon needs a floor ID/name which will be used to identify the
        floor.
      </p>

      <div className="py-10 grid place-items-center">
        <MarkBuildingModel
          setFile={setFile}
          buildingModelImage={buildingModelImage}
          setBuildingModelImage={setBuildingModelImage}
          polygons={polygons}
          setPolygons={setPolygons}
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button
          text="Back"
          width="!w-[150px]"
          onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
        />
        <Button text="Next" width="!w-[150px]" onClick={nextBtnHandler} />
      </div>
    </div>
  );
};

export default BuildingModel;
