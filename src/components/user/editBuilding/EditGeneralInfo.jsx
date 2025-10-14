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
  const building = useSelector((state) => state.building);
  // const { data: editData } = useGetBuildingEditDataQuery(buildingId);
  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
  console.log('generalbuilding', building);
  console.log('building.isGeneralEdit', building.isGeneralEdit);

  const [image, setImage] = useState({ file: null, imagePreview: null });
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

  const buildingInfoChangeHandler = (e) => {
    const { name, value } = e.target;
    setBuildingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const nextBtnHandler = (e) => {
    e.preventDefault();
    const hasEmptyField = Object.values(buildingInfo).some((val) => !val?.toString().trim());
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
    setCurrentStep((s) => s + 1);
  };

  // Load existing building data
  useEffect(() => {
    if (building.isGeneralEdit === true) return;
    console.log('api data');

    if (editData?.data?.building) {
      const buildingData = editData.data.building;

      // Store API data in Redux
      dispatch(setApiData(editData.data));

      setBuildingInfo({
        buildingName: buildingData.name || '',
        buildingType: buildingData.type || '',
        location: buildingData.location || '',
        area: buildingData.area || '',
        totalFloors: buildingData.totalFloors?.toString() || '',
        totalRestrooms: buildingData.numberOfRooms?.toString() || '2',
        buildingManager: buildingData.buildingManager || '',
        phone: buildingData.phone || '',
      });

      if (buildingData.buildingThumbnail?.url) {
        setImage({
          file: null,
          imagePreview: buildingData.buildingThumbnail.url,
        });
      }

      // Initialize building state with existing data
      dispatch(
        setBuilding({
          buildingName: buildingData.name || '',
          buildingType: buildingData.type || '',
          location: buildingData.location || '',
          area: buildingData.area || '',
          totalFloors: buildingData.totalFloors?.toString() || '',
          totalRestrooms: buildingData.numberOfRooms?.toString() || '2',
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

  // Load redux values
  useEffect(() => {
    console.log('building.isGeneralEdit');

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
        <h6 className="text-base text-primary font-medium">General Information</h6>
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
            placeholder="Total Floors"
            value={buildingInfo.totalFloors}
            onChange={buildingInfoChangeHandler}
          />
          <Input
            type="number"
            name="totalRestrooms"
            label="Total Restrooms"
            placeholder="Total Restrooms"
            value={buildingInfo.totalRestrooms}
            onChange={buildingInfoChangeHandler}
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

          <div className="lg:col-span-3 flex justify-end">
            <Button text="Next" width="!w-[150px]" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGeneralInfo;
