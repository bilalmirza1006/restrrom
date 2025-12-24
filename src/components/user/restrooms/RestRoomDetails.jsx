'use client';
import React, { useEffect, useRef, useState } from 'react';
import FloorList from '../buildings/FloorList';
import MostUsedRooms from '../buildings/MostUsedRooms';
import CustomDropdown from '@/components/global/CustomDropdown';
// import FloorActivityChart from '../buildings/FloorActivityChart';
import InfoCards from './InfoCards';
import ActiveAlerts from './ActiveAlerts';
import Button from '@/components/global/small/Button';
import Link from 'next/link';
import SensorTable from './SensorTable';
import FloorActivityChart from '../buildings/FloorActivityChart';
import Dropdown from '@/components/global/small/Dropdown';
import RestroomShowCanvasData from './RestrromShowCanvasData';
// import SensorTable from './SensorTable';

const buildingImage =
  'https://res.cloudinary.com/hamzanafasat/image/upload/v1755063318/rest-room/building-models/xmjx04gv73z6rnycrurl.jpg';

function RestRoomDetails({ restRoom }) {
  const [popupData, setPopupData] = useState(null);
  const [image, setImage] = useState('');
  const [polygons, setPolygons] = useState([]);
  console.log('imageimageimage', image);
  console.log('polygonspolygonspolygons', polygons);
  console.log('restroomrestroomrestroomrestroomrestroomrestroomrestroom', restRoom);
  const [range, setRange] = useState('day');
  const options = [
    { option: 'Day', value: 'day' },
    { option: 'This Week', value: 'week' },
    { option: 'This Month', value: 'month' },
  ];
  const data = {
    stats: [
      {
        id: 1,
        title: 'Total Sensors',
        borderColor: 'border-[#FF4D85]',
        hoverColor: 'hover:bg-[#FF4D8515]',
        count: restRoom?.data?.totalSensors ?? 0,
        icon: '/svgs/user/pink-buzzer.svg',
      },
      {
        id: 2,
        title: 'Total Slates',
        borderColor: 'border-[#A449EB]',
        hoverColor: 'hover:bg-[#A449EB15]',
        count: restRoom?.data?.occupancyStats?.totalOccupancySensors ?? 0,
        icon: '/svgs/user/purple-restroom.svg',
      },
      {
        id: 3,
        title: 'Total Vacant',
        borderColor: 'border-[#078E9B]',
        hoverColor: 'hover:bg-[#078E9B15]',
        count: restRoom?.data?.occupancyStats?.totalVacant ?? 0,
        icon: '/svgs/user/green-step.svg',
      },

      {
        id: 4,
        title: 'Slates In Use',
        borderColor: 'border-[#FF9500]',
        hoverColor: 'hover:bg-[#FF950015]',
        count: restRoom?.data?.occupancyStats?.totalOccupied ?? 0,
        icon: '/svgs/user/yellow-toilet.svg',
      },
    ],
    image: '/Frame 2085666687.png',
    sensors: [
      {
        id: 1,
        name: 's1',
        status: 'active',
        parameters: ['Temperature', 'Co', 'Tvoc'],
        value: 5,
        color: '#6ACBFFD9',
        border: '#6ACBFF',
        polygon: [
          { x: 329, y: 265 },
          { x: 469, y: 282 },
          { x: 409, y: 342 },
          { x: 310, y: 314 },
        ],
      },
      {
        id: 2,
        name: 's2',
        status: 'inactive',
        parameters: ['Temperature', 'Co', 'Tvoc'],
        value: 5,
        color: '#FF6A6AD9', // red for inactive
        border: '#FF6A6A',
        polygon: [
          { x: 150, y: 150 },
          { x: 250, y: 150 },
          { x: 250, y: 250 },
          { x: 150, y: 250 },
        ],
      },
    ],
  };

  const handleCanvasClick = ({ event, canvasRef, polygons, setPopupData }) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Detect clicked polygon
    for (let sensor of polygons) {
      // better naming
      const coords = sensor.polygon; // ✅ correct property name
      if (!coords || coords.length === 0) continue; // safety check

      const path = new Path2D();
      path.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        path.lineTo(coords[i].x, coords[i].y);
      }
      path.closePath();

      if (ctx.isPointInPath(path, clickX, clickY)) {
        setPopupData({
          // store coordinates relative to canvas
          x: clickX,
          y: clickY,
          polygon: sensor,
        });
        return;
      }
    }

    setPopupData(null);
  };

  const canvasRef = useRef();
  useEffect(() => {
    if (restRoom?.data) {
      setImage(restRoom.data.modelImage?.[0]?.url || '');
      setPolygons(restRoom.data.modelCoordinates || []);
    }
  }, [restRoom]);

  useEffect(() => {
    const image = new Image();
    image.src = data.image;

    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      //   const scaleX = canvas.width / image.width;
      //   const scaleY = canvas.height / image.height;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      data.sensors.forEach(sensor => {
        ctx.beginPath();
        ctx.moveTo(sensor.polygon[0].x, sensor.polygon[0].y);
        for (let i = 1; i < sensor.polygon.length; i++) {
          ctx.lineTo(sensor.polygon[i].x, sensor.polygon[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = sensor.color;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = sensor.border;
        ctx.stroke();
      });
    };
  }, []);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="relative col-span-12 rounded-2xl bg-white p-7.5 shadow-md lg:col-span-8">
        {image && polygons.length ? (
          <RestroomShowCanvasData image={image} polygons={polygons} />
        ) : (
          <p className="mt-20 text-center text-gray-400">Loading restroom model...</p>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <ActiveAlerts />
      </div>
      <div className="col-span-12 grid grid-cols-12 gap-5">
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data?.stats.map(item => (
              <InfoCards
                key={item.id}
                borderColor={item.borderColor}
                count={item.count}
                hoverColor={item.hoverColor}
                title={item.title}
                icon={item.icon}
              />
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-semibold">Water leakage activity</h1>
              <Dropdown
                options={options}
                defaultText="day"
                initialValue="day"
                width="180px"
                onSelect={value => setRange(value)}
              />
            </div>

            <FloorActivityChart range={range} sensorData={restRoom?.data?.waterLeakageData} />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <MostUsedRooms mostUsedRestroom={restRoom?.data?.mostUseSlate} />
        </div>
        <div className="col-span-12 rounded-2xl bg-white p-5">
          <SensorTable data={restRoom?.data?.sensors} />
        </div>
      </div>
    </div>
  );
}

export default RestRoomDetails;
