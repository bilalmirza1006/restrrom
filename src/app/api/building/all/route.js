import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Building } from "@/models/building.model";
import { BuildingForInspection } from "@/models/buildingForInspection.model";
import { asyncHandler } from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  let buildings = [];
  if (user.role == "inspector") {
    const data = await BuildingForInspection.find({ inspectorId: user?._id }).populate("buildingId");
    if (data?.length > 0) {
      data.forEach((item) => {
        if (item?.buildingId?._id) buildings.push(item?.buildingId);
      });
    }
  } else {
    buildings = await Building.find({ ownerId: user._id });
  }
  return sendResponse(NextResponse, "Buildings fetched successfully", buildings, accessToken);
});
