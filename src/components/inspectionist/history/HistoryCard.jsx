'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaCaretDown } from 'react-icons/fa';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import { useCreateBuildingInspectionMutation } from '@/features/inspection/inspectionApi';
import InspectionFields from '../checkinlist/InspectionFields';
import InputFields from '../checkinlist/AddFields';
import AddInput from './AddInput';
import InspectionFieldRead from './InspectionFieldRead';
// import InspectionFields from './InspectionFields';
// import InputFields from './AddFields';

const HistoryCard = ({ buildingId, restroom }) => {
  const { data } = useGetAllRestroomsQuery(buildingId);
  const [tableId, setTableId] = useState(null);
  const [inspectionData, setInspectionData] = useState({});
  const [summary, setSummary] = useState('');
  const [createInspection, { isLoading }] = useCreateBuildingInspectionMutation();

  const toggleTable = id => setTableId(prev => (prev === id ? null : id));
  console.log('inspectionDatainspectionData', inspectionData);

  // collect main inspection data (radio fields)
  const handleInspectionChange = (restroomId, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [restroomId]: {
        ...prev[restroomId],
        [field]: value,
      },
    }));
  };

  console.log('restroomrestroom', restroom);

  // collect custom fields
  const handleCustomFields = (restroomId, extraDetails) => {
    setInspectionData(prev => ({
      ...prev,
      [restroomId]: {
        ...prev[restroomId],
        extraDetails,
      },
    }));
  };

  const handleSubmit = async () => {
    const restroomInspections = Object.entries(inspectionData).map(([restroomId, details]) => ({
      restroomId,
      ...details,
      extraDetails:
        details.extraDetails?.map(d => ({
          title: d.name,
          description: d.desc,
        })) || [],
    }));

    const payload = {
      buildingId,
      summary,
      restroomInspections,
    };

    try {
      const res = await createInspection(payload).unwrap();
      alert('Inspection submitted successfully!');
      console.log('✅ Submitted:', res);
      setInspectionData({});
      setSummary('');
      setTableId(null);
    } catch (err) {
      console.error('❌ Submission failed:', err);
      alert('Failed to submit inspection.');
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-4">
      {restroom?.restroomInspections?.map(restroom => (
        <div
          key={restroom?.restroomId}
          className="flex w-175 flex-col overflow-auto rounded-lg bg-white shadow-sm sm:w-full"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <Image src="/svgs/user/total-restrooms.svg" width={30} height={34} alt="icon" />
              <h1 className="text-[20px] font-semibold text-[#05004E]">{restroom?.restroomName}</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleTable(restroom?.restroomId)}
                className="rounded-lg border border-[#A449EB96] bg-[#ccbfd696] p-2"
              >
                <FaCaretDown
                  className={
                    tableId === restroom.restroomId
                      ? 'rotate-180 transform transition-transform duration-300 ease-in'
                      : 'transition-transform duration-300'
                  }
                  fill="#A449EB96"
                />
              </button>
            </div>
          </div>

          {tableId === restroom?.restroomId && (
            <div className="px-3 pb-4">
              <InspectionFieldRead
                prefillData={restroom}
                onChange={(field, value) =>
                  handleInspectionChange(restroom.restroomId, field, value)
                }
              />
              <AddInput
                restroom={restroom}
                tableId={tableId}
                onCustomChange={custom => handleCustomFields(restroom.restroomId, custom)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Summary + Submit */}
      <div className="mt-6 flex flex-col gap-3 bg-white">
        <textarea
          value={restroom?.summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Add overall inspection summary..."
          className="h-28 w-full cursor-not-allowed rounded-lg border border-gray-300 p-3"
          readOnly
        />
      </div>
    </div>
  );
};

export default HistoryCard;

// export default HistoryCard;
