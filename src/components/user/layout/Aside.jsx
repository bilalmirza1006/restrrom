"use client";
import {
  BuildingIcon,
  DashboardIcon,
  PlansIcon,
  ReportsIcon,
  SensorsIcon,
  SettingIcon,
} from "@/assets/icon";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FaArrowCircleRight } from "react-icons/fa";

const pages = [
  {
    id: 1,
    title: "Dashboard",
    link: ["/"],
    icon: <DashboardIcon />,
  },
  {
    id: 2,
    title: "Buildings",
    link: ["/buildings", "/add-building"],
    icon: <BuildingIcon />,
  },
  {
    id: 3,
    title: "Sensors",
    link: ["/sensors"],
    icon: <SensorsIcon />,
  },
  {
    id: 4,
    title: "Reports",
    link: ["/reports"],
    icon: <ReportsIcon />,
  },
  {
    id: 4,
    title: "Plans",
    link: ["/plans"],
    icon: <PlansIcon />,
  },
  {
    id: 5,
    title: "Settings",
    link: ["/settings"],
    icon: <SettingIcon />,
  },
];

const Aside = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <aside
      className={`relative transition-all duration-300 hidden xl:block ${
        isMenuOpen ? "w-[84px]" : "w-[246px]"
      }`}
    >
      {/* Arrow icon */}
      <div
        className={`bg-white rounded-full p-1 absolute top-[37px] -right-[10px] cursor-pointer z-50 transition-all duration-300 hidden xl:block ${
          isMenuOpen ? "rotate-0" : "rotate-180"
        }`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FaArrowCircleRight className="text-lg text-primary" />
      </div>
      <div
        className="w-full h-full bg-aside-grad rounded-lg px-[11px] py-5 overflow-y-auto overflow-x-hidden scroll-0 flex flex-col relative"
        style={{ boxShadow: "0px 4px 14px 0px #3582E729" }}
      >
        <Image
          src={
            isMenuOpen
              ? "/images/default/logo-icon.png"
              : "/images/default/logo.png"
          }
          width={isMenuOpen ? 35 : 170}
          height={isMenuOpen ? 35 : 40}
          alt="logo"
          className="mx-auto"
        />
        <div className="mt-5 lg:mt-10">
          <h4
            className={`text-xs text-white/60 font-medium ${
              isMenuOpen ? "text-center" : "pl-2"
            }`}
          >
            MENU
          </h4>
          <div className="mt-3 flex flex-col gap-4">
            {pages.map((page, i) => (
              <LinkItem
                key={i}
                page={page}
                pathname={pathname}
                isMenuOpen={isMenuOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Aside;

const LinkItem = ({ page, pathname, isMenuOpen }) => {
  const isLinkActive = page?.link.some((item) => item === pathname);
  return (
    <Link
      href={page?.link[0]}
      className={`flex items-center py-[10px] px-[13px] rounded-lg text-sm font-medium ${
        isMenuOpen ? "gap-0 justify-center" : "gap-3"
      } ${
        isLinkActive
          ? "bg-[#e8f2ffaf] text-primary"
          : "text-white bg-[#e8f2ff1c]"
      }`}
    >
      {React.cloneElement(page?.icon, { isLinkActive })}
      <span
        className={`transition-all duration-300 text-nowrap ${
          isMenuOpen
            ? "opacity-0 scale-x-0 w-0 h-0"
            : "opacity-100 scale-x-100 h-auto w-auto"
        }`}
      >
        {page?.title}
      </span>
      {!isMenuOpen &&
        (page?.title === "Notification" || page?.title === "Messages") && (
          <span className="flex-1 flex justify-end">
            <div className="bg-[#FF2F00] w-[27px] h-[18px] rounded-[31px] grid place-items-center text-[10px] font-semibold text-white">
              {page?.title === "Notification" && "21"}
              {page?.title === "Messages" && "3"}
            </div>
          </span>
        )}
    </Link>
  );
};
