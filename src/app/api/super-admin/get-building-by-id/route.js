import { connectDb } from '@/configs/connectDb';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { asyncHandler } from '@/utils/asyncHandler';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = await params;
  if (!isValidObjectId(buildingId)) throw new customError(400, 'Invalid building id');

  const url = new URL(req.url);
  const include = url.searchParams.get('include'); // e.g. include=restrooms

  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, 'Building not found');

  if (include === 'restrooms') {
    const restrooms = await RestRoom.find({ buildingId });
    const payload = { building, restrooms };
    return sendResponse(NextResponse, 'Building fetched successfully', payload, accessToken);
  }

  return sendResponse(NextResponse, 'Building fetched successfully', building, accessToken);
});
