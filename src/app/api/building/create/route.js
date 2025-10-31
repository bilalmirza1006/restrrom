import { connectDb } from '@/configs/connectDb';
import { configureCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const POST = asyncHandler(async (req) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, 'Please Add Fields For Building');
  const {
    name,
    type,
    location,
    area,
    totalFloors,
    numberOfRooms,
    buildingManager,
    phone,
    latitude,
    longitude,
    buildingCoordinates,
  } = Object.fromEntries(formData);
  // console.log(Object.fromEntries(formData));
  if (
    !name ||
    !type ||
    !location ||
    !area ||
    !totalFloors ||
    !numberOfRooms ||
    !buildingManager ||
    !phone ||
    !latitude ||
    !longitude ||
    !buildingCoordinates
  )
    throw new customError(400, 'Please provide all fields');
  const thumbnailImage = formData.get('buildingThumbnail');
  const buildingModelImage = formData.get('buildingModelImage');
  if (!thumbnailImage || !buildingModelImage)
    throw new customError(400, 'Please provide all fields');
  const coordinates = JSON.parse(buildingCoordinates);
  const [thumbNailCloud, buildingCloud] = await Promise.all([
    uploadOnCloudinary(thumbnailImage, 'building-thumbnails'),
    uploadOnCloudinary(buildingModelImage, 'building-models'),
  ]);
  if (!thumbNailCloud?.public_id || !thumbNailCloud?.secure_url)
    throw new customError(400, 'Error while uploading thumbnail image');
  if (!buildingCloud?.public_id || !buildingCloud?.secure_url)
    throw new customError(400, 'Error while uploading building model image');
  const building = await Building.create({
    ownerId: user?._id,
    buildingThumbnail: {
      public_id: thumbNailCloud.public_id,
      url: thumbNailCloud.secure_url,
    },
    name,
    type,
    location,
    area,
    totalFloors,
    numberOfRooms,
    buildingManager,
    latitude,
    longitude,
    phone,
    buildingCoordinates: coordinates,
    buildingModelImage: {
      public_id: buildingCloud.public_id,
      url: buildingCloud.secure_url,
    },
  });
  return sendResponse(NextResponse, 'Building created successfully', building?._id, accessToken);
});
