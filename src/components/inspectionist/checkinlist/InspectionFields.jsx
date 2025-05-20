import React, { useState } from 'react';
import styles from '@/components/inspectionist/checkinlist/CheckInCard.module.css';
import Image from 'next/image';

function InspectionFields() {
  const [waterLeakage, setWaterLeakage] = useState('');
  const [queuingStatus, setQueuingStatus] = useState('');
  const [odorStatus, setOdorStatus] = useState('');
  console.log(waterLeakage);
  console.log(queuingStatus);
  console.log(odorStatus);
  const optionHandler = (e) => {
    setWaterLeakage(e.target.value);
  };
  return (
    <div className="mt-2 px-5 flex gap-2 mb-2 flex-col">
      <div className="mb-2 flex gap-[28%] px-3 text-[#696969]">
        Sensors
        <div className="flex items-center align-middle w-full justify-between">
          <h1 className="w-[25%] text-center">Good</h1>
          <h1 className="w-[25%] text-center">Bad</h1>
          <h1 className="w-[25%] text-center">Excellent</h1>
          <h1 className="w-[25%] text-center">Malfunctioned</h1>
        </div>
      </div>
      <div className="bg-white rounded-md py-2 px-3 shadow-md">
        <div className="bg-[#A449EB0F] justify-between flex py-4 px-4 rounded-md">
          <div>
            <h1 className="flex gap-2 items-center">
              <Image src="/svgs/inspertionist/water.svg" width={19} height={19} alt="water" /> Water
              Leakage
            </h1>
          </div>
          <div className={`${styles.customRadio} basis-[65%] flex justify-between gap-4`}>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="good"
                checked={waterLeakage === 'good'}
                onChange={(e) => {
                  setWaterLeakage(e.target.value);
                }}
                name="water"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="bad"
                checked={waterLeakage === 'bad'}
                onChange={(e) => {
                  setWaterLeakage(e.target.value);
                }}
                name="water"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="excellent"
                checked={waterLeakage === 'excellent'}
                onChange={(e) => {
                  setWaterLeakage(e.target.value);
                }}
                name="water"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="malfunctioned"
                checked={waterLeakage === 'malfunctioned'}
                onChange={(e) => {
                  setWaterLeakage(e.target.value);
                }}
                name="water"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md py-2 px-3 shadow-md">
        <div className="bg-[#A449EB0F] justify-between flex py-4 px-4 rounded-md">
          <div>
            <h1 className="flex gap-2 items-center">
              <Image src="/svgs/inspertionist/queu.svg" width={19} height={19} alt="water" />
              Queuing Status
            </h1>
          </div>
          <div className={`${styles.customRadio} basis-[65%] flex justify-between gap-4`}>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="good"
                checked={queuingStatus === 'good'}
                onChange={(e) => {
                  setQueuingStatus(e.target.value);
                }}
                name="queuing"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="bad"
                checked={queuingStatus === 'bad'}
                onChange={(e) => {
                  setQueuingStatus(e.target.value);
                }}
                name="queuing"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="excellent"
                checked={queuingStatus === 'excellent'}
                onChange={(e) => {
                  setQueuingStatus(e.target.value);
                }}
                name="queuing"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="malfunctioned"
                checked={queuingStatus === 'malfunctioned'}
                onChange={(e) => {
                  setQueuingStatus(e.target.value);
                }}
                name="queuing"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md py-2 px-3 shadow-md">
        <div className="bg-[#A449EB0F] justify-between flex py-4 px-4 rounded-md">
          <div>
            <h1 className="flex gap-2 items-center">
              <Image src="/svgs/inspertionist/odor.svg" width={19} height={19} alt="water" />
              Odor Status
            </h1>
          </div>
          <div className={`${styles.customRadio} basis-[65%] flex justify-between gap-4`}>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="good"
                checked={odorStatus === 'good'}
                onChange={(e) => {
                  setOdorStatus(e.target.value);
                }}
                name="odor"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="bad"
                checked={odorStatus === 'bad'}
                onChange={(e) => {
                  setOdorStatus(e.target.value);
                }}
                name="odor"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="excellent"
                checked={odorStatus === 'excellent'}
                onChange={(e) => {
                  setOdorStatus(e.target.value);
                }}
                name="odor"
              />
            </div>
            <div className="w-[25%] text-center">
              <input
                type="radio"
                value="malfunctioned"
                checked={odorStatus === 'malfunctioned'}
                onChange={(e) => {
                  setOdorStatus(e.target.value);
                }}
                name="odor"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectionFields;
