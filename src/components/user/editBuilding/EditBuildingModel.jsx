import Button from '@/components/global/small/Button';
import MarkBuildingModel from '../addBuilding/MarkBuildingModel';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBuilding, setModelEdited, setApiData } from '@/features/building/buildingSlice';
import { setFileCache } from '@/utils/fileStore';
import toast from 'react-hot-toast';
import { useGetBuildingWithRestroomsQuery } from '@/features/building/buildingApi';

const EditBuildingModel = ({ setCurrentStep, buildingId }) => {
  const dispatch = useDispatch();
  const [buildingModelPreview, setBuildingModelPreview] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [file, setFile] = useState(null);
  const building = useSelector((state) => state.building);
  console.log('modelbuilding', building);

  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);

  const [existingApiPolygons, setExistingApiPolygons] = useState([]);
  const [apiNumberOfRooms, setApiNumberOfRooms] = useState(0);

  // 🟢 Load API data
  useEffect(() => {
    if (building.isModelEdit === true) return;
    if (editData?.data?.building) {
      const b = editData.data.building;

      // Store API data in Redux
      dispatch(setApiData(editData.data));

      setApiNumberOfRooms(Number(b?.numberOfRooms || 0));

      if (b.buildingModelImage?.url) setBuildingModelPreview(b.buildingModelImage.url);
      if (b.buildingCoordinates?.length > 0) {
        setPolygons(b.buildingCoordinates);
        setExistingApiPolygons(b.buildingCoordinates);
      }

      dispatch(
        setBuilding({
          buildingModelPreview: b.buildingModelImage?.url || null,
          buildingModelImage: null,
          buildingModelCoordinates: b.buildingCoordinates || [],
        })
      );
      dispatch(setModelEdited(true));
    }
  }, [editData, dispatch]);

  // 🟢 Update Redux when local changes happen
  useEffect(() => {
    if (buildingModelPreview !== null) {
      dispatch(setBuilding({ buildingModelPreview }));
    }
  }, [buildingModelPreview, dispatch]);

  useEffect(() => {
    if (file) {
      dispatch(setBuilding({ buildingModelImage: file }));
    }
  }, [file, dispatch]);

  // 🟣 Limit polygons to totalRestrooms
  const handlePolygonsChange = (newPolygons) => {
    const totalRestrooms = Number(building?.totalRestrooms || 0);
    const existingCount = existingApiPolygons.length;
    const allowedExtra = totalRestrooms - apiNumberOfRooms; // how many new polygons can be added
    const maxAllowed = existingCount + allowedExtra;

    if (newPolygons.length > maxAllowed) {
      toast.error(`You can only add ${allowedExtra} new restroom${allowedExtra !== 1 ? 's' : ''}.`);
      return;
    }

    setPolygons(newPolygons);
    dispatch(setBuilding({ buildingModelCoordinates: newPolygons }));
  };

  // 🟢 When building store updates, sync preview/polygons
  useEffect(() => {
    if (building?.buildingModelPreview && building?.buildingModelCoordinates) {
      setBuildingModelPreview(building.buildingModelPreview);
      setPolygons(building.buildingModelCoordinates);
    }
    if (building?.buildingModelImage) {
      setFile(building.buildingModelImage);
    }
  }, [building]);

  const nextBtnHandler = () => {
    if (polygons.length > 0 && buildingModelPreview) {
      if (file) setFileCache('buildingModelPreview', file);
      dispatch(
        setBuilding({
          buildingModelPreview,
          buildingModelImage: file,
          buildingModelCoordinates: polygons,
        })
      );
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      toast.error('Please upload a building model image and mark at least one restroom.');
    }
  };

  return (
    <div>
      {/* Display API Data */}
      {building.apiData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h6 className="text-sm font-medium text-gray-700 mb-3">API Data Overview</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p><strong>Building:</strong> {building.apiData.building?.name || 'N/A'}</p>
              <p><strong>Type:</strong> {building.apiData.building?.type || 'N/A'}</p>
              <p><strong>Location:</strong> {building.apiData.building?.location || 'N/A'}</p>
              <p><strong>Total Restrooms:</strong> {building.apiData.building?.numberOfRooms || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Latitude:</strong> {building.apiData.building?.latitude || 'N/A'}</p>
              <p><strong>Longitude:</strong> {building.apiData.building?.longitude || 'N/A'}</p>
              <p><strong>Total Floors:</strong> {building.apiData.building?.totalFloors || 'N/A'}</p>
              <p><strong>Manager:</strong> {building.apiData.building?.buildingManager || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-3">
            <p><strong>Restrooms Count:</strong> {building.apiData.restrooms?.length || 0}</p>
            {building.apiData.restrooms?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">Restroom Details:</p>
                {building.apiData.restrooms.map((restroom, idx) => (
                  <div key={idx} className="text-xs text-gray-600 ml-2">
                    {idx + 1}. {restroom.name || 'Unnamed'} - {restroom.type || 'No type'} - {restroom.status || 'No status'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <h6 className="text-base text-primary font-medium">Building Model</h6>
      <p className="text-sm text-gray-600 mt-2">
        You can only create up to <b>{building?.totalRestrooms}</b> restrooms. ({apiNumberOfRooms}{' '}
        already exist in this building)
      </p>

      <div className="py-10 grid place-items-center">
        <MarkBuildingModel
          setFile={setFile}
          buildingModelImage={buildingModelPreview}
          setBuildingModelImage={setBuildingModelPreview}
          polygons={polygons}
          setPolygons={handlePolygonsChange}
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

export default EditBuildingModel;
