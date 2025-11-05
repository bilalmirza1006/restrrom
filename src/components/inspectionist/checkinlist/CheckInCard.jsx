'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaCaretDown } from 'react-icons/fa';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import { useCreateBuildingInspectionMutation } from '@/features/inspection/inspectionApi';
import InspectionFields from './InspectionFields';
import InputFields from './AddFields';
// import InputFields from './InputFields';

const CheckInCard = ({ buildingId }) => {
  const { data } = useGetAllRestroomsQuery(buildingId);
  const [tableId, setTableId] = useState(null);
  const [inspectionData, setInspectionData] = useState({});
  const [summary, setSummary] = useState('');
  const [createInspection, { isLoading }] = useCreateBuildingInspectionMutation();

  const toggleTable = (id) => setTableId((prev) => (prev === id ? null : id));
  console.log('inspectionDatainspectionData', inspectionData);

  // collect main inspection data (radio fields)
  const handleInspectionChange = (restroomId, field, value) => {
    setInspectionData((prev) => ({
      ...prev,
      [restroomId]: {
        ...prev[restroomId],
        [field]: value,
      },
    }));
  };

  // collect custom fields
  const handleCustomFields = (restroomId, extraDetails) => {
    setInspectionData((prev) => ({
      ...prev,
      [restroomId]: {
        ...prev[restroomId],
        extraDetails,
      },
    }));
  };

  // const handleSubmit = async () => {
  //   const restroomInspections = Object.entries(inspectionData).map(([restroomId, details]) => ({
  //     restroomId,
  //     ...details,
  //   }));

  //   const payload = {
  //     buildingId,
  //     summary,
  //     restroomInspections,
  //   };

  //   try {
  //     const res = await createInspection(payload).unwrap();
  //     alert('Inspection submitted successfully!');
  //     console.log('✅ Submitted:', res);
  //   } catch (err) {
  //     console.error('❌ Submission failed:', err);
  //     alert('Failed to submit inspection.');
  //   }
  // };

  const handleSubmit = async () => {
    const restroomInspections = Object.entries(inspectionData).map(([restroomId, details]) => ({
      restroomId,
      ...details,
      // 🔁 Map custom field keys to what backend expects
      extraDetails:
        details.extraDetails?.map((d) => ({
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
      {data?.data?.restRooms?.map((restroom) => (
        <div
          key={restroom?._id}
          className="bg-white overflow-auto w-[700px] sm:w-full shadow-sm rounded-lg flex flex-col"
        >
          <div className="flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-3">
              <Image src="/svgs/user/total-restrooms.svg" width={30} height={34} alt="icon" />
              <h1 className="text-[#05004E] text-[20px] font-semibold">{restroom?.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <p
                className={`inline-block capitalize px-4 py-1.5 rounded-[8px] text-white ${
                  restroom?.status === 'Active' ? 'bg-[#61CA94]' : 'bg-[#FF8080]'
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
                      ? 'ease-in transition-transform duration-300 transform rotate-180'
                      : 'transition-transform duration-300'
                  }
                  fill="#A449EB96"
                />
              </button>
            </div>
          </div>

          {tableId === restroom?._id && (
            <div className="px-3 pb-4">
              <InspectionFields
                onChange={(field, value) => handleInspectionChange(restroom._id, field, value)}
              />
              <InputFields
                restroom={restroom}
                tableId={tableId}
                onCustomChange={(custom) => handleCustomFields(restroom._id, custom)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Summary + Submit */}
      <div className="mt-6 flex flex-col gap-3">
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Add overall inspection summary..."
          className="border border-gray-300 rounded-lg p-3 h-28 w-[700px]"
        />
        <button
          disabled={isLoading}
          onClick={handleSubmit}
          className="bg-[#A449EB] hover:bg-[#922cd8] text-white px-6 py-2 rounded-lg w-[200px]"
        >
          {isLoading ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </div>
    </div>
  );
};

export default CheckInCard;
