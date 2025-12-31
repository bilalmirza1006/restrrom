const Input = ({
  label,
  type = 'text',
  shadow = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled = false, // ✅ NEW
  ...rest
}) => {
  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium text-[#11111199]">{label}</label>}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[#666666]">
            {leftIcon}
          </span>
        )}

        <input
          {...rest}
          type={type}
          disabled={disabled}
          className={`h-11 w-full rounded-[10px] border px-4 text-sm transition-all outline-none md:text-base ${
            disabled
              ? 'cursor-not-allowed border-[#d1d5db] bg-[#f5f5f5] opacity-60'
              : 'border-[#54545499] focus:border-[#545454]'
          } ${shadow && !disabled ? 'shadow-sm' : ''} ${leftIcon ? 'pl-11' : ''} ${rightIcon ? 'pr-11' : ''} ${className} `}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span
            className={`absolute top-1/2 right-4 -translate-y-1/2 ${
              disabled ? 'cursor-not-allowed text-[#999]' : 'cursor-pointer text-[#666666]'
            }`}
          >
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;

/// example of uses of component

//  <div className="space-y-4 w-[300px]">
//       {/* Username field with left icon */}
//       <Input
//         label="Username"
//         placeholder="Enter your username"
//         leftIcon={<FaUser size={18} />}
//       />

//       {/* Password field with left + right icons */}
//       <Input
//         label="Password"
//         type="password"
//         placeholder="Enter your password"
//         leftIcon={<FaLock size={18} />}
//         rightIcon={<FaEye size={18} />}
//       />

//       {/* Custom input with extra className */}
//       <Input
//         label="Custom"
//         placeholder="Custom styled"
//         leftIcon={<FaUser />}
//         className="bg-gray-100"
//       />
//     </div>
