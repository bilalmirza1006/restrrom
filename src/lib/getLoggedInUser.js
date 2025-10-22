// lib/getLoggedInUser.js - UPDATED
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Auth } from '@/models/auth.model';
import { connectDb } from '@/configs/connectDb';
import { getEnv } from '@/configs/config';

export const getLoggedInUser = async () => {
  try {
    const cookieStore = await cookies();

    // Use the same token names as your frontend
    const accessToken = cookieStore.get(getEnv('ACCESS_TOKEN_NAME'))?.value;

    if (!accessToken) {
      console.log('❌ getLoggedInUser: No access token found');
      return null;
    }

    console.log('✅ getLoggedInUser: Access token found');

    // Use your JWT service instead of direct jwt.verify
    const { JWTService } = await import('@/services/auth/jwtService');
    const decoded = await JWTService().verifyAccessToken(accessToken);

    if (!decoded) {
      console.log('❌ getLoggedInUser: Invalid access token');
      return null;
    }

    await connectDb();
    const user = await Auth.findById(decoded._id || decoded.id).select('-password');

    if (!user) {
      console.log('❌ getLoggedInUser: User not found in database');
      return null;
    }

    console.log('✅ getLoggedInUser: User found -', user.role);
    return user;
  } catch (error) {
    console.error('💥 getLoggedInUser error:', error);
    return null;
  }
};
