"use client";
import Spinner from "@/components/global/small/Spinner";
import { useGetSingleSensorQuery } from "@/features/sensor/sensorApi";
import { useEffect, useState } from "react";
import AlertHistory from "./AlertHistory";
import BasicInfo from "./BasicInfo";
import HistoryData from "./HistoryData";
import SpecificInfo from "./SpecificInfo";
import StatusAndData from "./StatusAndData";

const SensorDetail = ({ id }) => {
  const { data, isLoading, error } = useGetSingleSensorQuery(id);
  const [sensorData, setSensorData] = useState({});

  console.log("SensorDetail", sensorData);

  useEffect(() => {
    if (data?.sensor) {
      setSensorData(data.sensor);
    }
  }, [data]);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  return (
    <section className="bg-white p-4 md:p-5 rounded-[10px]">
      <h4 className="text-base md:text-xl font-semibold text-[#05004E]">
        Sensor Details
      </h4>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
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
