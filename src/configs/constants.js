import { getEnv } from "./config";

export const accessTokenOptions = {
  httpOnly: true,
  sameSite: getEnv("NODE_ENV") !== "development" ? "none" : "lax",
  secure: getEnv("NODE_ENV") !== "development",
  maxAge: Number(getEnv("ACCESS_TOKEN_MAX_AGE")),
  path: "/",
};

export const refreshTokenOptions = {
  httpOnly: true,
  sameSite: getEnv("NODE_ENV") !== "development" ? "none" : "lax",
  secure: getEnv("NODE_ENV") !== "development",
  maxAge: Number(getEnv("REFRESH_TOKEN_MAX_AGE")),
  path: "/",
};
