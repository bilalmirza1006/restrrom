const StatusAndData = ({ sensorInfo }) => {
  return (
    <div className="rounded-[15px] border border-gray-200 p-4 shadow-md md:p-5">
      <h6 className="text-primary text-base font-semibold">Status and Data</h6>
      <List title="Status" value={sensorInfo?.status} />
      <List title="Battery" value="90%" />
      <List title="Last Update" value="10:15 AM, 22-Jul-2024" />
    </div>
  );
};

export default StatusAndData;

const List = ({ title, value }) => {
  const renderValue = () => {
    if (typeof value === 'boolean') {
      return (
        <span
          className={`rounded-lg px-5 py-[5px] text-sm font-medium text-white ${
            value ? 'bg-secondary' : ' bg-orange-400'
          }`}
        >
          {value ? 'Active' : 'Not Active'}
        </span>
      );
    }

    return <p className="text-primary text-base font-medium md:text-lg">{value}</p>;
  };

  return (
    <div className="mt-4 flex items-center justify-between rounded-lg px-6 py-2 shadow-sm">
      <h4 className="text-sm text-[#686868]">{title}</h4>
      {renderValue()}
    </div>
  );
};
