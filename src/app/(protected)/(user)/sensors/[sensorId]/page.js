import SensorDetail from "@/components/user/sensors/SensorDetail";

const SensorViewPage = async ({ params }) => {
  const { sensorId } = await params;
  return <SensorDetail id={sensorId} />;
};

export default SensorViewPage;
