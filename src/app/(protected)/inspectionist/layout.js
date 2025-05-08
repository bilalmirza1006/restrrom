"use client";

import Loader from "@/components/global/Loader";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

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

const InspectionistLayout = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "inspectionist") {
      const route = getRoleBaseRoute(user.role);
      if (pathname !== route) {
        toast.error("You are not authorized to access this page");
        router.replace(route);
      }
    }
  }, [user, isAuthenticated, pathname, router]);

  if (!isAuthenticated || !user || user.role !== "inspectionist")
    return <Loader />;

  return (
    <section className="bg-[#F5F2FF] w-screen h-screen grid place-items-center overflow-hidden">
      <section className="h-[calc(100vh-16px)] w-[calc(100vw-16px)] flex gap-4">
        {/* Aside navigation placeholder */}
        Aside
        <div className="flex-1">
          {/* Header placeholder */}
          Header
          <main className="h-[calc(100vh-197px)] overflow-y-scroll overflow-x-hidden scroll-0 pt-4 rounded-lg">
            {children}
          </main>
        </div>
      </section>
    </section>
  );
};

export default InspectionistLayout;
