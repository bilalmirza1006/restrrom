'use client';
import Button from '@/components/global/small/Button';
import Dropdown from '@/components/global/small/Dropdown';
import Input from '@/components/global/small/Input';
import MarkRestroomModel from '@/components/user/addBuilding/MarkRestroomModel';
import { updateRestroom } from '@/features/building/buildingSlice';
import { useDispatch } from 'react-redux';
import { setFileCache } from '@/utils/fileStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

const AddFloor = ({ setCurrentStep }) => {
  const dispatch = useDispatch();

  const [restroom, setRestroom] = useState({
    name: '',
    type: '',
    status: '',
    area: '',
    toilets: '',
    restroomImage: null,
    restroomCoordinates: [],
  });

  const [polygons, setPolygons] = useState([]);
  const [availableSensors, setAvailableSensors] = useState([]);

  const handleChange = (field, value) => {
    setRestroom((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (image, file, coordinates) => {
    if (image) handleChange('restroomImage', image);
    if (coordinates) handleChange('restroomCoordinates', coordinates);
    if (file) setFileCache(`restroom`, file);
  };

  const handleSave = () => {
    const { name, type, status, area, toilets } = restroom;
    if (!name || !type || !status || !area || !toilets) {
      toast.error('Please fill all required fields');
      return;
    }

    dispatch(updateRestroom({ index: 0, data: restroom })); // index is still needed by reducer
    toast.success('Restroom data saved');
  };

  return (
    <div>
      <h6 className="text-base text-primary font-medium">Restroom</h6>
      <div className="py-6 p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Restroom Name"
            placeholder="Enter name"
            value={restroom.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <Dropdown
            label="Type"
            placeholder="Select type"
            value={restroom.type}
            setValue={(value) => handleRestroomChange(index, 'type', value)}
            options={[
              { label: 'Public', value: 'public' },
              { label: 'Private', value: 'private' },
            ]}
          />

          <Dropdown
            label="Status"
            placeholder="Select status"
            setValue={(value) => handleChange('status', value)}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <Input
            label="Area (sq ft)"
            placeholder="Enter area"
            type="number"
            value={restroom.area}
            onChange={(e) => handleChange('area', e.target.value)}
          />

          <Input
            label="Number of Toilets"
            placeholder="Enter toilets"
            type="number"
            value={restroom.toilets}
            onChange={(e) => handleChange('toilets', e.target.value)}
          />
        </div>

        <div>
          <h6 className="font-medium mb-3">Restroom Layout</h6>
          <div className="py-4 grid place-items-center">
            <MarkRestroomModel
              setFile={(file) => handleImageChange(null, file, null)}
              restroomImage={restroom.restroomImage}
              setRestroomImage={(image) => handleImageChange(image, null, null)}
              polygons={polygons}
              setPolygons={(coordinates) => handleImageChange(null, null, coordinates)}
              availableSensors={availableSensors}
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button text="Save Restroom" width="!w-[200px]" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default AddFloor;
