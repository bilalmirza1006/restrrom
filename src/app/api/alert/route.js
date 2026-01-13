// app/api/alerts/route.js
import { NextResponse } from 'next/server';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { isAuthenticated } from '@/lib/isAuthenticated';
// import { Alert } from '@/models/alert.model';
import mongoose from 'mongoose';
import Alert from '@/models/alert';

// GET all alerts or a single alert by id
export const GET = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new customError(400, 'Invalid Alert ID');
    const alert = await Alert.findOne({ _id: id, ownerId: user._id });
    if (!alert) throw new customError(404, 'Alert not found');
    return NextResponse.json({ success: true, alert });
  } else {
    const alerts = await Alert.find({ ownerId: user._id }).sort({ timestamp: -1 });
    return NextResponse.json({ success: true, alerts });
  }
});

// POST create alert
export const POST = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const body = await req.json();
  const { name, alertType, severity, value, label, sensorId, platform, email, status } = body;

  if (!name || !alertType || !severity || !value || !platform) {
    throw new customError(400, 'All required fields must be provided');
  }

  const alert = await Alert.create({
    name,
    alertType,
    severity,
    value,
    label,
    sensorId: sensorId || null,
    platform,
    email: platform === 'email' ? email : undefined, // only save email if platform
    status: status || 'active',
    ownerId: user._id,
  });

  return NextResponse.json({ success: true, message: 'Alert created successfully', alert });
});

// PUT update alert
export const PUT = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const body = await req.json();
  const { id, name, alertType, severity, value, label, sensorId, platform, email, status } = body;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new customError(400, 'Invalid alert ID');
  }

  const alert = await Alert.findOne({ _id: id, ownerId: user._id });
  if (!alert) throw new customError(404, 'Alert not found');

  alert.name = name || alert.name;
  alert.alertType = alertType || alert.alertType;
  alert.severity = severity || alert.severity;
  alert.value = value || alert.value;
  alert.label = label || alert.label;
  alert.sensorId = sensorId || alert.sensorId;
  alert.platform = platform || alert.platform;
  alert.email = platform === 'email' ? email : undefined;
  alert.status = status || alert.status;

  await alert.save();
  return NextResponse.json({ success: true, message: 'Alert updated successfully', alert });
});

// DELETE alert
export const DELETE = asyncHandler(async req => {
  const { user } = await isAuthenticated();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new customError(400, 'Invalid alert ID');

  const alert = await Alert.findOne({ _id: id, ownerId: user._id });
  if (!alert) throw new customError(404, 'Alert not found');

  await alert.deleteOne();
  return NextResponse.json({ success: true, message: 'Alert deleted successfully' });
});
