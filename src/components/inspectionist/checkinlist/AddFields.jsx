import React, { useState, useEffect } from 'react';

const InputFields = ({ tableId, restroom, onCustomChange }) => {
  const [components, setComponents] = useState([]);

  const addComponent = () => {
    setComponents((prev) => [...prev, { id: prev.length, name: '', desc: '' }]);
  };

  const handleChange = (id, field, value) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // whenever components change, inform parent
  useEffect(() => {
    onCustomChange(components.filter((c) => c.name || c.desc));
  }, [components]);

  if (tableId !== restroom?._id) return null;

  return (
    <div className="mx-3 my-3">
      <button className="text-[#05004E] text-[18px] mb-3" onClick={addComponent}>
        + Add More
      </button>

      {components.map((component) => (
        <div key={component.id} className="my-3 px-4">
          <div className="flex justify-between items-center gap-4">
            <div className="basis-[49%]">
              <label className="text-sm text-[#666666]" htmlFor={`name-${component.id}`}>
                Name
              </label>
              <input
                id={`name-${component.id}`}
                type="text"
                placeholder="Enter Name"
                value={component.name}
                onChange={(e) => handleChange(component.id, 'name', e.target.value)}
                className="mt-2 outline-none px-4 h-[50px] border-[0.5px] border-[#66666659] rounded-xl w-full"
              />
            </div>
            <div className="basis-[49%]">
              <label className="text-sm text-[#666666]" htmlFor={`desc-${component.id}`}>
                Description
              </label>
              <input
                id={`desc-${component.id}`}
                type="text"
                placeholder="Enter Description"
                value={component.desc}
                onChange={(e) => handleChange(component.id, 'desc', e.target.value)}
                className="mt-2 outline-none px-4 h-[50px] border-[0.5px] border-[#66666659] rounded-xl w-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InputFields;
