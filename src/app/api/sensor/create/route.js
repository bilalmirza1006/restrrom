import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';
import { sequelize } from '@/configs/connectDb';
import mongoose from 'mongoose';

// Map sensorType to MySQL table name
const sensorTypeToTable = {
  door_queue: 'door_queue',
  stall_status: 'stall_status',
  occupancy: 'occupancy',
  air_quality: 'air_quality',
  toilet_paper: 'toilet_paper',
  soap_dispenser: 'soap_dispenser',
  water_leakage: 'water_leakage',
};

export const POST = asyncHandler(async req => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const ownerId = user._id;
  const body = await req.json();
  console.log('Sensor request body:', body);

  const { id, name, uniqueId, sensorType, status } = body;
  console.log('Parsed sensor data:', { id, name, uniqueId, sensorType, status });
  // Validation
  if (!id) {
    // Create mode: require all fields
    if (!name || !uniqueId || !sensorType)
      throw new customError(
        400,
        'Please provide all required fields: name, uniqueId, and sensorType'
      );

    // Validate sensorType enum
    const validSensorTypes = [
      'door_queue',
      'stall_status',
      'occupancy',
      'air_quality',
      'toilet_paper',
      'soap_dispenser',
      'water_leakage',
    ];
    if (!validSensorTypes.includes(sensorType)) {
      throw new customError(
        400,
        `Invalid sensorType. Must be one of: ${validSensorTypes.join(', ')}`
      );
    }
  }

  // Normalize uniqueId: replace all dash-like characters with standard hyphen-minus
  const normalizedUniqueId = uniqueId ? uniqueId.replace(/[‐‑‒–—―]/g, '-').trim() : undefined;

  // Check MySQL connection
  try {
    await sequelize.authenticate();
    console.log('MySQL database is connected');
  } catch (err) {
    throw new customError(500, 'MySQL database is not connected');
  }

  // Validate uniqueId exists in the MySQL table corresponding to sensorType
  if (sensorType && normalizedUniqueId) {
    const tableName = sensorTypeToTable[sensorType];
    if (!tableName) {
      throw new customError(400, `No MySQL table mapping found for sensorType: ${sensorType}`);
    }

    try {
      const [result] = await sequelize.query(
        `SELECT 1 FROM \`${tableName}\` WHERE sensor_unique_id  = :uniqueId LIMIT 1`,
        { replacements: { uniqueId: normalizedUniqueId } }
      );

      if (!result || result.length === 0) {
        throw new customError(
          400,
          `Sensor uniqueId "${normalizedUniqueId}" not found in the "${tableName}" table. Please ensure the sensor exists in the MySQL database.`
        );
      }
    } catch (error) {
      // If it's already a customError, rethrow it
      if (error.statusCode) throw error;
      // Otherwise, it's a database error
      throw new customError(
        500,
        `Error checking sensor in MySQL table "${tableName}": ${error.message}`
      );
    }
  }

  // Create or Edit sensor
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
    if (sensorType) sensor.sensorType = sensorType;
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
      sensorType,
    });
    return sendResponse(NextResponse, 'Sensor created successfully', '', accessToken);
  }
});
