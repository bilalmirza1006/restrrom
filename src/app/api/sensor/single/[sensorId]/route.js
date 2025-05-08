import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Sensor } from "@/models/sensor.model";
import { asyncHandler } from "@/utils/asynHanlder";
import { customError } from "@/utils/customError";
import { isValidObjectId } from "mongoose";
import { turborepoTraceAccess } from "next/dist/build/turborepo-access-trace";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  const user = await isAuthenticated();
  const ownerId = user._id;
  const { sensorId } = await params;
  if (!isValidObjectId(sensorId))
    throw new customError(400, "Invalid sensor id");

  const sensor = await Sensor.findOne({ _id: sensorId, ownerId });

  return NextResponse.json({
    success: true,
    message: "Sensor fetched successfully",
    sensor,
  });
});

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();

  const user = await isAuthenticated();
  const ownerId = user._id;
  const { sensorId } = await params;

  if (!isValidObjectId(sensorId)) {
    throw new customError(400, "Invalid sensor ID");
  }

  const sensor = await Sensor.findOne({ _id: sensorId, ownerId });
  if (!sensor) {
    throw new customError(404, "Sensor not found");
  }

  const updates = await req.json();
  const allowedFields = ["name", "type", "uniqueId", "status", "isConnected"];
  const hasUpdates = allowedFields.some((field) => field in updates);

  if (!hasUpdates) {
    throw new customError(400, "Please provide at least one field to update");
  }

  // Handle uniqueId change with duplication check
  if (updates.uniqueId && updates.uniqueId !== sensor.uniqueId) {
    const existing = await Sensor.findOne({ uniqueId: updates.uniqueId });
    if (existing) {
      throw new customError(400, "Sensor uniqueId already exists");
    }
    sensor.uniqueId = updates.uniqueId;
  }

  // Update allowed fields dynamically
  for (const field of allowedFields) {
    if (field in updates && field !== "uniqueId") {
      sensor[field] = updates[field];
    }
  }

  await sensor.save();

  return NextResponse.json({
    success: true,
    message: "Sensor updated successfully",
    sensor,
  });
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();
  const user = await isAuthenticated();
  const ownerId = user._id;
  const { sensorId } = await params;
  if (!isValidObjectId(sensorId))
    throw new customError(400, "Invalid sensor id");

  const sensor = await Sensor.findOneAndDelete({ _id: sensorId, ownerId });
  if (!sensor) throw new customError(400, "Sensor not found");

  return NextResponse.json({
    success: true,
    message: "Sensor Deleted successfully",
  });
});
