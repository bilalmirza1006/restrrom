"use client";
import Input from "@/components/global/small/Input";
import { useUpdateProfileMutation } from "@/features/auth/authApi";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
console.log("oldPassword",oldPassword,confirmPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!oldPassword || !newPassword || !confirmPassword) return toast.error("Please fill all the fields");
      if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
      const formData = new FormData();
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
      const response = await updateProfile(formData).unwrap();
      if (response?.success) {
        toast.success(response?.message);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Error while changing password");
      console.log("Error while changing password", error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 border border-gray-200 rounded-xl grid grid-cols-1 gap-5">
      <div className="relative">
        <Input
          label="Old Password"
          name="password"
          type={showOldPassword ? "text" : "password"}
          onChange={(e) => setOldPassword(e.target.value)}

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
          onChange={(e) => setNewPassword(e.target.value)}

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
          onChange={(e) => setConfirmPassword(e.target.value)}

        />
        <div
          className="absolute top-[47px] right-5 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
      </div>
      <div className="mt-3">
        <button
          disabled={isLoading}
          type="submit"
          className="bg-[#03A5E030] text-[#03A5E0] text-[14px] w-full md:w-auto py-3 px-6 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-20"
        >
          Change Password
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
