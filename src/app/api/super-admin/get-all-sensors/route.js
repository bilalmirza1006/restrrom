// import { connectDb } from '@/configs/connectDb';
// import { Sensor } from '@/models/sensor.model';
import { connectDb } from '@/configs/connectDb';
import { Sensor } from '@/models/sensor.model';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    // Connect to MongoDB
    await connectDb();

    // Fetch all sensors (optionally populate references)
    const sensors = await Sensor.find()
      .populate('ownerId', 'name email') // optional
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
