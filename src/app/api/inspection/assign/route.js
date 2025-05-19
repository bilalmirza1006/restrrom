import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Building } from "@/models/building.model";
import { BuildingForInspection } from "@/models/buildingForInspection.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, "User not found");
  const { buildingId, inspectorId } = await req.json();
  if (!inspectorId) throw new customError(400, "Please provide inspectorId");
  if (!buildingId) throw new customError(400, "Please provide buildingId");
  const building = await Building.findOne({ _id: buildingId, ownerId: user._id });
  if (!building) throw new customError(400, "You are not owner of this building");
  const isAssignedForInspection = await BuildingForInspection.findOne({ buildingId });
  if (isAssignedForInspection) throw new customError(400, "You are already assigned for this building");
  const buildingForInspection = await BuildingForInspection.create({
    buildingId,
    inspectorId: inspectorId,
    ownerId: user?._id,
    isCompleted: false,
  });
  if (!buildingForInspection) throw new customError(400, "Inspection not created");
  return sendResponse(NextResponse, "Building Assigned to Inspection Successfully", buildingForInspection, accessToken);
});
