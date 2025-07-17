import { Sequelize } from "sequelize";
import mongoose from "mongoose";
import { getEnv } from "./config";
// import { Sequelize } from "sequelize";
// import { config } from "../config/config.js";
import mysql2 from "mysql2"; // ✅ Use ES Module import

let isConnected = false;
export async function connectDb() {
  if (isConnected) return console.log(`MongoDB is already connected`, isConnected);
  try {
    const connection = await mongoose.connect(getEnv("MONGODB_URL"));
    isConnected = connection.connections[0].readyState === 1;
    console.log(`MongoDB connected successfully`, isConnected);
    connection.connection.on("error", (error) => console.log("Error in connection to database", error));
  } catch (error) {
    console.log("Connection failed", error);
    console.error("Error in connection to database", error);
  }
}

// connect mysql
// -------------
export const sequelize = new Sequelize(
  getEnv("SQL_DB_NAME"),
  getEnv("SQL_USERNAME"),
  getEnv("SQL_PASSWORD"),
  {
    host: getEnv("SQL_HOST_NAME"),
    port: Number(getEnv("SQL_PORT")) || 3306,
    dialect: "mysql",
    dialectModule: mysql2,
  }
);
export const connectCustomMySql = async (userId) => {
  try {
    const userProfile = await User.findById(userId);
    let dbConnection = sequelize;
    // if user have custom db credentials and custom db setted the connect with custom db
    if (userProfile && userProfile.isCustomDb === true) {
      let customDb = false;
      try {
        const { customDbHost, customDbName, customDbUsername, customDbPassword, customDbPort } = userProfile;
        if (customDbHost && customDbName && customDbUsername && customDbPassword && customDbPort) {
          dbConnection = new Sequelize(customDbName, customDbUsername, customDbPassword, {
            host: customDbHost,
            port: customDbPort || 3306,
            dialect: "mysql",
          });
          customDb = true;
        }
        await dbConnection.authenticate();
        customDb
          ? console.log("\n\nConnected to custom MySql for user:\n\n", userId)
          : console.log("\n\nConnected to Global MySql successfully\n\n");
        userProfile.isCustomDbConnected = customDb ? true : false;
        await userProfile.save();
        const SensorData = defineSensorData(dbConnection);
        await dbConnection.sync();
        return { dbConnection, SensorData };
      } catch (error) {
        dbConnection = sequelize;
        userProfile.isCustomDbConnected = false;
        await userProfile.save();
      }
    }
    await dbConnection.authenticate();
    console.log("\n\nConnected to Global MySql successfully\n\n");
    const SensorData = defineSensorData(dbConnection);
    await dbConnection.sync();
    return { dbConnection, SensorData };
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};


