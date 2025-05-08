"use client";
import { useRef, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import Notifications from "../Notifications";
import { GoDotFill } from "react-icons/go";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  resetAuthApiState,
  useGetProfileQuery,
  useLogoutMutation,
} from "@/features/auth/authApi";
import { useDispatch } from "react-redux";
import { deleteUser } from "@/features/auth/authSlice";
import toast from "react-hot-toast";

const Header = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const { data } = useGetProfileQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const path = pathname.split("/").slice(-1)[0];
  const [profileActive, setProfileActive] = useState(false);
  const [notificationActive, setNotificationActive] = useState(false);
  const notificationRef = useRef();
  const profileRef = useRef();

  const getPathName = (pathname) => {
    switch (pathname) {
      case "":
        return "Dashboard";
      default:
        return pathname;
    }
  };
  const toggleDropDown = () => {
    setProfileActive(!profileActive);
    setNotificationActive(false);
  };

  const handleNotification = () => {
    setNotificationActive(!notificationActive);
    setProfileActive(false);
  };

  const logoutHandler = async () => {
    try {
      const res = await logout().unwrap();

      dispatch(deleteUser());
      dispatch(resetAuthApiState());

      if (res?.success) {
        toast.success(res?.message || "Logout successfully");
      } else {
        toast.warning("Session ended but no success flag from server");
      }

      router.push("/login");
    } catch (error) {
      dispatch(deleteUser());
      dispatch(resetAuthApiState());
      toast.error(error?.data?.message || "Something went wrong");
      router.push("/login");
    }
  };

  return (
    <header
      className="relative w-full h-[180px] rounded-xl 
  bg-[url('/images/default/header-bg.png')] bg-no-repeat bg-cover bg-top p-5 md:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#088d9c] to-[#9550e4] opacity-55 rounded-xl"></div>
      <div className="relative z-50 h-full flex flex-col justify-between">
        <div className="flex justify-end">
          <div className="flex justify-end  items-center gap-4">
            <button
              className="bg-black h-[40px] w-[40px] flex justify-center items-center rounded-lg relative cursor-pointer"
              onClick={handleNotification}
              ref={notificationRef}
            >
              <FaRegBell color="white" />
              <GoDotFill
                color="#EB5757"
                className="absolute right-[-4px] top-[-6px]"
              />
              {notificationActive && (
                <div className="absolute top-[45px] right-[-60px] sm:right-0 bg-white drop-shadow-md rounded-lg w-[280px] h-[300px] border border-gray-300 z-[999999] overflow-y-auto no-scrollbar">
                  <Notifications />
                </div>
              )}
            </button>
            <div className="flex items-center gap-2 md:gap-4">
              <img
                src={data?.user?.image?.url || "/images/default/profile.png"}
                alt="profile-pic"
                className="w-[40px] h-[40px] rounded-lg object-cover hidden md:inline-block cursor-pointer"
                onClick={toggleDropDown}
              />
              {profileActive && (
                <div className="absolute top-[46px] right-0 bg-white shadow-md rounded-lg w-[150px] z-10">
                  <Link
                    className="flex items-center justify-between px-3 py-2 border-b border-gray-200"
                    href={"/settings?tab=profile"}
                    onClick={() => setProfileActive(false)}
                  >
                    Profile
                    <IoIosArrowForward />
                  </Link>
                  <div
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                      isLoading
                        ? "cursor-none pointer-events-none opacity-50"
                        : ""
                    }`}
                    onClick={logoutHandler}
                  >
                    Logout
                    <IoIosLogOut />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <h3 className="text-lg lg:text-[34px] font-semibold text-white leading-none capitalize">
          {getPathName(path)}
        </h3>
      </div>
    </header>
  );
};

export default Header;
