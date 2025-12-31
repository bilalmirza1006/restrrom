import mongoose from 'mongoose';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import Subscriber from '@/models/subscription.model';
import { connectDb } from '@/configs/connectDb';
import { asyncHandler } from '@/utils/asyncHandler';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { getTopBuildings } from '@/utils/getAggregatedSensorData';

export const GET = asyncHandler(async req => {
  await connectDb();

  const { user } = await isAuthenticated();
  const ownerId = user._id.toString();

  if (!ownerId) {
    return NextResponse.json({ success: false, message: 'ownerId required' });
  }

  // Run queries in parallel for better performance
  const [buildings, totalRestrooms, totalSubscriptions, allSensors] = await Promise.all([
    Building.find({ ownerId }).lean(),
    RestRoom.countDocuments({ ownerId }),
    Subscriber.countDocuments({ user: ownerId }),
    Sensor.find({ ownerId }).lean(),
  ]);
  const topBuildings = getTopBuildings(allSensors);
  return NextResponse.json({
    success: true,
    data: {
      buildings,
      allSensors,
      topBuildings,
      counts: {
        totalBuildings: buildings.length,
        totalRestrooms,
        totalSubscriptions,
        totalSensors: allSensors.length,
      },
    },
  });
});
