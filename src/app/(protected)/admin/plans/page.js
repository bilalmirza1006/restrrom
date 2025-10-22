'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import Plans from '@/components/user/plans/Plans';

const PlansPage = () => {
  return <Plans />;
};

// export default PlansPage;
export default withPageGuard(PlansPage, '/admin/plans');
