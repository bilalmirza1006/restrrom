'use client';
import {
  BuildingIcon,
  DashboardIcon,
  PlansIcon,
  ReportsIcon,
  SensorsIcon,
  SettingIcon,
} from '@/assets/icon';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { FaArrowCircleRight } from 'react-icons/fa';

const pages = [
  {
    id: 1,
    title: 'Dashboard',
    link: ['/super-admin'],
    icon: <DashboardIcon />,
  },
  {
    id: 1,
    title: 'All Users',
    link: ['/super-admin/all-users'],
    icon: <DashboardIcon />,
  },
  {
    id: 2,
    title: 'Buildings',
    link: ['/super-admin/buildings'],
    icon: <BuildingIcon />,
  },

  {
    id: 3,
    title: 'Sensors',
    link: ['/super-admin/sensors'],
    icon: <SensorsIcon />,
  },

  {
    id: 6,
    title: 'Settings',
    link: ['/super-admin/settings'],
    icon: <SettingIcon />,
  },
];

const AdminAside = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <aside
      className={`relative hidden transition-all duration-300 xl:block ${
        isMenuOpen ? 'w-21' : 'w-61.5'
      }`}
    >
      {/* Arrow icon */}
      <div
        className={`absolute top-9.25 -right-2.5 z-50 hidden cursor-pointer rounded-full bg-white p-1 transition-all duration-300 xl:block ${
          isMenuOpen ? 'rotate-0' : 'rotate-180'
        }`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FaArrowCircleRight className="text-primary text-lg" />
      </div>
      <div
        className="bg-aside-grad scroll-0 relative flex h-full w-full flex-col overflow-x-hidden overflow-y-auto rounded-lg px-2.75 py-5"
        style={{ boxShadow: '0px 4px 14px 0px #3582E729' }}
      >
        <Image
          src={isMenuOpen ? '/images/default/logo-icon.png' : '/images/default/logo.png'}
          width={isMenuOpen ? 35 : 170}
          height={isMenuOpen ? 35 : 40}
          alt="logo"
          className="mx-auto"
        />
        <div className="mt-5 lg:mt-10">
          <h4
            className={`text-xs font-medium text-white/60 ${isMenuOpen ? 'text-center' : 'pl-2'}`}
          >
            MENU
          </h4>
          <div className="mt-3 flex flex-col gap-4">
            {pages.map((page, i) => (
              <LinkItem key={i} page={page} pathname={pathname} isMenuOpen={isMenuOpen} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminAside;

const LinkItem = ({ page, pathname, isMenuOpen }) => {
  const isLinkActive = page?.link.some(item => item === pathname);
  return (
    <Link
      href={page?.link[0]}
      className={`flex items-center rounded-lg px-3.25 py-2.5 text-sm font-medium ${
        isMenuOpen ? 'justify-center gap-0' : 'gap-3'
      } ${isLinkActive ? 'text-primary bg-[#e8f2ffaf]' : 'bg-[#e8f2ff1c] text-white'}`}
    >
      {React.cloneElement(page?.icon, { isLinkActive })}
      <span
        className={`text-nowrap transition-all duration-300 ${
          isMenuOpen ? 'h-0 w-0 scale-x-0 opacity-0' : 'h-auto w-auto scale-x-100 opacity-100'
        }`}
      >
        {page?.title}
      </span>
      {!isMenuOpen && (page?.title === 'Notification' || page?.title === 'Messages') && (
        <span className="flex flex-1 justify-end">
          <div className="grid h-4.5 w-6.75 place-items-center rounded-[31px] bg-[#FF2F00] text-[10px] font-semibold text-white">
            {page?.title === 'Notification' && '21'}
            {page?.title === 'Messages' && '3'}
          </div>
        </span>
      )}
    </Link>
  );
};

// export default AdminAside;
