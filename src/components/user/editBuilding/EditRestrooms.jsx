// // // 'use client';
// // // import { useState, useEffect } from 'react';
// // // import { useSelector } from 'react-redux';
// // // import { nanoid } from 'nanoid';
// // // import toast from 'react-hot-toast';
// // // import Button from '@/components/global/small/Button';
// // // import Input from '@/components/global/small/Input';
// // // import Dropdown from '@/components/global/small/Dropdown';
// // // import MarkRestroomModel from '../addBuilding/MarkRestroomModel';
// // // import {
// // //   useGetBuildingWithRestroomsQuery,
// // //   useUpdateBuildingMutation,
// // // } from '@/features/building/buildingApi';
// // // import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
// // // import {
// // //   useUpdateRestroomMutation,
// // //   useDeleteRestroomMutation,
// // //   useCreateRestroomMutation,
// // // } from '@/features/restroom/restroomApi';
// // // import { setUserEdited } from '@/features/building/buildingSlice';

// // // const EditRestrooms = ({ setCurrentStep, buildingId }) => {
// // //   const building = useSelector((state) => state.building);
// // //   const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
// // //   const { data: sensorsData } = useGetAllSensorsQuery();
// // //   const [updateBuilding] = useUpdateBuildingMutation();
// // //   const [updateRestroom] = useUpdateRestroomMutation();
// // //   const [deleteRestroom] = useDeleteRestroomMutation();
// // //   const [createRestroom] = useCreateRestroomMutation();
// // //   const [availableSensors, setAvailableSensors] = useState([]);
// // //   const [restrooms, setRestrooms] = useState([]);
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   console.log('store building', building);
// // //   console.log('api building data ', editData?.data);
// // //   console.log('restrooms', restrooms);
// // //   console.log('availableSensors', availableSensors);

// // //   // ✅ Load existing restrooms from API
// // //   useEffect(() => {
// // //     if (!building.isUserEdited) {
// // //       // 🧠 only load once from API
// // //       const storePolygons = building?.buildingModelCoordinates || [];
// // //       const apiRestrooms = editData?.data?.restrooms || [];
// // //       if (!Array.isArray(storePolygons) || storePolygons.length === 0) return;

// // //       const mergedRestrooms = storePolygons.map((poly, index) => {
// // //         const polygonRestroomId = poly?.restroomId;
// // //         const matchedRestroom = apiRestrooms.find(
// // //           (r) => r._id === polygonRestroomId || r.restroomId === polygonRestroomId
// // //         );
// // //         if (matchedRestroom) {
// // //           return {
// // //             ...matchedRestroom,
// // //             name: matchedRestroom.name || `Restroom ${index + 1}`,
// // //             restroomId:
// // //               matchedRestroom.restroomId || matchedRestroom._id || polygonRestroomId || nanoid(),
// // //             area: matchedRestroom.area || '',
// // //             type: matchedRestroom.type || '',
// // //             status: matchedRestroom.status || '',
// // //             toilets: matchedRestroom.numOfToilets?.toString() || matchedRestroom.toilets || '1',
// // //             restroomImage:
// // //               matchedRestroom.modelImage?.[0]?.url || matchedRestroom.restroomImage || null,
// // //             restroomCoordinates: matchedRestroom.modelCoordinates || [],
// // //             isExisting: true,
// // //           };
// // //         }
// // //         return {
// // //           name: poly.restroomName || `Restroom ${index + 1}`,
// // //           restroomId: polygonRestroomId || poly.id || nanoid(),
// // //           area: '',
// // //           type: '',
// // //           status: '',
// // //           toilets: '1',
// // //           restroomImage: null,
// // //           restroomCoordinates: [],
// // //           isExisting: false,
// // //         };
// // //       });
// // //       setRestrooms(mergedRestrooms);
// // //     }
// // //   }, [building?.buildingModelCoordinates, editData?.data?.restrooms, building.isUserEdited]);

// // //   const restroomChangeHandler = (index, field, value) => {
// // //     setRestrooms((prev) => {
// // //       const updated = [...prev];
// // //       updated[index] = { ...updated[index], [field]: value };
// // //       return updated;
// // //     });
// // //     dispatch(setUserEdited(true)); // 🆕 mark edit
// // //   };

// // //   const handleImageChange = (index, image, file, coordinates) => {
// // //     setRestrooms((prev) => {
// // //       const updated = [...prev];
// // //       updated[index] = {
// // //         ...updated[index],
// // //         ...(image && { restroomImage: image }),
// // //         ...(coordinates && { restroomCoordinates: coordinates }),
// // //       };
// // //       return updated;
// // //     });
// // //     dispatch(setUserEdited(true)); // 🆕 mark edit
// // //   };

// // //   const restoreSensor = (sensorId) => {
// // //     const sensor = sensorsData?.data?.find((s) => s._id === sensorId);
// // //     if (sensor)
// // //       setAvailableSensors((prev) => [...prev, { option: sensor?.name, value: sensor?._id }]);
// // //   };

// // //   const saveBuilding = async () => {
// // //     try {
// // //       setIsLoading(true);

// // //       // 🏢 Update building
// // //       const buildingData = {
// // //         name: building.buildingName,
// // //         type: building.buildingType,
// // //         location: building.location,
// // //         area: building.area,
// // //         latitude: building.mapInfo?.lat,
// // //         longitude: building.mapInfo?.lng,
// // //         totalFloors: building.totalFloors,
// // //         numberOfRooms: building.totalRestrooms,
// // //         buildingManager: building.buildingManager,
// // //         phone: building.phone,
// // //         buildingCoordinates: building?.buildingModelCoordinates || [],
// // //       };

// // //       const buildingFormData = new FormData();
// // //       Object.entries(buildingData).forEach(([key, val]) => {
// // //         buildingFormData.append(key, key === 'buildingCoordinates' ? JSON.stringify(val) : val);
// // //       });

// // //       if (building.buildingThumbnail)
// // //         buildingFormData.append('buildingThumbnail', building.buildingThumbnail);
// // //       if (building.buildingModelImage)
// // //         buildingFormData.append('buildingModelImage', building.buildingModelImage);

// // //       await updateBuilding({ buildingId, data: buildingFormData }).unwrap();

// // //       // 🚻 Update/Create restrooms
// // //       const restroomPromises = restrooms.map(async (restroom) => {
// // //         const restroomData = {
// // //           name: restroom.name,
// // //           type: restroom.type,
// // //           status: restroom.status,
// // //           area: restroom.area,
// // //           numOfToilets: parseInt(restroom.toilets),
// // //           coordinates: restroom.restroomCoordinates.map((coord) => ({
// // //             ...coord,
// // //             polygonId: coord?.polygonId || nanoid(),
// // //             labelPoint: coord?.labelPoint || 'first',
// // //           })),
// // //         };

// // //         const formData = new FormData();
// // //         Object.entries(restroomData).forEach(([key, val]) => {
// // //           formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
// // //         });
// // //         formData.append('buildingId', buildingId);

// // //         if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
// // //           formData.append('modelImage', restroom.restroomImage);
// // //         }

// // //         if (restroom.isExisting)
// // //           return updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
// // //         else return createRestroom(formData).unwrap();
// // //       });

// // //       await Promise.all(restroomPromises);

// // //       toast.success('Building and restrooms updated successfully');
// // //       setCurrentStep(1);
// // //     } catch (error) {
// // //       console.error('❌ Error updating building:', error);
// // //       toast.error(error?.data?.message || 'Failed to update building');
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };
// // //   useEffect(() => {
// // //     if (sensorsData?.data?.length && restrooms.length) {
// // //       const usedSensorIds = restrooms.flatMap((r) => r.sensors || []);
// // //       const available = sensorsData.data
// // //         .filter((sensor) => !sensor.isConnect && !usedSensorIds.includes(sensor._id))
// // //         .map((sensor) => ({
// // //           option: sensor.name,
// // //           value: sensor._id,
// // //         }));

// // //       setAvailableSensors(available);
// // //     }
// // //   }, [sensorsData, restrooms]);

// // //   return (
// // //     <div>
// // //       <h6 className="text-base text-primary font-medium">Restrooms</h6>
// // //       <div className="mt-5 space-y-6">
// // //         {restrooms.map((restroom, index) => (
// // //           <div key={index} className="border border-gray-200 rounded-lg p-4">
// // //             <h6 className="text-lg font-medium mb-4">Restroom {index + 1}</h6>

// // //             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
// // //               <Input
// // //                 type="text"
// // //                 name="name"
// // //                 label="Restroom Name"
// // //                 placeholder="Restroom Name"
// // //                 value={restroom.name}
// // //                 onChange={(e) => restroomChangeHandler(index, 'name', e.target.value)}
// // //               />
// // //               <Input
// // //                 type="text"
// // //                 name="restroomId"
// // //                 label="Restroom ID"
// // //                 placeholder="Restroom ID"
// // //                 value={restroom._id ? restroom._id : restroom.restroomId}
// // //                 readOnly
// // //               />

// // //               <Dropdown
// // //                 label="Type"
// // //                 placeholder="Select type"
// // //                 initialValue={restroom.type || ''}
// // //                 onSelect={(value) => restroomChangeHandler(index, 'type', value)}
// // //                 options={[
// // //                   { option: 'Public', value: 'public' },
// // //                   { option: 'Private', value: 'private' },
// // //                 ]}
// // //               />

// // //               <Dropdown
// // //                 label="Status"
// // //                 placeholder="Select status"
// // //                 initialValue={restroom.status || ''}
// // //                 onSelect={(value) => restroomChangeHandler(index, 'status', value)}
// // //                 options={[
// // //                   { option: 'Active', value: 'active' },
// // //                   { option: 'Inactive', value: 'inactive' },
// // //                 ]}
// // //               />

// // //               <Input
// // //                 type="text"
// // //                 name="area"
// // //                 label="Area"
// // //                 placeholder="Area"
// // //                 value={restroom.area}
// // //                 onChange={(e) => restroomChangeHandler(index, 'area', e.target.value)}
// // //               />

// // //               <Input
// // //                 type="number"
// // //                 name="toilets"
// // //                 label="Number of Toilets"
// // //                 placeholder="Number of Toilets"
// // //                 value={restroom.toilets}
// // //                 onChange={(e) => restroomChangeHandler(index, 'toilets', e.target.value)}
// // //               />
// // //             </div>

// // //             <div className="mt-4">
// // //               <h6 className="font-medium mb-3">Restroom Layout</h6>
// // //               <div className="py-4 grid place-items-center">
// // //                 <MarkRestroomModel
// // //                   restroomIndex={index}
// // //                   setFile={(file) => handleImageChange(index, null, file, null)}
// // //                   restroomImage={restroom.restroomImage}
// // //                   setRestroomImage={(image) => handleImageChange(index, image, null, null)}
// // //                   polygons={restroom.restroomCoordinates || []}
// // //                   setPolygons={(coordinates) => handleImageChange(index, null, null, coordinates)}
// // //                   availableSensors={availableSensors}
// // //                   updateRestRoomHandler={(field, value) =>
// // //                     restroomChangeHandler(index, field, value)
// // //                   }
// // //                   restoreSensor={restoreSensor}
// // //                 />
// // //               </div>
// // //             </div>

// // //             <div className="mt-4">
// // //               <h6 className="text-sm font-medium mb-2">Restroom Coordinates</h6>
// // //               <p className="text-sm text-gray-600">
// // //                 {restroom.restroomCoordinates.length} polygon(s) defined
// // //               </p>
// // //             </div>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       <div className="flex items-center justify-end gap-4">
// // //         <Button
// // //           text="Back"
// // //           width="!w-[150px]"
// // //           onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
// // //           cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
// // //         />
// // //         <Button
// // //           text={isLoading ? 'Saving...' : 'Save Building'}
// // //           width="!w-[150px]"
// // //           onClick={saveBuilding}
// // //         />
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default EditRestrooms;
// // /////////////////////

// // 'use client';
// // import { useState, useEffect } from 'react';
// // import { useSelector, useDispatch } from 'react-redux';
// // import { nanoid } from 'nanoid';
// // import toast from 'react-hot-toast';
// // import Button from '@/components/global/small/Button';
// // import Input from '@/components/global/small/Input';
// // import Dropdown from '@/components/global/small/Dropdown';
// // import MarkRestroomModel from '../addBuilding/MarkRestroomModel';
// // import {
// //   useGetBuildingWithRestroomsQuery,
// //   useUpdateBuildingMutation,
// // } from '@/features/building/buildingApi';
// // import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
// // import {
// //   useUpdateRestroomMutation,
// //   useDeleteRestroomMutation,
// //   useCreateRestroomMutation,
// // } from '@/features/restroom/restroomApi';
// // import { setUserEdited, setApiData } from '@/features/building/buildingSlice';

// // const EditRestrooms = ({ setCurrentStep, buildingId }) => {
// //   const dispatch = useDispatch();
// //   const building = useSelector((state) => state.building);
// //   const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
// //   const { data: sensorsData } = useGetAllSensorsQuery();
// //   const [updateBuilding] = useUpdateBuildingMutation();
// //   const [updateRestroom] = useUpdateRestroomMutation();
// //   const [deleteRestroom] = useDeleteRestroomMutation();
// //   const [createRestroom] = useCreateRestroomMutation();
// //   const [availableSensors, setAvailableSensors] = useState([]);
// //   const [restrooms, setRestrooms] = useState([]);
// //   const [isLoading, setIsLoading] = useState(false);

// //   console.log('store building', building);
// //   console.log('api building data ', editData?.data);
// //   console.log('restrooms', restrooms);
// //   console.log('availableSensors', availableSensors);

// //   // ✅ Load existing restrooms from API
// //   useEffect(() => {
// //     if (!building.isUserEdited) {
// //       // Store API data in Redux
// //       if (editData?.data) {
// //         dispatch(setApiData(editData.data));
// //       }

// //       const storePolygons = building?.buildingModelCoordinates || [];
// //       const apiRestrooms = editData?.data?.restrooms || [];
// //       if (!Array.isArray(storePolygons) || storePolygons.length === 0) return;

// //       const mergedRestrooms = storePolygons.map((poly, index) => {
// //         const polygonRestroomId = poly?.restroomId;
// //         const matchedRestroom = apiRestrooms.find(
// //           (r) => r._id === polygonRestroomId || r.restroomId === polygonRestroomId
// //         );
// //         if (matchedRestroom) {
// //           return {
// //             ...matchedRestroom,
// //             name: matchedRestroom.name || `Restroom ${index + 1}`,
// //             restroomId:
// //               matchedRestroom.restroomId || matchedRestroom._id || polygonRestroomId || nanoid(),
// //             area: matchedRestroom.area || '',
// //             type: matchedRestroom.type || '',
// //             status: matchedRestroom.status || '',
// //             toilets: matchedRestroom.numOfToilets?.toString() || matchedRestroom.toilets || '1',
// //             restroomImage:
// //               matchedRestroom.modelImage?.[0]?.url || matchedRestroom.restroomImage || null,
// //             restroomCoordinates: matchedRestroom.modelCoordinates || [],
// //             isExisting: true,
// //           };
// //         }
// //         return {
// //           name: poly.restroomName || `Restroom ${index + 1}`,
// //           restroomId: polygonRestroomId || poly.id || nanoid(),
// //           area: '',
// //           type: '',
// //           status: '',
// //           toilets: '1',
// //           restroomImage: null,
// //           restroomCoordinates: [],
// //           isExisting: false,
// //         };
// //       });
// //       setRestrooms(mergedRestrooms);
// //     }
// //   }, [
// //     building?.buildingModelCoordinates,
// //     editData?.data?.restrooms,
// //     building.isUserEdited,
// //     dispatch,
// //   ]);

// //   const restroomChangeHandler = (index, field, value) => {
// //     setRestrooms((prev) => {
// //       const updated = [...prev];
// //       updated[index] = { ...updated[index], [field]: value };
// //       return updated;
// //     });
// //     dispatch(setUserEdited(true));
// //   };

// //   const handleImageChange = (index, image, file, coordinates) => {
// //     setRestrooms((prev) => {
// //       const updated = [...prev];
// //       updated[index] = {
// //         ...updated[index],
// //         ...(image && { restroomImage: image }),
// //         ...(coordinates && { restroomCoordinates: coordinates }),
// //       };
// //       return updated;
// //     });
// //     dispatch(setUserEdited(true));
// //   };

// //   const restoreSensor = (sensorId) => {
// //     const sensor = sensorsData?.data?.find((s) => s._id === sensorId);
// //     if (sensor)
// //       setAvailableSensors((prev) => [...prev, { option: sensor?.name, value: sensor?._id }]);
// //   };

// //   // 🆕 Save single restroom
// //   const handleSaveSingleRestroom = async (restroom) => {
// //     try {
// //       const restroomData = {
// //         name: restroom.name,
// //         type: restroom.type,
// //         status: restroom.status,
// //         area: restroom.area,
// //         numOfToilets: parseInt(restroom.toilets),
// //         coordinates: restroom.restroomCoordinates.map((coord) => ({
// //           ...coord,
// //           polygonId: coord?.polygonId || nanoid(),
// //           labelPoint: coord?.labelPoint || 'first',
// //         })),
// //       };
// //       console.log('restroomDatarestroomData', restroomData);

// //       const formData = new FormData();
// //       Object.entries(restroomData).forEach(([key, val]) => {
// //         formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
// //       });
// //       formData.append('buildingId', buildingId);

// //       // For new restrooms, we need to ensure there's a model image
// //       if (restroom.isExisting) {
// //         // For existing restrooms, only add image if it's a new file
// //         if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
// //           formData.append('modelImage', restroom.restroomImage);
// //         }
// //         await updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
// //         toast.success(`${restroom.name} updated successfully`);
// //       } else {
// //         // For new restrooms, require a model image
// //         // ✅ Check if model image exists (URL or File)
// //         if (!restroom.restroomImage) {
// //           toast.error(`Please upload a model image for ${restroom.name}`);
// //           return;
// //         }

// //         // ✅ Append only if it's a File object, not a URL
// //         if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
// //           formData.append('modelImage', restroom.restroomImage);
// //         }

// //         await createRestroom(formData).unwrap();
// //         toast.success(`${restroom.name} created successfully`);
// //       }
// //     } catch (err) {
// //       toast.error(`Failed to save ${restroom.name}`);
// //       console.error('❌ Error saving restroom:', err);
// //     }
// //   };

// //   // 🔹 Save all building & restrooms
// //   const saveBuilding = async () => {
// //     // Check if any new restrooms are missing model images
// //     const newRestroomsWithoutImages = restrooms.filter(
// //       (restroom) =>
// //         !restroom.isExisting &&
// //         (!restroom.restroomImage || typeof restroom.restroomImage !== 'object')
// //     );

// //     if (newRestroomsWithoutImages.length > 0) {
// //       toast.error(
// //         `Please upload model images for: ${newRestroomsWithoutImages.map((r) => r.name).join(', ')}`
// //       );
// //       return;
// //     }

// //     try {
// //       setIsLoading(true);

// //       const buildingData = {
// //         name: building.buildingName,
// //         type: building.buildingType,
// //         location: building.location,
// //         area: building.area,
// //         latitude: building.mapInfo?.lat,
// //         longitude: building.mapInfo?.lng,
// //         totalFloors: building.totalFloors,
// //         numberOfRooms: building.totalRestrooms,
// //         buildingManager: building.buildingManager,
// //         phone: building.phone,
// //         buildingCoordinates: building?.buildingModelCoordinates || [],
// //       };
// //       console.log('buildingData', buildingData);

// //       const buildingFormData = new FormData();
// //       Object.entries(buildingData).forEach(([key, val]) => {
// //         buildingFormData.append(key, key === 'buildingCoordinates' ? JSON.stringify(val) : val);
// //       });

// //       if (building.buildingThumbnail)
// //         buildingFormData.append('buildingThumbnail', building.buildingThumbnail);
// //       if (building.buildingModelImage)
// //         buildingFormData.append('buildingModelImage', building.buildingModelImage);

// //       await updateBuilding({ buildingId, data: buildingFormData }).unwrap();

// //       const restroomPromises = restrooms.map(async (restroom) => {
// //         const restroomData = {
// //           name: restroom.name,
// //           type: restroom.type,
// //           status: restroom.status,
// //           area: restroom.area,
// //           numOfToilets: parseInt(restroom.toilets),
// //           coordinates: restroom.restroomCoordinates.map((coord) => ({
// //             ...coord,
// //             polygonId: coord?.polygonId || nanoid(),
// //             labelPoint: coord?.labelPoint || 'first',
// //           })),
// //         };

// //         const formData = new FormData();
// //         Object.entries(restroomData).forEach(([key, val]) => {
// //           formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
// //         });
// //         formData.append('buildingId', buildingId);

// //         if (restroom.isExisting) {
// //           // For existing restrooms, only add image if it's a new file
// //           if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
// //             formData.append('modelImage', restroom.restroomImage);
// //           }
// //           return updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
// //         } else {
// //           // For new restrooms, require a model image
// //           // ✅ Allow existing image URLs or new File objects
// //           if (!restroom.restroomImage) {
// //             throw new Error(`Please upload a model image for ${restroom.name}`);
// //           }

// //           if (typeof restroom.restroomImage === 'object') {
// //             formData.append('modelImage', restroom.restroomImage);
// //           }

// //           return createRestroom(formData).unwrap();
// //         }
// //       });

// //       await Promise.all(restroomPromises);

// //       toast.success('Building and restrooms updated successfully');
// //       setCurrentStep(1);
// //     } catch (error) {
// //       console.error('❌ Error updating building:', error);
// //       toast.error(error?.data?.message || 'Failed to update building');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (sensorsData?.data?.length && restrooms.length) {
// //       const usedSensorIds = restrooms.flatMap((r) => r.sensors || []);
// //       const available = sensorsData.data
// //         .filter((sensor) => !sensor.isConnect && !usedSensorIds.includes(sensor._id))
// //         .map((sensor) => ({
// //           option: sensor.name,
// //           value: sensor._id,
// //         }));

// //       setAvailableSensors(available);
// //     }
// //   }, [sensorsData, restrooms]);

// //   return (
// //     <div>
// //       <h6 className="text-base text-primary font-medium">Restrooms</h6>
// //       <div className="mt-5 space-y-6">
// //         {restrooms.map((restroom, index) => (
// //           <div key={index} className="border border-gray-200 rounded-lg p-4">
// //             <h6 className="text-lg font-medium mb-4">Restroom {index + 1}</h6>

// //             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
// //               <Input
// //                 type="text"
// //                 name="name"
// //                 label="Restroom Name"
// //                 placeholder="Restroom Name"
// //                 value={restroom.name}
// //                 onChange={(e) => restroomChangeHandler(index, 'name', e.target.value)}
// //               />
// //               <Input
// //                 type="text"
// //                 name="restroomId"
// //                 label="Restroom ID"
// //                 placeholder="Restroom ID"
// //                 value={restroom._id ? restroom._id : restroom.restroomId}
// //                 readOnly
// //               />

// //               <Dropdown
// //                 label="Type"
// //                 placeholder="Select type"
// //                 initialValue={restroom.type || ''}
// //                 onSelect={(value) => restroomChangeHandler(index, 'type', value)}
// //                 options={[
// //                   { option: 'Public', value: 'public' },
// //                   { option: 'Private', value: 'private' },
// //                 ]}
// //               />

// //               <Dropdown
// //                 label="Status"
// //                 placeholder="Select status"
// //                 initialValue={restroom.status || ''}
// //                 onSelect={(value) => restroomChangeHandler(index, 'status', value)}
// //                 options={[
// //                   { option: 'Active', value: 'active' },
// //                   { option: 'Inactive', value: 'inactive' },
// //                 ]}
// //               />

// //               <Input
// //                 type="text"
// //                 name="area"
// //                 label="Area"
// //                 placeholder="Area"
// //                 value={restroom.area}
// //                 onChange={(e) => restroomChangeHandler(index, 'area', e.target.value)}
// //               />

// //               <Input
// //                 type="number"
// //                 name="toilets"
// //                 label="Number of Toilets"
// //                 placeholder="Number of Toilets"
// //                 value={restroom.toilets}
// //                 onChange={(e) => restroomChangeHandler(index, 'toilets', e.target.value)}
// //               />
// //             </div>

// //             <div className="mt-4">
// //               <h6 className="font-medium mb-3">Restroom Layout</h6>
// //               <div className="py-4 grid place-items-center">
// //                 <MarkRestroomModel
// //                   restroomIndex={index}
// //                   setFile={(file) => handleImageChange(index, null, file, null)}
// //                   restroomImage={restroom.restroomImage}
// //                   setRestroomImage={(image) => handleImageChange(index, image, null, null)}
// //                   polygons={restroom.restroomCoordinates || []}
// //                   setPolygons={(coordinates) => handleImageChange(index, null, null, coordinates)}
// //                   availableSensors={availableSensors}
// //                   updateRestRoomHandler={(field, value) =>
// //                     restroomChangeHandler(index, field, value)
// //                   }
// //                   restoreSensor={restoreSensor}
// //                 />
// //               </div>
// //             </div>

// //             <div className="mt-4">
// //               <h6 className="text-sm font-medium mb-2">Restroom Coordinates</h6>
// //               <p className="text-sm text-gray-600">
// //                 {restroom.restroomCoordinates.length} polygon(s) defined
// //               </p>
// //             </div>

// //             {/* 🆕 Individual Save Button */}
// //             <div className="mt-4 flex justify-between items-center">
// //               <div className="text-sm">
// //                 {!restroom.isExisting &&
// //                   (!restroom.restroomImage || typeof restroom.restroomImage !== 'object') && (
// //                     <span className="text-red-500 font-medium">
// //                       ⚠️ Model image required for new restroom
// //                     </span>
// //                   )}
// //                 {restroom.isExisting &&
// //                   restroom.restroomImage &&
// //                   typeof restroom.restroomImage === 'object' && (
// //                     <span className="text-blue-500 font-medium">
// //                       📷 New image will replace existing
// //                     </span>
// //                   )}
// //               </div>
// //               <Button
// //                 text={`Save ${restroom.name}`}
// //                 width="!w-[180px]"
// //                 onClick={() => handleSaveSingleRestroom(restroom)}
// //                 disabled={
// //                   !restroom.isExisting &&
// //                   (!restroom.restroomImage || typeof restroom.restroomImage !== 'object')
// //                 }
// //               />
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="flex items-center justify-end gap-4 mt-6">
// //         <Button
// //           text="Back"
// //           width="!w-[150px]"
// //           onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
// //           cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
// //         />
// //         <Button
// //           text={isLoading ? 'Saving...' : 'Save Building'}
// //           width="!w-[150px]"
// //           onClick={saveBuilding}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default EditRestrooms;
// //////////////////////////////////////////////////

// 'use client';
// import { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { nanoid } from 'nanoid';
// import toast from 'react-hot-toast';
// import Button from '@/components/global/small/Button';
// import Input from '@/components/global/small/Input';
// import Dropdown from '@/components/global/small/Dropdown';
// import MarkRestroomModel from '../addBuilding/MarkRestroomModel';
// import {
//   useGetBuildingWithRestroomsQuery,
//   useUpdateBuildingMutation,
// } from '@/features/building/buildingApi';
// import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
// import {
//   useUpdateRestroomMutation,
//   useDeleteRestroomMutation,
//   useCreateRestroomMutation,
// } from '@/features/restroom/restroomApi';
// import { setUserEdited, setApiData } from '@/features/building/buildingSlice';

// const EditRestrooms = ({ setCurrentStep, buildingId }) => {
//   const dispatch = useDispatch();
//   const building = useSelector((state) => state.building);
//   const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
//   const { data: sensorsData } = useGetAllSensorsQuery();
//   const [updateBuilding] = useUpdateBuildingMutation();
//   const [updateRestroom] = useUpdateRestroomMutation();
//   const [deleteRestroom] = useDeleteRestroomMutation();
//   const [createRestroom] = useCreateRestroomMutation();
//   const [availableSensors, setAvailableSensors] = useState([]);
//   const [restrooms, setRestrooms] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // ✅ Load existing restrooms from API
//   useEffect(() => {
//     if (!building.isUserEdited) {
//       if (editData?.data) {
//         dispatch(setApiData(editData.data));
//       }

//       const storePolygons = building?.buildingModelCoordinates || [];
//       const apiRestrooms = editData?.data?.restrooms || [];
//       if (!Array.isArray(storePolygons) || storePolygons.length === 0) return;

//       const mergedRestrooms = storePolygons.map((poly, index) => {
//         const polygonRestroomId = poly?.restroomId;
//         const matchedRestroom = apiRestrooms.find(
//           (r) => r._id === polygonRestroomId || r.restroomId === polygonRestroomId
//         );
//         if (matchedRestroom) {
//           return {
//             ...matchedRestroom,
//             name: matchedRestroom.name || `Restroom ${index + 1}`,
//             restroomId:
//               matchedRestroom.restroomId || matchedRestroom._id || polygonRestroomId || nanoid(),
//             area: matchedRestroom.area || '',
//             type: matchedRestroom.type || '',
//             status: matchedRestroom.status || '',
//             toilets: matchedRestroom.numOfToilets?.toString() || matchedRestroom.toilets || '1',
//             restroomImage:
//               matchedRestroom.modelImage?.[0]?.url || matchedRestroom.restroomImage || null,
//             restroomCoordinates: matchedRestroom.modelCoordinates || [],
//             isExisting: true,
//           };
//         }
//         return {
//           name: poly.restroomName || `Restroom ${index + 1}`,
//           restroomId: polygonRestroomId || poly.id || nanoid(),
//           area: '',
//           type: '',
//           status: '',
//           toilets: '1',
//           restroomImage: null,
//           restroomCoordinates: [],
//           isExisting: false,
//         };
//       });
//       setRestrooms(mergedRestrooms);
//     }
//   }, [
//     building?.buildingModelCoordinates,
//     editData?.data?.restrooms,
//     building.isUserEdited,
//     dispatch,
//   ]);

//   const restroomChangeHandler = (index, field, value) => {
//     setRestrooms((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//     dispatch(setUserEdited(true));
//   };
//   const handleImageChange = (index, image, file, coordinates) => {
//     const updatedRestroom = {
//       ...building.restrooms[index],
//       ...(image && { restroomImage: image }),
//       ...(coordinates && { restroomCoordinates: coordinates }),
//     };

//     dispatch(updateRestroom({ index, data: updatedRestroom }));

//     // ✅ Always cache file when selected
//     if (file) {
//       setFileCache(`restroom-${index}`, file);
//     }
//   };

//   const restoreSensor = (sensorId) => {
//     const sensor = sensorsData?.data?.find((s) => s._id === sensorId);
//     if (sensor)
//       setAvailableSensors((prev) => [...prev, { option: sensor?.name, value: sensor?._id }]);
//   };

//   // ✅ Single restroom save
//   const handleSaveSingleRestroom = async (restroom) => {
//     try {
//       const restroomData = {
//         name: restroom.name,
//         type: restroom.type,
//         status: restroom.status,
//         area: restroom.area,
//         numOfToilets: parseInt(restroom.toilets),
//         coordinates: restroom.restroomCoordinates.map((coord) => ({
//           ...coord,
//           polygonId: coord?.polygonId || nanoid(),
//           labelPoint: coord?.labelPoint || 'first',
//         })),
//       };

//       const formData = new FormData();
//       Object.entries(restroomData).forEach(([key, val]) => {
//         formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
//       });
//       formData.append('buildingId', buildingId);

//       if (restroom.isExisting) {
//         if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
//           formData.append('modelImage', restroom.restroomImage);
//         }
//         await updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
//         toast.success(`${restroom.name} updated successfully`);
//       } else {
//         // ✅ FIX: Allow image URL OR File object
//         if (!restroom.restroomImage) {
//           toast.error(`Please upload a model image for ${restroom.name}`);
//           return;
//         }

//         if (typeof restroom.restroomImage === 'object') {
//           formData.append('modelImage', restroom.restroomImage);
//         }

//         await createRestroom(formData).unwrap();
//         toast.success(`${restroom.name} created successfully`);
//       }
//     } catch (err) {
//       toast.error(`Failed to save ${restroom.name}`);
//       console.error('❌ Error saving restroom:', err);
//     }
//   };

//   // ✅ Save entire building
//   const saveBuilding = async () => {
//     try {
//       setIsLoading(true);

//       const buildingData = {
//         name: building.buildingName,
//         type: building.buildingType,
//         location: building.location,
//         area: building.area,
//         latitude: building.mapInfo?.lat,
//         longitude: building.mapInfo?.lng,
//         totalFloors: building.totalFloors,
//         numberOfRooms: building.totalRestrooms,
//         buildingManager: building.buildingManager,
//         phone: building.phone,
//         buildingCoordinates: building?.buildingModelCoordinates || [],
//       };

//       const buildingFormData = new FormData();
//       Object.entries(buildingData).forEach(([key, val]) => {
//         buildingFormData.append(key, key === 'buildingCoordinates' ? JSON.stringify(val) : val);
//       });

//       if (building.buildingThumbnail)
//         buildingFormData.append('buildingThumbnail', building.buildingThumbnail);
//       if (building.buildingModelImage)
//         buildingFormData.append('buildingModelImage', building.buildingModelImage);

//       await updateBuilding({ buildingId, data: buildingFormData }).unwrap();

//       const restroomPromises = restrooms.map(async (restroom) => {
//         const restroomData = {
//           name: restroom.name,
//           type: restroom.type,
//           status: restroom.status,
//           area: restroom.area,
//           numOfToilets: parseInt(restroom.toilets),
//           coordinates: restroom.restroomCoordinates.map((coord) => ({
//             ...coord,
//             polygonId: coord?.polygonId || nanoid(),
//             labelPoint: coord?.labelPoint || 'first',
//           })),
//         };

//         const formData = new FormData();
//         Object.entries(restroomData).forEach(([key, val]) => {
//           formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
//         });
//         formData.append('buildingId', buildingId);

//         if (restroom.isExisting) {
//           if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
//             formData.append('modelImage', restroom.restroomImage);
//           }
//           return updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
//         } else {
//           // ✅ FIX: Allow both File object and URL
//           if (!restroom.restroomImage) {
//             throw new Error(`Please upload a model image for ${restroom.name}`);
//           }
//           if (typeof restroom.restroomImage === 'object') {
//             formData.append('modelImage', restroom.restroomImage);
//           }
//           return createRestroom(formData).unwrap();
//         }
//       });

//       await Promise.all(restroomPromises);

//       toast.success('Building and restrooms updated successfully');
//       setCurrentStep(1);
//     } catch (error) {
//       console.error('❌ Error updating building:', error);
//       toast.error(error?.data?.message || 'Failed to update building');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (sensorsData?.data?.length && restrooms.length) {
//       const usedSensorIds = restrooms.flatMap((r) => r.sensors || []);
//       const available = sensorsData.data
//         .filter((sensor) => !sensor.isConnect && !usedSensorIds.includes(sensor._id))
//         .map((sensor) => ({
//           option: sensor.name,
//           value: sensor._id,
//         }));

//       setAvailableSensors(available);
//     }
//   }, [sensorsData, restrooms]);

//   return (
//     <div>
//       <h6 className="text-base text-primary font-medium">Restrooms</h6>
//       <div className="mt-5 space-y-6">
//         {restrooms.map((restroom, index) => (
//           <div key={index} className="border border-gray-200 rounded-lg p-4">
//             <h6 className="text-lg font-medium mb-4">Restroom {index + 1}</h6>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//               <Input
//                 type="text"
//                 name="name"
//                 label="Restroom Name"
//                 placeholder="Restroom Name"
//                 value={restroom.name}
//                 onChange={(e) => restroomChangeHandler(index, 'name', e.target.value)}
//               />
//               <Input
//                 type="text"
//                 name="restroomId"
//                 label="Restroom ID"
//                 placeholder="Restroom ID"
//                 value={restroom._id ? restroom._id : restroom.restroomId}
//                 readOnly
//               />

//               <Dropdown
//                 label="Type"
//                 placeholder="Select type"
//                 initialValue={restroom.type || ''}
//                 onSelect={(value) => restroomChangeHandler(index, 'type', value)}
//                 options={[
//                   { option: 'Public', value: 'public' },
//                   { option: 'Private', value: 'private' },
//                 ]}
//               />

//               <Dropdown
//                 label="Status"
//                 placeholder="Select status"
//                 initialValue={restroom.status || ''}
//                 onSelect={(value) => restroomChangeHandler(index, 'status', value)}
//                 options={[
//                   { option: 'Active', value: 'active' },
//                   { option: 'Inactive', value: 'inactive' },
//                 ]}
//               />

//               <Input
//                 type="text"
//                 name="area"
//                 label="Area"
//                 placeholder="Area"
//                 value={restroom.area}
//                 onChange={(e) => restroomChangeHandler(index, 'area', e.target.value)}
//               />

//               <Input
//                 type="number"
//                 name="toilets"
//                 label="Number of Toilets"
//                 placeholder="Number of Toilets"
//                 value={restroom.toilets}
//                 onChange={(e) => restroomChangeHandler(index, 'toilets', e.target.value)}
//               />
//             </div>

//             <div className="mt-4">
//               <h6 className="font-medium mb-3">Restroom Layout</h6>
//               <div className="py-4 grid place-items-center">
//                 <MarkRestroomModel
//                   restroomIndex={index}
//                   setFile={(file) => handleImageChange(index, null, file, null)}
//                   restroomImage={restroom.restroomImage}
//                   setRestroomImage={(image) => handleImageChange(index, image, null, null)}
//                   polygons={restroom.restroomCoordinates || []}
//                   setPolygons={(coordinates) => handleImageChange(index, null, null, coordinates)}
//                   availableSensors={availableSensors}
//                   updateRestRoomHandler={(field, value) =>
//                     restroomChangeHandler(index, field, value)
//                   }
//                   restoreSensor={restoreSensor}
//                 />
//               </div>
//             </div>

//             <div className="mt-4">
//               <h6 className="text-sm font-medium mb-2">Restroom Coordinates</h6>
//               <p className="text-sm text-gray-600">
//                 {restroom.restroomCoordinates.length} polygon(s) defined
//               </p>
//             </div>

//             {/* ✅ Updated individual save + image validation message */}
//             <div className="mt-4 flex justify-between items-center">
//               <div className="text-sm">
//                 {!restroom.isExisting && !restroom.restroomImage && (
//                   <span className="text-red-500 font-medium">
//                     ⚠️ Model image required for new restroom
//                   </span>
//                 )}
//                 {restroom.isExisting &&
//                   restroom.restroomImage &&
//                   typeof restroom.restroomImage === 'object' && (
//                     <span className="text-blue-500 font-medium">
//                       📷 New image will replace existing
//                     </span>
//                   )}
//               </div>
//               <Button
//                 text={`Save ${restroom.name}`}
//                 width="!w-[180px]"
//                 onClick={() => handleSaveSingleRestroom(restroom)}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="flex items-center justify-end gap-4 mt-6">
//         <Button
//           text="Back"
//           width="!w-[150px]"
//           onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
//           cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
//         />
//         <Button
//           text={isLoading ? 'Saving...' : 'Save Building'}
//           width="!w-[150px]"
//           onClick={saveBuilding}
//         />
//       </div>
//     </div>
//   );
// };

// export default EditRestrooms;
//////////////////
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
import { setUserEdited, setApiData } from '@/features/building/buildingSlice';

// helper: convert data URL or remote URL to File
async function urlToFile(url, fileName = 'image.png') {
  // url might be a data: URL or an http(s) URL
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || 'image/png' });
}

const EditRestrooms = ({ setCurrentStep, buildingId }) => {
  const dispatch = useDispatch();
  const building = useSelector((state) => state.building);
  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
  const { data: sensorsData } = useGetAllSensorsQuery();
  const [updateBuilding] = useUpdateBuildingMutation();
  const [updateRestroom] = useUpdateRestroomMutation();
  const [deleteRestroom] = useDeleteRestroomMutation();
  const [createRestroom] = useCreateRestroomMutation();
  const [availableSensors, setAvailableSensors] = useState([]);
  const [restrooms, setRestrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logs (feel free to remove)
  // console.log('store building', building);
  // console.log('api building data ', editData?.data);
  // console.log('restrooms', restrooms);
  // console.log('availableSensors', availableSensors);

  // ✅ Load existing restrooms from API
  useEffect(() => {
    if (!building.isUserEdited) {
      // Store API data in Redux
      if (editData?.data) {
        dispatch(setApiData(editData.data));
      }

      const storePolygons = building?.buildingModelCoordinates || [];
      const apiRestrooms = editData?.data?.restrooms || [];
      if (!Array.isArray(storePolygons) || storePolygons.length === 0) return;

      const mergedRestrooms = storePolygons.map((poly, index) => {
        const polygonRestroomId = poly?.restroomId;
        const matchedRestroom = apiRestrooms.find(
          (r) => r._id === polygonRestroomId || r.restroomId === polygonRestroomId
        );
        if (matchedRestroom) {
          return {
            ...matchedRestroom,
            name: matchedRestroom.name || `Restroom ${index + 1}`,
            restroomId:
              matchedRestroom.restroomId || matchedRestroom._id || polygonRestroomId || nanoid(),
            area: matchedRestroom.area || '',
            type: matchedRestroom.type || '',
            status: matchedRestroom.status || '',
            toilets: matchedRestroom.numOfToilets?.toString() || matchedRestroom.toilets || '1',
            // keep URL string for existing model image so UI can show it
            restroomImage:
              matchedRestroom.modelImage?.[0]?.url || matchedRestroom.restroomImage || null,
            restroomCoordinates: matchedRestroom.modelCoordinates || [],
            sensors: matchedRestroom.sensors || [],
            isExisting: true,
            _id: matchedRestroom._id,
          };
        }
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
      setRestrooms(mergedRestrooms);
    }
  }, [
    building?.buildingModelCoordinates,
    editData?.data?.restrooms,
    building.isUserEdited,
    dispatch,
  ]);

  const restroomChangeHandler = (index, field, value) => {
    setRestrooms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    dispatch(setUserEdited(true));
  };

  // handleImageChange: accept (index, imageStringOrUrl, fileObject, coordinates)
  // - If `file` supplied (File), store that in restroomImage so uploads can use it directly.
  // - If `image` string supplied (dataURL or remote URL), store that too (we will convert to File before upload).
  const handleImageChange = (index, image, file, coordinates) => {
    setRestrooms((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };
      if (file) {
        // file is priority when provided
        target.restroomImage = file;
      } else if (image) {
        // data URL or URL string
        target.restroomImage = image;
      }
      if (coordinates) target.restroomCoordinates = coordinates;
      updated[index] = target;
      return updated;
    });
    dispatch(setUserEdited(true));
  };

  const restoreSensor = (sensorId) => {
    const sensor = sensorsData?.data?.find((s) => s._id === sensorId);
    if (sensor)
      setAvailableSensors((prev) => [...prev, { option: sensor?.name, value: sensor?._id }]);
  };

  // 🆕 Save single restroom
  const handleSaveSingleRestroom = async (restroom) => {
    try {
      const restroomData = {
        name: restroom.name,
        type: restroom.type,
        status: restroom.status,
        area: restroom.area,
        numOfToilets: parseInt(restroom.toilets),
        coordinates: (restroom.restroomCoordinates || []).map((coord) => ({
          ...coord,
          polygonId: coord?.polygonId || nanoid(),
          labelPoint: coord?.labelPoint || 'first',
        })),
      };

      const formData = new FormData();
      Object.entries(restroomData).forEach(([key, val]) => {
        formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
      });
      formData.append('buildingId', buildingId);

      if (restroom.isExisting) {
        // For existing restrooms: only append file if restroom.restroomImage is a File
        if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
          formData.append('modelImage', restroom.restroomImage);
        }
        await updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
        toast.success(`${restroom.name} updated successfully`);
      } else {
        // For new restrooms: ensure we have something to upload
        if (!restroom.restroomImage) {
          toast.error(`Please upload a model image for ${restroom.name}`);
          return;
        }

        // If restroomImage is a File (object), use it. If it's a data URL or remote URL (string) -> convert to File
        if (typeof restroom.restroomImage === 'object') {
          formData.append('modelImage', restroom.restroomImage);
        } else if (typeof restroom.restroomImage === 'string') {
          // convert string -> File
          try {
            const file = await urlToFile(
              restroom.restroomImage,
              `${restroom.restroomId || 'restroom'}-model.png`
            );
            formData.append('modelImage', file);
          } catch (e) {
            console.error('Failed to convert image URL to file', e);
            toast.error('Failed to process restroom image. Please re-upload the image.');
            return;
          }
        } else {
          toast.error(`Please upload a model image for ${restroom.name}`);
          return;
        }

        await createRestroom(formData).unwrap();
        toast.success(`${restroom.name} created successfully`);
      }
    } catch (err) {
      toast.error(`Failed to save ${restroom.name}`);
      console.error('❌ Error saving restroom:', err);
    }
  };

  // 🔹 Save all building & restrooms
  const saveBuilding = async () => {
    // New restrooms without images (either File or string) are not allowed
    const newRestroomsWithoutImages = restrooms.filter(
      (restroom) => !restroom.isExisting && !restroom.restroomImage
    );

    if (newRestroomsWithoutImages.length > 0) {
      toast.error(
        `Please upload model images for: ${newRestroomsWithoutImages.map((r) => r.name).join(', ')}`
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

      // Process restrooms (update or create). We'll convert string images when needed.
      const restroomPromises = restrooms.map(async (restroom) => {
        const restroomData = {
          name: restroom.name,
          type: restroom.type,
          status: restroom.status,
          area: restroom.area,
          numOfToilets: parseInt(restroom.toilets),
          coordinates: (restroom.restroomCoordinates || []).map((coord) => ({
            ...coord,
            polygonId: coord?.polygonId || nanoid(),
            labelPoint: coord?.labelPoint || 'first',
          })),
        };

        const formData = new FormData();
        Object.entries(restroomData).forEach(([key, val]) => {
          formData.append(key, key === 'coordinates' ? JSON.stringify(val) : val);
        });
        formData.append('buildingId', buildingId);

        if (restroom.isExisting) {
          // Append only when new file provided
          if (restroom.restroomImage && typeof restroom.restroomImage === 'object') {
            formData.append('modelImage', restroom.restroomImage);
          }
          return updateRestroom({ restroomId: restroom._id, data: formData }).unwrap();
        } else {
          // New restroom - must have image (File or string -> convert)
          if (!restroom.restroomImage) {
            throw new Error(`Please upload a model image for ${restroom.name}`);
          }

          if (typeof restroom.restroomImage === 'object') {
            formData.append('modelImage', restroom.restroomImage);
          } else if (typeof restroom.restroomImage === 'string') {
            try {
              const file = await urlToFile(
                restroom.restroomImage,
                `${restroom.restroomId || 'restroom'}-model.png`
              );
              formData.append('modelImage', file);
            } catch (e) {
              console.error('Failed to convert image URL to file', e);
              throw new Error(`Failed to process image for ${restroom.name}. Please re-upload.`);
            }
          } else {
            throw new Error(`Please upload a model image for ${restroom.name}`);
          }

          return createRestroom(formData).unwrap();
        }
      });

      await Promise.all(restroomPromises);

      toast.success('Building and restrooms updated successfully');
      setCurrentStep(1);
    } catch (error) {
      console.error('❌ Error updating building:', error);
      // Show server message if available
      const errMsg = error?.data?.message || error?.message || 'Failed to update building';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sensorsData?.data?.length && restrooms.length) {
      const usedSensorIds = restrooms.flatMap((r) => r.sensors || []);
      const available = sensorsData.data
        .filter((sensor) => !sensor.isConnect && !usedSensorIds.includes(sensor._id))
        .map((sensor) => ({
          option: sensor.name,
          value: sensor._id,
        }));

      setAvailableSensors(available);
    }
  }, [sensorsData, restrooms]);

  return (
    <div>
      <h6 className="text-base text-primary font-medium">Restrooms</h6>

      <div className="mt-5 space-y-6">
        {restrooms.map((restroom, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h6 className="text-lg font-medium mb-4">Restroom {index + 1}</h6>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Input
                type="text"
                name="name"
                label="Restroom Name"
                placeholder="Restroom Name"
                value={restroom.name}
                onChange={(e) => restroomChangeHandler(index, 'name', e.target.value)}
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
                onSelect={(value) => restroomChangeHandler(index, 'type', value)}
                options={[
                  { option: 'Public', value: 'public' },
                  { option: 'Private', value: 'private' },
                ]}
              />

              <Dropdown
                label="Status"
                placeholder="Select status"
                initialValue={restroom.status || ''}
                onSelect={(value) => restroomChangeHandler(index, 'status', value)}
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
                onChange={(e) => restroomChangeHandler(index, 'area', e.target.value)}
              />

              <Input
                type="number"
                name="toilets"
                label="Number of Toilets"
                placeholder="Number of Toilets"
                value={restroom.toilets}
                onChange={(e) => restroomChangeHandler(index, 'toilets', e.target.value)}
              />
            </div>

            <div className="mt-4">
              <h6 className="font-medium mb-3">Restroom Layout</h6>
              <div className="py-4 grid place-items-center">
                <MarkRestroomModel
                  restroomIndex={index}
                  setFile={(file) => handleImageChange(index, null, file, null)}
                  restroomImage={restroom.restroomImage}
                  setRestroomImage={(image) => handleImageChange(index, image, null, null)}
                  polygons={restroom.restroomCoordinates || []}
                  setPolygons={(coordinates) => handleImageChange(index, null, null, coordinates)}
                  availableSensors={availableSensors}
                  updateRestRoomHandler={(field, value) =>
                    restroomChangeHandler(index, field, value)
                  }
                  restoreSensor={restoreSensor}
                />
              </div>
            </div>

            <div className="mt-4">
              <h6 className="text-sm font-medium mb-2">Restroom Coordinates</h6>
              <p className="text-sm text-gray-600">
                {restroom.restroomCoordinates?.length || 0} polygon(s) defined
              </p>
            </div>

            {/* 🆕 Individual Save Button */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                {!restroom.isExisting && !restroom.restroomImage && (
                  <span className="text-red-500 font-medium">
                    ⚠️ Model image required for new restroom
                  </span>
                )}
                {restroom.isExisting &&
                  restroom.restroomImage &&
                  typeof restroom.restroomImage === 'object' && (
                    <span className="text-blue-500 font-medium">
                      📷 New image will replace existing
                    </span>
                  )}
              </div>
              <Button
                text={`Save ${restroom.name}`}
                width="!w-[180px]"
                onClick={() => handleSaveSingleRestroom(restroom)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-4 mt-6">
        <Button
          text="Back"
          width="!w-[150px]"
          onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
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
