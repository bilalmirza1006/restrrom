import React from 'react';

const Button = ({ text = 'button', cn, width, height, className, ...rest }) => {
  return (
    <button
      {...rest}
      className={`bg-primary border-primary h-[50px] w-full cursor-pointer rounded-[10px] border px-4 text-center text-base font-bold text-white transition-all duration-150 hover:opacity-60 ${
        cn && cn
      } ${width && width} ${height && height} ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
