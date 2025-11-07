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
      {label && <label className="text-sm text-[#666666] lg:text-base">{label}</label>}
      <div className="relative mt-2">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[#666666]">
            {leftIcon}
          </span>
        )}

        <input
          {...rest}
          type={type}
          className={`h-[50px] w-full rounded-xl border-[0.5px] border-[#66666659] px-4 text-sm text-[#3a3a3a] outline-none lg:text-base ${
            shadow && 'shadow-input'
          } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#666666]">
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
