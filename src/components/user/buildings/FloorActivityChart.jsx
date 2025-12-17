// 'use client';

// import {
//   CartesianGrid,
//   Legend,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from 'recharts';

// // Mock data
// const activityChartData = [
//   {
//     name: '9 AM',
//     door_queue: 12,
//     stall_status: 3,
//     occupancy: 18,
//     air_quality: 75,
//     toilet_paper: 60,
//     soap_dispenser: 40,
//     water_leakage: 2,
//   },
//   {
//     name: '10 AM',
//     door_queue: 18,
//     stall_status: 5,
//     occupancy: 22,
//     air_quality: 82,
//     toilet_paper: 70,
//     soap_dispenser: 50,
//     water_leakage: 5,
//   },
//   {
//     name: '11 AM',
//     door_queue: 8,
//     stall_status: 7,
//     occupancy: 15,
//     air_quality: 68,
//     toilet_paper: 55,
//     soap_dispenser: 35,
//     water_leakage: 1,
//   },
//   {
//     name: '12 PM',
//     door_queue: 22,
//     stall_status: 2,
//     occupancy: 28,
//     air_quality: 90,
//     toilet_paper: 80,
//     soap_dispenser: 60,
//     water_leakage: 3,
//   },
//   {
//     name: '1 PM',
//     door_queue: 15,
//     stall_status: 6,
//     occupancy: 20,
//     air_quality: 77,
//     toilet_paper: 65,
//     soap_dispenser: 45,
//     water_leakage: 4,
//   },
//   {
//     name: '2 PM',
//     door_queue: 10,
//     stall_status: 4,
//     occupancy: 17,
//     air_quality: 72,
//     toilet_paper: 50,
//     soap_dispenser: 30,
//     water_leakage: 6,
//   },
//   {
//     name: '3 PM',
//     door_queue: 25,
//     stall_status: 8,
//     occupancy: 30,
//     air_quality: 88,
//     toilet_paper: 75,
//     soap_dispenser: 55,
//     water_leakage: 2,
//   },
// ];

// const FloorActivityChart = () => {
//   return (
//     <section className="h-[495px] rounded-[14px] px-4 py-3">
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart
//           data={activityChartData}
//           margin={{
//             top: 10,
//             right: 20,
//             bottom: 10,
//             left: -20,
//           }}
//         >
//           <CartesianGrid vertical={false} />
//           <XAxis
//             dataKey="name"
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontSize: 12, fill: '#555' }}
//           />
//           <YAxis
//             domain={['auto', 'auto']}
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontSize: 12, fill: '#555' }}
//           />
//           <Tooltip />
//           <Legend
//             layout="horizontal"
//             align="center"
//             verticalAlign="start"
//             wrapperStyle={{
//               position: 'relative',
//               bottom: 10,
//               marginTop: 5,
//               marginBottom: 20,
//             }}
//             formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
//           />
//           <Line type="monotone" dataKey="door_queue" stroke="#FF4C85" strokeWidth={3} dot={false} />
//           <Line
//             type="monotone"
//             dataKey="stall_status"
//             stroke="#FF7300"
//             strokeWidth={3}
//             dot={false}
//           />
//           <Line type="monotone" dataKey="occupancy" stroke="#1F2253" strokeWidth={3} dot={false} />
//           <Line
//             type="monotone"
//             dataKey="air_quality"
//             stroke="#00C49F"
//             strokeWidth={3}
//             dot={false}
//           />
//           <Line
//             type="monotone"
//             dataKey="toilet_paper"
//             stroke="#0088FE"
//             strokeWidth={3}
//             dot={false}
//           />
//           <Line
//             type="monotone"
//             dataKey="soap_dispenser"
//             stroke="#AA00FF"
//             strokeWidth={3}
//             dot={false}
//           />
//           <Line
//             type="monotone"
//             dataKey="water_leakage"
//             stroke="#FFBB28"
//             strokeWidth={3}
//             dot={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </section>
//   );
// };

// export default FloorActivityChart;

'use client';

import { dayData, weekData, monthData } from '@/data/data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// import { dayData, weekData, monthData } from './activityData';

const FloorActivityChart = ({ range }) => {
  const dataMap = {
    day: dayData,
    week: weekData,
    month: monthData,
  };

  return (
    <section className="h-[495px] rounded-[14px] px-4 py-3">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dataMap[range]}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* 7 Sensor Lines */}
          <Line type="monotone" dataKey="door_queue" stroke="#FF4C85" strokeWidth={3} dot={false} />
          <Line
            type="monotone"
            dataKey="stall_status"
            stroke="#FF7300"
            strokeWidth={3}
            dot={false}
          />
          <Line type="monotone" dataKey="occupancy" stroke="#1F2253" strokeWidth={3} dot={false} />
          <Line
            type="monotone"
            dataKey="air_quality"
            stroke="#00C49F"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="toilet_paper"
            stroke="#0088FE"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="soap_dispenser"
            stroke="#AA00FF"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="water_leakage"
            stroke="#FFBB28"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default FloorActivityChart;
