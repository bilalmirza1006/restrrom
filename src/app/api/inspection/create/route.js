import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { BuildingForInspection } from "@/models/buildingForInspection.model";
import { Inspection } from "@/models/inspection.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, "User not found");
  const body = await req.json();
  const { buildingId, inspections } = body;
  if (!buildingId || !inspections?.length) throw new customError(400, "Please provide all fields");
  const isAssignedForInspection = await BuildingForInspection.findOne({ buildingId, inspectorId: user?._id });
  if (!isAssignedForInspection) throw new customError(400, "You are not assigned for this building");
  const inspection = await Inspection.create({
    ownerId: isAssignedForInspection.ownerId,
    inspectorId: user?._id,
    buildingId,
    inspections,
  });
  if (!inspection) throw new customError(400, "Inspection not created");
  const updateAssignedForInspection = await BuildingForInspection.updateOne(
    { _id: isAssignedForInspection?._id },
    { $set: { isCompleted: true, inspectionId: inspection?._id } }
  );
  return sendResponse(NextResponse, "Inspection created successfully", inspection, accessToken);
});
