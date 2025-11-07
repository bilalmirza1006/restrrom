import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  // ✅ Authenticate user
  const { user, accessToken } = await isAuthenticated();

  // ✅ Extract buildingId from query
  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get('buildingId');

  if (!buildingId) throw new customError(400, 'Please provide buildingId');

  // ✅ Find building document
  const building = await Building.findById(buildingId);
  if (!building) throw new customError(404, 'Building not found');

  // ✅ Extract restroom IDs from buildingCoordinates
  const restroomIds = building.buildingCoordinates
    ?.map(coord => coord?.restroomId)
    .filter(id => !!id);

  if (!restroomIds || restroomIds.length === 0)
    throw new customError(404, 'No restrooms found in this building');

  // ✅ Fetch all restroom details using those IDs
  const restRooms = await RestRoom.find({ _id: { $in: restroomIds } });

  // ✅ Return response
  return sendResponse(
    NextResponse,
    'Fetched restrooms successfully',
    { building, restRooms },
    accessToken
  );
});

// import { connectDb } from '@/configs/connectDb';
// import { isAuthenticated } from '@/lib/isAuthenticated';
// import { RestRoom } from '@/models/restroom.model';
// import { asyncHandler } from '@/utils/asyncHandler';
// import sendResponse from '@/utils/sendResponse';
// import { NextResponse } from 'next/server';

// export const GET = asyncHandler(async (req) => {
//   await connectDb();
//   const { user, accessToken } = await isAuthenticated();
//   const { searchParams } = new URL(req.url);
//   const buildingId = searchParams.get('buildingId');
//   if (!buildingId) throw new customError(400, 'Please provide buildingId');
//   const restRooms = await RestRoom.find({ buildingId });
//   return sendResponse(NextResponse, 'Fetched restrooms successfully', restRooms, accessToken);
// });
