// app/api/rules/route.js
import { NextResponse } from 'next/server';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { isAuthenticated } from '@/lib/isAuthenticated';
import mongoose from 'mongoose';
import Rule from '@/models/rule';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';

// GET all rules or a single rule by id
export const GET = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const alertType = searchParams.get('alertType');
  const severity = searchParams.get('severity');

  let query = { ownerId: user._id };

  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new customError(400, 'Invalid Rule ID');
    const rule = await Rule.findOne({ _id: id, ownerId: user._id }).lean();
    if (!rule) throw new customError(404, 'Rule not found');

    // Populate names for single rule
    if (rule.buildingId) {
      const building = await Building.findById(rule.buildingId).select('name').lean();
      rule.buildingName = building?.name || null;
    }

    if (rule.restroomId) {
      const restroom = await RestRoom.findById(rule.restroomId).select('name').lean();
      rule.restroomName = restroom?.name || null;
    }

    if (rule.sensorIds && rule.sensorIds.length > 0) {
      const sensors = await Sensor.find({ _id: { $in: rule.sensorIds } }).select('name sensorType').lean();
      rule.sensors = sensors.map(s => ({ id: s._id, name: s.name, type: s.sensorType }));
    }

    return NextResponse.json({ success: true, rule });
  }

  if (alertType) query.alertType = alertType;
  if (severity) query.severity = severity;

  const rules = await Rule.find(query).sort({ createdAt: -1 }).lean();

  // Enrich rules with building, restroom, and sensor names
  const enrichedRules = await Promise.all(
    rules.map(async (rule) => {
      const enrichedRule = { ...rule };

      // Get building name
      if (rule.buildingId) {
        const building = await Building.findById(rule.buildingId).select('name').lean();
        enrichedRule.buildingName = building?.name || null;
      }

      // Get restroom name
      if (rule.restroomId) {
        const restroom = await RestRoom.findById(rule.restroomId).select('name').lean();
        enrichedRule.restroomName = restroom?.name || null;
      }

      // Get sensor details (name and type)
      if (rule.sensorIds && rule.sensorIds.length > 0) {
        const sensors = await Sensor.find({ _id: { $in: rule.sensorIds } }).select('name sensorType').lean();
        enrichedRule.sensors = sensors.map(s => ({ id: s._id, name: s.name, type: s.sensorType }));
      }

      return enrichedRule;
    })
  );

  return NextResponse.json({ success: true, rules: enrichedRules });
});

// POST create a new rule
export const POST = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const data = await req.json();
  const { name, buildingId, restroomId, sensorIds, severity, values, platform, email, status } = data;

  if (!name || !severity) {
    throw new customError(400, 'Name and severity are required');
  }

  const newRule = await Rule.create({
    name,
    buildingId,
    restroomId,
    sensorIds: sensorIds || [],
    severity,
    status: status || 'active',
    values: values || {}, // label, id, value
    ownerId: user._id,
    platform: platform || 'platform',
    email: platform === 'email' ? email : undefined,
  });

  return NextResponse.json({ success: true, message: 'Rule created successfully', rule: newRule });
});

// PUT update a rule
export const PUT = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const data = await req.json();
  const { id, name, buildingId, restroomId, sensorIds, severity, values, status, platform, email } = data;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new customError(400, 'Invalid Rule ID');

  const rule = await Rule.findOne({ _id: id, ownerId: user._id });
  if (!rule) throw new customError(404, 'Rule not found');

  rule.name = name || rule.name;
  rule.buildingId = buildingId || rule.buildingId;
  rule.restroomId = restroomId || rule.restroomId;
  rule.sensorIds = sensorIds || rule.sensorIds;
  rule.severity = severity || rule.severity;
  rule.values = values || rule.values;
  rule.status = status || rule.status;
  rule.platform = platform || rule.platform;
  rule.email = platform === 'email' ? email : undefined;

  await rule.save();
  return NextResponse.json({ success: true, message: 'Rule updated successfully', rule });
});

// DELETE a rule
export const DELETE = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new customError(400, 'Invalid Rule ID');

  const rule = await Rule.findOne({ _id: id, ownerId: user._id });
  if (!rule) throw new customError(404, 'Rule not found');

  await rule.deleteOne();
  return NextResponse.json({ success: true, message: 'Rule deleted successfully' });
});
