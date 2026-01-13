'use client';
import { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const RuleDropdown = ({
  options = [],
  defaultText = 'Select',
  onSelect,
  initialValue = null,
  value, // ✅ NEW: Controlled value prop
  width = '100%',
  label,
  multi = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(multi ? initialValue || [] : initialValue || null);
  const dropdownRef = useRef(null);

  // ✅ Support both controlled (value) and uncontrolled (initialValue) modes
  useEffect(() => {
    const newValue = value !== undefined ? value : initialValue;
    if (multi) setSelected(newValue || []);
    else setSelected(newValue || null);
  }, [value, initialValue, multi]);

  // 🔄 Toggle selection (OBJECT SAFE)
  const toggleOption = option => {
    if (disabled) return;

    const value = option.value;

    if (multi) {
      const exists = selected.some(item => item?.id === value?.id);

      const updatedSelection = exists
        ? selected.filter(item => item.id !== value.id)
        : [...selected, value];

      setSelected(updatedSelection);
      onSelect?.(updatedSelection);
    } else {
      setSelected(value);
      onSelect?.(value);
      setIsOpen(false);
    }
  };

  // 🏷 Selected label text
  const getSelectedText = () => {
    if (multi) {
      if (!selected.length) return defaultText;

      return options
        .filter(opt => selected.some(sel => sel?.id === opt.value?.id))
        .map(opt => opt.option)
        .join(', ');
    }

    const matched = options.find(opt => opt.value?.id === selected?.id);
    return matched?.option || defaultText;
  };

  // ❌ Close on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (disabled) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [disabled]);

  return (
    <div ref={dropdownRef} className="relative" style={{ width }}>
      {label && <label className="mb-2 block text-sm font-medium text-[#11111199]">{label}</label>}

      {/* 🔘 Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`flex items-center justify-between rounded-[10px] border px-4 py-3 text-sm shadow-sm ${disabled ? 'cursor-not-allowed border-gray-300 opacity-60' : 'border-[#54545499]'}`}
        style={{ width }}
      >
        <span
          className={`truncate ${multi
              ? selected.length
                ? 'text-[#414141]'
                : 'text-gray-400'
              : selected
                ? 'text-[#414141]'
                : 'text-gray-400'
            }`}
        >
          {getSelectedText()}
        </span>

        <FaChevronDown
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 📜 Options */}
      {isOpen && !disabled && (
        <ul
          className="absolute z-20 mt-1 max-h-56 overflow-auto rounded-md border bg-white shadow-lg"
          style={{ width }}
        >
          {options.map(option => {
            const isChecked = multi
              ? selected.some(item => item?.id === option.value?.id)
              : selected?.id === option.value?.id;

            return (
              <li
                key={option.value?.id || option.option}
                onClick={() => toggleOption(option)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 ${isChecked ? 'bg-blue-50' : ''}`}
              >
                {multi && (
                  <input type="checkbox" readOnly checked={isChecked} className="accent-blue-500" />
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

// export default Dropdown;

export default RuleDropdown;
