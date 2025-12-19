const QueueingStatus = ({ building }) => {
  const stats = building?.queuingStats || {};

  // Optional: format flow count as "X IN & Y OUT" if needed
  const flowCountText = stats.totalFlowCount
    ? `${stats.totalFlowCount} IN & ${stats.totalFlowCount - stats.totalOccupied || 0} OUT`
    : '-';

  return (
    <div className="rounded-lg bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h6 className="text-secondary text-base font-semibold md:text-xl">Queueing Status</h6>
        {/* <div className="rounded-lg bg-[#FFC472] px-4 py-2 text-sm font-medium text-white">
          Small Queue
        </div> */}
      </div>

      <div className="mt-5 flex flex-col gap-5 md:gap-7">
        <List title={'Total Restrooms'} value={building?.numberOfRooms || 0} />
        <List title=" Total Occupancy Sensors" value={stats.totalOccupancySensors || 0} />
        <List title="Occupied Restrooms" value={stats.totalOccupied || 0} />
        <List title="Vacant Restrooms" value={stats.totalVacant || 0} />
        <List title="People In Queue" value={stats.totalPeopleInQueue || 0} />
        <List title="Flow Count" value={flowCountText} />
      </div>
    </div>
  );
};

export default QueueingStatus;

const List = ({ title, value }) => {
  return (
    <div className="flex items-center justify-between rounded-md bg-[#F6EAFF] px-5 py-3">
      <h6 className="text-base text-[#111111] md:text-lg">{title}</h6>
      <p className="text-primary text-base font-semibold md:text-xl">{value}</p>
    </div>
  );
};
