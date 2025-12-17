// import {Floor} from "@/components/user/buildings/Floor";
import { connectDb } from '@/configs/connectDb';
import { configureCloudinary, removeFromCloudinary, uploadOnCloudinary } from '@/lib/cloudinary';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import {
  getDoorQueueAndOccupancyStats,
  getLatestDoorQueueCounts,
  getLatestDoorQueueRecords,
  getRestroomChartReport,
  getRestroomUsageReport,
  getSensorsAggregatedData,
  getWaterLeakageAggregatedData,
} from '@/utils/getAggregatedSensorData';
import sendResponse from '@/utils/sendResponse';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = params;

  console.log('Building ID from params:', buildingId);

  if (!buildingId || buildingId === 'undefined' || !isValidObjectId(buildingId)) {
    console.log('Invalid building ID:', buildingId);
    throw new customError(400, 'Invalid building id');
  }

  const url = new URL(req.url);
  const include = url.searchParams.get('include');
  const period = url.searchParams.get('period') || 'day';

  console.log('Include:', include, 'Period:', period);

  const building = await Building.findOne({ _id: buildingId }).lean();
  if (!building) {
    console.log('Building not found for ID:', buildingId);
    throw new Error('Building not found');
  }

  const sensors = await Sensor.find({ buildingId }).lean();
  // console.log(
  //   'Fetched sensors:',
  //   sensors.length,
  //   sensors.map(s => s.uniqueId)
  // );

  building.sensors = sensors;

  if (!sensors || sensors.length === 0) {
    building.sensorData = [];
    return sendResponse(NextResponse, 'Building fetched successfully', building, accessToken);
  }

  const sensorAggregationArray = sensors
    .filter(s => s.sensorType && s.uniqueId)
    .map(s => ({
      sensorType: s.sensorType,
      uniqueId: s.uniqueId,
      buildingId: s.buildingId,
      restroomId: s.restroomId,
      ownerId: s.ownerId,
    }));

  // console.log('Sensor aggregation array:', sensorAggregationArray);

  // const sensorData = await getSensorsAggregatedData({
  //   sensors: sensorAggregationArray,
  //   groupBy: period,
  //   scope: 'building', // building | restroom | sensor | owner
  // });
  // // console.log('sensorssensorssensorssensorssensors', sensors);

  const doorQueueSensors = await getDoorQueueAndOccupancyStats(sensors);
  // console.log('sdsdsdsdsdsdsdssdsdsdsdsdsdsds:', doorQueueSensors);

  const report = await getRestroomChartReport(sensors);

  console.log('Restroom Usage Report:', report);

  // // Function to map count to color
  // // Attach restroomId from the original sensors to avoid undefined errors
  // const doorQueueSensorsWithRestroom = doorQueueSensors.map(sensor => {
  //   const originalSensor = sensors.find(s => s.uniqueId === sensor.sensor_unique_id);
  //   return {
  //     ...sensor,
  //     restroomId: originalSensor?.restroomId,
  //   };
  // });

  // // Helper function to map count to color
  // const getDoorQueueColor = (count, polygon) => {
  //   if (!polygon?.color || polygon.color.length === 0) return null;
  //   const colorObj = polygon.color.find(c => count >= Number(c.min) && count <= Number(c.max));
  //   return colorObj ? colorObj.color : null;
  // };

  // Map colors to door queue sensors
  // const doorQueueSensorsWithColor = doorQueueSensorsWithRestroom.map(sensor => {
  //   const polygon = building.buildingCoordinates.find(
  //     p => p.restroomId?.toString() === sensor.restroomId?.toString()
  //   );

  //   const color = getDoorQueueColor(sensor.count, polygon);

  //   return {
  //     ...sensor,
  //     color,
  //   };
  // });

  // console.log('Door Queue Sensors with Color:', doorQueueSensorsWithColor);

  // building.sensorData = sensorData;
  const dayData = await getWaterLeakageAggregatedData({
    sensors,
    groupBy: 'day',
    scope: 'building',
  });
  const weekData = await getWaterLeakageAggregatedData({
    sensors,
    groupBy: 'week',
    scope: 'building',
  });
  const monthData = await getWaterLeakageAggregatedData({
    sensors,
    groupBy: 'month',
    scope: 'building',
  });

  // console.log('latestDaylatestDaylatestDays:', dayData);
  // console.log('latestWeeklatestWeeklatestWeeks:', weekData);
  // console.log('latestMonthlatestMonthlatestMonthlatestMonths:', monthData);
  // dayData,weekData,monthData  send in a structured way name is waterLeakageData

  // console.log('Final building.sensorData:', building.sensorData);
  const waterLeakageData = {
    day: dayData,
    week: weekData,
    month: monthData,
  };

  // console.log('Structured waterLeakageData:', waterLeakageData);

  // You can then attach it to the building object
  building.sensorData = waterLeakageData;
  building.mostUsedRestroom = report;
  building.queuingStats = doorQueueSensors;

  return sendResponse(NextResponse, 'Building fetched successfully', building, accessToken);
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary();

  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = await params;

  console.log('6891d74878bf2c8a69875ead', buildingId);

  if (!isValidObjectId(buildingId)) throw new customError(400, 'Invalid building id');

  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, 'Building not found');

  const promises = [];

  // Remove cloudinary assets
  if (building?.buildingThumbnail?.public_id)
    promises.push(removeFromCloudinary(building.buildingThumbnail.public_id));
  if (building?.buildingModelImage?.public_id)
    promises.push(removeFromCloudinary(building.buildingModelImage.public_id));

  // Fetch floors attached to this building
  const floors = await RestRoom.find({ buildingId });

  // Get all sensor IDs from floors
  const allFloorSensorIds = floors.flatMap(floor => floor.sensors || []);

  // Disconnect all sensors from building and floor
  if (allFloorSensorIds.length) {
    await Sensor.updateMany(
      { _id: { $in: allFloorSensorIds } },
      {
        $unset: { buildingId: '', restroomId: '' },
        $set: { isConnected: false },
      }
    );
  }

  // Delete all floors
  await RestRoom.deleteMany({ buildingId });

  // Delete the building
  await Promise.all([...promises, Building.findByIdAndDelete(buildingId)]);

  return sendResponse(
    NextResponse,
    'Building and associated data deleted successfully',
    building,
    accessToken
  );
});

export const PUT = asyncHandler(async (req, { params }) => {
  await connectDb();
  await configureCloudinary();
  const { user, accessToken } = await isAuthenticated();
  const formData = await req?.formData();
  if (!formData) throw new customError(400, 'Please Add Fields For Building');
  const {
    name,
    type,
    location,
    area,
    totalFloors,
    numberOfRooms,
    buildingManager,
    phone,
    buildingCoordinates,
  } = Object.fromEntries(formData);
  const thumbnailImage = formData.get('buildingThumbnail');
  const buildingModelImage = formData.get('buildingModelImage');
  if (
    !name &&
    !type &&
    !location &&
    !area &&
    !totalFloors &&
    !numberOfRooms &&
    !buildingManager &&
    !phone &&
    !thumbnailImage &&
    !buildingModelImage &&
    !buildingCoordinates
  )
    throw new customError(400, 'Please Provide Field For Update');
  const { buildingId } = await params;
  if (!isValidObjectId(buildingId)) throw new customError(400, 'Invalid building id');
  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, 'Building not found');
  const updates = {};
  if (name) updates.name = name;
  if (type) updates.type = type;
  if (location) updates.location = location;
  if (area) updates.area = area;
  if (totalFloors) updates.totalFloors = totalFloors;
  if (numberOfRooms) updates.numberOfRooms = numberOfRooms;
  if (buildingManager) updates.buildingManager = buildingManager;
  if (phone) updates.phone = phone;
  if (buildingCoordinates) {
    try {
      updates.buildingCoordinates = JSON.parse(buildingCoordinates);
    } catch {
      throw new customError(400, 'Invalid buildingCoordinates JSON');
    }
  }
  if (thumbnailImage) {
    if (building?.buildingThumbnail?.public_id)
      await removeFromCloudinary(building?.buildingThumbnail?.public_id);
    const thumbNailCloud = await uploadOnCloudinary(thumbnailImage, 'building-thumbnails');
    updates.buildingThumbnail = {
      public_id: thumbNailCloud.public_id,
      url: thumbNailCloud.secure_url,
    };
  }
  if (buildingModelImage) {
    if (building?.buildingModelImage?.public_id)
      await removeFromCloudinary(building?.buildingModelImage?.public_id);
    const buildingCloud = await uploadOnCloudinary(buildingModelImage, 'building-models');
    updates.buildingModelImage = {
      public_id: buildingCloud.public_id,
      url: buildingCloud.secure_url,
    };
  }
  const updatedBuilding = await Building.findOneAndUpdate(
    { _id: buildingId, ownerId: user?._id },
    updates,
    {
      new: true,
    }
  );
  return sendResponse(NextResponse, 'Building updated successfully', updatedBuilding, accessToken);
});
