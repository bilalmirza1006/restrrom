import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Sensor } from "@/models/sensor.model";
import { asyncHandler } from "@/utils/asynHanlder";
import { customError } from "@/utils/customError";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const user = await isAuthenticated();
  const ownerId = user._id;

  const body = await req.json();
  const { name, type, uniqueId } = body;
  if (!name || !type || !uniqueId)
    throw new customError(400, "Please provide all fields");

  const isExist = await Sensor.findOne({ uniqueId });
  if (isExist) throw new customError(400, "Sensor uniqueId already exists");

  const sensor = await Sensor.create({
    name,
    type,
    uniqueId,
    ownerId,
  });
  return NextResponse.json({
    success: true,
    message: "Sensor created successfully",
    sensor,
  });
});
