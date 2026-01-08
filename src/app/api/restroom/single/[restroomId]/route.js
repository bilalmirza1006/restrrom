import { connectCustomMySqll, connectDb } from '@/configs/connectDb';
import { configureCloudinary, removeFromCloudinary } from '@/lib/cloudinary';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import {
  getOccupancyStats,
  getSlateChartReport,
  getWaterLeakageAggregatedData,
} from '@/utils/getAggregatedSensorData';
import sendResponse from '@/utils/sendResponse';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();
  const { models } = await connectCustomMySqll(user._id);

  // DO NOT use await on params
  const { restroomId } = await params;

  if (!isValidObjectId(restroomId)) {
    throw new customError(400, 'Invalid restroom id');
  }

  // Fetch restroom with sensors populated
  const restroom = await RestRoom.findOne({ _id: restroomId, ownerId: user?._id }).populate(
    'sensors'
  );

  if (!restroom) {
    throw new customError(404, 'Restroom not found');
  }

  // Generate report from the populated sensors
  const mostUseSlate = await getSlateChartReport(models, restroom.sensors);
  const dayData = await getWaterLeakageAggregatedData({
    models: models,
    sensors: restroom.sensors,
    groupBy: 'day',
    scope: 'building',
  });
  console.log('dayData', dayData);

  const weekData = await getWaterLeakageAggregatedData({
    models: models,
    sensors: restroom.sensors,
    groupBy: 'week',
    scope: 'building',
  });
  const monthData = await getWaterLeakageAggregatedData({
    models: models,
    sensors: restroom.sensors,
    groupBy: 'month',
    scope: 'building',
  });
  const waterLeakageData = {
    day: dayData,
    week: weekData,
    month: monthData,
  };
  const occupancyStats = await getOccupancyStats(models, restroom.sensors);
  console.log('occupancyStatsoccupancyStatsoccupancyStatsoccupancyStats', occupancyStats);

  // Attach report to the restroom object (for response only)
  const restroomData = restroom.toObject();
  restroomData.mostUseSlate = mostUseSlate;
  restroomData.waterLeakageData = waterLeakageData;
  restroomData.totalSensors = restroom.sensors.length;
  restroomData.occupancyStats = occupancyStats;

  return sendResponse(NextResponse, 'Restroom fetched successfully', restroomData, accessToken);
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const { restroomId } = await params;
  if (!isValidObjectId(restroomId)) throw new customError(400, 'Invalid restroomId id');
  const restroom = await RestRoom.findOne({ _id: restroomId, ownerId: user?._id });
  if (!restroom) throw new customError(404, 'RestroomId not found');
  if (restroom?.modelImage?.public_id) await removeFromCloudinary(restroom.modelImage.public_id);
  if (restroom.sensors?.length) {
    await Sensor.updateMany(
      { _id: { $in: restroom.sensors } },
      {
        $unset: { buildingId: '', restroomId: '' },
        $set: { isConnected: false },
      }
    );
  }
  await RestRoom.findByIdAndDelete(restroom?._id);
  return sendResponse(NextResponse, 'Restroom deleted successfully', restroom, accessToken);
});

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary();

  const { user, accessToken } = await isAuthenticated();
  const { restroomId } = params;

  if (!isValidObjectId(restroomId)) {
    throw new customError(400, 'Invalid restroom id');
  }

  const formData = await req.formData();
  if (!formData) {
    throw new customError(400, 'Please add fields for restroom');
  }

  const {
    name,
    type,
    status,
    area,
    numOfToilets,
    coordinates, // JSON string
  } = Object.fromEntries(formData);

  const modelImage = formData.get('modelImage');

  if (!name && !type && !status && !area && !numOfToilets && !coordinates && !modelImage) {
    throw new customError(400, 'Please provide at least one field to update');
  }

  /** --------------------------------
   * 1️⃣ FIND RESTROOM
   -------------------------------- */
  const restroom = await RestRoom.findOne({
    _id: restroomId,
    ownerId: user?._id,
  });

  if (!restroom) {
    throw new customError(404, 'Restroom not found');
  }

  /** --------------------------------
   * 2️⃣ DISCONNECT OLD SENSORS
   -------------------------------- */
  if (coordinates && restroom.sensors?.length) {
    await Sensor.updateMany(
      { _id: { $in: restroom.sensors } },
      {
        $set: {
          isConnected: false,
        },
        $unset: {
          restroomId: '',
          buildingId: '',
        },
      }
    );
  }

  /** --------------------------------
   * 3️⃣ UPDATE SIMPLE FIELDS
   -------------------------------- */
  if (name) restroom.name = name;
  if (type) restroom.type = type;
  if (status) restroom.status = status;
  if (area) restroom.area = area;
  if (numOfToilets) restroom.numOfToilets = Number(numOfToilets);

  /** --------------------------------
   * 4️⃣ UPDATE COORDINATES + SENSORS
   -------------------------------- */
  let newSensorIds = [];

  if (coordinates) {
    let parsedCoordinates;
    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch {
      throw new customError(400, 'Invalid coordinates JSON');
    }

    if (!Array.isArray(parsedCoordinates)) {
      throw new customError(400, 'Coordinates must be an array');
    }

    newSensorIds = parsedCoordinates.map(item => {
      if (!item.sensor) {
        throw new customError(400, 'Sensor missing in coordinates');
      }
      return item.sensor;
    });

    restroom.modelCoordinates = parsedCoordinates;
    restroom.sensors = newSensorIds;
  }

  /** --------------------------------
   * 5️⃣ UPDATE IMAGE
   -------------------------------- */
  if (modelImage) {
    if (restroom?.modelImage?.public_id) {
      await removeFromCloudinary(restroom.modelImage.public_id);
    }

    const upload = await uploadOnCloudinary(modelImage, 'restroom-models');
    if (!upload?.secure_url) {
      throw new customError(400, 'Error while uploading image');
    }

    restroom.modelImage = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
  }

  /** --------------------------------
   * 6️⃣ SAVE RESTROOM
   -------------------------------- */
  await restroom.save();

  /** --------------------------------
   * 7️⃣ CONNECT NEW SENSORS ✅
   -------------------------------- */
  if (newSensorIds.length) {
    await Sensor.updateMany(
      { _id: { $in: newSensorIds } },
      {
        $set: {
          isConnected: true,
          restroomId: restroom._id,
          buildingId: restroom.buildingId,
        },
      }
    );
  }

  return sendResponse(NextResponse, 'Restroom updated successfully', restroom, accessToken);
});
