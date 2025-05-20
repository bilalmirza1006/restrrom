import Input from '@/components/global/small/Input';
import React, { useState } from 'react';

function App({ tableId, list }) {
  const [input, setInput] = useState({});
  const [components, setComponents] = useState([]);

  function MyComponent() {
    const [showInputs, setShowInputs] = useState(true);
    const [value, setValue] = useState({
      name: '',
      desc: '',
    });
    return (
      <div>
        {showInputs && (
          <div className="my-3 px-4">
            <div className="flex justify-between items-center">
              <div className="basis-[49%]">
                <label className="text-sm lg:text-base text-[#666666]" htmlFor="name">
                  Name
                </label>
                <input
                  onChange={(e) => setValue({ ...value, name: e.target.value })}
                  value={value.name}
                  className="mt-2 outline-none px-4 h-[50px] border-[0.5px] border-[#66666659] rounded-xl w-full text-sm lg:text-base text-[#3a3a3a]"
                  id="name"
                  placeholder="Enter Name"
                  type="text"
                />
              </div>
              <div className="basis-[49%]">
                <label className="text-sm lg:text-base text-[#666666]" htmlFor="Description">
                  Description
                </label>
                <input
                  value={value.desc}
                  onChange={(e) => setValue({ ...value, desc: e.target.value })}
                  className="mt-2 outline-none px-4 h-[50px] border-[0.5px] border-[#66666659] rounded-xl w-full text-sm lg:text-base text-[#3a3a3a]"
                  id="Description"
                  placeholder="Enter Description"
                  type="text"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setShowInputs(false)}
                className="bg-[#FF8080] py-1.5 px-4 rounded-[4px] text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const addComponent = () => {
    setComponents([...components, <MyComponent key={components.length} />]);
  };

  return (
    <div>
      {tableId === list.id && (
        <>
          <div className="mx-3 my-3">
            <button className="text-[#05004E] text-[18px]" onClick={addComponent}>
              + Add more
            </button>
          </div>
          <div>{components.map((component) => component)}</div>
        </>
      )}
    </div>
  );
}

export default App;
