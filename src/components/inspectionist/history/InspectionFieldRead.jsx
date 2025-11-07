import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/components/inspectionist/checkinlist/CheckInCard.module.css';

function InspectionFieldRead({ onChange, prefillData = {} }) {
  const [waterLeakage, setWaterLeakage] = useState('');
  const [queuingStatus, setQueuingStatus] = useState('');
  const [odorStatus, setOdorStatus] = useState('');

  useEffect(() => {
    if (prefillData) {
      if (prefillData.waterLeakage) setWaterLeakage(prefillData.waterLeakage);
      if (prefillData.queuingStatus) setQueuingStatus(prefillData.queuingStatus);
      if (prefillData.odorStatus) setOdorStatus(prefillData.odorStatus);
    }
  }, [prefillData]);

  const handleChange = (setter, field, value) => {
    setter(value);
    onChange(field, value);
  };

  const renderRow = (icon, label, field, value, setter) => (
    <div className="mb-3 rounded-md bg-white px-3 py-2 shadow-md">
      <div className="flex justify-between rounded-md bg-[#A449EB0F] px-4 py-4">
        <div className="flex items-center gap-2">
          <Image src={icon} width={19} height={19} alt={label} /> {label}
        </div>
        <div className={`${styles.customRadio} flex basis-[65%] justify-between gap-4`}>
          {['good', 'bad', 'excellent', 'malfunctioned', 'not_checked'].map(opt => (
            <div key={opt} className="w-[20%] text-center">
              <input
                style={{ cursor: 'not-allowed' }}
                type="radio"
                value={opt}
                checked={value === opt}
                name={field}
                readOnly
                disabled
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
        waterLeakage,
        setWaterLeakage
      )}
      {renderRow(
        '/svgs/inspertionist/queu.svg',
        'Queuing Status',
        'queuingStatus',
        queuingStatus,
        setQueuingStatus
      )}
      {renderRow(
        '/svgs/inspertionist/odor.svg',
        'Odor Status',
        'odorStatus',
        odorStatus,
        setOdorStatus
      )}
    </div>
  );
}

export default InspectionFieldRead;

// export default InspectionFieldRead
