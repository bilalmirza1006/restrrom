import { connectDb } from "@/configs/connectDb";
import { configureCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { RestRoom } from "@/models/restroom.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, "Please Add Fields For Building");
  const rawRestRooms = formData.get("restRooms");
  const buildingId = formData.get("buildingId");
  if (!rawRestRooms?.length || !buildingId) throw new customError(400, "Please provide all fields");
  // Parse JSON array of restrooms
  let restRooms;
  try {
    restRooms = JSON.parse(rawRestRooms);
  } catch (err) {
    throw new customError(400, "'restRooms' must be valid JSON.");
  }
  if (!Array.isArray(restRooms) || restRooms?.length === 0)
    throw new customError(400, "'restRooms' must be a non-empty array.");

  // Validate each restroom object
  restRooms.forEach((r, idx) => {
    if (!r?.name || !r?.type || !r?.status || !r?.area || !r?.numOfToilets)
      throw new customError(400, `Invalid or missing fields in restRooms[${idx}].`);
  });
  const data = restRooms.map((r) => ({
    ownerId: user?._id,
    name: r.name,
    type: r.type,
    status: r.status,
    area: r.area,
    numOfToilets: r.numOfToilets,
    buildingId,
  }));
  //  handle images and attach them to each restroom
  const restRoomImages = formData.getAll("restRoomImages");
  if (restRoomImages.length !== data.length)
    throw new customError(400, "You must upload exactly one image per restroom.");
  const uploadPromises = restRoomImages.map((file) => uploadOnCloudinary(file, "restroom-models"));
  const uploads = await Promise.all(uploadPromises);
  uploads.forEach((upload, idx) => {
    if (!upload?.secure_url || !upload?.public_id) throw new customError(500, "Cloudinary upload failed.");
    data[idx].modelImage = { public_id: upload.public_id, url: upload.secure_url };
  });
  const createdRestRooms = await RestRoom.insertMany(data);
  if (!created) throw new customError(500, "Failed to create restrooms.");
  return sendResponse(NextResponse, "Restrooms created successfully.", createdRestRooms, accessToken);
});
