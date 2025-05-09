import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Building } from "@/models/building.model";
import { asyncHandler } from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const buildings = await Building.find({ ownerId: user._id });
  return sendResponse(NextResponse, "Buildings fetched successfully", buildings, accessToken);
});
