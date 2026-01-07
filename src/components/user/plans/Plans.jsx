'use client';

import { useState } from 'react';
import PricePlans from './PricePlans';
import Review from './Review';
import CurrentSubscription from './CurrentSubscription';

const Plans = () => {
  const [isActiveTab, setIsActiveTab] = useState('Current Subscription');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const tabsHandler = tab => {
    setIsActiveTab(tab);
  };

  return (
    <section className="rounded-[15px] bg-white p-4 lg:p-6">
      <div className="flex items-center gap-4">
        {['Current Subscription', 'Price Plans', 'Review'].map(tab => {
          const isDisabled = tab === 'Review' && !selectedPlan;
          return (
            <button
              key={tab}
              className={`rounded-md px-5 py-3 text-base font-semibold transition-all duration-150 ${
                isActiveTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-100'
              } ${isDisabled ? 'cursor-not-allowed!' : 'cursor-pointer'}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && tabsHandler(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pb-7 md:mt-6">
        {isActiveTab === 'Current Subscription' && <CurrentSubscription />}
        {isActiveTab === 'Price Plans' && (
          <PricePlans
            onSelectPlan={plan => {
              setSelectedPlan(plan);
              tabsHandler('Review');
            }}
          />
        )}
        {isActiveTab === 'Review' && <Review plan={selectedPlan} />}
      </div>
    </section>
  );
};

export default Plans;
