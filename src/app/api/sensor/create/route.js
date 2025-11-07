import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';
import { sequelize } from '@/configs/connectDb';
import mongoose from 'mongoose';

export const POST = asyncHandler(async req => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const ownerId = user._id;
  const body = await req.json();
  console.log('iuygfdfghjkjhgfd', body);

  const { id, name, uniqueId, parameters, status } = body;
  if (!id) {
    // Create mode: require all fields
    if (!name || !uniqueId || !parameters || !Array.isArray(parameters) || parameters.length === 0)
      throw new customError(400, 'Please provide all fields, including parameters');
  }

  // Normalize uniqueId: replace all dash-like characters with standard hyphen-minus
  const normalizedUniqueId = uniqueId ? uniqueId.replace(/[‐‑‒–—―]/g, '-').trim() : undefined;

  // 1. Check MySQL connection
  try {
    await sequelize.authenticate();
    console.log('MySQL database is connected');
  } catch (err) {
    throw new customError(500, 'MySQL database is not connected');
  }

  // 2. Check uniqueId in each parameter table (only for create or if parameters are provided)
  if (!id || (parameters && Array.isArray(parameters) && parameters.length > 0)) {
    const missingTables = [];
    for (const param of parameters || []) {
      const [result] = await sequelize.query(
        `SELECT 1 FROM \`${param}\` WHERE sensor_unique_id = :uniqueId LIMIT 1`,
        { replacements: { uniqueId: normalizedUniqueId } }
      );
      if (!result || result.length === 0) {
        missingTables.push(param);
      }
    }
    if (missingTables.length > 0) {
      throw new customError(
        400,
        `Sensor uniqueId not found in the following parameter tables: ${missingTables.join(', ')}`
      );
    }
  }

  // 3. Create or Edit sensor
  let sensor;
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new customError(400, 'Invalid sensor ID');
    }
    sensor = await Sensor.findOne({ _id: id, ownerId });
    if (!sensor) throw new customError(404, 'Sensor not found for editing');
    // Only check for uniqueId if it's being changed and provided
    if (uniqueId && sensor.uniqueId !== uniqueId) {
      const isExist = await Sensor.findOne({ uniqueId });
      if (isExist) throw new customError(400, 'Sensor uniqueId already exists');
      sensor.uniqueId = uniqueId;
    }
    if (name) sensor.name = name;
    if (parameters && Array.isArray(parameters) && parameters.length > 0)
      sensor.parameters = parameters;
    if (typeof status !== 'undefined') sensor.status = status;
    await sensor.save();
    return sendResponse(NextResponse, 'Sensor updated successfully', '', accessToken);
  } else {
    // Create mode: check for duplicate uniqueId
    const isExist = await Sensor.findOne({ uniqueId });
    if (isExist) throw new customError(400, 'Sensor uniqueId already exists');
    sensor = await Sensor.create({
      name,
      uniqueId,
      ownerId,
      parameters,
    });
    return sendResponse(NextResponse, 'Sensor created successfully', '', accessToken);
  }
});
