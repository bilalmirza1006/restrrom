'use client';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const FloorActivityChart = ({ range, sensorData }) => {
  console.log('FloorActivityChart props:', { range, sensorData });

  // ✅ Safe data extraction
  const data = Array.isArray(sensorData?.[range]) ? sensorData[range] : [];

  console.log('FloorActivityChart data:', data);

  // ✅ Safe key extraction
  const waterLeakageKeys = Array.from(
    new Set(
      data.flatMap(obj =>
        obj && typeof obj === 'object'
          ? Object.keys(obj).filter(key => key.includes('water_leakage'))
          : []
      )
    )
  );

  const colors = ['#FF4C85', '#FF7300', '#1F2253', '#00C49F', '#0088FE', '#AA00FF', '#FFBB28'];

  return (
    <section className="h-[495px] rounded-[14px] px-4 py-3">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          {waterLeakageKeys.length > 0 &&
            waterLeakageKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={false}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default FloorActivityChart;
