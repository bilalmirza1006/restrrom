'use client';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { BuildingIcon } from '@/assets/icon';

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded border border-gray-200 bg-white p-2 shadow-md">
        <p className="text-sm font-semibold">{data.buildingName}</p>
        <p className="text-xs">Total Performance: {data.totalPerformance}</p>
      </div>
    );
  }
  return null;
};

const PieChartComponent = ({
  data = [],
  COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  icon,
  width = 200,
  height = 200,
  loading = false,
  ...rest
}) => {
  // if (loading) {
  //   return (
  //     <div className="mx-auto mt-4 flex flex-col items-center">
  //       {/* Skeleton Pie */}
  //       <Skeleton circle width={width} height={height} />
  //       {/* Skeleton Legend */}
  //       <div className="mt-6 flex flex-wrap justify-center gap-4">
  //         {(data?.length || 3) &&
  //           Array.from({ length: data?.length || 3 }).map((_, index) => (
  //             <div key={index} className="flex items-center gap-2">
  //               <Skeleton circle width={12} height={12} />
  //               <Skeleton width={80} height={12} />
  //             </div>
  //           ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div>
      <div className="relative mt-4 grid place-items-center">
        <PieChart width={width} height={height}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            cornerRadius={8}
            fill="#8884d8"
            paddingAngle={3}
            dataKey="totalPerformance"
            label={renderLabel}
            labelLine={false}
            {...rest}
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
        {icon && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <img src={icon} alt="icon" className="w-[60px]" />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4">
        {data?.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm font-medium text-[#030229]">{entry.buildingName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;
