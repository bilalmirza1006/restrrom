const BasicInfo = ({ sensorInfo }) => {
  return (
    <div className="shadow-md rounded-[15px] p-4 md:p-5 border border-gray-200">
      <h6 className="text-primary text-base font-semibold">
        Basic Sensor Information
      </h6>
      <List title="Sensor Name" value={sensorInfo?.name} />
      <List title="Sensor Type" value={sensorInfo?.type} />
      <List title="Unique Id" value={sensorInfo?.uniqueId} />
    </div>
  );
};

export default BasicInfo;

const List = ({ title, value }) => {
  return (
    <div className="rounded-lg shadow-sm py-2 px-6 flex items-center justify-between mt-4">
      <h4 className="text-sm text-[#686868]">{title}</h4>
      <p className="text-base md:text-lg font-medium text-primary">{value}</p>
    </div>
  );
};
