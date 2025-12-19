'use client';
import { useState } from 'react';
import Twomen from '@/assets/default/Twomen';
// import CustomAreaChart from '@/components/global/charts/CustomAreaChart';
import Dropdown from '@/components/global/small/Dropdown';
import CustomAreaChart from '@/components/global/charts/CustomLineChart';

const timeOptions = [
  { option: 'Hour', value: 'hour' },
  { option: 'Day', value: 'day' },
  { option: 'Week', value: 'week' },
  { option: 'Month', value: 'month' },
];

const MostUsedRooms = ({ mostUsedRestroom }) => {
  const [selectedTime, setSelectedTime] = useState('hour'); // default chart view

  return (
    <div className="scroll-0 overflow-y-scroll rounded-xl bg-white p-5">
      {/* Header with Dropdown */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Twomen />
          <h2 className="text-xl font-medium">Most Used Restrooms</h2>
        </div>
        <div className="w-40">
          <Dropdown
            options={timeOptions}
            defaultText="Select Time"
            onSelect={setSelectedTime}
            initialValue={selectedTime}
          />
        </div>
      </div>

      {/* List of Restrooms */}
      <div className="mt-5 flex h-[615px] flex-col gap-5 overflow-y-auto">
        {mostUsedRestroom.map((item, i) => (
          <List item={item} key={i} selectedTime={selectedTime} />
        ))}
      </div>
    </div>
  );
};

export default MostUsedRooms;

const List = ({ item, selectedTime }) => {
  // Transform data to consistent keys: x & value
  const data =
    item.chartData[selectedTime]?.map(d => {
      const xKey = Object.keys(d).find(key => key !== 'value'); // hour/day/week/month
      return { x: d[xKey], value: d.value };
    }) || [];

  return (
    <div className="flex items-center justify-between border-b border-gray-300 py-2">
      {/* Restroom Info */}
      <div className="flex flex-col">
        <h4 className="text-[14px] font-[700]">{item.restroomName}</h4>
        <h6 className="text-[12px] font-[500]">Floor info</h6>
      </div>

      {/* Chart */}
      <div className="w-[35%]">
        <CustomAreaChart type="linear" height={100} data={data} xaxis="x" yaxis="value" />
      </div>

      {/* Usage Percentage */}
      <div>
        <h4 className="text-[14px] font-[700]">{item.percentage}</h4>
      </div>
    </div>
  );
};
