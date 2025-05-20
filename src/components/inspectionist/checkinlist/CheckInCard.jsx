'use client';

import { inspectionistFloorListData } from '@/data/data';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import Image from 'next/image';
import { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import InputFields from './AddFields';
import InspectionFields from './InspectionFields';

const CheckInCard = ({ buildingId }) => {
  const { data } = useGetAllRestroomsQuery(buildingId);
  const [inputValue, setInputValue] = useState('');
  const onClickHandler = (e) => setInputValue(e.target.value);
  const [tableId, setTableId] = useState(null);
  const toggleTable = (id) => setTableId((prev) => (prev === id ? null : id));

  return (
    <>
      <div className="mt-3 flex flex-col gap-4">
        {inspectionistFloorListData.map((list) => {
          return (
            <div key={list.id} className="bg-white shadow-sm rounded-lg flex flex-col">
              <div className="flex items-center justify-between py-2 px-3">
                <div className="flex items-center gap-3">
                  <Image src={'/svgs/user/total-restrooms.svg'} width={30} height={34} alt="icon" />
                  <h1 className="text-[#05004E] text-[20px] font-semibold">{list.name}</h1>
                </div>

                {tableId !== list.id && (
                  <>
                    <div className="text-center">
                      <span className="block text-[#05004E80] text-[12px]">Type</span>
                      <h1 className="text-[#A449EB] text-[16px] font-semibold">{list.type}</h1>
                    </div>

                    <div className="text-center">
                      <span className="block text-[#05004E80] text-[12px]">Number of Toilets</span>
                      <h1 className="text-[#A449EB] text-[16px] font-semibold">
                        {list.numberoftiolets}
                      </h1>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-4">
                  <p
                    className={`inline-block px-4 py-1.5 rounded-[8px] text-white ${
                      list.status === 'Active' ? 'bg-[#61CA94]' : 'bg-[#FF8080]'
                    }`}
                  >
                    {list.status}
                  </p>
                  <button
                    onClick={() => toggleTable(list.id)}
                    className="p-2 rounded-[8px] bg-[#ccbfd696] border border-[#A449EB96]"
                  >
                    <FaCaretDown
                      className={
                        tableId === list.id
                          ? 'ease-in transition-transform duration-300 transform  rotate-180'
                          : 'transition-transform duration-300'
                      }
                      fill="#A449EB96"
                    />
                  </button>
                </div>
              </div>
              <div>{tableId === list.id && <InspectionFields />}</div>
              <InputFields tableId={tableId} list={list} />
            </div>
          );
        })}
      </div>
    </>
  );
};
export default CheckInCard;
