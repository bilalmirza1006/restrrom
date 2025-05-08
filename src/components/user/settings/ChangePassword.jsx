"use client";
import Input from "@/components/global/small/Input";
import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form className="p-5 border border-gray-200 rounded-xl grid grid-cols-1 gap-5">
      <div className="relative">
        <Input
          label="Old Password"
          name="password"
          type={showOldPassword ? "text" : "password"}
        />
        <div
          className="absolute top-[47px] right-5 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
          onClick={() => setShowOldPassword(!showOldPassword)}
        >
          {showOldPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
      <div className="relative">
        <Input
          label="New Password"
          name="password"
          type={showNewPassword ? "text" : "password"}
        />
        <div
          className="absolute top-[47px] right-5 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
      <div className="relative">
        <Input
          label="Confrim New Password"
          name="password"
          type={showConfirmPassword ? "text" : "password"}
        />
        <div
          className="absolute top-[47px] right-5 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
    </form>
  );
};

export default ChangePassword;
