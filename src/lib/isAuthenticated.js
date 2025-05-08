import { getEnv } from "@/configs/config";
import { accessTokenOptions } from "@/configs/constants";
import { Auth } from "@/models/auth.model";
import { JWTService } from "@/services/auth/jwtService";
import { customError } from "@/utils/customError";
import { cookies } from "next/headers";

export const isAuthenticated = async () => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(getEnv("ACCESS_TOKEN_NAME"))?.value;
  const refreshToken = cookieStore.get(getEnv("REFRESH_TOKEN_NAME"))?.value;

  if (!refreshToken) throw new customError(401, "Please Login First");

  let decoded = await JWTService().verifyAccessToken(accessToken);
  let user;

  if (!decoded) {
    // ⏳ Access token expired or invalid, try refresh token
    // console.log("Access token expired, trying refresh token...");
    decoded = await JWTService().verifyRefreshToken(refreshToken);
    if (!decoded) throw new customError(401, "Please Login First");

    user = await Auth.findById(decoded._id);
    if (!user) throw new customError(401, "Please Login First");

    // Issue new access token
    const newAccessToken = await JWTService().accessToken(user._id);
    if (!newAccessToken)
      throw new customError(400, "Error While Generating Access Token");

    return user;
  }

  user = await Auth.findById(decoded._id);
  if (!user) throw new customError(401, "Please Login First");

  return user;
};
