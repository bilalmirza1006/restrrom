import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import Subscriber from '@/models/subscription.model';
import { getBuildingPerformanceFromSensors, getLatestBuildingPerformance } from '@/utils/admin';
import { asyncHandler } from '@/utils/asyncHandler';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  const { user } = await isAuthenticated();
  const ownerId = user?._id?.toString();

  if (!ownerId) {
    return NextResponse.json({ success: false, message: 'ownerId required' });
  }

  const url = new URL(req.url);
  const period = url.searchParams.get('period'); // day | week | month
  const latest = url.searchParams.get('latest'); // true

  /**
   * ===============================
   * PARTIAL API — ONLY PERIOD CHANGE
   * ===============================
   */
  if (period) {
    // Fetch sensors and buildings in parallel
    const [allSensors, buildings] = await Promise.all([
      Sensor.find({ ownerId }).lean(),
      Building.find({ ownerId }).lean(),
    ]);

    // Create a mapping of buildingId → buildingName
    const buildingIdToNameMap = {};
    buildings.forEach(b => {
      buildingIdToNameMap[b._id.toString()] = b.location || 'Unnamed Building';
    });

    // Get performance data for the period
    const overAllBuildingPerformance = await getBuildingPerformanceFromSensors(allSensors, period);

    // Attach building names
    const finalPerformance = overAllBuildingPerformance.map(item => ({
      buildingName: buildingIdToNameMap[item.buildingId.toString()] || item.buildingId,
      ...item,
    }));

    return NextResponse.json({
      success: true,
      data: {
        overAllBuildingPerformance: finalPerformance,
      },
    });
  }

  /**
   * ====================================
   * PARTIAL API — ONLY LATEST PERFORMANCE
   * ====================================
   */
  if (latest === 'true') {
    const allSensors = await Sensor.find({ ownerId }).lean();

    const topBuildings = await getLatestBuildingPerformance(allSensors);

    const summedBuildings = topBuildings.map(b => ({
      ...b,
      totalPerformance: Object.values(b.performance).reduce((acc, val) => acc + val, 0),
    }));

    return NextResponse.json({
      success: true,
      data: {
        topBuildings: summedBuildings,
      },
    });
  }

  /**
   * ===============================
   * FULL API — FIRST LOAD ONLY
   * ===============================
   */
  const [buildings, totalRestrooms, totalSubscriptions, allSensors] = await Promise.all([
    Building.find({ ownerId }).lean(),
    RestRoom.countDocuments({ ownerId }),
    Subscriber.countDocuments({ user: ownerId }),
    Sensor.find({ ownerId }).lean(),
  ]);

  const buildingIdToNameMap = {};
  buildings.forEach(b => {
    buildingIdToNameMap[b._id.toString()] = b.location || 'Unnamed Building';
  });

  const topBuildings = await getLatestBuildingPerformance(allSensors);
  const summedBuildings = topBuildings.map(b => ({
    buildingName: buildingIdToNameMap[b.buildingId.toString()] || b.buildingId,
    totalPerformance: Object.values(b.performance).reduce((acc, val) => acc + val, 0),
    ...b,
  }));
  const buildingLocations = buildings.map(b => ({
    buildingId: b._id,
    locationName: b.location || null,
    latitude: b.latitude || null,
    longitude: b.longitude || null,
    buildingThumbnail: b.buildingThumbnail?.url || null,
  }));

  return NextResponse.json({
    success: true,
    data: {
      buildings,
      allSensors,
      topBuildings: summedBuildings,
      // overAllBuildingPerformance: finalPerformance,
      locationData: buildingLocations,
      counts: {
        totalBuildings: buildings.length,
        totalRestrooms,
        totalSubscriptions,
        totalSensors: allSensors.length,
      },
    },
  });
});
