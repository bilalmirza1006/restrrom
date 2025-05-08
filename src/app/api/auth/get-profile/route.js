import { connectDb } from "@/configs/connectDb";
import {
  configureCloudinary,
  removeFromCloudinary,
  uploadOnCloudinary,
} from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Auth } from "@/models/auth.model";
import { asyncHandler } from "@/utils/asynHanlder";
import { customError } from "@/utils/customError";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async () => {
  await connectDb();
  const userGet = await isAuthenticated();

  const user = await Auth.findById(userGet?._id).select("-password");

  if (!user) throw new customError(404, "User not found");

  return NextResponse.json({
    success: true,
    message: "User profile fetched successfully",
    user,
  });
});

export const PUT = asyncHandler(async (req) => {
  await connectDb();
  configureCloudinary();
  const userGet = await isAuthenticated();

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

  return NextResponse.json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
});
