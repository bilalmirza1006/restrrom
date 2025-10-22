'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import Settings from '@/components/user/settings/Settings';

const SettingPage = () => {
  return <Settings />;
};

// export default SettingPage;
export default withPageGuard(SettingPage, '/admin/settings');
