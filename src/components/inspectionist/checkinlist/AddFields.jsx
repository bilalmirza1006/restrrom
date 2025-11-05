import React from 'react';

const InputFields = ({ tableId, restroom, customFields = [], onAddField, onFieldChange }) => {
  if (tableId !== restroom?._id) return null;

  return (
    <div className="mx-3 my-3">
      <button className="text-[#05004E] text-[18px] mb-3" onClick={onAddField}>
        + Add More
      </button>

      {customFields.map((field) => (
        <div key={field.id} className="my-3 px-4">
          <div className="flex justify-between items-center gap-4">
            <div className="basis-[49%]">
              <label className="text-sm text-[#666666]" htmlFor={`name-${field.id}`}>
                Name
              </label>
              <input
                id={`name-${field.id}`}
                type="text"
                placeholder="Enter Name"
                value={field.name}
                onChange={(e) => onFieldChange(field.id, 'name', e.target.value)}
                className="mt-2 outline-none px-4 h-[50px] border-[0.5px] border-[#66666659] rounded-xl w-full"
              />
            </div>
            <div className="basis-[49%]">
              <label className="text-sm text-[#666666]" htmlFor={`desc-${field.id}`}>
                Description
              </label>
              <input
                id={`desc-${field.id}`}
                type="text"
                placeholder="Enter Description"
                value={field.desc}
                onChange={(e) => onFieldChange(field.id, 'desc', e.target.value)}
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
