import { connectDb } from "@/configs/connectDb";
import { configureCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { RestRoom } from "@/models/restroom.model";
import { Sensor } from "@/models/sensor.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, "Please Add Fields For Building");
  const { name, type, status, area, numOfToilets, buildingId, coordinates } = Object.fromEntries(formData);
  if (!name || !type || !status || !area || !numOfToilets || !buildingId || !coordinates?.length)
    throw new customError(400, "Please provide all fields");
  const sensors = [];
  const coordinatesObject = JSON.parse(coordinates);

  coordinatesObject?.forEach((item) => {
    if (!item?.labelPoint) throw new customError(400, `Invalid or missing fields label in coordinates.`);
    if (!item?.id) throw new customError(400, `Invalid or missing fields id in coordinates.`);
    if (!item?.color) throw new customError(400, `Invalid or missing fields color in coordinates.`);
    if (!item?.fillColor) throw new customError(400, `Invalid or missing fields fillColor in coordinates.`);
    if (!item?.sensor) throw new customError(400, `Invalid or missing fields Sensor in coordinates.`);
    if (!item?.points?.length) throw new customError(400, `Invalid or missing fields points in coordinates.`);
    sensors.push(String(item?.sensor));
  });

  // check for sensor availability
  const sensorObjectIds = sensors.map((id) => new mongoose.Types.ObjectId(id));
  const isSensorAvailable = await Sensor.find({
    _id: { $in: sensorObjectIds },
    isConnected: false,
    ownerId: user?._id,
  });
  if (isSensorAvailable?.length !== sensorObjectIds?.length)
    throw new customError(400, "All sensors must be available.");

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
    modelCoordinates: coordinatesObject,
    modelImage: {
      public_id: modelImageCloud.public_id,
      url: modelImageCloud.secure_url,
    },
  });
  if (!restroom) throw new customError(400, "Error while creating restroom");
  // update sensors status isConnected True
  const updateSensors = await Sensor.updateMany({ _id: { $in: sensorObjectIds } }, { $set: { isConnected: true } });
  if (!updateSensors) throw new customError(500, "Failed to update sensors.");
  return sendResponse(NextResponse, "Restroom created successfully", restroom, accessToken);
});
