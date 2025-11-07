'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBuilding, setGeneralEdited, setApiData } from '@/features/building/buildingSlice';
import Button from '@/components/global/small/Button';
import Input from '@/components/global/small/Input';
import UploadBuildingImage from '../addBuilding/UploadBuildingImage';
import toast from 'react-hot-toast';
import { getFileCache, setFileCache } from '@/utils/fileStore';
import {
  useGetBuildingEditDataQuery,
  useGetBuildingWithRestroomsQuery,
} from '@/features/building/buildingApi';

const EditGeneralInfo = ({ setCurrentStep, buildingId }) => {
  const dispatch = useDispatch();
  const building = useSelector(state => state.building);
  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);

  const [image, setImage] = useState({ file: null, imagePreview: null });
  const [minRestroomCount, setMinRestroomCount] = useState(0); // 🆕 new state
  const [buildingInfo, setBuildingInfo] = useState({
    buildingName: '',
    buildingType: '',
    location: '',
    area: '',
    totalFloors: '',
    totalRestrooms: '2',
    buildingManager: '',
    phone: '',
  });

  // 🆕 Modified handler
  const buildingInfoChangeHandler = e => {
    const { name, value } = e.target;

    // Restrict only for restroom field
    if (name === 'totalRestrooms') {
      const numVal = parseInt(value, 10) || 0;

      // Prevent decrease below minRestroomCount
      if (numVal < minRestroomCount) return;

      // Allow increase only
      setBuildingInfo(prev => ({ ...prev, [name]: numVal.toString() }));
      return;
    }

    setBuildingInfo(prev => ({ ...prev, [name]: value }));
  };

  const nextBtnHandler = e => {
    e.preventDefault();
    const hasEmptyField = Object.values(buildingInfo).some(val => !val?.toString().trim());
    const hasImage = !!(image?.file || image?.imagePreview);
    if (hasEmptyField || !hasImage)
      return toast.error('Please fill all fields and upload building image.');

    dispatch(
      setBuilding({
        ...buildingInfo,
        buildingImage: image.imagePreview,
        buildingThumbnail: image.file,
        isEditMode: true,
        buildingId: buildingId,
      })
    );
    setFileCache('buildingImage', image.file);
    setCurrentStep(s => s + 1);
  };

  // Load existing building data
  useEffect(() => {
    if (building.isGeneralEdit === true) return;

    if (editData?.data?.building) {
      const buildingData = editData.data.building;

      // 🆕 Get restroom polygons count from API
      const restroomCount = buildingData?.restrooms?.length || 0;
      setMinRestroomCount(restroomCount);

      dispatch(setApiData(editData.data));

      setBuildingInfo({
        buildingName: buildingData.name || '',
        buildingType: buildingData.type || '',
        location: buildingData.location || '',
        area: buildingData.area || '',
        totalFloors: buildingData.totalFloors?.toString() || '',
        totalRestrooms: buildingData.numberOfRooms?.toString() || restroomCount.toString() || '2',
        buildingManager: buildingData.buildingManager || '',
        phone: buildingData.phone || '',
      });

      if (buildingData.buildingThumbnail?.url) {
        setImage({
          file: null,
          imagePreview: buildingData.buildingThumbnail.url,
        });
      }

      dispatch(
        setBuilding({
          buildingName: buildingData.name || '',
          buildingType: buildingData.type || '',
          location: buildingData.location || '',
          area: buildingData.area || '',
          totalFloors: buildingData.totalFloors?.toString() || '',
          totalRestrooms: buildingData.numberOfRooms?.toString() || restroomCount.toString() || '2',
          buildingManager: buildingData.buildingManager || '',
          phone: buildingData.phone || '',
          buildingImage: buildingData.buildingThumbnail?.url || '',
          buildingThumbnail: null,
          isEditMode: true,
          buildingId: buildingId,
        })
      );
      dispatch(setGeneralEdited(true));
    }
  }, [editData, dispatch, buildingId]);

  // 🆕 Update when restroom polygons change in redux (step 2 deletes one)
  useEffect(() => {
    if (building.apiData?.restrooms) {
      const count = building.apiData.restrooms.length;
      setMinRestroomCount(count);

      // Ensure input value is never below polygon count
      setBuildingInfo(prev => ({
        ...prev,
        totalRestrooms: Math.max(parseInt(prev.totalRestrooms || 0), count).toString(),
      }));
    }
  }, [building.apiData?.restrooms]);

  // Load redux values
  useEffect(() => {
    if (building && building.isEditMode) {
      setBuildingInfo({
        buildingName: building.buildingName || '',
        buildingType: building.buildingType || '',
        location: building.location || '',
        area: building.area || '',
        totalFloors: building.totalFloors || '',
        totalRestrooms: building.totalRestrooms || '2',
        buildingManager: building.buildingManager || '',
        phone: building.phone || '',
      });

      if (building.buildingImage) {
        setImage({
          file: getFileCache('buildingImage'),
          imagePreview: building.buildingImage,
        });
      }
    }
  }, [building]);

  return (
    <div>
      <div>
        <h6 className="text-primary text-base font-medium">General Information</h6>
        <form
          className="mt-5 grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3"
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
            placeholder="Total Floors"
            value={buildingInfo.totalFloors}
            onChange={buildingInfoChangeHandler}
          />

          {/* 🆕 Only increase possible, no decrease below minRestroomCount */}
          <Input
            type="number"
            name="totalRestrooms"
            label={`Total Restrooms (min ${minRestroomCount})`}
            placeholder="Total Restrooms"
            value={buildingInfo.totalRestrooms}
            onChange={buildingInfoChangeHandler}
            min={minRestroomCount}
          />

          <Input
            type="text"
            name="buildingManager"
            label="Building Manager"
            placeholder="Building Manager"
            value={buildingInfo.buildingManager}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="text"
            name="phone"
            label="Phone"
            placeholder="Phone"
            value={buildingInfo.phone}
            onChange={buildingInfoChangeHandler}
          />

          <div className="flex justify-end lg:col-span-3">
            <Button text="Next" width="!w-[150px]" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGeneralInfo;
