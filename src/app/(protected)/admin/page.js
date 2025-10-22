'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import Dashboard from '@/components/user/dashboard/Dashboard';

const UserPage = () => {
  console.log('admin pagesss');

  return <Dashboard />;
};

// export default UserPage;
export default withPageGuard(UserPage, '/admin');
