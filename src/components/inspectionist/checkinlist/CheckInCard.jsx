'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaCaretDown } from 'react-icons/fa';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import { useCreateBuildingInspectionMutation } from '@/features/inspection/inspectionApi';
import InspectionFields from './InspectionFields';
import InputFields from './AddFields';

const CheckInCard = ({ buildingId }) => {
  const { data } = useGetAllRestroomsQuery(buildingId);
  const [tableId, setTableId] = useState(null);
  const [inspectionData, setInspectionData] = useState({});
  const [summary, setSummary] = useState('');
  const [createInspection, { isLoading }] = useCreateBuildingInspectionMutation();

  const toggleTable = id => setTableId(prev => (prev === id ? null : id));

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

  // Add custom field inputs
  const handleAddCustomField = restroomId => {
    setInspectionData(prev => {
      const currentFields = prev[restroomId]?.customFields || [];
      return {
        ...prev,
        [restroomId]: {
          ...prev[restroomId],
          customFields: [...currentFields, { id: Date.now() + Math.random(), name: '', desc: '' }],
        },
      };
    });
  };

  // Update custom field
  const handleCustomFieldChange = (restroomId, fieldId, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [restroomId]: {
        ...prev[restroomId],
        customFields:
          prev[restroomId]?.customFields?.map(item =>
            item.id === fieldId ? { ...item, [field]: value } : item
          ) || [],
      },
    }));
  };

  const handleSubmit = async () => {
    const restroomInspections = Object.entries(inspectionData).map(([restroomId, details]) => ({
      restroomId,
      ...details,
      // Use customFields for the extra details
      extraDetails: (details.customFields || [])
        .filter(field => field.name || field.desc)
        .map(field => ({
          title: field.name,
          description: field.desc,
        })),
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
      {data?.data?.restRooms?.map(restroom => (
        <div
          key={restroom?._id}
          className="flex w-175 flex-col overflow-auto rounded-lg bg-white shadow-sm sm:w-full"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <Image src="/svgs/user/total-restrooms.svg" width={30} height={34} alt="icon" />
              <h1 className="text-[20px] font-semibold text-[#05004E]">{restroom?.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <p
                className={`inline-block rounded-lg px-4 py-1.5 text-white capitalize ${
                  restroom?.status === 'Active' ? 'bg-[#61CA94]' : 'bg-[#FF8080]'
                }`}
              >
                {restroom?.status}
              </p>
              <button
                onClick={() => toggleTable(restroom?._id)}
                className="rounded-lg border border-[#A449EB96] bg-[#ccbfd696] p-2"
              >
                <FaCaretDown
                  className={
                    tableId === restroom._id
                      ? 'rotate-180 transform transition-transform duration-300 ease-in'
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
                prefillData={inspectionData[restroom._id] || {}}
              />
              <InputFields
                restroom={restroom}
                tableId={tableId}
                customFields={inspectionData[restroom._id]?.customFields || []}
                onAddField={() => handleAddCustomField(restroom._id)}
                onFieldChange={(fieldId, field, value) =>
                  handleCustomFieldChange(restroom._id, fieldId, field, value)
                }
              />
            </div>
          )}
        </div>
      ))}

      {/* Summary + Submit */}
      <div className="mt-6 flex flex-col gap-3">
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Add overall inspection summary..."
          className="h-28 rounded-lg border border-gray-300 p-3"
        />
        <button
          disabled={isLoading}
          onClick={handleSubmit}
          className="w-50 rounded-lg bg-[#A449EB] px-6 py-2 text-white hover:bg-[#922cd8]"
        >
          {isLoading ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </div>
    </div>
  );
};

export default CheckInCard;
