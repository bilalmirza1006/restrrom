'use client';
import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { FaSmile } from 'react-icons/fa';

function UsersEngagment() {
  const data = [
    {
      value: 290,
      date: '2024-07-01',
    },
    {
      value: 382,
      date: '2024-07-02',
    },
    {
      value: 356,
      date: '2024-07-03',
    },
    {
      value: 600,
      date: '2024-07-4',
    },
    {
      value: 400,
      date: '2024-07-05',
    },
    {
      value: 300,
      date: '2024-07-06',
    },
    {
      value: 500,
      date: '2024-07-07',
    },
    {
      value: 569,
      date: '2024-07-08',
    },
    {
      value: 487,
      date: '2024-07-09',
    },
    {
      value: 368,
      date: '2024-07-10',
    },
  ];
  return (
    <div className="mt-5 h-fit basis-full rounded-xl bg-white px-4 py-3 shadow-lg xl:basis-[32%]">
      <div className="mb-5 flex items-center justify-between px-2">
        <h1 className="text-[20px] font-bold">User’s Engagement</h1>
      </div>
      <ResponsiveContainer width="102%" height={280}>
        <ComposedChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} opacity={0.4} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <YAxis tickMargin={20} dataKey="value" axisLine={false} tickLine={false} tickCount={7} />
          <Tooltip content={renderTooltip} />
          <Bar dataKey="value" fill="#E9ECF1" activeBar={{ fill: '#A449EB' }} />
          <Line dot={{ fill: '#fff' }} dataKey="value" stroke="#A449EB" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[14px] text-[#767676]">
          Your performance is 30% better<br></br> compare to last month
        </p>
        <span className="text-[24px] font-bold text-[#2E2E30]">30%</span>
      </div>
    </div>
  );
}

export default UsersEngagment;

const formatDateWithSuffix = rawDate => {
  const date = new Date(rawDate);

  const day = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });

  const getSuffix = d => {
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

function renderTooltip({ active, payload }) {
  if (active) {
    const fullData = payload[0].payload;
    const date = fullData.date;
    const formattedDate = formatDateWithSuffix(date);

    return (
      <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-3">
        <p>
          <FaSmile fill="#A449EB" fontSize={30} />
        </p>
        <div>
          <p className="text-[18px] font-bold text-[#767676]">{fullData.value}</p>
          <p className="text-[14px] text-[#767676]">{formattedDate}</p>
        </div>
      </div>
    );
  }
}
