import { connectDb } from "@/configs/connectDb";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { Sensor } from "@/models/sensor.model";
import { asyncHandler } from "@/utils/asyncHandler";
import { customError } from "@/utils/customError";
import sendResponse from "@/utils/sendResponse";
import { NextResponse } from "next/server";
import { sequelize } from "@/configs/connectDb";

export const POST = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const ownerId = user._id;
  const body = await req.json();
  const { name, uniqueId, parameters } = body;
  if (!name || !uniqueId || !parameters || !Array.isArray(parameters) || parameters.length === 0)
    throw new customError(400, "Please provide all fields, including parameters");
  const isExist = await Sensor.findOne({ uniqueId });
  if (isExist) throw new customError(400, "Sensor uniqueId already exists");

  // Normalize uniqueId: replace all dash-like characters with standard hyphen-minus
  const normalizedUniqueId = uniqueId.replace(/[‐‑‒–—―]/g, '-').trim();

  // 1. Check MySQL connection
  try {
    await sequelize.authenticate();
    console.log("MySQL database is connected");
    
  } catch (err) {
    throw new customError(500, "MySQL database is not connected");
  }

  // 2. Check uniqueId in each parameter table
  const missingTables = [];
  for (const param of parameters) {
    const [result] = await sequelize.query(
      `SELECT 1 FROM \`${param}\` WHERE sensor_unique_id = :uniqueId LIMIT 1`,
      { replacements: { uniqueId: normalizedUniqueId } }
    );
    if (!result || result.length === 0) {
      missingTables.push(param);
    }
  }
  if (missingTables.length > 0) {
    throw new customError(400, `Sensor uniqueId not found in the following parameter tables: ${missingTables.join(", ")}`);
  }

  // 3. Create sensor if all checks pass
  const sensor = await Sensor.create({
    name,
    uniqueId,
    ownerId,
    parameters,
  });
  return sendResponse(NextResponse, "Sensor created successfully", "", accessToken);
});
