import { connectDb } from "@/configs/connectDb";
import { Auth } from "@/models/auth.model";
import { sendToken } from "@/services/auth/sendToken";
import { asyncHandler } from "@/utils/asynHanlder";
import { customError } from "@/utils/customError";

export const POST = asyncHandler(async (req) => {
  await connectDb();

  const body = await req.json();
  const { email, password } = body;

  if (!email || !password)
    throw new customError(400, "Provide email and password");

  const user = await Auth.findOne({ email }).select("+password");
  if (!user && !user?._id) throw new customError(403, "Invalid credentials");

  const matchPwd = await user.comparePassword(password);
  if (!matchPwd) throw new customError(403, "Password is incorrect");

  return await sendToken(user, 200, "User logged in successfully");
});
