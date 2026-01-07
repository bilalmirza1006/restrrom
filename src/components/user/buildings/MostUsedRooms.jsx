'use client';
import { useState } from 'react';
import Twomen from '@/assets/default/Twomen';
import Dropdown from '@/components/global/small/Dropdown';
import CustomAreaChart from '@/components/global/charts/CustomLineChart';

const timeOptions = [
  { option: 'Hour', value: 'hour' },
  { option: 'Day', value: 'day' },
  { option: 'Week', value: 'week' },
  { option: 'Month', value: 'month' },
];

const MostUsedRooms = ({ mostUsedRestroom }) => {
  const [selectedTime, setSelectedTime] = useState('hour');
  console.log('MostUsedRooms - mostUsedRestroom:', mostUsedRestroom);
  const label = mostUsedRestroom?.restroomName
    ? `Restroom: ${mostUsedRestroom.restroomName}`
    : mostUsedRestroom?.sensorName
      ? `Slate: ${mostUsedRestroom.sensorName}`
      : 'Unnamed Restroom';
  console.log('MostUsedRooms - label:', label);
  return (
    <div className="scroll-0 overflow-y-scroll rounded-xl bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Twomen />
          <h2 className="text-xl font-medium">
            Most Used{' '}
            {mostUsedRestroom && mostUsedRestroom.length > 0
              ? mostUsedRestroom[0]?.restroomName
                ? 'Restrooms'
                : mostUsedRestroom[0]?.sensorName
                  ? 'Slates'
                  : 'Restrooms'
              : 'Restrooms'}
          </h2>
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

      {/* List */}
      <div className="mt-5 flex h-153.75 flex-col gap-5 overflow-y-auto">
        {Array.isArray(mostUsedRestroom) && mostUsedRestroom.length > 0 ? (
          mostUsedRestroom.map((item, i) => (
            <List item={item} key={i} selectedTime={selectedTime} />
          ))
        ) : (
          <p className="text-center text-sm text-gray-400">No restroom usage data available</p>
        )}
      </div>
    </div>
  );
};

export default MostUsedRooms;

const List = ({ item, selectedTime }) => {
  if (!item) return null;

  const rawChartData = item?.chartData?.[selectedTime];

  const data = Array.isArray(rawChartData)
    ? rawChartData
        .map(d => {
          if (!d || typeof d !== 'object') return null;

          const xKey = Object.keys(d).find(key => key !== 'value');
          return xKey ? { x: d[xKey], value: d.value ?? 0 } : null;
        })
        .filter(Boolean)
    : [];

  return (
    <div className="flex items-center justify-between border-b border-gray-300 py-2">
      {/* Restroom Info */}
      <div className="flex flex-col">
        <h4 className="text-[14px] font-bold">
          {(item?.restroomName || item?.sensorName) ?? 'Unnamed Restroom'}
        </h4>

        <h6 className="text-[12px] font-medium">Floor info</h6>
      </div>

      {/* Chart */}
      <div className="w-[35%]">
        <CustomAreaChart type="linear" height={100} data={data} xaxis="x" yaxis="value" />
      </div>

      {/* Usage Percentage */}
      <div>
        <h4 className="text-[14px] font-bold">{item?.percentage ?? '0%'}</h4>
      </div>
    </div>
  );
};
