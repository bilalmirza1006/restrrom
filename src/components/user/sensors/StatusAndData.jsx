const StatusAndData = ({ sensorInfo }) => {
  return (
    <div className="shadow-md rounded-[15px] p-4 md:p-5 border border-gray-200">
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
    if (typeof value === "boolean") {
      return (
        <span
          className={`text-sm font-medium py-[5px] px-5 rounded-lg text-white ${
            value ? "bg-secondary" : " bg-orange-400"
          }`}
        >
          {value ? "Active" : "Not Active"}
        </span>
      );
    }

    return (
      <p className="text-base md:text-lg font-medium text-primary">{value}</p>
    );
  };

  return (
    <div className="rounded-lg shadow-sm py-2 px-6 flex items-center justify-between mt-4">
      <h4 className="text-sm text-[#686868]">{title}</h4>
      {renderValue()}
    </div>
  );
};
