// import { connectDb } from '@/configs/connectDb';
// import { SubscriptionHistory } from '@/models/subscription.model';
import { connectDb } from '@/configs/connectDb';
import { SubscriptionHistory } from '@/models/subscription.model';
import { NextResponse } from 'next/server';

export const GET = async req => {
  try {
    await connectDb();

    // Parse URL params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // optional
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;

    const filter = {
      action: { $in: ['created', 'canceled'] },
    };

    if (userId) filter.user = userId;

    const history = await SubscriptionHistory.find(filter)
      .populate('user', 'name email') // optional
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await SubscriptionHistory.countDocuments(filter);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscription history' },
      { status: 500 }
    );
  }
};
