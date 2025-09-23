'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/global/small/Button';
import Input from '@/components/global/small/Input';
import Dropdown from '@/components/global/small/Dropdown';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
import MarkRestroomModel from './MarkRestroomModel';
import { setRestrooms, updateRestroom } from '@/features/building/buildingSlice';
import { getFileCache, setFileCache } from '@/utils/fileStore';
import toast from 'react-hot-toast';
import {
  useCreateBuildingMutation,
  useDeleteBuildingMutation,
} from '@/features/building/buildingApi';
import { useCreateMultipleRestroomsMutation } from '@/features/restroom/restroomApi';

const Restrooms = ({ setCurrentStep }) => {
  const dispatch = useDispatch();
  const building = useSelector((state) => state.building);
  const { data: sensorsData } = useGetAllSensorsQuery();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [availableSensors, setAvailableSensors] = useState([]);
  const [createNewBuilding, { isLoading: createNewBuildingLoading }] = useCreateBuildingMutation();
  const [createMultipleRestrooms, { isLoading: createRestroomsLoading }] =
    useCreateMultipleRestroomsMutation();
  const [deleteBuilding, { isLoading: deleteBuildingLoading }] = useDeleteBuildingMutation();

  const toggleAccordion = (index) => {
    if (activeAccordion === index) {
      saveRestroomData(index);
    }
    setActiveAccordion(activeAccordion === index ? null : index);
  };
  console.log('building', building);

  const handleRestroomChange = (index, field, value) => {
    const updatedRestroom = {
      ...building.restrooms[index],
      [field]: value,
    };
    console.log('updatedRestroom', updatedRestroom);

    dispatch(updateRestroom({ index, data: updatedRestroom }));
  };

  const handleImageChange = (index, image, file, coordinates) => {
    const updatedRestroom = {
      ...building.restrooms[index],
      ...(image && { restroomImage: image }),
      ...(coordinates && { restroomCoordinates: coordinates }),
    };
    dispatch(updateRestroom({ index, data: updatedRestroom }));

    if (file) {
      setFileCache(`restroom-${index}`, file);
    }
  };

  const saveRestroomData = (index) => {
    const restroom = building.restrooms[index];
    if (
      !restroom.name ||
      !restroom.type ||
      !restroom.status ||
      !restroom.area ||
      !restroom.toilets
    ) {
      return toast.error('Please fill all required fields for this restroom');
    }
    toast.success(`${restroom.name} data saved`);
    return true;
  };

  const saveBuilding = async () => {
    let buildingData = {};
    let allRestRooms = [];
    let buildingId = '';

    try {
      buildingData = {
        name: building.buildingName,
        type: building.buildingType,
        location: building.location,
        area: building.area,
        latitude: building.mapInfo?.lat,
        longitude: building.mapInfo?.lng,
        totalFloors: building.totalFloors,
        numberOfRooms: building.totalRestrooms,
        buildingManager: building.buildingManager,
        phone: building.phone,
        buildingThumbnail: building.buildingThumbnail,
        buildingModelImage: building.buildingModelImage,
        buildingCoordinates: building?.buildingModelCoordinates || [],
      };

      const {
        name,
        type,
        location,
        area,
        totalFloors,
        numberOfRooms,
        buildingManager,
        phone,
        latitude,
        longitude,
        buildingCoordinates,
      } = buildingData;

      if (
        !name ||
        !type ||
        !location ||
        !area ||
        !totalFloors ||
        !numberOfRooms ||
        !buildingManager ||
        !phone ||
        !latitude ||
        !longitude ||
        !buildingCoordinates?.length
      ) {
        return toast.error('Please provide all fields');
      }

      allRestRooms = building.restrooms.map((restroom) => {
        const { name, type, status, area, toilets, restroomImage, restroomCoordinates } = restroom;
        if (
          !name ||
          !type ||
          !status ||
          !area ||
          !toilets ||
          !restroomImage ||
          !restroomCoordinates.length
        )
          return toast.error('Please provide all fields');
        restroomCoordinates.forEach((coordinate) => {
          if (
            !coordinate.sensor ||
            !coordinate.color ||
            !coordinate.fillColor ||
            !coordinate.labelPoint ||
            !coordinate?.id
          ) {
            return toast.error('Please Fill all fields for Coordinates Of RestRooms');
          }
        });
        return {
          name,
          type,
          status,
          area,
          numOfToilets: toilets,
          modelImage: restroomImage,
          coordinates: restroomCoordinates,
        };
      });
    } catch (error) {
      toast.error('error in Validation for building and restrooms');
      return console.log('error in Validation for building and restrooms', error);
    }

    try {
      const buildingFormData = new FormData();
      buildingFormData.append('buildingThumbnail', buildingData?.buildingThumbnail);
      buildingFormData.append('buildingModelImage', buildingData?.buildingModelImage);
      buildingFormData.append('name', buildingData?.name);
      buildingFormData.append('type', buildingData?.type);
      buildingFormData.append('location', buildingData?.location);
      buildingFormData.append('area', buildingData?.area);
      buildingFormData.append('totalFloors', buildingData?.totalFloors);
      buildingFormData.append('numberOfRooms', buildingData?.numberOfRooms);
      buildingFormData.append('buildingManager', buildingData?.buildingManager);
      buildingFormData.append('phone', buildingData?.phone);
      buildingFormData.append('longitude', buildingData?.longitude);
      buildingFormData.append('latitude', buildingData?.latitude);
      buildingFormData.append(
        'buildingCoordinates',
        JSON.stringify(buildingData?.buildingCoordinates)
      );
      const res = await createNewBuilding(buildingFormData).unwrap();
      buildingId = res?.data;
      if (!buildingId) return toast.error('error in creating building');
    } catch (error) {
      toast.error('error in building creation');
      return console.log('error in building creation', error);
    }

    try {
      const restRoomsFormData = new FormData();
      restRoomsFormData.append('buildingId', buildingId);
      const roomsMeta = allRestRooms.map(({ modelImage, ...meta }) => meta);
      restRoomsFormData.append('restRooms', JSON.stringify(roomsMeta));
      allRestRooms.forEach((r) => {
        restRoomsFormData.append('restRoomImages', r.modelImage);
      });
      const res = await createMultipleRestrooms(restRoomsFormData).unwrap();
      if (res?.success) toast.success('You Building and all Restrooms added successfully');
    } catch (error) {
      console.log('Error while adding restrooms', error);
      toast.error(error?.data?.message || 'Error while adding restrooms');
      return await deleteBuilding(buildingId).unwrap();
    }

    console.log('building', buildingData);
    console.log('restRoom', allRestRooms);
  };
  const restoreSensor = (sensorId) => {
    const sensor = sensorsData?.data?.find((s) => s._id === sensorId);
    if (sensor) {
      setAvailableSensors((prev) => [...prev, { option: sensor?.name, value: sensor?._id }]);
    }
  };
  useEffect(() => {
    if (sensorsData?.data) {
      const formattedSensors = [];
      sensorsData?.data?.forEach((sensor) => {
        if (!sensor?.isConnected)
          formattedSensors.push({ option: sensor?.name, value: sensor?._id });
      });
      setAvailableSensors(formattedSensors);
    }
  }, [sensorsData]);

  useEffect(() => {
    if (
      building?.totalRestrooms &&
      (!building.restrooms.length ||
        building.restrooms.length !== parseInt(building.totalRestrooms))
    ) {
      const initialRestroomData = Array.from({
        length: parseInt(building.totalRestrooms),
      }).map((_, index) => ({
        name: `Restroom ${index + 1}`,
        type: '',
        status: '',
        area: '',
        toilets: '',
        restroomImage: null,
        restroomCoordinates: [],
      }));

      dispatch(setRestrooms(initialRestroomData));
    }
  }, [building?.totalRestrooms, dispatch]);

  useEffect(() => {
    if (sensorsData?.data) {
      // 1. Collect all sensors already assigned in Redux
      const usedSensors = building.restrooms
        .flatMap((restroom) => restroom.restroomCoordinates?.map((p) => p.sensor) || [])
        .filter(Boolean);

      // 2. Only include sensors that are free (isConnected === false) AND not already assigned
      const formattedSensors = sensorsData.data
        .filter((sensor) => !sensor.isConnected && !usedSensors.includes(sensor._id))
        .map((sensor) => ({
          option: sensor.name,
          value: sensor._id,
        }));

      setAvailableSensors(formattedSensors);
    }
  }, [sensorsData, building.restrooms]);

  if (!building.restrooms.length) {
    return (
      <div className="py-10 text-center">
        <p>No restrooms to display. Please add restrooms in the General Information step.</p>
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
        {building.restrooms?.map((restroom, index) => (
          <div key={index} className="border border-[#DFDFDF] rounded-md mb-4 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <h6 className="font-medium">{restroom.name || `Restroom ${index + 1}`}</h6>
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
                  {/* Name */}
                  <Input
                    label="Restroom Name"
                    placeholder="Enter name"
                    value={restroom.name || ''} // ✅ always read from Redux
                    onChange={(e) => handleRestroomChange(index, 'name', e.target.value)}
                  />

                  {/* Type */}
                  <Dropdown
                    label="Type"
                    placeholder="Select type"
                    initialValue={restroom.type || ''}
                    onSelect={(value) => handleRestroomChange(index, 'type', value)}
                    options={[
                      { option: 'Public', value: 'public' },
                      { option: 'Private', value: 'private' },
                    ]}
                  />

                  {/* Status */}
                  <Dropdown
                    label="Status"
                    placeholder="Select status"
                    initialValue={restroom.status || ''}
                    onSelect={(value) => handleRestroomChange(index, 'status', value)}
                    options={[
                      { option: 'Active', value: 'active' },
                      { option: 'Inactive', value: 'inactive' },
                    ]}
                  />

                  {/* Area */}
                  <Input
                    label="Area (sq ft)"
                    placeholder="Enter area"
                    type="number"
                    value={restroom.area || ''} // ✅ bind to Redux
                    onChange={(e) => handleRestroomChange(index, 'area', e.target.value)}
                  />

                  {/* Toilets */}
                  <Input
                    label="Number of Toilets"
                    placeholder="Enter toilets"
                    type="number"
                    value={restroom.toilets || ''} // ✅ bind to Redux
                    onChange={(e) => handleRestroomChange(index, 'toilets', e.target.value)}
                  />
                </div>
                {/* {restroom.restroomImage && ( // <-- FIX
                  <div className="mb-4">
                    <img
                      src={
                        restroom.restroomImage instanceof File
                          ? URL.createObjectURL(restroom.restroomImage)
                          : restroom.restroomImage
                      }
                      alt="Restroom Preview"
                      className="w-full max-h-[300px] object-contain rounded-md border"
                    />
                  </div>
                )} */}

                {/* Layout */}
                <div className="mt-6">
                  <h6 className="font-medium mb-3">Restroom Layout</h6>
                  <div className="py-4 grid place-items-center">
                    <MarkRestroomModel
                      restroomIndex={index}
                      setFile={(file) => handleImageChange(index, null, file, null)}
                      restroomImage={restroom.restroomImage} // ✅ show uploaded image
                      setRestroomImage={(image) => handleImageChange(index, image, null, null)}
                      polygons={restroom.restroomCoordinates || []} // ✅ show saved polygons
                      setPolygons={(coordinates) =>
                        handleImageChange(index, null, null, coordinates)
                      }
                      availableSensors={availableSensors}
                      updateRestRoomHandler={handleRestroomChange}
                      restoreSensor={restoreSensor}
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
          disabled={createNewBuildingLoading || createRestroomsLoading || deleteBuildingLoading}
          className={`${
            createNewBuildingLoading || createRestroomsLoading || deleteBuildingLoading
              ? 'opacity-30 cursor-not-allowed'
              : ''
          }`}
          text="Save Building"
          width="!w-[200px]"
          onClick={saveBuilding}
        />
      </div>
    </div>
  );
};

export default Restrooms;
