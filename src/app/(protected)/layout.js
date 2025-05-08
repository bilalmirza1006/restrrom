"use client";

import Loader from "@/components/global/Loader";
import { useGetProfileQuery } from "@/features/auth/authApi";
import { setUser } from "@/features/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const getRoleBaseRoute = (role) => {
  switch (role) {
    case "user":
      return "/";
    case "admin":
      return "/admin";
    case "inspectionist":
      return "/inspectionist";
    default:
      return "/";
  }
};

const ProtectedLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { data, isSuccess, isLoading, isError } = useGetProfileQuery();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (data?.user && isSuccess) {
      dispatch(setUser(data.user));
      const expectedPath = getRoleBaseRoute(data.user.role);

      if (!pathname.startsWith(expectedPath)) {
        router.replace(expectedPath);
        return;
      }

      setChecked(true);
    }

    if (isError && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    data,
    isSuccess,
    isLoading,
    pathname,
    router,
    dispatch,
    isError,
    isAuthenticated,
    user,
  ]);

  if (isLoading || (!isAuthenticated && !isError) || !checked) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default ProtectedLayout;
