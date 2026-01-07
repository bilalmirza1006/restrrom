'use client';
import Dropdown from '@/components/global/small/Dropdown';
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const barValue = payload.find(p => p.dataKey === 'bar')?.value;
    return (
      <div className="rounded-lg bg-white p-2 shadow-md">
        <div className="text-lg font-semibold text-gray-800">{barValue}%</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    );
  }
  return null;
};

const HistoryData = ({ datas }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [range, setRange] = useState('day');

  const options = [
    { option: 'Hour', value: 'hour' },
    { option: 'Day', value: 'day' },
    { option: 'This Week', value: 'week' },
    { option: 'This Month', value: 'month' },
  ];

  // Transform the data for the chart
  const data = mapDataForChart(datas[range] || []);

  return (
    <div className="h-83.25 w-full rounded-[15px] border border-gray-200 p-4 shadow-md md:p-5">
      <div className="mb-5 flex items-center justify-between">
        <h6 className="text-primary text-base font-semibold">Historical Data</h6>
        <Dropdown
          options={options}
          defaultText="day"
          initialValue="day"
          width="180px"
          onSelect={value => setRange(value)}
        />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 30 }}
          onMouseMove={state =>
            state.isTooltipActive ? setActiveIndex(state.activeTooltipIndex) : setActiveIndex(null)
          }
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid horizontal vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A449EB', fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            domain={[0, 55]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#A449EB', fontSize: 12 }}
            tickFormatter={val => `${val}C`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="bar" barSize={36}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={idx === activeIndex ? '#A449EB' : '#E5E7EB'}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </Bar>
          <Line
            dataKey="line"
            stroke="#A449EB"
            strokeWidth={2}
            strokeLinecap="round"
            dot={{
              r: 4,
              fill: '#A449EB',
              stroke: '#fff',
              strokeWidth: 2,
            }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryData;
// Function to map raw data to chart format
const mapDataForChart = dataArray => {
  return dataArray.map(item => ({
    date: item.date,
    bar: item.count, // For the Bar chart
    line: item.count, // For the Line chart (if needed)
  }));
};
