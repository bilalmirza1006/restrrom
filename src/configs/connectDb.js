import mongoose from "mongoose";
import { getEnv } from "./config";

let isConnected = false;
export async function connectDb() {
  if (isConnected) {
    console.log(`MongoDB is already connected`, isConnected);
    return;
  }

  try {
    const connection = await mongoose.connect(getEnv("MONGODB_URL"));
    isConnected = connection.connections[0].readyState === 1;
    console.log(`MongoDB connected successfully`, isConnected);
    connection.connection.on("error", (error) =>
      console.log("Error in connection to database", error)
    );
  } catch (error) {
    console.log("Connection failed", error);
    console.error("Error in connection to database", error);
  }
}
