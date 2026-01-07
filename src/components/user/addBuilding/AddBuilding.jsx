'use client';
import GeneralInfo from './GeneralInfo';
import BuildingModel from './BuildingModel';
import Maping from './Maping';
import Restrooms from './Restrooms';
import { useState } from 'react';

const AddBuilding = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = ['General Information', 'Building Model', 'Maping', 'Restrooms'];

  const renderStep = step => {
    switch (step) {
      case 1:
        return <GeneralInfo setCurrentStep={setCurrentStep} />;
      case 2:
        return <BuildingModel setCurrentStep={setCurrentStep} />;
      case 3:
        return <Maping setCurrentStep={setCurrentStep} />;
      case 4:
        return <Restrooms setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };
  return (
    <div className="rounded-[10px] bg-white p-4 md:p-5">
      <h4 className="text-center text-base font-semibold text-[#05004E] md:text-[22px]">
        Add Building
      </h4>
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

export default AddBuilding;
