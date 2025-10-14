'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import Map from '../addBuilding/Map';
import { setBuilding, setMapEdited, setUserEdited, setApiData } from '@/features/building/buildingSlice';
import {
  useGetBuildingEditDataQuery,
  useGetBuildingWithRestroomsQuery,
} from '@/features/building/buildingApi';

const EditMapping = ({ setCurrentStep, buildingId }) => {
  const [mapping, setMapping] = useState({
    lat: '',
    lng: '',
  });
  const building = useSelector((state) => state.building);
  const dispatch = useDispatch();
  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
  const backHandler = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };
  const mappingChangeHandler = (e) => {
    const { name, value } = e.target;
    setMapping((prev) => ({
      ...prev,
      [name]: value,
    }));
    const nextMapping = { ...mapping, [name]: value };
    dispatch(setBuilding({ mapInfo: nextMapping }));
    dispatch(setUserEdited(true));
  };

  const nextBtnHandler = () => {
    if (mapping.lat && mapping.lng) {
      dispatch(setBuilding({ mapInfo: mapping }));
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      toast.error('Please enter lat and lng');
    }
  };

  // Load existing mapping data
  useEffect(() => {
    if (building.isMapEdit === true) return;

    if (!building.isUserEdited && editData?.data?.building) {
      // 🧠 only if user hasn't edited
      const buildingData = editData.data.building;

      // Store API data in Redux
      dispatch(setApiData(editData.data));

      const mapData = {
        lat: buildingData.latitude || '',
        lng: buildingData.longitude || '',
      };
      setMapping(mapData);
      dispatch(setBuilding({ mapInfo: mapData }));
      dispatch(setMapEdited(true));
    }
  }, [editData, dispatch, building.isUserEdited]);

  useEffect(() => {
    if (building?.mapInfo?.lat && building?.mapInfo?.lng) {
      setMapping(building?.mapInfo);
    }
  }, [building?.mapInfo]);

  console.log('building', building);

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

      <div>
        <h6 className="text-base text-primary font-medium">Mapping</h6>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mt-5">
          <Input
            type="text"
            name="lat"
            label="Latitude"
            placeholder="Latitude"
            value={mapping.lat}
            onChange={mappingChangeHandler}
          />
          <Input
            type="text"
            name="lng"
            label="Longitude"
            placeholder="Longitude"
            value={mapping.lng}
            onChange={mappingChangeHandler}
          />
        </div>
        <div className="mt-5">
          <Map lat={mapping.lat} lng={mapping.lng} />
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
    </div>
  );
};

export default EditMapping;
