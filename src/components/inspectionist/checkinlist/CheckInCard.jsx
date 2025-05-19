'use client';
import styles from '@/components/inspectionist/checkinlist/CheckInCard.module.css';
import { FaCaretDown } from 'react-icons/fa';
import { inspectionistFloorListData } from '@/data/data';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import InputFields from './InputFields';

const CheckInCard = () => {
  const [inputValue, setInputValue] = useState('');
  const onClickHandler = (e) => {
    setInputValue(e.target.value);
  };
  useEffect(() => {
    console.log(inputValue);
  }, [inputValue]);
  const [tableId, setTableId] = useState(null);
  const toggleTable = (id) => {
    setTableId((prev) => (prev === id ? null : id));
  };
  const columns = [
    {
      name: 'Sensors',
      selector: (row) => (
        <p className="text-[16px] text-black flex gap-2">
          <Image src={row.icon} width={19} height={19} alt="icon" />
          {row.title}
        </p>
      ),
    },
    {
      name: 'Good',
      selector: (row) => (
        <div className={`${styles.customRadio} flex items-center gap-1`}>
          <input
            onClick={onClickHandler}
            type="radio"
            value="Good"
            name={`${row.id}-${row.icon}-condition-${row.title}`}
          />
        </div>
      ),
    },
    {
      name: 'Bad',
      selector: (row) => (
        <div className={`${styles.customRadio} flex items-center gap-1`}>
          <input
            onClick={onClickHandler}
            type="radio"
            value="Bad"
            name={`${row.id}-${row.icon}-condition-${row.title}`}
          />
        </div>
      ),
    },
    {
      name: 'Excellent',
      selector: (row) => (
        <div className={`${styles.customRadio} flex items-center gap-1`}>
          <input
            onClick={onClickHandler}
            value="Excellent"
            type="radio"
            name={`${row.id}-${row.icon}-condition-${row.title}`}
          />
        </div>
      ),
    },
    {
      name: 'Malfunctioned',
      selector: (row) => (
        <div className={`${styles.customRadio} flex items-center gap-1`}>
          <input
            onClick={onClickHandler}
            value="Malfunctioned"
            type="radio"
            defaultChecked
            name={`${row.id}-${row.icon}-condition-${row.title}`}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mt-3 flex flex-col gap-4">
        {inspectionistFloorListData.map((list) => {
          return (
            <div key={list.id} className="bg-white shadow-sm rounded-lg flex flex-col">
              <div className="flex items-center justify-between py-2 px-3">
                <div className="flex items-center gap-3">
                  <Image src={list.icon} width={30} height={34} alt="icon" />
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
              <div>
                {tableId === list.id && (
                  <div>
                    <DataTable columns={columns} data={list.listdata} customStyles={tableStyles} />
                  </div>
                )}
              </div>
              <InputFields tableId={tableId} list={list} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CheckInCard;

const tableStyles = {
  headCells: {
    style: {
      fontSize: '16px',
      color: '#696969',
    },
  },
  rows: {
    style: {
      width: '98%',
      background: '#A449EB0F',
      borderRadius: '6px',
      margin: '10px 0',
      alignSelf: 'center',
      padding: '20px',
    },
  },
};
