'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Profile from '@/components/user/settings/Profile';
import SubscriptionHistory from '@/components/user/settings/SubscriptionHistory';
import ChangePassword from '@/components/user/settings/ChangePassword';
import Configuration from '@/components/user/settings/Configuration';

const tabComponents = {
  profile: <Profile />,
  subscriptions: <SubscriptionHistory />,
  password: <ChangePassword />,
  configuration: <Configuration />,
};

const Settings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab')?.toLowerCase() || 'profile';
  const [activeTab, setActiveTab] = useState(tabParam);

  const tabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Subscriptions History', value: 'subscriptions' },
    { label: 'Change Password', value: 'password' },
    { label: 'Configuration', value: 'configuration' },
  ];

  const handleTabChange = value => {
    setActiveTab(value);
    router.push(`?tab=${value}`, { scroll: false });
  };

  useEffect(() => {
    if (tabParam !== activeTab) setActiveTab(tabParam);
  }, [tabParam]);

  return (
    <section className="rounded-[15px] bg-white p-4 lg:p-6">
      <div className="flex flex-wrap items-center gap-4">
        {tabs.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleTabChange(value)}
            className={`rounded-md px-5 py-3 text-base font-semibold transition-all duration-150 ${
              activeTab === value
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 md:mt-5">{tabComponents[activeTab] || <Profile />}</div>
    </section>
  );
};

export default Settings;
