// // // import { connectDb } from "@/configs/connectDb";
// // // import { configureCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
// // // import { isAuthenticated } from "@/lib/isAuthenticated";
// // // import { RestRoom } from "@/models/restroom.model";
// // // import { Sensor } from "@/models/sensor.model";
// // // import { asyncHandler } from "@/utils/asyncHandler";
// // // import { customError } from "@/utils/customError";
// // // import sendResponse from "@/utils/sendResponse";
// // // import mongoose from "mongoose";
// // // import { NextResponse } from "next/server";

// // // export const POST = asyncHandler(async (req) => {
// // //   await connectDb();
// // //   await configureCloudinary();
// // //   const { user, accessToken } = await isAuthenticated();
// // //   const formData = await req?.formData();
// // //   if (!formData) throw new customError(400, "Please Add Fields For Building");
// // //   const { name, type, status, area, numOfToilets, buildingId, coordinates } = Object.fromEntries(formData);
// // //   if (!name || !type || !status || !area || !numOfToilets || !buildingId || !coordinates?.length)
// // //     throw new customError(400, "Please provide all fields");
// // //   const sensors = [];
// // //   const coordinatesObject = JSON.parse(coordinates);

// // //   coordinatesObject?.forEach((item) => {
// // //     if (!item?.labelPoint) throw new customError(400, `Invalid or missing fields label in coordinates.`);
// // //     if (!item?.id) throw new customError(400, `Invalid or missing fields id in coordinates.`);
// // //     if (!item?.color) throw new customError(400, `Invalid or missing fields color in coordinates.`);
// // //     if (!item?.fillColor) throw new customError(400, `Invalid or missing fields fillColor in coordinates.`);
// // //     if (!item?.sensor) throw new customError(400, `Invalid or missing fields Sensor in coordinates.`);
// // //     if (!item?.points?.length) throw new customError(400, `Invalid or missing fields points in coordinates.`);
// // //     sensors.push(String(item?.sensor));
// // //   });

// // //   // check for sensor availability
// // //   const sensorObjectIds = sensors.map((id) => new mongoose.Types.ObjectId(id));
// // //   const isSensorAvailable = await Sensor.find({
// // //     _id: { $in: sensorObjectIds },
// // //     isConnected: false,
// // //     ownerId: user?._id,
// // //   });
// // //   if (isSensorAvailable?.length !== sensorObjectIds?.length)
// // //     throw new customError(400, "All sensors must be available.");

// // //   const modelImage = formData.get("modelImage");
// // //   if (!modelImage) throw new customError(400, "Please add model image");
// // //   const modelImageCloud = await uploadOnCloudinary(modelImage, "restroom-models");
// // //   if (!modelImageCloud?.secure_url || !modelImageCloud?.public_id)
// // //     throw new customError(400, "Error while uploading image");
// // //   const restroom = await RestRoom.create({
// // //     ownerId: user?._id,
// // //     buildingId,
// // //     name,
// // //     type,
// // //     status,
// // //     area,
// // //     numOfToilets,
// // //     modelCoordinates: coordinatesObject,
// // //     modelImage: {
// // //       public_id: modelImageCloud.public_id,
// // //       url: modelImageCloud.secure_url,
// // //     },
// // //   });
// // //   if (!restroom) throw new customError(400, "Error while creating restroom");
// // //   // update sensors status isConnected True
// // //   const updateSensors = await Sensor.updateMany({ _id: { $in: sensorObjectIds } }, { $set: { isConnected: true } });
// // //   if (!updateSensors) throw new customError(500, "Failed to update sensors.");
// // //   return sendResponse(NextResponse, "Restroom created successfully", restroom, accessToken);
// // // });

// // import { connectDb } from '@/configs/connectDb';
// // import { configureCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
// // import { isAuthenticated } from '@/lib/isAuthenticated';
// // import { RestRoom } from '@/models/restroom.model';
// // import { Sensor } from '@/models/sensor.model';
// // import { asyncHandler } from '@/utils/asyncHandler';
// // import { customError } from '@/utils/customError';
// // import sendResponse from '@/utils/sendResponse';
// // import mongoose from 'mongoose';
// // import { NextResponse } from 'next/server';

// // function syncRestroomIdWithBuilding(buildingData) {
// //   const { building, restrooms } = buildingData.data;

// //   // Clone the building to avoid mutating original
// //   const updatedBuilding = { ...building };

// //   // Iterate over all building coordinates
// //   updatedBuilding.buildingCoordinates = building.buildingCoordinates.map((coord) => {
// //     // If restroomId already exists, skip it
// //     if (coord.restroomId) return coord;

// //     // Find restroom by name match
// //     const matchingRestroom = restrooms.find((r) => r.name === coord.restroomName);

// //     // If found, add its _id as restroomId
// //     if (matchingRestroom) {
// //       return { ...coord, restroomId: matchingRestroom._id };
// //     }

// //     // No match found, return as is
// //     return coord;
// //   });

// //   return updatedBuilding;
// // }

// // export const POST = asyncHandler(async (req) => {
// //   await connectDb();
// //   await configureCloudinary();

// //   const { user, accessToken } = await isAuthenticated();

// //   const formData = await req.formData();
// //   if (!formData) throw new customError(400, 'Form data is required');

// //   const rawData = Object.fromEntries(formData);
// //   const { name, type, status, area, numOfToilets, buildingId, coordinates } = rawData;

// //   if (!name || !type || !status || !area || !numOfToilets || !buildingId || !coordinates) {
// //     throw new customError(400, 'Please provide all required fields');
// //   }

// //   const parsedCoordinates = JSON.parse(coordinates);
// //   const sensors = [];

// //   parsedCoordinates.forEach((item) => {
// //     if (
// //       !item.labelPoint ||
// //       !item.id ||
// //       !item.color ||
// //       !item.fillColor ||
// //       !item.sensor ||
// //       !item.points?.length
// //     ) {
// //       throw new customError(400, 'Invalid or missing fields in coordinates.');
// //     }
// //     sensors.push(item.sensor);
// //   });

// //   const sensorObjectIds = sensors.map((id) => new mongoose.Types.ObjectId(id));

// //   const availableSensors = await Sensor.find({
// //     _id: { $in: sensorObjectIds },
// //     isConnected: false,
// //     ownerId: user._id,
// //   });

// //   if (availableSensors.length !== sensorObjectIds.length) {
// //     throw new customError(400, 'All sensors must be available.');
// //   }

// //   const modelImage = formData.get('modelImage');
// //   if (!modelImage) throw new customError(400, 'Model image is required');

// //   const uploadedImage = await uploadOnCloudinary(modelImage, 'restroom-models');

// //   if (!uploadedImage?.secure_url || !uploadedImage?.public_id) {
// //     throw new customError(400, 'Image upload failed');
// //   }

// //   const restroom = await RestRoom.create({
// //     ownerId: user._id,
// //     buildingId: new mongoose.Types.ObjectId(buildingId),
// //     name,
// //     type,
// //     status,
// //     area,
// //     numOfToilets: Number(numOfToilets),
// //     sensors,
// //     modelCoordinates: parsedCoordinates,
// //     modelImage: [
// //       {
// //         public_id: uploadedImage.public_id,
// //         url: uploadedImage.secure_url,
// //       },
// //     ],
// //   });

// //   if (!restroom) {
// //     throw new customError(400, 'Failed to create restroom');
// //   }

// //   await Sensor.updateMany(
// //     { _id: { $in: sensorObjectIds } },
// //     {
// //       $set: {
// //         isConnected: true,
// //         buildingId: new mongoose.Types.ObjectId(buildingId),
// //         restroomId: restroom._id,
// //       },
// //     }
// //   );

// //   // ✅ Populate full sensor details in response
// //   const fullSensors = await Sensor.find({ _id: { $in: sensorObjectIds } });

// //   const responsePayload = {
// //     ...restroom.toObject(),
// //     sensors: fullSensors,
// //   };

// //   return sendResponse(NextResponse, 'Restroom created successfully', responsePayload, accessToken);
// // });

// import mongoose from 'mongoose';
// import { NextResponse } from 'next/server';
// import asyncHandler from '@/utils/asyncHandler';
// // import connectDb from '@/configs/connectDb';
// // import { isAuthenticated } from '@/middlewares/isAuthenticated';
// import { configureCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
// import customError from '@/utils/customError';
// import sendResponse from '@/utils/sendResponse';
// // import Sensor from '@/models/Sensor';
// // import RestRoom from '@/models/RestRoom';
// // import Building from '@/models/Building.model';
// import { connectDb } from '@/configs/connectDb';
// import { isAuthenticated } from '@/lib/isAuthenticated';
// import { RestRoom } from '@/models/restroom.model';
// import { Sensor } from '@/models/sensor.model';
// import { Building } from '@/models/building.model';

// function syncRestroomIdWithBuilding(buildingData) {
//   const { building, restrooms } = buildingData.data;

//   const updatedBuilding = { ...building };

//   updatedBuilding.buildingCoordinates = building.buildingCoordinates.map((coord) => {
//     // Skip if restroomId already exists
//     if (coord.restroomId) return coord;

//     // Find restroom by matching name
//     const matchingRestroom = restrooms.find((r) => r.name === coord.restroomName);

//     // Add restroomId if found
//     if (matchingRestroom) {
//       return { ...coord, restroomId: matchingRestroom._id };
//     }

//     return coord;
//   });

//   return updatedBuilding;
// }

// export const POST = asyncHandler(async (req) => {
//   await connectDb();
//   await configureCloudinary();

//   const { user, accessToken } = await isAuthenticated();

//   const formData = await req.formData();
//   if (!formData) throw new customError(400, 'Form data is required');

//   const rawData = Object.fromEntries(formData);
//   const { name, type, status, area, numOfToilets, buildingId, coordinates } = rawData;

//   if (!name || !type || !status || !area || !numOfToilets || !buildingId || !coordinates) {
//     throw new customError(400, 'Please provide all required fields');
//   }

//   const parsedCoordinates = JSON.parse(coordinates);
//   const sensors = [];

//   parsedCoordinates.forEach((item) => {
//     if (
//       !item.labelPoint ||
//       !item.id ||
//       !item.color ||
//       !item.fillColor ||
//       !item.sensor ||
//       !item.points?.length
//     ) {
//       throw new customError(400, 'Invalid or missing fields in coordinates.');
//     }
//     sensors.push(item.sensor);
//   });

//   const sensorObjectIds = sensors.map((id) => new mongoose.Types.ObjectId(id));

//   const availableSensors = await Sensor.find({
//     _id: { $in: sensorObjectIds },
//     isConnected: false,
//     ownerId: user._id,
//   });

//   if (availableSensors.length !== sensorObjectIds.length) {
//     throw new customError(400, 'All sensors must be available.');
//   }

//   const modelImage = formData.get('modelImage');
//   if (!modelImage) throw new customError(400, 'Model image is required');

//   const uploadedImage = await uploadOnCloudinary(modelImage, 'restroom-models');

//   if (!uploadedImage?.secure_url || !uploadedImage?.public_id) {
//     throw new customError(400, 'Image upload failed');
//   }

//   const restroom = await RestRoom.create({
//     ownerId: user._id,
//     buildingId: new mongoose.Types.ObjectId(buildingId),
//     name,
//     type,
//     status,
//     area,
//     numOfToilets: Number(numOfToilets),
//     sensors,
//     modelCoordinates: parsedCoordinates,
//     modelImage: [
//       {
//         public_id: uploadedImage.public_id,
//         url: uploadedImage.secure_url,
//       },
//     ],
//   });

//   if (!restroom) {
//     throw new customError(400, 'Failed to create restroom');
//   }

//   await Sensor.updateMany(
//     { _id: { $in: sensorObjectIds } },
//     {
//       $set: {
//         isConnected: true,
//         buildingId: new mongoose.Types.ObjectId(buildingId),
//         restroomId: restroom._id,
//       },
//     }
//   );

//   // ✅ Populate full sensor details in response
//   const fullSensors = await Sensor.find({ _id: { $in: sensorObjectIds } });

//   // ✅ Now sync restroomId with building coordinates
//   const buildingData = await Building.findById(buildingId).populate('ownerId').lean();

//   // Fetch all restrooms of this building
//   const restrooms = await RestRoom.find({ buildingId });

//   const buildingWithRestrooms = {
//     data: {
//       building: buildingData,
//       restrooms: restrooms,
//     },
//   };

//   const updatedBuilding = syncRestroomIdWithBuilding(buildingWithRestrooms);

//   // ✅ Save updated building coordinates to DB
//   await Building.findByIdAndUpdate(buildingId, {
//     $set: { buildingCoordinates: updatedBuilding.buildingCoordinates },
//   });

//   // ✅ Prepare final response
//   const responsePayload = {
//     ...restroom.toObject(),
//     sensors: fullSensors,
//   };

//   return sendResponse(
//     NextResponse,
//     'Restroom created successfully and building updated',
//     responsePayload,
//     accessToken
//   );
// });

/////
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
// import asyncHandler from '@/utils/asyncHandler';
import { configureCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import { Building } from '@/models/building.model';
import { asyncHandler } from '@/utils/asyncHandler';

function syncRestroomIdWithBuilding(buildingData) {
  const { building, restrooms } = buildingData.data;
  if (!building || !Array.isArray(building.buildingCoordinates)) {
    console.warn('⚠️ building.buildingCoordinates is missing or invalid.');
    return building;
  }

  const updatedBuilding = { ...building };

  updatedBuilding.buildingCoordinates = building.buildingCoordinates.map((coord) => {
    if (coord.restroomId) return coord;

    const matchingRestroom = restrooms.find(
      (r) => r.name?.trim()?.toLowerCase() === coord.restroomName?.trim()?.toLowerCase()
    );

    if (matchingRestroom) {
      return { ...coord, restroomId: matchingRestroom._id };
    }

    return coord;
  });

  return updatedBuilding;
}

export const POST = asyncHandler(async (req) => {
  await connectDb();
  await configureCloudinary();

  const { user, accessToken } = await isAuthenticated();
  const formData = await req.formData();
  if (!formData) throw new customError(400, 'Form data is required');

  const rawData = Object.fromEntries(formData);
  const { name, type, status, area, numOfToilets, buildingId, coordinates } = rawData;

  if (!name || !type || !status || !area || !numOfToilets || !buildingId || !coordinates) {
    throw new customError(400, 'Please provide all required fields');
  }

  const parsedCoordinates = JSON.parse(coordinates);
  const sensors = [];

  parsedCoordinates.forEach((item) => {
    if (
      !item.labelPoint ||
      !item.id ||
      !item.color ||
      !item.fillColor ||
      !item.sensor ||
      !item.points?.length
    ) {
      throw new customError(400, 'Invalid or missing fields in coordinates.');
    }
    sensors.push(item.sensor);
  });

  const sensorObjectIds = sensors.map((id) => new mongoose.Types.ObjectId(id));

  const availableSensors = await Sensor.find({
    _id: { $in: sensorObjectIds },
    isConnected: false,
    ownerId: user._id,
  });

  if (availableSensors.length !== sensorObjectIds.length) {
    throw new customError(400, 'All sensors must be available.');
  }

  const modelImage = formData.get('modelImage');
  if (!modelImage) throw new customError(400, 'Model image is required');

  const uploadedImage = await uploadOnCloudinary(modelImage, 'restroom-models');

  if (!uploadedImage?.secure_url || !uploadedImage?.public_id) {
    throw new customError(400, 'Image upload failed');
  }

  const restroom = await RestRoom.create({
    ownerId: user._id,
    buildingId: new mongoose.Types.ObjectId(buildingId),
    name,
    type,
    status,
    area,
    numOfToilets: Number(numOfToilets),
    sensors,
    modelCoordinates: parsedCoordinates,
    modelImage: [
      {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
    ],
  });

  if (!restroom) throw new customError(400, 'Failed to create restroom');

  await Sensor.updateMany(
    { _id: { $in: sensorObjectIds } },
    {
      $set: {
        isConnected: true,
        buildingId: new mongoose.Types.ObjectId(buildingId),
        restroomId: restroom._id,
      },
    }
  );

  const fullSensors = await Sensor.find({ _id: { $in: sensorObjectIds } });

  // ✅ Now sync restroomId with building coordinates
  try {
    const buildingData = await Building.findById(buildingId).lean();
    const restrooms = await RestRoom.find({ buildingId });

    if (buildingData && restrooms.length) {
      const buildingWithRestrooms = {
        data: { building: buildingData, restrooms },
      };

      const updatedBuilding = syncRestroomIdWithBuilding(buildingWithRestrooms);

      if (updatedBuilding?.buildingCoordinates) {
        await Building.findByIdAndUpdate(buildingId, {
          $set: { buildingCoordinates: updatedBuilding.buildingCoordinates },
        });
      } else {
        console.warn('⚠️ Skipped updating buildingCoordinates - no valid update found.');
      }
    } else {
      console.warn('⚠️ Building or restrooms not found, skipping coordinate sync.');
    }
  } catch (err) {
    console.error('❌ Error syncing restroomId with building:', err);
  }

  const responsePayload = {
    ...restroom.toObject(),
    sensors: fullSensors,
  };

  return sendResponse(
    NextResponse,
    'Restroom created successfully and building updated',
    responsePayload,
    accessToken
  );
});
