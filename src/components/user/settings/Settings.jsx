"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Profile from "./Profile";
import SubscriptionHistory from "./SubscriptionHistory";
import ChangePassword from "./ChangePassword";
import Configuration from "./Configuration";

const tabComponents = {
  profile: <Profile />,
  subscriptions: <SubscriptionHistory />,
  password: <ChangePassword />,
  configuration: <Configuration />,
};

const Settings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab")?.toLowerCase() || "profile";
  const [activeTab, setActiveTab] = useState(tabParam);

  const tabs = [
    { label: "Profile", value: "profile" },
    { label: "Subscriptions History", value: "subscriptions" },
    { label: "Change Password", value: "password" },
    { label: "Configuration", value: "configuration" },
  ];

  const handleTabChange = (value) => {
    setActiveTab(value);
    router.push(`?tab=${value}`, { scroll: false });
  };

  useEffect(() => {
    if (tabParam !== activeTab) setActiveTab(tabParam);
  }, [tabParam]);

  return (
    <section className="bg-white rounded-[15px] p-4 lg:p-6">
      <div className="flex items-center gap-4 flex-wrap">
        {tabs.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleTabChange(value)}
            className={`text-base font-semibold px-5 py-3 rounded-md transition-all duration-150 ${
              activeTab === value
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 md:mt-5">
        {tabComponents[activeTab] || <Profile />}
      </div>
    </section>
  );
};

export default Settings;
