'use client';
import React from 'react';
import { FaSmile } from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function RestRoomPerformance() {
  const data = [
    {
      day: '5 May',
      value: 23,
      date: '2024-07-05',
    },
    {
      day: '6 May',
      value: 24,
      date: '2024-07-06',
    },
    {
      day: '7 May',
      value: 29,
      date: '2024-07-07',
    },
    {
      day: '8 May',
      value: 39,
      date: '2024-07-08',
    },
    {
      day: '9 May',
      value: 14,
      date: '2024-07-09',
    },
    {
      day: '10 May',
      value: 368,
      date: '2024-07-10',
    },
    {
      day: '11 May',
      value: 456,
      date: '2024-07-10',
    },
    {
      day: '12 May',
      value: 600,
      date: '2024-07-10',
    },
    {
      day: '13 May',
      value: 600,
      date: '2024-07-10',
    },
    {
      day: '14 May',
      value: 600,
      date: '2024-07-10',
    },
    {
      day: '15 May',
      value: 600,
      date: '2024-07-10',
    },
    {
      day: '16 May',
      value: 46,
      date: '2024-07-10',
    },
    {
      day: '17 May',
      value: 46,
      date: '2024-07-10',
    },
  ];
  return (
    <div className="basis-[100%] bg-white shadow-lg mt-5 rounded-xl py-3 px-4  xl:basis-[32%]">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-[20px] font-bold">Restrooms Performance</h1>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          stackOffset="expand"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid opacity={0.4} vertical={false} />
          <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
          <YAxis tickMargin={27} dataKey="value" axisLine={false} tickLine={false} tickCount={7} />
          <Tooltip content={renderTooltip} />
          <Line dot={false} strokeWidth={2} type="monotone" dataKey="value" stroke="#058F9A" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between items-center mt-2">
        <p className="text-[14px] text-[#767676]">
          Your performance is 50% better<br></br> compare to last month
        </p>
        <span className="text-[24px] text-[#2E2E30] font-bold">50%</span>
      </div>
    </div>
  );
}

export default RestRoomPerformance;
function renderTooltip({ active, payload }) {
  if (active) {
    const fullData = payload[0].payload;
    const date = fullData.date;
    const formattedDate = formatDateWithSuffix(date);

    return (
      <div className="bg-white flex gap-2 items-center py-3 px-5 rounded-xl">
        <p>
          <FaSmile fill="#078E9B" fontSize={30} />
        </p>
        <div>
          <p className="text-[18px] font-bold text-[#767676]">{fullData.value}</p>
          <p className="text-[14px] text-[#767676]">{formattedDate}</p>
        </div>
      </div>
    );
  }
}

const formatDateWithSuffix = (rawDate) => {
  const date = new Date(rawDate);

  const day = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });

  const getSuffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  return `${weekday}, ${month} ${day}${getSuffix(day)}`;
};
