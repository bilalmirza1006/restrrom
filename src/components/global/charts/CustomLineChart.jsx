"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AiOutlineArrowUp } from "react-icons/ai";

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const currentValue = payload[0].value;
  return (
    <div className="bg-white border border-gray-300 rounded-md p-2 text-xs shadow-md">
      <p className="text-gray-700 font-semibold mb-1">{label} May 2024</p>
      <div className="flex items-center gap-1">
        <span className="text-[#A449EB] font-bold">{currentValue}%</span>
        <AiOutlineArrowUp className="text-green-500" />
      </div>
    </div>
  );
}

export default function CustomAreaChart({
  type = "monotone",
  height = 300,
  data,
  xaxis,
  yaxis,
}) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          {xaxis && (
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#888" }}
            />
          )}

          {yaxis && (
            <YAxis
              domain={[10, 50]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#888" }}
              tickFormatter={(val) => `${val}%`}
            />
          )}

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#d0d0d0", strokeDasharray: "3 3" }}
          />

          {/* Define gradients */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A449EB" stopOpacity={1} />
              <stop offset="100%" stopColor="#A449EB" stopOpacity={0.5} />
            </linearGradient>
            {/* Gradient for the area fill */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A449EB" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#A449EB" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type={type}
            dataKey="value"
            stroke="url(#lineGradient)"
            strokeWidth={2}
            fill="url(#areaGradient)"
            fillOpacity={1}
            dot={false}
            activeDot={{
              r: 6,
              stroke: "#A449EB",
              strokeWidth: 2,
              fill: "#fff",
            }}
            baseValue="dataMin"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
