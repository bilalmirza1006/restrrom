'use client';
import Spinner from '@/components/global/small/Spinner';
import { useGetSingleSensorQuery } from '@/features/sensor/sensorApi';
import { useEffect, useState } from 'react';
import AlertHistory from './AlertHistory';
import BasicInfo from './BasicInfo';
import HistoryData from './HistoryData';
import SpecificInfo from './SpecificInfo';
import StatusAndData from './StatusAndData';

const SensorDetail = ({ id }) => {
  const { data, isLoading, error } = useGetSingleSensorQuery(id);
  const [sensorData, setSensorData] = useState({});

  console.log('SensorDetail', sensorData);

  useEffect(() => {
    if (data?.data) {
      setSensorData(data.data);
    }
  }, [data]);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  return (
    <section className="rounded-[10px] bg-white p-4 md:p-5">
      <h4 className="text-base font-semibold text-[#05004E] md:text-xl">Sensor Details</h4>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <BasicInfo sensorInfo={sensorData} />
            <StatusAndData sensorInfo={sensorData} />
            <SpecificInfo />
          </div>
          <div className="flex flex-col gap-5">
            <HistoryData />
            <AlertHistory />
          </div>
        </div>
      )}
    </section>
  );
};

export default SensorDetail;
