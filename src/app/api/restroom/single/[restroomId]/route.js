import { connectDb } from "@/configs/connectDb";
import { configureCloudinary, removeFromCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { RestRoom } from "@/models/restroom.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { restroomId } = await params;
  if (!isValidObjectId(restroomId)) throw new customError(400, "Invalid restroom id");
  const restroom = await RestRoom.findOne({ _id: restroomId, ownerId: user?._id });
  if (!restroom) throw new customError(404, "Building not found");
  return sendResponse(NextResponse, "Restroom fetched successfully", restroom, accessToken);
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { restroomId } = await params;
  if (!isValidObjectId(restroomId)) throw new customError(400, "Invalid restroomId id");
  const restroom = await RestRoom.findOne({ _id: restroomId, ownerId: user?._id });
  if (!restroom) throw new customError(404, "RestroomId not found");
  if (restroom?.modelImage?.public_id) await removeFromCloudinary(restroom.modelImage.public_id);
  await RestRoom.findByIdAndDelete(restroom?._id);
  return sendResponse(NextResponse, "Restroom deleted successfully", restroom, accessToken);
});

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, "Please Add Fields For Building");
  const { restroomId } = await params;
  if (!isValidObjectId(restroomId)) throw new customError(400, "Invalid restroom id");
  const { name, type, status, area, numOfToilets } = Object.fromEntries(formData);
  const modelImage = formData.get("modelImage");
  if (!name && !type && !status && !area && numOfToilets && !modelImage)
    throw new customError(400, "Please provide all fields");
  const restroom = await RestRoom.findOne({ _id: restroomId, ownerId: user?._id });
  if (!restroom) throw new customError(404, "Building not found");
  if (name) restroom.name = name;
  if (type) restroom.type = type;
  if (status) restroom.status = status;
  if (area) restroom.area = area;
  if (numOfToilets) restroom.numOfToilets = numOfToilets;
  if (modelImage) {
    if (restroom?.modelImage?.public_id) await removeFromCloudinary(restroom?.modelImage?.public_id);
    const modelImageCloud = await uploadOnCloudinary(modelImage, "restroom-models");
    if (!modelImageCloud?.secure_url || !modelImageCloud?.public_id)
      throw new customError(400, "Error while uploading image");
    restroom.modelImage = { public_id: modelImageCloud.public_id, url: modelImageCloud.secure_url };
  }
  await restroom.save();
  return sendResponse(NextResponse, "Restroom updated successfully", restroom, accessToken);
});
