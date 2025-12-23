import { connectDb, sequelize } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Sensor } from '@/models/sensor.model';
import { initModels } from '@/sequelizeSchemas/initModels';
import {
  AirQuality,
  DoorQueue,
  MODEL_CLASSES,
  Occupancy,
  SoapDispenser,
  StallStatus,
  ToiletPaper,
  WaterLeakage,
} from '@/sequelizeSchemas/models';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import {
  getLatestSensorValue,
  getSensorCounts,
  getSensorHistory,
} from '@/utils/getAggregatedSensorData';
import sendResponse from '@/utils/sendResponse';
import { isValidObjectId } from 'mongoose';
import { turborepoTraceAccess } from 'next/dist/build/turborepo-access-trace';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  initModels(sequelize); // initialize SQL models

  const { user } = await isAuthenticated();
  const ownerId = user._id.toString();

  const { sensorId, range } = params; // range: 'hour' | 'day' | 'week' | 'month'
  if (!isValidObjectId(sensorId)) throw new customError(400, 'Invalid sensor id');

  const sensor = await Sensor.findOne({ _id: sensorId, ownerId });
  if (!sensor) throw new customError(404, 'Sensor not found');

  const modelEntry = MODEL_CLASSES.find(
    m => m.name.toLowerCase() === sensor.sensorType.toLowerCase()
  );
  if (!modelEntry?.cls) throw new customError(400, `Unsupported sensor type: ${sensor.sensorType}`);
  const SqlModel = modelEntry.cls;

  // Latest value
  const latestValue = await SqlModel.findOne({
    where: { sensor_unique_id: sensor.uniqueId },
    order: [['timestamp', 'DESC']],
    raw: true,
  });

  // Historical counts
  const historicalCounts = {
    hour: await getSensorCounts(SqlModel, sensor, 'hour'),
    day: await getSensorCounts(SqlModel, sensor, 'day'),
    week: await getSensorCounts(SqlModel, sensor, 'week'),
    month: await getSensorCounts(SqlModel, sensor, 'month'),
  };
  return NextResponse.json({
    success: true,
    sensor,
    latestValue,
    historicalCounts, // array of { date, count }
  });
});

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();
  const ownerId = user._id;
  const { sensorId } = await params;
  if (!isValidObjectId(sensorId)) {
    throw new customError(400, 'Invalid sensor ID');
  }
  const sensor = await Sensor.findOne({ _id: sensorId, ownerId });
  if (!sensor) {
    throw new customError(404, 'Sensor not found');
  }
  const updates = await req.json();
  const allowedFields = ['name', 'type', 'uniqueId', 'status', 'isConnected'];
  const hasUpdates = allowedFields.some(field => field in updates);
  if (!hasUpdates) {
    throw new customError(400, 'Please provide at least one field to update');
  }
  // Handle uniqueId change with duplication check
  if (updates.uniqueId && updates.uniqueId !== sensor.uniqueId) {
    const existing = await Sensor.findOne({ uniqueId: updates.uniqueId });
    if (existing) {
      throw new customError(400, 'Sensor uniqueId already exists');
    }
    sensor.uniqueId = updates.uniqueId;
  }
  // Update allowed fields dynamically
  for (const field of allowedFields) {
    if (field in updates && field !== 'uniqueId') {
      sensor[field] = updates[field];
    }
  }
  await sensor.save();
  return sendResponse(NextResponse, 'Sensor updated successfully', sensor, accessToken);
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const ownerId = user._id;
  const { sensorId } = await params;
  if (!isValidObjectId(sensorId)) throw new customError(400, 'Invalid sensor id');

  const sensor = await Sensor.findOneAndDelete({ _id: sensorId, ownerId });
  if (!sensor) throw new customError(400, 'Sensor not found');
  return sendResponse(NextResponse, 'Sensor Deleted successfully', '', accessToken);
  return NextResponse.json({
    success: true,
    message: 'Sensor Deleted successfully',
  });
});
