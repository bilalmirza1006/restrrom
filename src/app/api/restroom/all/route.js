import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { RestRoom } from "@/models/restroom.model";
import { asyncHandler } from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get("buildingId");
  if (!buildingId) throw new customError(400, "Please provide buildingId");
  const restRooms = await RestRoom.find({ ownerId: user?._id, buildingId });
  return sendResponse(NextResponse, "Fetched restrooms successfully", restRooms, accessToken);
});
