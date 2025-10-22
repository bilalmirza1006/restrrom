'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import SensorDetail from '@/components/user/sensors/SensorDetail';

const SensorViewPage = async ({ params }) => {
  const { sensorId } = await params;
  return <SensorDetail id={sensorId} />;
};

// export default SensorViewPage;
export default withPageGuard(SensorViewPage, '/admin/sensors/[sensorId]');
