'use client';

import Dropdown from '@/components/global/small/Dropdown';
import React, { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#A449EB', '#22C55E', '#F97316', '#0EA5E9'];

const DROPDOWN_OPTIONS = [
  { option: 'This Day', value: 'day' },
  { option: 'This Week', value: 'week' },
  { option: 'This Month', value: 'month' },
];

export default function AdminCustomLineChart({
  setPeriod,
  period,
  apiData,
  loading = false,
  height = 320,
}) {
  // Merge multiple buildings into chart-friendly data
  const chartData = useMemo(() => {
    if (!Array.isArray(apiData) || !apiData.length) return [];

    const timeMap = {};

    apiData.forEach(building => {
      if (!building) return;

      // Unique key per building for chart data
      const key = `${building.buildingName}-${building.buildingId}`;

      const points = building[period];
      if (!Array.isArray(points)) return;

      points.forEach(point => {
        if (!point || !point.name) return;
        if (!timeMap[point.name]) timeMap[point.name] = { name: point.name };
        timeMap[point.name][key] = point.value ?? 0;
      });
    });

    return Object.values(timeMap);
  }, [apiData, period]);

  // Dynamic Y-axis max
  const yMax = useMemo(() => {
    if (!chartData.length) return 10;
    return (
      Math.max(
        ...chartData.flatMap(d =>
          Object.keys(d)
            .filter(k => k !== 'name')
            .map(k => (d[k] != null ? d[k] : 0))
        )
      ) * 1.2
    );
  }, [chartData]);

  // Skeleton Loader
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton width={160} height={24} />
          <Skeleton width={150} height={40} />
        </div>
        <Skeleton height={height} borderRadius={12} />
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h6 className="text-lg font-semibold text-black">Overall Performance</h6>
        <Dropdown
          options={DROPDOWN_OPTIONS}
          defaultText="Select Period"
          onSelect={value => setPeriod(value)}
          width={150}
          initialValue={period}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />

          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis domain={[0, yMax]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={40}
            formatter={value => value.split('-')[0]} // show only building name
          />

          {apiData?.map((building, index) => {
            if (!building) return null;

            const key = `${building.buildingName}-${building.buildingId}`;

            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
