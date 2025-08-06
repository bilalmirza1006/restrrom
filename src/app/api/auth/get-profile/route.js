import { getEnv } from "@/configs/config";
import { connectCustomMySql, connectCustomMySqll, connectDb } from "@/configs/connectDb";
import { accessTokenOptions } from "@/configs/constants";
import { configureCloudinary, removeFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Auth } from "@/models/auth.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import next from "next";
import { Sequelize } from "sequelize";
import mysql2 from "mysql2"; // ✅ Use ES Module import

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
  const user = await Auth.findById(userGet?._id).select("+password");
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
    "oldPassword",
    "newPassword"
  ];

  const updatePayload = {};
  for (const field of allowedFields) {
    const value = formData.get(field);
    if (value !== null && value !== undefined) {
      updatePayload[field] = value;
    }
  }
  // console.log("user",user);

  if (Object.keys(updatePayload).length === 0) {
    throw new customError(400, "Please provide at least one field to update");
  }
  const oldPassword = formData.get("oldPassword")
  const newPassword = formData.get("newPassword")

  if (oldPassword && newPassword) {
    if (!user?.password) {
      throw new customError(400, 'User has no password set.');
    }

    const matchPwd = await bcrypt.compare(oldPassword, user.password);
    if (!matchPwd) {
      throw new customError(400, 'Wrong Old Password');
    }

    user.password = newPassword;
    await user.save();
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





  /* 5. Custom‑DB credentials & validation ------------------------- */
  const enableCustom = formData.get("isCustomDb") === 'true';
  const disableCustom = formData.get("isCustomDb") === 'false';
  let credsChanged = false;

  if (enableCustom) {
    const customDbHost = formData.get("customDbHost")
    const customDbName = formData.get("customDbName")
    const customDbUsername = formData.get("customDbUsername")
    const customDbPassword = formData.get("customDbPassword")
    const customDbPort = formData.get("customDbPort")

    const hasAllCreds =
      customDbHost && customDbName && customDbUsername && customDbPassword && customDbPort;
    if (!hasAllCreds)
      return next(new customError(400, 'Please provide complete custom DB credentials'));

    /* 5a. Probe the DB first */
    try {
      const probe = new Sequelize(customDbName, customDbUsername, customDbPassword, {
        host: customDbHost,
        port: Number(customDbPort) || 3306,
        // dialect: 'mysql',
        logging: false,
        dialect: "mysql",
        dialectModule: mysql2,
      });
      await probe.authenticate();
      await probe.close();
      console.log('🔍 Testing custom DB connection with:');
      console.log({
        host: customDbHost,
        port: Number(customDbPort),
        database: customDbName,
        user: customDbUsername,
        password: customDbPassword,
      });
    } catch (err) {
      console.error('❌ Authentication failed:', err.message);
      return next(
        new customError(
          400,
          'Unable to connect to your custom MySQL database. Please verify the credentials'
        )
      );
    }

    /* 5b. Save creds */
    if (
      user.customDbHost !== customDbHost ||
      user.customDbName !== customDbName ||
      user.customDbUsername !== customDbUsername ||
      user.customDbPassword !== customDbPassword ||
      String(user.customDbPort) !== String(customDbPort) ||
      user.isCustomDb !== true
    )
      credsChanged = true;

    user.isCustomDb = true;
    user.customDbHost = customDbHost;
    user.customDbPassword = customDbPassword;
    user.customDbUsername = customDbUsername;
    user.customDbName = customDbName;
    user.customDbPort = customDbPort;
  }

  if (disableCustom) {
    if (user.isCustomDb) credsChanged = true;
    user.isCustomDb = false;
  }
  const userId = user?._id
  /* 6. Persist + clear cache if creds changed --------------------- */
  await user.save();
  if (credsChanged) connectCustomMySqll.delete(String(userId));

  /* 7. (Re)connect ------------------------------------------------- */
  await connectCustomMySqll(String(userId)); // will throw if it can’t connect



  const updatedUser = await Auth.findByIdAndUpdate(userGet._id, updatePayload, {
    new: true,
    runValidators: true,
  }).select("-password");



  return sendResponse(NextResponse, "User profile fetched successfully", updatedUser, accessToken);
});
