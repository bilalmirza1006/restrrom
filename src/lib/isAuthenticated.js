import { getEnv } from '@/configs/config';
import { accessTokenOptions } from '@/configs/constants';
import { Auth } from '@/models/auth.model';
import { JWTService } from '@/services/auth/jwtService';
import customError from '@/utils/customError';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const isAuthenticated = async response => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(getEnv('ACCESS_TOKEN_NAME'))?.value;
  const refreshToken = cookieStore.get(getEnv('REFRESH_TOKEN_NAME'))?.value;
  if (!accessToken) console.log('access token not found');
  if (!refreshToken) console.log('refresh token not found');
  if (accessToken) console.log('access token found');
  if (refreshToken) console.log('refresh token found');
  if (!refreshToken && !accessToken) throw new customError(401, 'Please Login First');
  let decoded = await JWTService().verifyAccessToken(accessToken);
  let user;
  if (!decoded) {
    decoded = await JWTService().verifyRefreshToken(refreshToken);
    if (!decoded) throw new customError(401, 'Please Login First');
    user = await Auth.findById(decoded._id);
    if (!user) throw new customError(401, 'Please Login First');
    const newAccessToken = await JWTService().accessToken(user._id);
    if (!newAccessToken) throw new customError(400, 'Error While Generating Access Token');
    if (response) {
      response.cookies.set(getEnv('ACCESS_TOKEN_NAME'), newAccessToken, accessTokenOptions);
    }
    return { user, accessToken: newAccessToken ? newAccessToken : '' };
  }
  user = await Auth.findById(decoded._id);
  if (!user) throw new customError(401, 'Please Login First');
  return { user, accessToken: '' };
};
