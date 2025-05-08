"use client";

import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Input from "../global/small/Input";
import Button from "../global/small/Button";
import Link from "next/link";
import { useLoginMutation } from "@/features/auth/authApi";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { setUser } from "@/features/auth/authSlice";

const LoginForm = () => {
  const [login, { isLoading, isError }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleForm = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password)
      return toast.error("Please provide email and password");

    try {
      const res = await login(formData).unwrap();
      if (res?.success) {
        const { data } = res;
        dispatch(
          setUser({
            user: data?.user,
            role: data?.user?.role,
          })
        );
        toast.success(res?.message || "User logged in successfully");
        router.push("/");
      }
    } catch (error) {
      if (isError) {
        toast.error(error?.data?.message || "Something went wrong");
      }
    }
  };

  return (
    <form
      className="bg-white p-5 lg:py-8 lg:px-[8%] rounded-xl w-full"
      onSubmit={handleForm}
    >
      <h6 className="text-center md:text-left text-xl lg:text-2xl font-semibold text-text-textColor">
        Login now
      </h6>
      <div className="mt-5 lg:mt-7 grid grid-cols-1 gap-4 md:gap-6">
        <div>
          <Input
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="new-password"
          />
          <div
            className="absolute top-0 right-3 flex items-center gap-2 cursor-pointer text-sm lg:text-lg text-[#666666CC]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </div>
        </div>
        <Button
          text="Login"
          type="submit"
          disabled={isLoading}
          cn={`${isLoading && "opacity-60 cursor-not-allowed"}`}
        />
        <div className="text-sm lg:text-base text-[#666666]">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold">
            Signup
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
