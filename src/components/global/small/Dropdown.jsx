"use client";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const Dropdown = ({
  options,
  defaultText = "Select",
  onSelect,
  initialValue = null, // ✅ supports initial value(s)
  width,
  label,
  multi = false, // ✅ NEW: enable multi-select with this prop
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Updated to support both single and multi values
  const [selected, setSelected] = useState(
    multi ? initialValue || [] : initialValue || null
  );

  const dropdownRef = useRef(null);

  // ✅ NEW: Handles both single and multi-select toggling
  const toggleOption = (option) => {
    if (multi) {
      let updatedSelection;
      if (selected.includes(option.value)) {
        updatedSelection = selected.filter((val) => val !== option.value);
      } else {
        updatedSelection = [...selected, option.value];
      }
      setSelected(updatedSelection);
      onSelect?.(updatedSelection);
    } else {
      setSelected(option);
      onSelect?.(option?.value || "not set");
      setIsOpen(false);
    }
  };

  // ✅ NEW: Display selected options text (for multi and single)
  const getSelectedText = () => {
    if (multi) {
      if (!selected.length) return defaultText;
      return options
        .filter((opt) => selected.includes(opt.value))
        .map((opt) => opt.option)
        .join(", ");
    }
    return selected?.option || defaultText;
  };

  // ✅ Dropdown close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      style={{ width: width || "100%" }}
    >
      <label className="block text-[#11111199] text-sm mb-2 font-medium">
        {label}
      </label>
      <button
        type="button"
        className="shadow-sm border-[1px] border-[#54545499] flex gap-[5px] items-center justify-between rounded-[10px] px-[20px] py-[12px] text-sm md:text-base text-[#54545499]"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: width || "100%" }}
      >
        <span
          className={`text-sm font-[500] ${
            selected && (multi ? selected.length : true)
              ? "text-[#414141]"
              : "text-[#9CA3AF]"
          }`}
        >
          {getSelectedText()}
        </span>
        <div
          className={`transition-all duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <FaChevronDown />
        </div>
      </button>

      {/* ✅ Dropdown list */}
      {isOpen && (
        <ul
          className="absolute z-10 max-h-60 overflow-auto rounded-[6px] shadow-md cursor-pointer border-[1px] border-[#54545433] mt-1 bg-white"
          style={{ width: width || "100%" }}
        >
          {options?.map((option) => {
            const isChecked = multi
              ? selected.includes(option.value)
              : selected?.value === option.value;

            return (
              <li
                key={option.value}
                className={`py-2 px-3 text-sm border-b border-gray-100 flex items-center gap-2 hover:bg-[#00000005] ${
                  isChecked ? "bg-[#e5f0ff]" : ""
                }`}
                onClick={() => toggleOption(option)}
              >
                {multi && (
                  <input
                    type="checkbox"
                    readOnly
                    checked={isChecked}
                    className="accent-blue-500"
                  />
                )}
                {option.option}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
