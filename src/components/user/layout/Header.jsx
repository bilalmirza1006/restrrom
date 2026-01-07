'use client';
import { useRef, useState } from 'react';
import { FaRegBell } from 'react-icons/fa';
import { IoIosLogOut } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import Notifications from '../Notifications';
import { GoDotFill } from 'react-icons/go';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { resetAuthApiState, useGetProfileQuery, useLogoutMutation } from '@/features/auth/authApi';
import { useDispatch } from 'react-redux';
import { deleteUser } from '@/features/auth/authSlice';
import toast from 'react-hot-toast';

const Header = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const { data } = useGetProfileQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const path = pathname.split('/').slice(-1)[0];
  const [profileActive, setProfileActive] = useState(false);
  const [notificationActive, setNotificationActive] = useState(false);
  const notificationRef = useRef();
  const profileRef = useRef();

  const getPathName = pathname => {
    switch (pathname) {
      case '':
        return 'Dashboard';
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
        toast.success(res?.message || 'Logout successfully');
      } else {
        toast.warning('Session ended but no success flag from server');
      }

      router.push('/login');
    } catch (error) {
      dispatch(deleteUser());
      dispatch(resetAuthApiState());
      toast.error(error?.data?.message || 'Something went wrong');
      router.push('/login');
    }
  };

  return (
    <header className="relative h-45 w-full rounded-xl bg-[url('/images/default/header-bg.png')] bg-cover bg-top bg-no-repeat p-5 md:p-8">
      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-[#088d9c] to-[#9550e4] opacity-55"></div>
      <div className="relative z-50 flex h-full flex-col justify-between">
        <div className="flex justify-end">
          <div className="flex items-center justify-end gap-4">
            <button
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-black"
              onClick={handleNotification}
              ref={notificationRef}
            >
              <FaRegBell color="white" />
              <GoDotFill color="#EB5757" className="absolute -top-1.5 -right-1" />
              {notificationActive && (
                <div className="no-scrollbar absolute top-11.25 -right-15 z-[999999] h-75 w-70 overflow-y-auto rounded-lg border border-gray-300 bg-white drop-shadow-md sm:right-0">
                  <Notifications />
                </div>
              )}
            </button>
            <div className="flex items-center gap-2 md:gap-4">
              <img
                src={data?.data?.image?.url || '/images/default/profile.png'}
                alt="profile-pic"
                className="hidden h-10 w-10 cursor-pointer rounded-lg object-cover md:inline-block"
                onClick={toggleDropDown}
              />
              {profileActive && (
                <div className="absolute top-11.5 right-0 z-10 w-37.5 rounded-lg bg-white shadow-md">
                  <Link
                    className="flex items-center justify-between border-b border-gray-200 px-3 py-2"
                    href={'/settings?tab=profile'}
                    onClick={() => setProfileActive(false)}
                  >
                    Profile
                    <IoIosArrowForward />
                  </Link>
                  <div
                    className={`flex cursor-pointer items-center justify-between px-3 py-2 ${
                      isLoading ? 'pointer-events-none cursor-none opacity-50' : ''
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
        <h3 className="text-lg leading-none font-semibold text-white capitalize lg:text-[34px]">
          {getPathName(path)}
        </h3>
      </div>
    </header>
  );
};

export default Header;
