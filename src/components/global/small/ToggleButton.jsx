const ToggleButton = ({ isChecked, onToggle, isTable = false, role }) => {
  const isDisabled = role === 'super_admin';

  return (
    <div
      className={`relative inline-flex items-center ${
        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
      onClick={() => {
        if (!isDisabled) onToggle();
      }}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {}}
        className="sr-only"
        disabled={isDisabled}
      />

      <div
        className={`block h-6 w-[45px] rounded-full transition-colors ${
          isChecked ? (isTable ? 'bg-[#03A5E040]' : 'bg-white') : 'bg-gray-300'
        }`}
      >
        <div
          className={`dot absolute top-1 left-1 h-4 w-4 rounded-full transition-all duration-300 ${
            isChecked ? 'bg-primary translate-x-5' : 'bg-white'
          }`}
        ></div>
      </div>
    </div>
  );
};

export default ToggleButton;
