"use client";

import { useState } from "react";
import PricePlans from "./PricePlans";
import Review from "./Review";

const Plans = () => {
  const [isActiveTab, setIsActiveTab] = useState("Price Plans");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const tabsHandler = (tab) => {
    setIsActiveTab(tab);
  };

  return (
    <section className="bg-white rounded-[15px] p-4 lg:p-6">
      <div className="flex items-center gap-4">
        {["Price Plans", "Review"].map((tab) => {
          const isDisabled = !selectedPlan;
          return (
            <button
              key={tab}
              className={`text-base font-semibold px-5 py-3 rounded-md transition-all duration-150 ${
                isActiveTab === tab
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-100"
              } ${isDisabled ? "!cursor-not-allowed" : "cursor-pointer"}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && tabsHandler(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className="mt-4 md:mt-6 pb-7">
        {isActiveTab === "Price Plans" && (
          <PricePlans
            onSelectPlan={(plan) => {
              setSelectedPlan(plan);
              tabsHandler("Review");
            }}
          />
        )}
        {isActiveTab === "Review" && <Review plan={selectedPlan} />}
      </div>
    </section>
  );
};

export default Plans;
