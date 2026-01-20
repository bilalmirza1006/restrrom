import { connectCustomMySqll, connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { MODEL_CLASSES } from '@/sequelizeSchemas/models';
import { asyncHandler } from '@/utils/asyncHandler';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { col, fn, literal, Op } from 'sequelize';

export const GET = asyncHandler(async req => {
  await connectDb(); // Ensure MongoDB is connected for Auth check
  const { user } = await isAuthenticated();
  // const ownerId = user._id.toString();
  let ownerId;

  if (user.role === 'admin') {
    ownerId = user._id;
  } else if (user.role === 'report_manager') {
    ownerId = user.creatorId;
  } else {
    ownerId = user._id;
  }
  // Connect to custom or global DB based on user profile
  const { models } = await connectCustomMySqll(ownerId);

  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get('buildingId');
  const restroomId = searchParams.get('restroomId');
  const sensorId = searchParams.get('sensorId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const latest = searchParams.get('latest') || 'false';
  const limitToLatest10 = !startDate && !endDate;
  const intervalParam = searchParams.get('interval'); // milliseconds

  const intervalMs = intervalParam ? parseInt(intervalParam, 10) : null;

  const INTERVAL_MINUTES = intervalMs && intervalMs > 0 ? intervalMs / (1000 * 60) : null;

  console.log('➡️ PARAMS RECEIVED:', {
    ownerId,
    buildingId,
    restroomId,
  });

  if (!ownerId) {
    return NextResponse.json({ success: false, message: 'ownerId required' });
  }

  /* 1️⃣ Fetch buildings */
  const buildingFilter = { ownerId };
  if (buildingId) buildingFilter._id = buildingId;

  const buildings = await Building.find(buildingFilter).lean();

  console.log('🏢 BUILDINGS FOUND:', buildings.length);

  if (!buildings.length) {
    return NextResponse.json({ success: true, data: [] });
  }

  const buildingIds = buildings.map(b => b._id.toString());

  /* 2️⃣ Fetch restroom details (DEBUGGED) */
  let restroomDetails = null;

  if (restroomId) {
    const restroomObjectId = new mongoose.Types.ObjectId(restroomId);
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const buildingObjectId = buildingId ? new mongoose.Types.ObjectId(buildingId) : null;

    console.log('🧪 OBJECT IDS:', {
      restroomObjectId,
      ownerObjectId,
      buildingObjectId,
    });

    restroomDetails = await RestRoom.findOne({
      _id: restroomObjectId,
      ownerId: ownerObjectId,
      ...(buildingObjectId && { buildingId: buildingObjectId }),
    }).lean();

    console.log('🚻 RESTROOM RESULT:', restroomDetails);
  }

  /* 3️⃣ Fetch sensor data */
  const buildingSensorData = {};

  for (const { cls, name } of MODEL_CLASSES) {
    const where = {
      buildingId: buildingIds,
    };

    if (restroomId) where.restroomId = restroomId;
    if (sensorId) where.sensorId = sensorId;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    // Get the dynamic model class for this connection
    const ModelClass = models[name];

    if (!ModelClass) {
      console.warn(`Model ${name} not found in initialized models`);
      continue;
    }

    const attributes = INTERVAL_MINUTES
      ? [
          // pick latest record per interval bucket
          [fn('MAX', col('timestamp')), 'timestamp'],
          ...Object.keys(ModelClass.rawAttributes)
            .filter(a => !['id', 'timestamp'].includes(a))
            .map(a => [fn('ANY_VALUE', col(a)), a]),
        ]
      : undefined;

    const group = INTERVAL_MINUTES
      ? [literal(`FLOOR(UNIX_TIMESTAMP(timestamp) / ${INTERVAL_MINUTES * 60})`)]
      : undefined;

    const sqlData = await ModelClass.findAll({
      where,
      attributes,
      group,
      order: [['timestamp', 'DESC']],
      limit: !INTERVAL_MINUTES && limitToLatest10 ? 10 : undefined,
      raw: true,
    });

    sqlData.forEach(record => {
      const bId = record.buildingId;
      if (!buildingSensorData[bId]) buildingSensorData[bId] = {};
      if (!buildingSensorData[bId][name]) buildingSensorData[bId][name] = [];
      buildingSensorData[bId][name].push(record);
    });

    if (latest === 'true') {
      Object.keys(buildingSensorData).forEach(bId => {
        if (buildingSensorData[bId][name]) {
          buildingSensorData[bId][name] = [buildingSensorData[bId][name][0]];
        }
      });
    }
  }

  /* 4️⃣ Attach sensors + restroom details */
  const buildingsWithSensors = buildings.map(building => ({
    ...building,
    sensors: buildingSensorData[building._id.toString()] || {},
    ...(restroomDetails && { restroomDetails }),
  }));

  console.log('✅ FINAL RESPONSE:', restroomDetails ? 'RESTROOM ATTACHED' : 'NO RESTROOM ATTACHED');

  return NextResponse.json(
    {
      success: true,
      data: buildingsWithSensors,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
});
