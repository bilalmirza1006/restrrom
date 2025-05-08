import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JWTService } from "./jwtService";
import { customError } from "@/utils/customError";
import { accessTokenOptions, refreshTokenOptions } from "@/configs/constants";
import { getEnv } from "@/configs/config";

export const sendToken = async (user, statusCode, message) => {
  const accessToken = await JWTService().accessToken(String(user._id));
  const refreshToken = await JWTService().refreshToken(String(user._id));

  if (!accessToken || !refreshToken) {
    throw new customError(400, "Error While Generating Tokens");
  }

  await JWTService().storeRefreshToken(refreshToken);

  const cookieStore = await cookies();
  cookieStore.set(getEnv("ACCESS_TOKEN_NAME"), accessToken, accessTokenOptions);
  cookieStore.set(
    getEnv("REFRESH_TOKEN_NAME"),
    refreshToken,
    refreshTokenOptions
  );

  return NextResponse.json(
    {
      success: true,
      message,
      data: { ...user.toObject?.(), password: undefined }, // safe strip
    },
    { status: statusCode }
  );
};
