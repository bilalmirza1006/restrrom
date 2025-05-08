const SpecificInfo = () => {
  return (
    <div className="shadow-md rounded-[15px] p-4 md:p-5 border border-gray-200">
      <h6 className="text-primary text-base font-semibold">
        Sensor-Specific Information
      </h6>
      <List title="Current Occupancy" value="03" />
      <List title="Peak Occupancy" value="10" />
    </div>
  );
};

export default SpecificInfo;

const List = ({ title, value }) => {
  return (
    <div className="rounded-lg shadow-sm py-2 px-6 flex items-center justify-between mt-4">
      <h4 className="text-sm text-[#686868]">{title}</h4>
      <p className="text-base md:text-lg font-medium text-primary">{value}</p>
    </div>
  );
};
