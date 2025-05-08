import React from "react";

const Button = ({ text = "button", cn, width, height, ...rest }) => {
  return (
    <button
      {...rest}
      className={`bg-primary h-[50px] px-4 rounded-[10px] text-center w-full text-white text-base font-bold hover:opacity-60 border border-primary cursor-pointer transition-all duration-150 ${
        cn && cn
      } ${width && width} ${height && height}`}
    >
      {text}
    </button>
  );
};

export default Button;
