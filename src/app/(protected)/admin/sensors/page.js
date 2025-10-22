'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import Sensors from '@/components/user/sensors/Sensors';

const SensorPage = () => {
  return <Sensors />;
};

// export default SensorPage;
export default withPageGuard(SensorPage, '/admin/sensors');
