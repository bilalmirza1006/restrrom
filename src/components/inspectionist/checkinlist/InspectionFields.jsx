import React from 'react';
import Image from 'next/image';
import styles from '@/components/inspectionist/checkinlist/CheckInCard.module.css';

function InspectionFields({ onChange, prefillData = {} }) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  const renderRow = (icon, label, field, value) => (
    <div className="mb-3 rounded-md bg-white px-3 py-2 shadow-md">
      <div className="flex justify-between rounded-md bg-[#A449EB0F] px-4 py-4">
        <div className="flex items-center gap-2">
          <Image src={icon} width={19} height={19} alt={label} /> {label}
        </div>
        <div className={`${styles.customRadio} flex basis-[65%] justify-between gap-4`}>
          {['good', 'bad', 'excellent', 'malfunctioned', 'not_checked'].map(opt => (
            <div key={opt} className="w-[20%] text-center">
              <input
                type="radio"
                value={opt}
                checked={value === opt}
                onChange={e => handleChange(field, e.target.value)}
                name={field}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-2 mb-2 flex flex-col px-5">
      <div className="mb-2 flex gap-[28%] px-3 text-[#696969]">
        Sensors
        <div className="flex w-full justify-between">
          <h1 className="w-[25%] text-center">Good</h1>
          <h1 className="w-[25%] text-center">Bad</h1>
          <h1 className="w-[25%] text-center">Excellent</h1>
          <h1 className="w-[25%] text-center">Malfunctioned</h1>
        </div>
      </div>

      {renderRow(
        '/svgs/inspertionist/water.svg',
        'Water Leakage',
        'waterLeakage',
        prefillData.waterLeakage || ''
      )}
      {renderRow(
        '/svgs/inspertionist/queu.svg',
        'Queuing Status',
        'queuingStatus',
        prefillData.queuingStatus || ''
      )}
      {renderRow(
        '/svgs/inspertionist/odor.svg',
        'Odor Status',
        'odorStatus',
        prefillData.odorStatus || ''
      )}
    </div>
  );
}

export default InspectionFields;
