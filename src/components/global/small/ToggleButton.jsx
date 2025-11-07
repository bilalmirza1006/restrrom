const ToggleButton = ({ isChecked, onToggle, isTable = false }) => {
  return (
    <div className="relative inline-flex cursor-pointer items-center" onClick={onToggle}>
      <input type="checkbox" checked={isChecked} onChange={() => {}} className="sr-only" />
      <div
        className={`block h-6 w-[45px] rounded-full ${
          isChecked ? (isTable ? 'bg-[#03A5E040]' : 'bg-white') : 'bg-gray-300'
        }`}
      >
        <div
          className={`dot absolute top-1 left-1 h-4 w-4 rounded-full transition-all ${
            isChecked ? 'bg-primary translate-x-5 transform' : 'bg-white'
          }`}
          style={{ transition: 'all 0.3s' }}
        ></div>
      </div>
    </div>
  );
};

export default ToggleButton;
