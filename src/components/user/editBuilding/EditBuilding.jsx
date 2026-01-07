'use client';
import EditGeneralInfo from './EditGeneralInfo';
import EditBuildingModel from './EditBuildingModel';
import EditMapping from './EditMapping';
import EditRestrooms from './EditRestrooms';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  useGetBuildingEditDataQuery,
  useGetBuildingWithRestroomsQuery,
} from '@/features/building/buildingApi';
import Loader from '@/components/global/Loader';

const newLocal = 'text-base leading-[32px] font-semibold md:text-lg';
const EditBuilding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const params = useParams();
  const buildingId = params.buildingId;

  const { data: editData, isLoading: editDataLoading } =
    useGetBuildingWithRestroomsQuery(buildingId);

  const steps = ['General Information', 'Building Model', 'Mapping', 'Restrooms'];

  const renderStep = step => {
    switch (step) {
      case 1:
        return <EditGeneralInfo setCurrentStep={setCurrentStep} buildingId={buildingId} />;
      case 2:
        return <EditBuildingModel setCurrentStep={setCurrentStep} buildingId={buildingId} />;
      case 3:
        return <EditMapping setCurrentStep={setCurrentStep} buildingId={buildingId} />;
      case 4:
        return <EditRestrooms setCurrentStep={setCurrentStep} buildingId={buildingId} />;
      default:
        return null;
    }
  };

  if (editDataLoading) {
    return <Loader />;
  }

  return (
    <div className="rounded-[10px] bg-white p-4 md:p-5">
      <h4 className={newLocal}>Edit Building</h4>
      <div className="mt-4 flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`grid size-8 place-items-center rounded-full text-lg font-medium ${
                index > currentStep
                  ? 'bg-[#D9D9D9] text-[#11111180]'
                  : index == currentStep
                    ? 'bg-[#D9D9D9] text-black'
                    : 'bg-primary text-white'
              }`}
            >
              {index + 1}
            </div>
            <h6
              className={`ml-3 text-base font-semibold md:text-lg ${
                index > currentStep
                  ? 'text-[#11111180]'
                  : index == currentStep
                    ? 'text-black'
                    : 'text-primary'
              }`}
            >
              {step}
            </h6>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-25 ${index >= currentStep ? 'bg-[#D9D9D9]' : 'bg-primary'}`}
              ></div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 md:mt-6">{renderStep(currentStep)}</div>
    </div>
  );
};

export default EditBuilding;
