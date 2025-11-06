import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDb } from '@/configs/connectDb';
import { Inspection } from '@/models/inspection.model';
// import { connectDB } from '@/utils/db';
// import { Inspection } from '@/models/inspection.model';

export async function GET(req) {
  try {
    await connectDb();

    // extract `id` from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing inspection ID in query params' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid inspection ID' },
        { status: 400 }
      );
    }

    // fetch inspection with relations
    const inspection = await Inspection.findById(id)
      .populate('buildingId', 'buildingName area buildingManager')
      .populate('ownerId', 'name email role')
      .populate('inspectorId', 'name email role');

    if (!inspection) {
      return NextResponse.json(
        { success: false, message: 'Inspection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inspection fetched successfully',
      data: inspection,
    });
  } catch (error) {
    console.error('❌ Error fetching inspection:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
