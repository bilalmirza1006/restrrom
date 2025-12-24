'use client';
import React, { useState } from 'react';
import withPageGuard from '@/components/auth/withPageGuard';
import AllAlerts from '@/components/user/alerts/AllAlerts';
import AllRuleEngine from '@/components/user/ruleEngine/AllRuleEngine';

function Alerts() {
  const [value, setValue] = useState('Alerts');

  const handleChange = newValue => {
    setValue(newValue);
  };
  return (
    <div className="flex w-full flex-col rounded-lg bg-white">
      <div className="flex border-b border-gray-300">
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            value === 'Alerts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
          onClick={() => handleChange('Alerts')}
        >
          Alerts
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            value === 'RuleEngine' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
          onClick={() => handleChange('RuleEngine')}
        >
          Rule Engine
        </button>
      </div>

      <div className="mt-4 p-4 md:mt-10">
        {value === 'Alerts' && <AllAlerts />}
        {value === 'RuleEngine' && <AllRuleEngine />}
      </div>
    </div>
  );
}

export default withPageGuard(Alerts, '/admin/alerts');
