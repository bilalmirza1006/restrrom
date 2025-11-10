import { connectDb } from '@/configs/connectDb';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model'; // ✅ required for populate to work
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  // ✅ Get optional query params (for filtering/sorting)
  const { search, ownerId, sort } = Object.fromEntries(req.nextUrl.searchParams);

  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (ownerId) filter.ownerId = ownerId;

  const sortOption = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };

  // ✅ Fetch buildings + restroom info
  const buildings = await Building.find(filter)
    .populate('ownerId', 'name email role')
    .populate({
      path: 'buildingCoordinates.restroomId',
      model: 'RestRoom',
      select: 'name floor status sensors', // select only useful fields
    })
    .sort(sortOption);

  if (!buildings.length) {
    throw new customError('No buildings found', 404);
  }

  return NextResponse.json({
    success: true,
    message: 'All buildings fetched successfully',
    data: buildings,
  });
});
