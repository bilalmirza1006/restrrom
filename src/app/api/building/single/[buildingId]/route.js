import { connectDb } from "@/configs/connectDb";
import { configureCloudinary, removeFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
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
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = await params;
  if (!isValidObjectId(buildingId)) throw new customError(400, "Invalid building id");
  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, "Building not found");
  const promises = [];
  if (building?.buildingThumbnail?.public_id)
    promises.push(removeFromCloudinary(building?.buildingThumbnail?.public_id));
  if (building?.buildingModelImage?.public_id)
    promises.push(removeFromCloudinary(building?.buildingModelImage?.public_id));
  await Promise.all([...promises, Building.findByIdAndDelete(buildingId)]);
  return sendResponse(NextResponse, "Building deleted successfully", building, accessToken);
});

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, "Please Add Fields For Building");
  const { name, type, location, area, totalFloors, numberOfRooms, buildingManager, phone } =
    Object.fromEntries(formData);
  const thumbnailImage = formData.get("buildingThumbnail");
  const buildingModelImage = formData.get("buildingModelImage");
  if (
    !name &&
    !type &&
    !location &&
    !area &&
    !totalFloors &&
    !numberOfRooms &&
    !buildingManager &&
    !phone &&
    !thumbnailImage &&
    !buildingModelImage
  )
    throw new customError(400, "Please Provide Field For Update");
  const { buildingId } = await params;
  if (!isValidObjectId(buildingId)) throw new customError(400, "Invalid building id");
  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, "Building not found");
  const updates = {};
  if (name) updates.name = name;
  if (type) updates.type = type;
  if (location) updates.location = location;
  if (area) updates.area = area;
  if (totalFloors) updates.totalFloors = totalFloors;
  if (numberOfRooms) updates.numberOfRooms = numberOfRooms;
  if (buildingManager) updates.buildingManager = buildingManager;
  if (phone) updates.phone = phone;
  if (thumbnailImage) {
    if (building?.buildingThumbnail?.public_id) await removeFromCloudinary(building?.buildingThumbnail?.public_id);
    const thumbNailCloud = await uploadOnCloudinary(thumbnailImage, "building-thumbnails");
    updates.buildingThumbnail = {
      public_id: thumbNailCloud.public_id,
      url: thumbNailCloud.secure_url,
    };
  }
  if (buildingModelImage) {
    if (building?.buildingModel?.public_id) await removeFromCloudinary(building?.buildingModel?.public_id);
    const buildingCloud = await uploadOnCloudinary(buildingModelImage, "building-models");
    updates.buildingModel = {
      public_id: buildingCloud.public_id,
      url: buildingCloud.secure_url,
    };
  }
  const updatedBuilding = await Building.findOneAndUpdate({ _id: buildingId, ownerId: user?._id }, updates, {
    new: true,
  });
  return sendResponse(NextResponse, "Building updated successfully", "", accessToken);
});
