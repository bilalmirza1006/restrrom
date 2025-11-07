const SpecificInfo = () => {
  return (
    <div className="rounded-[15px] border border-gray-200 p-4 shadow-md md:p-5">
      <h6 className="text-primary text-base font-semibold">Sensor-Specific Information</h6>
      <List title="Current Occupancy" value="03" />
      <List title="Peak Occupancy" value="10" />
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
