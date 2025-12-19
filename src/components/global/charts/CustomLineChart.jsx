'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AiOutlineArrowUp } from 'react-icons/ai';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const currentValue = payload[0].value;
  return (
    <div className="rounded-md border border-gray-300 bg-white p-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-gray-700">{label}</p>
      <div className="flex items-center gap-1">
        <span className="font-bold text-[#A449EB]">{currentValue}%</span>
        <AiOutlineArrowUp className="text-green-500" />
      </div>
    </div>
  );
}

export default function CustomAreaChart({ type = 'monotone', height = 300, data, xaxis, yaxis }) {
  if (!data || !data.length) return null; // don't render empty chart

  // Find Y-axis max dynamically
  const yMax = Math.max(...data.map(d => d[yaxis])) * 1.2;

  return (
    <div className="w-full bg-white">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />

          {xaxis && (
            <XAxis
              dataKey={xaxis} // now using prop
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
            />
          )}

          {yaxis && (
            <YAxis
              dataKey={yaxis}
              domain={[0, yMax]} // dynamic max
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
            />
          )}

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#d0d0d0', strokeDasharray: '3 3' }}
          />

          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A449EB" stopOpacity={1} />
              <stop offset="100%" stopColor="#A449EB" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A449EB" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#A449EB" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type={type}
            dataKey={yaxis}
            stroke="url(#lineGradient)"
            strokeWidth={2}
            fill="url(#areaGradient)"
            fillOpacity={1}
            dot={false}
            activeDot={{
              r: 6,
              stroke: '#A449EB',
              strokeWidth: 2,
              fill: '#fff',
            }}
            baseValue="dataMin"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
