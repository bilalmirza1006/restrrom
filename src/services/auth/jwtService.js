import { getEnv } from "@/configs/config";
import { Token } from "@/models/token.model";
import jwt from "jsonwebtoken";

export const JWTService = () => ({
  async accessToken(_id) {
    return jwt.sign({ _id }, getEnv("ACCESS_TOKEN_SECRET"), {
      expiresIn: getEnv("ACCESS_TOKEN_EXPIRY_TIME"),
    });
  },

  async refreshToken(_id) {
    return jwt.sign({ _id }, getEnv("REFRESH_TOKEN_SECRET"), {
      expiresIn: getEnv("REFRESH_TOKEN_EXPIRY_TIME"),
    });
  },

  async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, getEnv("ACCESS_TOKEN_SECRET"));
      return decoded;
    } catch (error) {
      console.error("verifyAccessToken error:", error.name, error.message);
      return null;
    }
  },

  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, getEnv("REFRESH_TOKEN_SECRET"));
      return decoded;
    } catch (error) {
      console.error("verifyRefreshToken error:", error.name, error.message);
      return null;
    }
  },

  async storeRefreshToken(token) {
    await Token.create({ token });
  },

  async removeRefreshToken(token) {
    await Token.deleteOne({ token });
  },

  async createVerificationToken(_id) {
    return jwt.sign({ _id }, getEnv("ACCESS_TOKEN_SECRET"), {
      expiresIn: getEnv("ACCESS_TOKEN_EXPIRY_TIME"),
    });
  },

  async verifyVerificationToken(token) {
    try {
      return jwt.verify(token, getEnv("ACCESS_TOKEN_SECRET"));
    } catch {
      return null;
    }
  },
});
