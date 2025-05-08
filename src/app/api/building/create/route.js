import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { asyncHandler } from "@/utils/asynHanlder";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const getUser = await isAuthenticated();

  const ownerId = getUser._id;
  const body = await req.json();
});
