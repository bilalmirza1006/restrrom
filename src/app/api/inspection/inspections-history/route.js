import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Inspection } from "@/models/inspection.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, "User not found");
  const inspections = await Inspection.find({ inspectorId: user._id });
  if (!inspections) throw new customError(400, "Inspection not found");
  return sendResponse(NextResponse, "", inspections, accessToken);
});
