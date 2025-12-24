// app/api/rules/route.js
import { NextResponse } from 'next/server';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { isAuthenticated } from '@/lib/isAuthenticated';
import mongoose from 'mongoose';
import Rule from '@/models/rule';

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
    const rule = await Rule.findOne({ _id: id, ownerId: user._id });
    if (!rule) throw new customError(404, 'Rule not found');
    return NextResponse.json({ success: true, rule });
  }

  if (alertType) query.alertType = alertType;
  if (severity) query.severity = severity;

  const rules = await Rule.find(query).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, rules });
});

// POST create a new rule
export const POST = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const data = await req.json();
  const { name, alertType, severity, sensorId, valueRange, conditions } = data;

  if (!name || !alertType || !severity) {
    throw new customError(400, 'Name, alertType, and severity are required');
  }

  const newRule = await Rule.create({
    name,
    alertType,
    severity,
    ownerId: user._id,
    sensorId: sensorId || null,
    valueRange: valueRange || {},
    conditions: conditions || [],
  });

  return NextResponse.json({ success: true, message: 'Rule created successfully', rule: newRule });
});

// PUT update a rule
export const PUT = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const data = await req.json();
  const { id, name, alertType, severity, sensorId, valueRange, conditions, status } = data;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new customError(400, 'Invalid Rule ID');

  const rule = await Rule.findOne({ _id: id, ownerId: user._id });
  if (!rule) throw new customError(404, 'Rule not found');

  rule.name = name || rule.name;
  rule.alertType = alertType || rule.alertType;
  rule.severity = severity || rule.severity;
  rule.sensorId = sensorId || rule.sensorId;
  rule.valueRange = valueRange || rule.valueRange;
  rule.conditions = conditions || rule.conditions;
  rule.status = status || rule.status;

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
