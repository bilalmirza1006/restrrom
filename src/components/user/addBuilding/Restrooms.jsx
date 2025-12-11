'use client';
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/global/small/Button';
import Input from '@/components/global/small/Input';
import Dropdown from '@/components/global/small/Dropdown';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
import MarkRestroomModel from './MarkRestroomModel';
import { removeBuilding, setRestrooms, updateRestroom } from '@/features/building/buildingSlice';
import { getFileCache, setFileCache } from '@/utils/fileStore';
import toast from 'react-hot-toast';
import {
  useCreateBuildingMutation,
  useDeleteBuildingMutation,
  useUpdateBuildingMutation,
} from '@/features/building/buildingApi';
import { useCreateMultipleRestroomsMutation } from '@/features/restroom/restroomApi';
import { useRouter } from 'next/navigation';

const Restrooms = ({ setCurrentStep }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const building = useSelector(state => state.building);
  const { user } = useSelector(state => state.auth);
  const { data: sensorsData } = useGetAllSensorsQuery();

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [availableSensors, setAvailableSensors] = useState([]);

  const [createNewBuilding, { isLoading: createNewBuildingLoading }] = useCreateBuildingMutation();
  const [createMultipleRestrooms, { isLoading: createRestroomsLoading }] =
    useCreateMultipleRestroomsMutation();
  const [deleteBuilding, { isLoading: deleteBuildingLoading }] = useDeleteBuildingMutation();
  const [updateBuilding] = useUpdateBuildingMutation();

  // -----------------------------
  // 🔹 Accordion Toggle
  // -----------------------------
  const toggleAccordion = index => {
    if (activeAccordion === index) saveRestroomData(index);
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // -----------------------------
  // 🔹 Update Restroom Field
  // -----------------------------
  const handleRestroomChange = (index, field, value) => {
    const updatedRestroom = {
      ...building.restrooms[index],
      [field]: value,
    };
    dispatch(updateRestroom({ index, data: updatedRestroom }));
  };

  // -----------------------------
  // 🔹 Handle Restroom Image or Coordinates
  // -----------------------------
  const handleImageChange = (index, image, file, coordinates) => {
    const updatedRestroom = {
      ...building.restrooms[index],
      ...(image && { restroomImage: image }),
      ...(coordinates && { restroomCoordinates: coordinates }),
    };
    dispatch(updateRestroom({ index, data: updatedRestroom }));
    if (file) setFileCache(`restroom-${index}`, file);
  };

  // -----------------------------
  // 🔹 Save Single Restroom Validation
  // -----------------------------
  const saveRestroomData = index => {
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

  // -----------------------------
  // 🔹 Save Full Building + Restrooms
  // -----------------------------
  const saveBuilding = async () => {
    try {
      // ✅ Validate building fields
      const buildingData = {
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
        return toast.error('Please provide all building fields');
      }

      // ✅ Prepare restroom data
      const allRestRooms = building.restrooms.map(restroom => {
        const {
          name,
          restroomId,
          type,
          status,
          area,
          toilets,
          restroomImage,
          restroomCoordinates,
        } = restroom;

        if (
          !name ||
          !type ||
          !status ||
          !area ||
          !toilets ||
          !restroomImage ||
          !restroomCoordinates.length
        ) {
          throw new Error(`Missing fields for ${name || 'a restroom'}`);
        }

        const sanitizedCoordinates = restroomCoordinates.map(coordinate => ({
          ...coordinate,
          polygonId: coordinate?.polygonId || nanoid(),
          labelPoint: coordinate?.labelPoint || 'first',
        }));

        return {
          name,
          restroomId,
          type,
          status,
          area,
          numOfToilets: toilets,
          modelImage: restroomImage,
          coordinates: sanitizedCoordinates,
        };
      });

      // ✅ Create building
      const buildingFormData = new FormData();
      Object.entries(buildingData).forEach(([key, val]) => {
        if (key === 'buildingCoordinates') buildingFormData.append(key, JSON.stringify(val));
        else buildingFormData.append(key, val);
      });

      const res = await createNewBuilding(buildingFormData).unwrap();
      const buildingId = res?.data;
      if (!buildingId) throw new Error('Failed to create building');

      // ✅ Create restrooms
      const restRoomsFormData = new FormData();
      restRoomsFormData.append('buildingId', buildingId);

      const roomsMeta = allRestRooms.map(({ modelImage, ...meta }) => meta);
      restRoomsFormData.append('restRooms', JSON.stringify(roomsMeta));
      allRestRooms.forEach(r => restRoomsFormData.append('restRoomImages', r.modelImage));

      const restroomsRes = await createMultipleRestrooms(restRoomsFormData).unwrap();
      if (restroomsRes?.success) toast.success('Building and all restrooms added successfully');

      // ✅ Attach restroom IDs to polygons
      try {
        const createdRestrooms = restroomsRes?.data || [];
        const updatedPolygons = (building?.buildingModelCoordinates || []).map(poly => {
          const match = createdRestrooms.find(r => r?.name === (poly?.restroomName || ''));
          return match ? { ...poly, restroomId: match?._id } : poly;
        });
        const updateForm = new FormData();
        updateForm.append('buildingCoordinates', JSON.stringify(updatedPolygons));
        await updateBuilding({ buildingId, data: updateForm }).unwrap();
      } catch (err) {
        console.warn('Failed to attach restroomId to building polygons', err);
      }

      // ✅ Redirect user
      if (user?.role === 'admin') {
        setTimeout(() => {
          router.push('/admin/buildings');
          dispatch(removeBuilding());
        }, 1500);
      }
    } catch (error) {
      console.error('Error while saving building:', error);
      toast.error(error?.data?.message || error.message || 'Save failed');
    }
  };

  // -----------------------------
  // 🔹 Restore sensor logic
  // -----------------------------
  const restoreSensor = sensorId => {
    const sensor = sensorsData?.data?.find(s => s._id === sensorId);
    if (sensor)
      setAvailableSensors(prev => [...prev, { option: sensor?.name, value: sensor?._id }]);
  };

  // -----------------------------
  // 🔹 Load sensors
  // -----------------------------
  useEffect(() => {
    if (sensorsData?.data) {
      const formattedSensors = sensorsData.data
        .filter(sensor => !sensor.isConnected)
        .map(sensor => ({
          option: sensor.name,
          value: sensor._id,
        }));
      setAvailableSensors(formattedSensors);
    }
  }, [sensorsData]);

  // -----------------------------
  // 🔹 Initialize restrooms
  // -----------------------------
  useEffect(() => {
    const polygons = building?.buildingModelCoordinates || [];
    if (polygons.length) {
      const initial = polygons.map((poly, index) => ({
        name: poly?.restroomName || `Restroom ${index + 1}`,
        restroomId: poly?.id || '',
        type: '',
        status: '',
        area: '',
        toilets: '',
        restroomImage: null,
        restroomCoordinates: [],
      }));
      dispatch(setRestrooms(initial));
      return;
    }

    // If polygons not available
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
  }, [
    building?.totalRestrooms,
    building?.buildingModelCoordinates,
    building?.restrooms.length,
    dispatch,
  ]);

  // -----------------------------
  // 🔹 Render
  // -----------------------------
  if (!building.restrooms.length) {
    return (
      <div className="py-10 text-center">
        <p>No restrooms to display. Please add restrooms in the General Information step.</p>
        <div className="mt-5 flex items-center justify-end gap-4">
          <Button
            text="Back"
            width="!w-[150px]"
            onClick={() => setCurrentStep(prevStep => prevStep - 1)}
            cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h6 className="text-primary text-base font-medium">Restrooms</h6>
      <div className="py-6">
        {building.restrooms?.map((restroom, index) => (
          <div key={index} className="mb-4 overflow-hidden rounded-md border border-[#DFDFDF]">
            {/* Header */}
            <div
              className="flex cursor-pointer items-center justify-between bg-[#F5F5F5] px-4 py-3"
              onClick={() => toggleAccordion(index)}
            >
              <h6 className="font-medium">{restroom.name || `Restroom ${index + 1}`}</h6>
              {activeAccordion === index ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
            </div>

            {/* Accordion Body */}
            {activeAccordion === index && (
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Restroom Name"
                    placeholder="Auto-filled from model"
                    value={restroom.name || ''}
                    readOnly
                  />
                  <Input
                    label="Restroom ID"
                    placeholder="Auto-filled from model"
                    value={restroom.restroomId || 'N/A'}
                    readOnly
                  />

                  <Dropdown
                    label="Type"
                    placeholder="Select type"
                    initialValue={restroom.type || ''}
                    onSelect={value => handleRestroomChange(index, 'type', value)}
                    options={[
                      { option: 'Public', value: 'public' },
                      { option: 'Private', value: 'private' },
                    ]}
                  />

                  <Dropdown
                    label="Status"
                    placeholder="Select status"
                    initialValue={restroom.status || ''}
                    onSelect={value => handleRestroomChange(index, 'status', value)}
                    options={[
                      { option: 'Active', value: 'active' },
                      { option: 'Inactive', value: 'inactive' },
                    ]}
                  />

                  <Input
                    label="Area (sq ft)"
                    placeholder="Enter area"
                    type="number"
                    value={restroom.area || ''}
                    onChange={e => handleRestroomChange(index, 'area', e.target.value)}
                  />

                  <Input
                    label="Number of Toilets"
                    placeholder="Enter toilets"
                    type="number"
                    value={restroom.toilets || ''}
                    onChange={e => handleRestroomChange(index, 'toilets', e.target.value)}
                  />
                </div>

                <div className="mt-6">
                  <h6 className="mb-3 font-medium">Restroom Layout</h6>
                  <div className="grid place-items-center py-4">
                    <MarkRestroomModel
                      restroomIndex={index}
                      setFile={file => handleImageChange(index, null, file, null)}
                      restroomImage={restroom.restroomImage}
                      setRestroomImage={image => handleImageChange(index, image, null, null)}
                      polygons={restroom.restroomCoordinates || []}
                      setPolygons={coordinates => handleImageChange(index, null, null, coordinates)}
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
          onClick={() => setCurrentStep(prevStep => prevStep - 1)}
          cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
        />
        <Button
          disabled={createNewBuildingLoading || createRestroomsLoading || deleteBuildingLoading}
          className={`${
            createNewBuildingLoading || createRestroomsLoading || deleteBuildingLoading
              ? 'cursor-not-allowed opacity-30'
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
