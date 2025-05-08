"use client";
import { Cell, Pie, PieChart } from "recharts";

const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
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

const PieChartComponent = ({
  data,
  COLORS,
  icon,
  width = 200,
  height = 200,
  ...rest
}) => {
  return (
    <>
      <div className="relative grid place-items-center mt-4">
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
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            {...rest}
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS?.length]}
              />
            ))}
          </Pie>
        </PieChart>
        {icon && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src={icon} alt="bin image" className="w-[60px]" />
          </div>
        )}
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 max-w-[344px] mx-auto">
        {data?.map((entry, index) => (
          <div key={`cell-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <span className="text-sm font-medium text-[#030229]">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default PieChartComponent;
