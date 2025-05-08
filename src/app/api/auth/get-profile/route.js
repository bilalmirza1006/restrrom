import { getEnv } from "@/configs/config";
import { connectDb } from "@/configs/connectDb";
import { accessTokenOptions } from "@/configs/constants";
import { configureCloudinary, removeFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Auth } from "@/models/auth.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async () => {
  await connectDb();
  const { user: userGet, accessToken } = await isAuthenticated();
  const user = await Auth.findById(userGet?._id).select("-password");
  if (!user) throw new customError(404, "User not found");
  // const res = NextResponse.json({ success: true, message: "User profile fetched successfully", user: user });
  // if (accessToken) res.cookies.set(getEnv("ACCESS_TOKEN_NAME"), accessToken, accessTokenOptions);
  // return res;
  return sendResponse(NextResponse, "User profile fetched successfully", user, accessToken);
});

export const PUT = asyncHandler(async (req) => {
  await connectDb();
  configureCloudinary();
  const { user: userGet, accessToken } = await isAuthenticated();
  const user = await Auth.findById(userGet?._id).select("-password");
  if (!user) throw new customError(404, "User not found");
  const formData = await req.formData();
  const allowedFields = [
    "fullName",
    "email",
    "dob",
    "phoneNumber",
    "gender",
    "nationality",
    "image",
    "interval",
    "isCustomDb",
    "customDbHost",
    "customDbPassword",
    "customDbUsername",
    "customDbName",
    "customDbPort",
    "isCustomDbConnected",
    "subscriptionId",
  ];
  const updatePayload = {};
  for (const field of allowedFields) {
    const value = formData.get(field);
    if (value !== null && value !== undefined) {
      updatePayload[field] = value;
    }
  }
  if (Object.keys(updatePayload).length === 0) {
    throw new customError(400, "Please provide at least one field to update");
  }
  const newImage = formData.get("image");
  if (newImage && typeof newImage === "object") {
    // Remove old image from Cloudinary if it exists
    if (user.image?.public_id) {
      await removeFromCloudinary(user.image.public_id);
    }
    // Upload new image
    const cloudImage = await uploadOnCloudinary(newImage, "user_profiles");
    if (!cloudImage || !cloudImage.secure_url || !cloudImage.public_id) {
      throw new customError(500, "Image upload failed");
    }
    updatePayload.image = {
      url: cloudImage.secure_url,
      public_id: cloudImage.public_id,
    };
  }
  const updatedUser = await Auth.findByIdAndUpdate(userGet._id, updatePayload, {
    new: true,
    runValidators: true,
  }).select("-password");
  return sendResponse(NextResponse, "User profile fetched successfully", updatedUser, accessToken);
});
