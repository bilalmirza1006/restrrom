import { Building } from '@/models/building.model';
import { connectDb, sequelize } from '@/configs/connectDb';
import { initModels } from '@/sequelizeSchemas/initModels';
import { MODEL_CLASSES } from '@/sequelizeSchemas/models';
import { asyncHandler } from '@/utils/asyncHandler';
import { Op } from 'sequelize';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/isAuthenticated';

export const GET = asyncHandler(async req => {
  await connectDb();
  const models = initModels(sequelize);

  const { user } = await isAuthenticated();
  const ownerId = user._id.toString();

  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get('buildingId'); // optional
  const restroomId = searchParams.get('restroomId'); // optional
  const sensorId = searchParams.get('sensorId'); // optional
  const startDate = searchParams.get('startDate'); // optional
  const endDate = searchParams.get('endDate'); // optional
  const latest = searchParams.get('latest') || 'false'; // optional, default false
  const limitToLatest10 = !startDate && !endDate;

  if (!ownerId) return NextResponse.json({ success: false, message: 'ownerId required' });

  // 1️⃣ Fetch all buildings for owner (or single building if buildingId is provided)
  const buildingFilter = { ownerId };
  if (buildingId) buildingFilter._id = buildingId;

  const buildings = await Building.find(buildingFilter).lean();
  if (!buildings.length) return NextResponse.json({ success: true, data: [] });

  const buildingIds = buildings.map(b => b._id.toString());

  // 2️⃣ Fetch sensor data in bulk
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

    const sqlData = await cls.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: limitToLatest10 ? 10 : undefined,
      raw: true,
    });

    // Group by buildingId
    sqlData.forEach(record => {
      const bId = record.buildingId;
      if (!buildingSensorData[bId]) buildingSensorData[bId] = {};
      if (!buildingSensorData[bId][name]) buildingSensorData[bId][name] = [];
      buildingSensorData[bId][name].push(record);
    });

    // 3️⃣ Keep only latest record if requested
    if (latest === 'true') {
      Object.keys(buildingSensorData).forEach(bId => {
        if (buildingSensorData[bId][name]) {
          buildingSensorData[bId][name] = [buildingSensorData[bId][name][0]];
        }
      });
    }
  }

  // 4️⃣ Map sensor data into building objects
  const buildingsWithSensors = buildings.map(building => ({
    ...building,
    sensors: buildingSensorData[building._id.toString()] || {},
  }));

  return NextResponse.json({
    success: true,
    data: buildingsWithSensors,
  });
});
