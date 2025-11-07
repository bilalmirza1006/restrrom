'use client';
import React from 'react';
import { FaSortDown } from 'react-icons/fa';
import { useState } from 'react';

function CustomDropdown({ lists }) {
  const optionsHandler = () => setIsOptionOpen(!isOptionOpen);
  const [selectedOption, setSelectedOption] = useState('This Month');
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const selectHandler = option => {
    setSelectedOption(option);
    setIsOptionOpen(false);
  };

  return (
    <div className="relative z-50">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-[8px] border px-3 py-2 text-[14px] text-[#A449EB]"
        onClick={() => optionsHandler()}
      >
        {selectedOption}
        <div
          className={`relative top-[-4px] transition-all duration-300 ${
            isOptionOpen ? 'top-[3px] rotate-180' : 'rotate-0'
          }`}
        >
          <FaSortDown fontSize={18} />
        </div>
      </div>
      {isOptionOpen && (
        <ul className="absolute top-[40px] left-0 flex w-full flex-col rounded-lg bg-white shadow-md">
          {lists.map((list, i) => (
            <li
              key={i}
              className="cursor-pointer border-b px-2 py-1 text-sm text-[#A449EB] hover:bg-gray-100"
              onClick={() => selectHandler(list)}
            >
              {list}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomDropdown;
