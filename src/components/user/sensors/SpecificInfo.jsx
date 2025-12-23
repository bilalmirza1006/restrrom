// import { SENSOR_UI_CONFIG } from './sensorConfig';

import { SENSOR_UI_CONFIG } from './SensorConfig';

const SpecificInfo = ({ sensorType, sensorData }) => {
  // console.log('sensorType in SpecificInfo:', sensorType);
  // console.log('sensorData in SpecificInfo:', sensorData);
  const fields = SENSOR_UI_CONFIG[sensorType];

  if (!fields) {
    return (
      <div className="rounded-[15px] border p-4">
        <p className="text-sm text-gray-500">No sensor-specific information available</p>
      </div>
    );
  }

  return (
    <div className="rounded-[15px] border border-gray-200 p-4 shadow-md md:p-5">
      <h6 className="text-primary text-base font-semibold">Sensor-Specific Information</h6>

      {fields.map((item, index) => (
        <List key={index} title={item.label} value={item.value(sensorData) ?? '-'} />
      ))}
    </div>
  );
};

export default SpecificInfo;

const List = ({ title, value }) => {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg px-6 py-2 shadow-sm">
      <h4 className="text-sm text-[#686868]">{title}</h4>
      <p className="text-primary text-base font-medium md:text-lg">{value}</p>
    </div>
  );
};
