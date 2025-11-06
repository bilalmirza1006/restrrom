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
    <div className="bg-white rounded-md py-2 px-3 shadow-md mb-3">
      <div className="bg-[#A449EB0F] flex justify-between py-4 px-4 rounded-md">
        <div className="flex gap-2 items-center">
          <Image src={icon} width={19} height={19} alt={label} /> {label}
        </div>
        <div className={`${styles.customRadio} basis-[65%] flex justify-between gap-4`}>
          {['good', 'bad', 'excellent', 'malfunctioned', 'not_checked'].map((opt) => (
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
    <div className="mt-2 px-5 flex flex-col mb-2">
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
