"use client";
import React, { useState } from "react";
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
} from "recharts";

const data = [
  { date: "3 May", bar: 28, line: 25 },
  { date: "4 May", bar: 40, line: 32 },
  { date: "5 May", bar: 22, line: 20 },
  { date: "6 May", bar: 33, line: 25 },
  { date: "7 May", bar: 26, line: 19 },
  { date: "8 May", bar: 31, line: 24 },
  { date: "9 May", bar: 40, line: 35 },
  { date: "10 May", bar: 27, line: 24 },
  { date: "11 May", bar: 33, line: 28 },
  { date: "12 May", bar: 29, line: 19 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const barValue = payload.find((p) => p.dataKey === "bar")?.value;
    return (
      <div className="bg-white p-2 rounded-lg shadow-md">
        <div className="text-lg font-semibold text-gray-800">{barValue}%</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    );
  }
  return null;
};

const HistoryData = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full h-[333px] shadow-md rounded-[15px] p-4 md:p-5 border border-gray-200">
      <h6 className="text-primary text-base font-semibold mb-5">
        Historical Data
      </h6>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 30 }}
          onMouseMove={(state) =>
            state.isTooltipActive
              ? setActiveIndex(state.activeTooltipIndex)
              : setActiveIndex(null)
          }
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid horizontal vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#A449EB", fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            domain={[0, 55]} // increase range to give space for thick line
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#A449EB", fontSize: 12 }}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Bar dataKey="bar" barSize={36}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={idx === activeIndex ? "#A449EB" : "#E5E7EB"}
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
              fill: "#A449EB",
              stroke: "#fff",
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
