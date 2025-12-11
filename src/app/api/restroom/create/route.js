/////
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
// import asyncHandler from '@/utils/asyncHandler';
import { configureCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import { Building } from '@/models/building.model';
import { asyncHandler } from '@/utils/asyncHandler';

function syncRestroomIdWithBuilding(buildingData) {
  const { building, restrooms } = buildingData.data;
  if (!building || !Array.isArray(building.buildingCoordinates)) {
    console.warn('⚠️ building.buildingCoordinates is missing or invalid.');
    return building;
  }

  const updatedBuilding = { ...building };

  updatedBuilding.buildingCoordinates = building.buildingCoordinates.map(coord => {
    if (coord.restroomId) return coord;

    const matchingRestroom = restrooms.find(
      r => r.name?.trim()?.toLowerCase() === coord.restroomName?.trim()?.toLowerCase()
    );

    if (matchingRestroom) {
      return { ...coord, restroomId: matchingRestroom._id };
    }

    return coord;
  });

  return updatedBuilding;
}

export const POST = asyncHandler(async req => {
  await connectDb();
  await configureCloudinary();

  const { user, accessToken } = await isAuthenticated();
  const formData = await req.formData();
  if (!formData) throw new customError(400, 'Form data is required');

  const rawData = Object.fromEntries(formData);
  const { name, type, status, area, numOfToilets, buildingId, coordinates } = rawData;

  if (!name || !type || !status || !area || !numOfToilets || !buildingId || !coordinates) {
    throw new customError(400, 'Please provide all required fields');
  }

  const parsedCoordinates = JSON.parse(coordinates);
  const sensors = [];

  parsedCoordinates.forEach(item => {
    if (
      !item.labelPoint ||
      !item.id ||
      !item.color ||
      !item.fillColor ||
      !item.sensor ||
      !item.points?.length
    ) {
      throw new customError(400, 'Invalid or missing fields in coordinates.');
    }
    sensors.push(item.sensor);
  });

  const sensorObjectIds = sensors.map(id => new mongoose.Types.ObjectId(id));

  const availableSensors = await Sensor.find({
    _id: { $in: sensorObjectIds },
    isConnected: false,
    ownerId: user._id,
  });

  if (availableSensors.length !== sensorObjectIds.length) {
    throw new customError(400, 'All sensors must be available.');
  }

  const modelImage = formData.get('modelImage');
  if (!modelImage) throw new customError(400, 'Model image is required');

  const uploadedImage = await uploadOnCloudinary(modelImage, 'restroom-models');

  if (!uploadedImage?.secure_url || !uploadedImage?.public_id) {
    throw new customError(400, 'Image upload failed');
  }

  const restroom = await RestRoom.create({
    ownerId: user._id,
    buildingId: new mongoose.Types.ObjectId(buildingId),
    name,
    type,
    status,
    area,
    numOfToilets: Number(numOfToilets),
    sensors,
    modelCoordinates: parsedCoordinates,
    modelImage: [
      {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
    ],
  });

  if (!restroom) throw new customError(400, 'Failed to create restroom');

  await Sensor.updateMany(
    { _id: { $in: sensorObjectIds } },
    {
      $set: {
        isConnected: true,
        buildingId: new mongoose.Types.ObjectId(buildingId),
        restroomId: restroom._id,
      },
    }
  );

  const fullSensors = await Sensor.find({ _id: { $in: sensorObjectIds } });

  // ✅ Now sync restroomId with building coordinates
  try {
    const buildingData = await Building.findById(buildingId).lean();
    const restrooms = await RestRoom.find({ buildingId });

    if (buildingData && restrooms.length) {
      const buildingWithRestrooms = {
        data: { building: buildingData, restrooms },
      };

      const updatedBuilding = syncRestroomIdWithBuilding(buildingWithRestrooms);

      if (updatedBuilding?.buildingCoordinates) {
        await Building.findByIdAndUpdate(buildingId, {
          $set: { buildingCoordinates: updatedBuilding.buildingCoordinates },
        });
      } else {
        console.warn('⚠️ Skipped updating buildingCoordinates - no valid update found.');
      }
    } else {
      console.warn('⚠️ Building or restrooms not found, skipping coordinate sync.');
    }
  } catch (err) {
    console.error('❌ Error syncing restroomId with building:', err);
  }

  const responsePayload = {
    ...restroom.toObject(),
    sensors: fullSensors,
  };

  return sendResponse(
    NextResponse,
    'Restroom created successfully and building updated',
    responsePayload,
    accessToken
  );
});
