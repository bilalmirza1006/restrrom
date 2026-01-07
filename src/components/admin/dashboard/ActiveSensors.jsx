'use client';
import React from 'react';
import { GoAlertFill } from 'react-icons/go';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
function ActiveSensors() {
  const legenditems = [
    {
      name: 'Queuing',
      value: 31,
      fill: '#FF5248',
    },
    {
      name: 'Flow Count',
      value: 26,
      fill: '#00D1FF',
    },
    {
      name: 'Stall Occupancy',
      value: 15,
      fill: '#00AF95',
    },
    {
      name: 'Toilet Paper',
      value: 0,
      fill: '#7A5AF8',
    },
    {
      name: 'Water Leakage',
      value: 0,
      fill: '#FAD85D',
    },
  ];

  function customLegend() {
    return (
      <div className="relative flex w-full flex-wrap justify-center gap-3">
        {legenditems.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
            <span className="text-[12px] text-[#030229] sm:text-[16px] md:text-[13px] xl:text-[12px]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  }
  const data = [
    {
      name: 'Flow Count',
      value: 56,
      fill: '#00D1FF',
    },
    {
      name: 'Queuing',
      value: 45,
      fill: '#FF5248',
    },

    {
      name: 'Stall Occupancy',
      value: 44,
      fill: '#00AF95',
    },
  ];
  return (
    <div className="mt-5 h-101 basis-full rounded-xl bg-white px-4 py-3 shadow-lg xl:basis-[32%]">
      <div className="flex items-center gap-2 px-2">
        <span>
          <GoAlertFill fontSize={26} fill="#FF3B30" />
        </span>
        <h1 className="flex items-center gap-2 text-[20px] font-bold">ActiveSensors</h1>
      </div>
      <div className="relative top-[34%] left-[44%] flex w-fit items-center gap-2 sm:left-[47%] lg:left-[44%]">
        <h1 className="text-[24px] font-bold">99%</h1>
      </div>
      <ResponsiveContainer className="" height={310}>
        <RadialBarChart
          cx="50%"
          cy="36%"
          innerRadius={65}
          outerRadius={118}
          barSize={12}
          data={data}
        >
          <RadialBar cornerRadius={20} background dataKey="value" />
          <Legend content={customLegend} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActiveSensors;
