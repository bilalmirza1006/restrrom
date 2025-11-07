'use client';
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const NestedPieChart = ({ title, data }) => {
  const renderLegend = useMemo(
    () =>
      ({ payload }) => {
        const filtered = payload.filter(entry => data.some(d => d.name === entry.value));
        return (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {filtered.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-800">{entry.value}</span>
              </div>
            ))}
          </div>
        );
      },
    []
  );

  return (
    <div className="relative h-[490px] w-[470px] rounded-lg bg-white px-6 py-7 shadow-lg">
      <div>
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          {data.map((entry, index) => (
            <Pie
              key={index}
              data={[
                { name: entry.name, value: entry.value },
                { name: 'Remaining', value: 100 - entry.value },
              ]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50 + index * 10}
              outerRadius={58 + index * 10}
              startAngle={90}
              endAngle={-270}
              cornerRadius={5}
              nameKey="name"
            >
              <Cell fill={entry.color} />
              <Cell fill="#F5F5F5" />
            </Pie>
          ))}
          <Legend layout="horizontal" verticalAlign="bottom" content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>

      {/* Centered percentage in the circle */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        99%
      </div>
    </div>
  );
};

export default NestedPieChart;
