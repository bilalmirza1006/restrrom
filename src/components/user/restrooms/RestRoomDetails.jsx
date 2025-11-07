'use client';
import React, { useEffect, useRef, useState } from 'react';
import FloorList from '../buildings/FloorList';
import MostUsedRooms from '../buildings/MostUsedRooms';
import CustomDropdown from '@/components/global/CustomDropdown';
import FloorActivityChart from '../buildings/FloorActivityChart';
import InfoCards from './InfoCards';
import ActiveAlerts from './ActiveAlerts';
import Button from '@/components/global/small/Button';
import Link from 'next/link';
import SensorTable from './SensorTable';
// import SensorTable from './SensorTable';

const buildingImage =
  'https://res.cloudinary.com/hamzanafasat/image/upload/v1755063318/rest-room/building-models/xmjx04gv73z6rnycrurl.jpg';

function RestRoomDetails() {
  const [popupData, setPopupData] = useState(null);
  const data = {
    stats: [
      {
        id: 1,
        title: 'Total Floors',
        borderColor: 'border-[#078E9B]',
        hoverColor: 'hover:bg-[#078E9B15]',
        count: '2',
        icon: '/svgs/user/green-step.svg',
      },
      {
        id: 2,
        title: 'Total Restrooms',
        borderColor: 'border-[#A449EB]',
        hoverColor: 'hover:bg-[#A449EB15]',
        count: '4',
        icon: '/svgs/user/purple-restroom.svg',
      },
      {
        id: 3,
        title: 'Restrooms In Use',
        borderColor: 'border-[#FF9500]',
        hoverColor: 'hover:bg-[#FF950015]',
        count: '6',
        icon: '/svgs/user/yellow-toilet.svg',
      },
      {
        id: 4,
        title: 'Total Sensors',
        borderColor: 'border-[#FF4D85]',
        hoverColor: 'hover:bg-[#FF4D8515]',
        count: '8',
        icon: '/svgs/user/pink-buzzer.svg',
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
        <canvas
          onClick={event =>
            handleCanvasClick({
              event,
              canvasRef,
              polygons: data.sensors, // ✅ your polygons come from sensors
              setPopupData,
              // other params...
            })
          }
          className="h-full w-full"
          ref={canvasRef}
        />
        {popupData && (
          <div
            style={{
              top: popupData.y + 90,
              left: popupData.x - 90,
            }}
            className={`absolute z-10 flex flex-col gap-3 rounded-2xl bg-white p-5`}
          >
            <div className="flex items-center justify-between gap-15">
              <p className="text-primary text-xl font-semibold">{popupData.polygon.name}</p>
              <p className="text-primary font-semibold">{popupData.polygon.value}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-primary text-xl font-semibold">Parameters</p>
              {popupData.polygon.parameters.map(item => (
                <p className="text-xs font-medium">{item}</p>
              ))}
            </div>
            <Link
              className="bg-primary border-primary flex h-[50px] w-full cursor-pointer items-center rounded-[10px] border px-4 text-center text-base font-bold text-white transition-all duration-150 hover:opacity-60"
              href={`/user/sensors/sensor-detail/${popupData.polygon.id}`}
            >
              see Full detail
            </Link>
          </div>
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
          <div>
            <div className="rounded-xl bg-white p-5">
              <div className="flex justify-between">
                <h1 className="text-[24px] font-semibold">Floors Activity</h1>
                <CustomDropdown lists={['This Month', 'This Week', 'This Year']} />
              </div>
              <FloorActivityChart />
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <MostUsedRooms />
        </div>
        <div className="col-span-12 rounded-2xl bg-white p-5">
          <SensorTable />
        </div>
      </div>
    </div>
  );
}

export default RestRoomDetails;
