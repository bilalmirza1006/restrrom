// import { STATUS_DATA_CONFIG } from './statusDataConfig';

import { STATUS_DATA_CONFIG } from './SensorConfig';

const StatusAndData = ({ sensorType, sensorInfo }) => {
  console.log('StatusAndData sensorType:', sensorType);
  console.log('StatusAndData sensorInfo:', sensorInfo);
  const rows = STATUS_DATA_CONFIG[sensorType]?.(sensorInfo);

  if (!rows) return null;

  return (
    <div className="rounded-[15px] border border-gray-200 p-4 shadow-md md:p-5">
      <h6 className="text-primary text-base font-semibold">Status and Data</h6>

      {rows.map((item, index) => (
        <List key={index} title={item.title} value={item.value} />
      ))}
    </div>
  );
};

export default StatusAndData;

const STATUS_STATES = ['occupied', 'vacant', 'free', 'busy'];

const List = ({ title, value }) => {
  const renderValue = () => {
    // Boolean status (occupancy, water leakage)
    if (typeof value === 'boolean') {
      return (
        <span
          className={`rounded-lg px-5 py-1.25 text-sm font-medium text-white ${
            value ? 'bg-secondary' : 'bg-orange-400'
          }`}
        >
          {value ? 'Active' : 'Not Active'}
        </span>
      );
    }

    // String-based status (stall_status.state)
    if (typeof value === 'string' && STATUS_STATES.includes(value.toLowerCase())) {
      const isActive = value.toLowerCase() === 'occupied';

      return (
        <span
          className={`rounded-lg px-5 py-1.25 text-sm font-medium text-white ${
            isActive ? 'bg-secondary' : 'bg-gray-400'
          }`}
        >
          {value}
        </span>
      );
    }

    return <p className="text-primary text-base font-medium md:text-lg">{value ?? '-'}</p>;
  };

  return (
    <div className="mt-4 flex items-center justify-between rounded-lg px-6 py-2 shadow-sm">
      <h4 className="text-sm text-[#686868]">{title}</h4>
      {renderValue()}
    </div>
  );
};
