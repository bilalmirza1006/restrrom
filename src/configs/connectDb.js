import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import { getEnv } from './config';
// import { Sequelize } from "sequelize";
// import { config } from "../config/config.js";
import mysql2 from 'mysql2'; // ✅ Use ES Module import
import { Auth } from '@/models/auth.model';
import { initModels } from '@/sequelizeSchemas/initModels';

let isConnected = false;
export async function connectDb() {
  if (isConnected) return console.log(`MongoDB is already connected`, isConnected);
  try {
    const connection = await mongoose.connect(getEnv('MONGODB_URL'));
    isConnected = connection.connections[0].readyState === 1;
    console.log(`MongoDB connected successfully`, isConnected);
    connection.connection.on('error', error =>
      console.log('Error in connection to database', error)
    );
  } catch (error) {
    console.log('Connection failed', error);
    console.error('Error in connection to database', error);
  }
}

// connect mysql
// -------------
export const sequelize = new Sequelize(
  getEnv('SQL_DB_NAME'),
  getEnv('SQL_USERNAME'),
  getEnv('SQL_PASSWORD'),
  {
    host: getEnv('SQL_HOST_NAME'),
    port: Number(getEnv('SQL_PORT')) || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
  }
);
// connection cache for my sql
// ---------------------------
const mySqlConnectionCache = new Map();

// export const connectCustomMySql = async (userId) => {
//   try {
//     const userProfile = await Auth.findById(userId);
//     let dbConnection = sequelize;
//     // if user have custom db credentials and custom db setted the connect with custom db
//     if (userProfile && userProfile.isCustomDb === true) {
//       let customDb = false;
//       try {
//         const { customDbHost, customDbName, customDbUsername, customDbPassword, customDbPort } = userProfile;
//         if (customDbHost && customDbName && customDbUsername && customDbPassword && customDbPort) {
//           dbConnection = new Sequelize(customDbName, customDbUsername, customDbPassword, {
//             host: customDbHost,
//             port: customDbPort || 3306,
//             dialect: "mysql",
//           });
//           customDb = true;
//         }
//         await dbConnection.authenticate();
//         customDb
//           ? console.log("\n\nConnected to custom MySql for user:\n\n", userId)
//           : console.log("\n\nConnected to Global MySql successfully\n\n");
//         userProfile.isCustomDbConnected = customDb ? true : false;
//         await userProfile.save();
//         const SensorData = defineSensorData(dbConnection);
//         await dbConnection.sync();
//         return { dbConnection, SensorData };
//       } catch (error) {
//         dbConnection = sequelize;
//         userProfile.isCustomDbConnected = false;
//         await userProfile.save();
//       }
//     }
//     await dbConnection.authenticate();
//     console.log("\n\nConnected to Global MySql successfully\n\n");
//     const SensorData = defineSensorData(dbConnection);
//     await dbConnection.sync();
//     return { dbConnection, SensorData };
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//     throw error;
//   }
// };

export const connectCustomMySqll = async userId => {
  let dbConnection = sequelize; // default = global
  let customDbConnected = false;

  try {
    /* 1. Cache hit? ------------------------------------------------ */
    if (mySqlConnectionCache.has(String(userId))) {
      console.log('cache hit');
      return mySqlConnectionCache.get(String(userId));
    }
    console.log('cache miss');

    /* 2. Read user profile ---------------------------------------- */
    const userProfile = await Auth.findById(userId);
    if (!userProfile) throw new Error('User not found');

    const { customDbHost, customDbName, customDbUsername, customDbPassword, customDbPort } =
      userProfile;

    const hasAllCreds =
      customDbHost && customDbName && customDbUsername && customDbPassword && customDbPort;

    if (userProfile.isCustomDb && hasAllCreds) {
      dbConnection = new Sequelize(customDbName, customDbUsername, customDbPassword, {
        host: customDbHost,
        port: Number(customDbPort) || 3306,
        dialect: 'mysql',
        logging: false,
        dialectModule: mysql2,
      });
      customDbConnected = true;
    }

    /* 3. Authenticate (retry‑3) ----------------------------------- */
    let retries = 3;
    while (retries) {
      try {
        await dbConnection.authenticate();
        console.log('✅ Authenticated MySQL');
        break;
      } catch (err) {
        retries -= 1;
        if (!retries) throw err;
        console.error('❌ MySQL auth failed, retrying...', err.message);
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    /* 4. Mark status, sync models --------------------------------- */
    userProfile.isCustomDbConnected = customDbConnected;
    await userProfile.save();

    const models = initModels(dbConnection);
    await dbConnection.sync();

    console.log(
      `✅ Connected to ${customDbConnected ? 'Custom' : 'Global'} MySQL for user ${userId}`
    );

    /* 5. Cache & return ------------------------------------------- */
    const payload = { dbConnection, models };
    mySqlConnectionCache.set(String(userId), payload);
    return payload;
  } catch (err) {
    mySqlConnectionCache.delete(String(userId));
    console.error('Unable to connect to the database:', err.message);
    throw new Error(
      err.message ||
        'Something went wrong with your database credentials. Please contact the admin.'
    );
  }
};

export const clearCustomMySqlConnection = userId => {
  mySqlConnectionCache.delete(String(userId));
};

//  dispatch(setUser(userData))
