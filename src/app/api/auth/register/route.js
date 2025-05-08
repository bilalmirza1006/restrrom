import { connectDb } from "@/configs/connectDb";
import { Auth } from "@/models/auth.model";
import { sendToken } from "@/services/auth/sendToken";
import { asyncHandler } from "@/utils/asynHanlder";
import { customError } from "@/utils/customError";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();

  const body = await req.json();
  const { fullName, email, password } = body;
  if (!fullName || !email || !password)
    throw new customError(400, "All fields are required");

  const user = await Auth.findOne({ email });
  if (user && user?._id)
    throw new customError(403, "User already exists. Please login");

  const newUser = await Auth.create({ fullName, email, password });
  if (!newUser) throw new customError(500, "Error while creating user");

  return await sendToken(newUser, 201, "User registered successfully");
});
