"use client";
import GeneralInfo from "./GeneralInfo";
import BuildingModel from "./BuildingModel";
import Maping from "./Maping";
import Restrooms from "./Restrooms";
import { useState } from "react";

const AddBuilding = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    "General Information",
    "Building Model",
    "Maping",
    "Restrooms",
  ];

  const renderStep = (step) => {
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
    <div className="bg-white p-4 md:p-5 rounded-[10px]">
      <h4 className="text-center text-[#05004E] text-base md:text-[22px] font-semibold">
        Add Building
      </h4>
      <div className="flex items-center justify-center mt-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`size-[32px] rounded-full text-lg font-medium grid place-items-center ${
                index > currentStep
                  ? "bg-[#D9D9D9] text-[#11111180]"
                  : index == currentStep
                  ? "bg-[#D9D9D9] text-[#000]"
                  : "bg-primary text-white"
              }`}
            >
              {index + 1}
            </div>
            <h6
              className={`text-base md:text-lg font-semibold ml-3 ${
                index > currentStep
                  ? "text-[#11111180]"
                  : index == currentStep
                  ? "text-[#000]"
                  : "text-primary"
              }`}
            >
              {step}
            </h6>
            {index < steps.length - 1 && (
              <div
                className={`h-[2px] w-[100px] ${
                  index >= currentStep ? "bg-[#D9D9D9]" : "bg-primary"
                }`}
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
