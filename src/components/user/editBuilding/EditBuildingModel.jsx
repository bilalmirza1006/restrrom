import Button from '@/components/global/small/Button';
import MarkBuildingModel from '../addBuilding/MarkBuildingModel';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBuilding, setModelEdited, setApiData } from '@/features/building/buildingSlice';
import { setFileCache } from '@/utils/fileStore';
import toast from 'react-hot-toast';
import { useGetBuildingWithRestroomsQuery } from '@/features/building/buildingApi';
import { useDeleteRestroomMutation } from '@/features/restroom/restroomApi';

const EditBuildingModel = ({ setCurrentStep, buildingId }) => {
  const dispatch = useDispatch();
  const [buildingModelPreview, setBuildingModelPreview] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [file, setFile] = useState(null);
  const building = useSelector(state => state.building);
  console.log('modelbuildingpolygons', polygons);

  const { data: editData } = useGetBuildingWithRestroomsQuery(buildingId);
  const [deleteRestroom, { isLoading }] = useDeleteRestroomMutation();

  const [existingApiPolygons, setExistingApiPolygons] = useState([]);
  const [apiNumberOfRooms, setApiNumberOfRooms] = useState(0);
  const [restRoomId, setRestRoomId] = useState('');
  // console.log('restRoomIdrestRoomIdrestRoomIdrestRoomIdrestRoomId', restRoomId);

  // 🟢 Load API data
  useEffect(() => {
    if (building.isModelEdit === true) return;
    if (editData?.data?.building) {
      const b = editData.data.building;

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
  const handleDelete = async id => {
    try {
      await deleteRestroom(id).unwrap();
      toast.success('Restroom deleted successfully!');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete restroom');
    }
  };

  // 🟣 Limit polygons to totalRestrooms
  // 🟣 Compare restroom IDs difference on polygon change
  const handlePolygonsChange = newPolygons => {
    const totalRestrooms = Number(building?.totalRestrooms || 0);
    const existingCount = existingApiPolygons.length;
    const allowedExtra = totalRestrooms - apiNumberOfRooms;
    const maxAllowed = existingCount + allowedExtra;

    if (newPolygons.length > maxAllowed) {
      toast.error(`You can only add ${allowedExtra} new restroom${allowedExtra !== 1 ? 's' : ''}.`);
      return;
    }

    // 🧩 Get previous and new restroom IDs
    const prevIds = polygons.map(p => p.restroomId).filter(Boolean);
    const newIds = newPolygons.map(p => p.restroomId).filter(Boolean);

    // 🧠 Detect which restroom polygon was deleted
    const deletedIds = prevIds.filter(id => !newIds.includes(id));

    if (deletedIds.length > 0) {
      deletedIds.forEach(id => {
        toast.error(`🗑️ Restroom polygon with ID ${id} was deleted`);
        console.log('Deleted restroom polygon ID:', id);

        setRestRoomId(id);
        handleDelete(id);
      });
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
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      toast.error('Please upload a building model image and mark at least one restroom.');
    }
  };

  return (
    <div>
      <h6 className="text-primary text-base font-medium">Building Model</h6>
      <p className="mt-2 text-sm text-gray-600">
        You can only create up to <b>{building?.totalRestrooms}</b> restrooms. ({apiNumberOfRooms}{' '}
        already exist in this building)
      </p>

      <div className="grid place-items-center py-10">
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
          onClick={() => setCurrentStep(prevStep => prevStep - 1)}
          cn="!bg-[#ACACAC40] !text-[#111111B2] hover:!bg-primary hover:!text-white"
        />
        <Button text="Next" width="!w-[150px]" onClick={nextBtnHandler} />
      </div>
    </div>
  );
};

export default EditBuildingModel;
