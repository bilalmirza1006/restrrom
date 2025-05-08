import { queueingStatusData } from "@/data/data";

const QueueingStatus = () => {
  return (
    <div className="bg-white rounded-lg p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h6 className="text-base md:text-xl font-semibold text-secondary">
          Queueing Status
        </h6>
        <div className="bg-[#FFC472] py-2 px-4 rounded-lg text-white text-sm font-medium">
          Small Queue
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-5 md:gap-6">
        {queueingStatusData.map((list, i) => (
          <List key={i} list={list} />
        ))}
      </div>
    </div>
  );
};

export default QueueingStatus;

const List = ({ list }) => {
  return (
    <div className="flex items-center justify-between bg-[#F6EAFF] rounded-md py-3 px-5">
      <h6 className="text-base md:text-lg text-[#111111]">{list.title}</h6>
      <p className="text-primary text-base md:text-xl font-semibold">
        {list.value}
      </p>
    </div>
  );
};
