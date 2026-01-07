'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Input from '@/components/global/small/Input';
import Button from '@/components/global/small/Button';
import Map from './Map';
import { setBuilding } from '@/features/building/buildingSlice';

const Mapping = ({ setCurrentStep }) => {
  const [mapping, setMapping] = useState({
    lat: '',
    lng: '',
  });
  const building = useSelector(state => state.building);
  const dispatch = useDispatch();

  const mappingChangeHandler = e => {
    const { name, value } = e.target;
    setMapping(prev => ({
      ...prev,
      [name]: value,
    }));
    const nextMapping = { ...mapping, [name]: value };
    dispatch(setBuilding({ mapInfo: nextMapping }));
  };

  const nextBtnHandler = () => {
    if (mapping.lat && mapping.lng) {
      dispatch(setBuilding({ mapInfo: mapping }));
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      toast.error('Please enter lat and lng');
    }
  };

  useEffect(() => {
    if (building?.mapInfo.lat && building?.mapInfo.lng) {
      setMapping(building?.mapInfo);
    }
  }, [building?.mapInfo]);

  console.log('building', building);

  return (
    <div>
      <h6 className="text-primary text-base font-medium">Maping</h6>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Input
          type="number"
          name="lat"
          label="Latitude"
          placeholder="Enter Latitude"
          value={mapping.lat}
          onChange={mappingChangeHandler}
        />
        <Input
          type="number"
          label="Longitude"
          name="lng"
          placeholder="Enter Longitude"
          value={mapping.lng}
          onChange={mappingChangeHandler}
        />
      </div>

      <div className="mt-4 lg:col-span-2">
        <div className="h-81.25 rounded-lg shadow-md">
          <Map lat={mapping.lat} lng={mapping.lng} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
        <Button
          text="Back"
          width="!w-[150px]"
          onClick={() => setCurrentStep(prevStep => prevStep - 1)}
          cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
        />
        <Button text="Next" width="!w-[150px]" onClick={nextBtnHandler} />
      </div>
    </div>
  );
};

export default Mapping;
