import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { getOccupancyStats } from '@/utils/getAggregatedSensorData';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';
export const GET = asyncHandler(async req => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();

  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get('buildingId');
  if (!buildingId) throw new customError(400, 'Please provide buildingId');

  const building = await Building.findById(buildingId).lean();
  if (!building) throw new customError(404, 'Building not found');

  const restroomIds = building.buildingCoordinates?.map(c => c?.restroomId).filter(Boolean);

  if (!restroomIds.length) throw new customError(404, 'No restrooms found in this building');

  const restRooms = await RestRoom.find({ _id: { $in: restroomIds } }).lean();

  // === Add occupancy stats for each restroom ===
  const restRoomsWithOccupancy = await Promise.all(
    restRooms.map(async restroom => {
      const sensors = await Sensor.find(
        { _id: { $in: restroom.sensors || [] } },
        { sensorType: 1, uniqueId: 1 }
      ).lean();

      const occupancyStats = await getOccupancyStats(sensors);

      return {
        ...restroom,
        occupancyStats,
      };
    })
  );

  return sendResponse(
    NextResponse,
    'Fetched restrooms successfully',
    {
      building,
      restRooms: restRoomsWithOccupancy,
    },
    accessToken
  );
});
