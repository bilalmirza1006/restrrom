'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import Button from '@/components/global/small/Button';
import Input from '@/components/global/small/Input';
import Dropdown from '@/components/global/small/Dropdown';
import MarkRestroomModel from '../addBuilding/MarkRestroomModel';
import {
  useGetBuildingWithRestroomsQuery,
  useUpdateBuildingMutation,
} from '@/features/building/buildingApi';
import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
import {
  useUpdateRestroomMutation,
  useDeleteRestroomMutation,
  useCreateRestroomMutation,
} from '@/features/restroom/restroomApi';
import {
  setUserEdited,
  setApiData,
  setRestrooms,
  resetBuildingState,
} from '@/features/building/buildingSlice';

// helper: convert data URL or remote URL to File
async function urlToFile(url, fileName = 'image.png') {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || 'image/png' });
}

const EditRestrooms = ({ setCurrentStep, buildingId }) => {
  const dispatch = useDispatch();
  const building = useSelector(state => state.building);
  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
  const { data: sensorsData } = useGetAllSensorsQuery();
  const [updateBuilding] = useUpdateBuildingMutation();
  const [updateRestroom] = useUpdateRestroomMutation();
  const [deleteRestroom] = useDeleteRestroomMutation();
  const [createRestroom] = useCreateRestroomMutation();
  const [availableSensors, setAvailableSensors] = useState([]);
  const [restrooms, setRestroomss] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🧩 Debug Logs
  console.log('🧱 [BUILDING REDUX]:', building);
  console.log('📡 [API building data]:', editData?.data);
  console.log('🚻 [LOCAL restrooms]:', restrooms);
  console.log('🧩 [Available Sensors]:', availableSensors);

  // ✅ Rehydrate local restrooms from Redux if exists
  useEffect(() => {
    if (building.restrooms?.length && restrooms.length === 0) {
      console.log('♻️ Hydrating local restrooms from Redux...');
      setRestroomss(building.restrooms);
    }
  }, [building.restrooms]);

  // ✅ Load existing restrooms from API only if Redux has none
  useEffect(() => {
    console.log('🌀 useEffect triggered for restroom merge');
    if (
      (!building.restrooms || building.restrooms.length === 0) &&
      editData?.data &&
      building?.buildingModelCoordinates?.length
    ) {
      console.log('🔁 Merging restrooms from API + building polygons...');
      dispatch(setApiData(editData.data));

      const storePolygons = building?.buildingModelCoordinates || [];
      const apiRestrooms = Array.isArray(editData?.data?.restrooms) ? editData.data.restrooms : [];

      const mergedRestrooms = storePolygons.map((poly, index) => {
        const polygonRestroomId = poly?.restroomId?.toString?.() || null;

        const matchedRestroom = apiRestrooms.find(r => {
          const rId = r._id?.toString?.() || r.restroomId?.toString?.();
          return polygonRestroomId && rId === polygonRestroomId;
        });

        if (matchedRestroom) {
          return {
            ...matchedRestroom,
            name: matchedRestroom.name || `Restroom ${index + 1}`,
            restroomId: matchedRestroom.restroomId || matchedRestroom._id || polygonRestroomId,
            area: matchedRestroom.area || '',
            type: matchedRestroom.type || '',
            status: matchedRestroom.status || '',
            toilets: matchedRestroom.numOfToilets?.toString() || '1',
            restroomImage:
              matchedRestroom.modelImage?.[0]?.url || matchedRestroom.restroomImage || null,
            restroomCoordinates: matchedRestroom.modelCoordinates || [],
            sensors: matchedRestroom.sensors || [],
            isExisting: true,
            _id: matchedRestroom._id,
          };
        }

        // ❌ No match → new restroom
        return {
          name: poly.restroomName || `Restroom ${index + 1}`,
          restroomId: polygonRestroomId || poly.id || nanoid(),
          area: '',
          type: '',
          status: '',
          toilets: '1',
          restroomImage: null,
          restroomCoordinates: [],
          sensors: [],
          isExisting: false,
        };
      });

      setRestroomss(mergedRestrooms);
      dispatch(setRestrooms(mergedRestrooms));
      console.log('✅ Merged and set restrooms:', mergedRestrooms);
    }
  }, [building?.buildingModelCoordinates, editData?.data?.restrooms, building.restrooms, dispatch]);

  const restroomChangeHandler = (index, field, value) => {
    setRestroomss(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    dispatch(setUserEdited(true));
  };

  const handleImageChange = (index, image, file, coordinates) => {
    setRestroomss(prev => {
      const updated = [...prev];
      const target = { ...updated[index] };
      if (file) target.restroomImage = file;
      else if (image) target.restroomImage = image;
      if (coordinates) target.restroomCoordinates = coordinates;
      updated[index] = target;
      return updated;
    });
    dispatch(setUserEdited(true));
  };

  const restoreSensor = sensorId => {
    const sensor = sensorsData?.data?.find(s => s._id === sensorId);
    if (sensor)
      setAvailableSensors(prev => [...prev, { option: sensor?.name, value: sensor?._id }]);
  };

  // 🆕 Save single restroom locally
  const handleSaveSingleRestroom = (restroom, index) => {
    const updated = [...restrooms];
    updated[index] = restroom;
    setRestroomss(updated);
    dispatch(setRestrooms(updated));
    toast.success(`${restroom.name} saved locally`);
  };

  // 🔹 Save building + restrooms
  const saveBuilding = async () => {
    const newRestroomsWithoutImages = restrooms.filter(r => !r.isExisting && !r.restroomImage);

    if (newRestroomsWithoutImages.length > 0) {
      toast.error(
        `Please upload model images for: ${newRestroomsWithoutImages.map(r => r.name).join(', ')}`
      );
      return;
    }

    try {
      setIsLoading(true);

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
        buildingCoordinates: building?.buildingModelCoordinates || [],
      };

      const buildingFormData = new FormData();
      Object.entries(buildingData).forEach(([key, val]) => {
        buildingFormData.append(key, key === 'buildingCoordinates' ? JSON.stringify(val) : val);
      });

      if (building.buildingThumbnail)
        buildingFormData.append('buildingThumbnail', building.buildingThumbnail);
      if (building.buildingModelImage)
        buildingFormData.append('buildingModelImage', building.buildingModelImage);

      await updateBuilding({ buildingId, data: buildingFormData }).unwrap();

      const restroomPromises = restrooms.map(async r => {
        const restroomData = {
          name: r.name,
          type: r.type,
          status: r.status,
          area: r.area,
          numOfToilets: parseInt(r.toilets),
          coordinates: (r.restroomCoordinates || []).map(coord => ({
            ...coord,
            polygonId: coord?.polygonId || nanoid(),
            labelPoint: coord?.labelPoint || 'first',
          })),
        };

        const formData = new FormData();
        Object.entries(restroomData).forEach(([k, v]) => {
          formData.append(k, k === 'coordinates' ? JSON.stringify(v) : v);
        });
        formData.append('buildingId', buildingId);

        if (r.isExisting) {
          if (r.restroomImage && typeof r.restroomImage === 'object') {
            formData.append('modelImage', r.restroomImage);
          }
          return updateRestroom({ restroomId: r._id, data: formData }).unwrap();
        } else {
          if (!r.restroomImage) {
            throw new Error(`Please upload a model image for ${r.name}`);
          }

          if (typeof r.restroomImage === 'object') {
            formData.append('modelImage', r.restroomImage);
          } else if (typeof r.restroomImage === 'string') {
            const file = await urlToFile(
              r.restroomImage,
              `${r.restroomId || 'restroom'}-model.png`
            );
            formData.append('modelImage', file);
          }

          return createRestroom(formData).unwrap();
        }
      });

      await Promise.all(restroomPromises);
      toast.success('Building and restrooms updated successfully');

      // 🧩 Do NOT reset Redux — keep data for next step
      // dispatch(resetBuildingState());

      setCurrentStep(1);
    } catch (error) {
      console.error('❌ Error updating building:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to update building');
    } finally {
      setIsLoading(false);
    }
  };

  // Update available sensors
  useEffect(() => {
    if (sensorsData?.data?.length && restrooms.length) {
      const usedSensorIds = restrooms.flatMap(r => r.sensors || []);
      const available = sensorsData.data
        .filter(sensor => !sensor.isConnect && !usedSensorIds.includes(sensor._id))
        .map(sensor => ({
          option: sensor.name,
          value: sensor._id,
        }));
      setAvailableSensors(available);
    }
  }, [sensorsData, restrooms]);

  return (
    <div>
      <h6 className="text-primary text-base font-medium">Restrooms</h6>

      <div className="mt-5 space-y-6">
        {restrooms.map((restroom, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            <h6 className="mb-4 text-lg font-medium">Restroom {index + 1}</h6>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Input
                type="text"
                name="name"
                label="Restroom Name"
                placeholder="Restroom Name"
                value={restroom.name}
                onChange={e => restroomChangeHandler(index, 'name', e.target.value)}
              />
              <Input
                type="text"
                name="restroomId"
                label="Restroom ID"
                placeholder="Restroom ID"
                value={restroom._id ? restroom._id : restroom.restroomId}
                readOnly
              />

              <Dropdown
                label="Type"
                placeholder="Select type"
                initialValue={restroom.type || ''}
                onSelect={value => restroomChangeHandler(index, 'type', value)}
                options={[
                  { option: 'Public', value: 'public' },
                  { option: 'Private', value: 'private' },
                ]}
              />

              <Dropdown
                label="Status"
                placeholder="Select status"
                initialValue={restroom.status || ''}
                onSelect={value => restroomChangeHandler(index, 'status', value)}
                options={[
                  { option: 'Active', value: 'active' },
                  { option: 'Inactive', value: 'inactive' },
                ]}
              />

              <Input
                type="text"
                name="area"
                label="Area"
                placeholder="Area"
                value={restroom.area}
                onChange={e => restroomChangeHandler(index, 'area', e.target.value)}
              />

              <Input
                type="number"
                name="toilets"
                label="Number of Toilets"
                placeholder="Number of Toilets"
                value={restroom.toilets}
                onChange={e => restroomChangeHandler(index, 'toilets', e.target.value)}
              />
            </div>

            <div className="mt-4">
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
                  updateRestRoomHandler={(field, value) =>
                    restroomChangeHandler(index, field, value)
                  }
                  restoreSensor={restoreSensor}
                />
              </div>
            </div>

            <div className="mt-4">
              <h6 className="mb-2 text-sm font-medium">Restroom Coordinates</h6>
              <p className="text-sm text-gray-600">
                {restroom.restroomCoordinates?.length || 0} polygon(s) defined
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">
                {!restroom.isExisting && !restroom.restroomImage && (
                  <span className="font-medium text-red-500">
                    ⚠️ Model image required for new restroom
                  </span>
                )}
                {restroom.isExisting &&
                  restroom.restroomImage &&
                  typeof restroom.restroomImage === 'object' && (
                    <span className="font-medium text-blue-500">
                      📷 New image will replace existing
                    </span>
                  )}
              </div>
              <Button
                text={`Save ${restroom.name}`}
                width="!w-[180px]"
                onClick={() => handleSaveSingleRestroom(restroom, index)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        <Button
          text="Back"
          width="!w-[150px]"
          onClick={() => setCurrentStep(prev => prev - 1)}
          cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
        />
        <Button
          text={isLoading ? 'Saving...' : 'Save Building'}
          width="!w-[150px]"
          onClick={saveBuilding}
        />
      </div>
    </div>
  );
};

export default EditRestrooms;
