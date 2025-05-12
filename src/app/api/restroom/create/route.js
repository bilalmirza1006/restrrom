import { connectDb } from "@/configs/connectDb";
import { configureCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { RestRoom } from "@/models/restroom.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, "Please Add Fields For Building");
  const { name, type, status, area, numOfToilets, buildingId } = Object.fromEntries(formData);
  if (!name || !type || !status || !area || !numOfToilets || !buildingId)
    throw new customError(400, "Please provide all fields");
  const modelImage = formData.get("modelImage");
  if (!modelImage) throw new customError(400, "Please add model image");
  const modelImageCloud = await uploadOnCloudinary(modelImage, "restroom-models");
  if (!modelImageCloud?.secure_url || !modelImageCloud?.public_id)
    throw new customError(400, "Error while uploading image");
  const restroom = await RestRoom.create({
    ownerId: user?._id,
    buildingId,
    name,
    type,
    status,
    area,
    numOfToilets,
    modelImage: {
      public_id: modelImageCloud.public_id,
      url: modelImageCloud.secure_url,
    },
  });
  if (!restroom) throw new customError(400, "Error while creating restroom");
  return sendResponse(NextResponse, "Restroom created successfully", restroom, accessToken);
});
