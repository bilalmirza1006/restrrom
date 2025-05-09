import { connectDb } from "@/configs/connectDb";
import { removeFromCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Building } from "@/models/building.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = await params;
  if (!isValidObjectId(buildingId)) throw new customError(400, "Invalid building id");
  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, "Building not found");
  return sendResponse(NextResponse, "Building fetched successfully", building, accessToken);
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = await params;
  if (!isValidObjectId(buildingId)) throw new customError(400, "Invalid building id");
  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, "Building not found");
  const promises = [];
  if (building?.buildingThumbnail?.public_id)
    promises.push(removeFromCloudinary(building?.buildingThumbnail?.public_id));
  if (building?.buildingModel?.public_id) promises.push(removeFromCloudinary(building?.buildingModel?.public_id));
  await Promise.all([...promises, Building.findByIdAndDelete(buildingId)]);
  return sendResponse(NextResponse, "Building deleted successfully", building, accessToken);
});
