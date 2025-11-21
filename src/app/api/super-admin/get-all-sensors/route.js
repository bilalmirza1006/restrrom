import { connectDb } from '@/configs/connectDb';
import { Sensor } from '@/models/sensor.model';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const GET = async () => {
  try {
    // Connect to MongoDB
    await connectDb();

    // ✅ Force Mongoose to register Building and RestRoom explicitly
    if (!mongoose.models.Building) {
      require('@/models/building.model');
    }
    if (!mongoose.models.RestRoom) {
      require('@/models/restroom.model');
    }

    // ✅ Now safe to query
    const sensors = await Sensor.find()
      .populate('ownerId', 'name email')
      .populate('buildingId', 'name')
      .populate('restroomId', 'name');

    return NextResponse.json({
      success: true,
      count: sensors.length,
      data: sensors,
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get sensors', error: error.message },
      { status: 500 }
    );
  }
};
