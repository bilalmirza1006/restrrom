"use client";

import { inspectionistFloorListData } from "@/data/data";
import { useGetAllRestroomsQuery } from "@/features/restroom/restroomApi";
import Image from "next/image";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import InputFields from "./AddFields";
import InspectionFields from "./InspectionFields";

const CheckInCard = ({ buildingId }) => {
  const { data } = useGetAllRestroomsQuery(buildingId);
  const [tableId, setTableId] = useState(null);
  const toggleTable = (id) => setTableId((prev) => (prev === id ? null : id));

  return (
    <>
      <div className="mt-3 flex flex-col gap-4">
        {data?.data?.map((restroom) => {
          return (
            <div key={restroom?._id} className="bg-white shadow-sm rounded-lg flex flex-col">
              <div className="flex items-center justify-between py-2 px-3">
                <div className="flex items-center gap-3">
                  <Image src={"/svgs/user/total-restrooms.svg"} width={30} height={34} alt="icon" />
                  <h1 className="text-[#05004E] text-[20px] font-semibold">{restroom?.name}</h1>
                </div>

                {tableId !== restroom?._id && (
                  <>
                    <div className="text-center">
                      <span className="block text-[#05004E80] text-[12px]">Type</span>
                      <h1 className="text-[#A449EB] text-[16px] font-semibold capitalize">{restroom?.type}</h1>
                    </div>

                    <div className="text-center">
                      <span className="block text-[#05004E80] text-[12px]">Number of Toilets</span>
                      <h1 className="text-[#A449EB] text-[16px] font-semibold">{restroom?.numOfToilets}</h1>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-4">
                  <p
                    className={`inline-block px-4 py-1.5 rounded-[8px] text-white ${
                      restroom?.status === "Active" ? "bg-[#61CA94]" : "bg-[#FF8080]"
                    }`}
                  >
                    {restroom?.status}
                  </p>
                  <button
                    onClick={() => toggleTable(restroom?._id)}
                    className="p-2 rounded-[8px] bg-[#ccbfd696] border border-[#A449EB96]"
                  >
                    <FaCaretDown
                      className={
                        tableId === restroom._id
                          ? "ease-in transition-transform duration-300 transform  rotate-180"
                          : "transition-transform duration-300"
                      }
                      fill="#A449EB96"
                    />
                  </button>
                </div>
              </div>
              <div>{tableId === restroom?._id && <InspectionFields />}</div>
              <InputFields tableId={tableId} restroom={restroom} />
            </div>
          );
        })}
      </div>
    </>
  );
};
export default CheckInCard;
