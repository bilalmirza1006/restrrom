import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Sensor } from "@/models/sensor.model";
import { asyncHandler } from "@/utils/asynHanlder";
import { customError } from "@/utils/customError";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async () => {
  await connectDb();
  const user = await isAuthenticated();
  const ownerId = user._id;
  const sensors = await Sensor.find({ ownerId });
  if (!sensors) throw new customError(400, "No sensors found");

  return NextResponse.json({
    success: true,
    message: "Sensors fetched successfully",
    sensors,
  });
});
