import { connectDb } from '@/configs/connectDb';
import { configureCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export const POST = asyncHandler(async (req) => {
  await connectDb();
  await configureCloudinary();
  console.log('erererere', req.body);

  const { user, accessToken } = await isAuthenticated();
  const formData = await req.formData();
  if (!formData) throw new customError(400, 'Please Add Fields For Building');

  const rawRestRoomsJson = formData.get('restRooms');
  const buildingId = formData.get('buildingId');
  const restRoomImages = formData.getAll('restRoomImages');

  if (!buildingId) throw new customError(400, 'Please provide building id');

  let restRooms;
  try {
    restRooms = JSON.parse(rawRestRoomsJson);
  } catch {
    throw new customError(400, "'restRooms' must be valid JSON.");
  }

  if (!Array.isArray(restRooms) || restRooms.length === 0) {
    throw new customError(400, "'restRooms' must be a non-empty array.");
  }

  // Validate each restroom and collect sensor IDs
  const sensorIds = [];
  const data = restRooms.map((r, idx) => {
    console.log('rrrrrrrrrrr', r);

    if (!r.name || !r.type || !r.status || !r.area || !r.numOfToilets || !r.coordinates) {
      throw new customError(400, `Invalid or missing fields in restRooms[${idx}].`);
    }

    // sanitize and validate coordinates
    r.coordinates = r.coordinates.map((item) => {
      const sanitized = {
        ...item,
        polygonId: item?.polygonId || nanoid(),
        labelPoint: item?.labelPoint || 'first',
      };
      if (!sanitized.sensor) throw new customError(400, `Missing sensor in coordinates[${idx}].`);
      if (!sanitized.points?.length)
        throw new customError(400, `Missing points in coordinates[${idx}].`);
      if (!sanitized.polygonId)
        throw new customError(400, `Missing polygonId in coordinates[${idx}].`);
      sensorIds.push(sanitized.sensor);
      return sanitized;
    });

    return {
      ownerId: user._id,
      name: r.name,
      restroomId: r.restroomId || '', // ✅ store frontend restroomId (polygon id)
      type: r.type,
      status: r.status,
      area: r.area,
      numOfToilets: r.numOfToilets,
      modelCoordinates: r.coordinates,
      buildingId,
      sensors: r.coordinates.map((item) => String(item.sensor)),
    };
  });

  if (restRoomImages.length !== data.length) {
    throw new customError(400, 'You must upload exactly one image per restroom.');
  }

  // Validate sensor availability
  const sensorObjectIds = sensorIds.map((id) => new mongoose.Types.ObjectId(id));
  const availableSensors = await Sensor.find({
    _id: { $in: sensorObjectIds },
    isConnected: false,
    ownerId: user._id,
  });

  if (availableSensors.length !== sensorObjectIds.length) {
    throw new customError(400, 'All sensors must be available.');
  }

  // Upload all images in parallel
  const uploads = await Promise.all(
    restRoomImages.map((file) => uploadOnCloudinary(file, 'restroom-models'))
  );

  uploads.forEach((upload, idx) => {
    if (!upload?.secure_url || !upload?.public_id) {
      throw new customError(500, 'Cloudinary upload failed.');
    }
    data[idx].modelImage = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
  });

  // Insert restrooms
  const createdRestRooms = await RestRoom.insertMany(data);
  if (!createdRestRooms) {
    throw new customError(500, 'Failed to create restrooms.');
  }

  // ✅ Update each sensor with restroomId and buildingId
  const sensorUpdateOps = [];
  createdRestRooms.forEach((restroom) => {
    restroom.sensors.forEach((sensorId) => {
      sensorUpdateOps.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(sensorId) },
          update: {
            $set: {
              isConnected: true,
              buildingId: new mongoose.Types.ObjectId(buildingId),
              restroomId: restroom._id,
            },
          },
        },
      });
    });
  });

  const updateSensors = await Sensor.bulkWrite(sensorUpdateOps);
  if (!updateSensors) throw new customError(500, 'Failed to update sensors.');

  const populatedRestrooms = await Promise.all(
    createdRestRooms.map(async (restroom) => {
      const fullSensors = await Sensor.find({ _id: { $in: restroom.sensors } });
      return {
        ...restroom.toObject(),
        sensors: fullSensors,
      };
    })
  );

  return sendResponse(
    NextResponse,
    'Restrooms created successfully.',
    populatedRestrooms,
    accessToken
  );
});
