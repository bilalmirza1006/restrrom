const QueueingStatus = ({ building }) => {
  return (
    <div className="rounded-lg bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h6 className="text-secondary text-base font-semibold md:text-xl">Queueing Status</h6>
        <div className="rounded-lg bg-[#FFC472] px-4 py-2 text-sm font-medium text-white">
          Small Queue
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-5 md:gap-6">
        <List title={'Total Restrooms'} value={building?.numberOfRooms} />
        <List title={'Occupied Restrooms'} value={'1'} />
        <List title={'Vacant Restrooms'} value={'1'} />
        <List title={'Peoples In Queue'} value={'12'} />
        <List title={'Flow Count'} value={'2 IN  &  1 OUT'} />
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
