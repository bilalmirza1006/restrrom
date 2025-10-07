const Input = ({
  label,
  type = 'text',
  shadow = false,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) => {
  return (
    <div>
      {label && <label className="text-sm lg:text-base text-[#666666]">{label}</label>}
      <div className="relative mt-2">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">
            {leftIcon}
          </span>
        )}

        <input
          {...rest}
          type={type}
          className={`outline-none px-4 h-[50px] border-[0.5px] border-[#66666659] rounded-xl w-full text-sm lg:text-base text-[#3a3a3a] ${
            shadow && 'shadow-input'
          } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] cursor-pointer">
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
