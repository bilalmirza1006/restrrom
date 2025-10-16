'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import Map from '../addBuilding/Map';
import {
  setBuilding,
  setMapEdited,
  setUserEdited,
  setApiData,
} from '@/features/building/buildingSlice';
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
