"use client";
import { activityChartData } from "@/data/data";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FloorActivityChart = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h6 className="text-lg md:text-2xl font-semibold text-black">
          Floors Activity
        </h6>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={activityChartData}
          margin={{
            top: 10,
            right: 20,
            bottom: 10,
            left: -20,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#555" }}
          />
          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#555" }}
          />
          <Tooltip />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="start"
            wrapperStyle={{
              position: "relative",
              bottom: 10,
              marginTop: 5,
              marginBottom: 20,
            }}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="floor1"
            stroke="#FF4C85"
            strokeWidth={3}
            dot={false}
          />{" "}
          <Line
            type="monotone"
            dataKey="floor2"
            stroke="#FF7300"
            strokeWidth={3}
            dot={false}
          />{" "}
          <Line
            type="monotone"
            dataKey="floor3"
            stroke="#1F2253"
            strokeWidth={3}
            dot={false}
          />{" "}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default FloorActivityChart;
