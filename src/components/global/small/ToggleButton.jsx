const ToggleButton = ({ isChecked, onToggle, isTable = false }) => {
  return (
    <div
      className="relative inline-flex items-center cursor-pointer"
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {}}
        className="sr-only"
      />
      <div
        className={`block w-[45px] h-6 rounded-full ${
          isChecked ? (isTable ? "bg-[#03A5E040]" : "bg-white") : "bg-gray-300"
        }`}
      >
        <div
          className={`dot absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${
            isChecked ? "transform translate-x-5 bg-primary" : "bg-white"
          }`}
          style={{ transition: "all 0.3s" }}
        ></div>
      </div>
    </div>
  );
};

export default ToggleButton;
