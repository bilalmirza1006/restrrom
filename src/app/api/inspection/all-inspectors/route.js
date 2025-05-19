import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Auth } from "@/models/auth.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, "User not found");
  const inspectors = await Auth.find({ role: "inspector" });
  return sendResponse(NextResponse, "", inspectors, accessToken);
});
