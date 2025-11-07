'use client';
import Twomen from '@/assets/default/Twomen';
import { lineChartData, mostUsedRoomsList } from '@/data/data';
import CustomLineChart from '@/components/global/charts/CustomLineChart';

const MostUsedRooms = () => {
  return (
    <div className="scroll-0 overflow-y-scroll rounded-xl bg-white p-5">
      <div className="flex items-center gap-1">
        <Twomen />
        <h2 className="text-xl font-medium">Most Used Restrooms</h2>
      </div>
      <div className="mt-5 flex flex-col gap-5">
        {mostUsedRoomsList.map((item, i) => (
          <List item={item} key={i} />
        ))}
      </div>
    </div>
  );
};

export default MostUsedRooms;

const List = ({ item }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-300">
      <div className="flex flex-col">
        <h4 className="text-[14px] leading-[16.94px] font-[700]">{item.room}</h4>
        <h6 className="text-[12px] leading-[14.52px] font-[500]">{item.floor}</h6>
      </div>
      <div className="w-[35%]">
        <CustomLineChart type="linear" height={50} data={lineChartData} />
      </div>
      <div>
        <h4 className="text-[14px] leading-[16.94px] font-[700]">{item.used}</h4>
      </div>
    </div>
  );
};
