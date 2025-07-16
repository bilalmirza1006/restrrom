import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Sensor } from "@/models/sensor.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const ownerId = user._id;
  const body = await req.json();
  const { name, uniqueId, parameters } = body;
  if (!name || !uniqueId || !parameters || !Array.isArray(parameters) || parameters.length === 0) throw new customError(400, "Please provide all fields, including parameters");
  const isExist = await Sensor.findOne({ uniqueId });
  if (isExist) throw new customError(400, "Sensor uniqueId already exists");
  const sensor = await Sensor.create({
    name,
    uniqueId,
    ownerId,
    parameters,
  });
  return sendResponse(NextResponse, "Sensor created successfully", "", accessToken);
});
