import { getEnv } from "@/configs/config";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { JWTService } from "@/services/auth/jwtService";
import { asyncHandler } from "@/utils/asynHanlder";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async () => {
  const user = await isAuthenticated();

  if (user) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(getEnv("REFRESH_TOKEN_NAME"))?.value;

    if (refreshToken) JWTService().removeRefreshToken(refreshToken);

    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    response.cookies.delete(getEnv("ACCESS_TOKEN_NAME"));
    response.cookies.delete(getEnv("REFRESH_TOKEN_NAME"));

    return response;
  }
});
