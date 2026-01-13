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

  console.log('================ DB CONNECTION START ================');
  console.log('User ID:', userId);

  try {
    /* 1. Read user profile ---------------------------------------- */
    console.log('📄 Fetching user profile...');
    const userProfile = await Auth.findById(userId);
    if (!userProfile) throw new Error('User not found');

    const {
      customDbHost,
      customDbName,
      customDbUsername,
      customDbPassword,
      customDbPort,
      isCustomDb,
    } = userProfile;

    const hasAllCreds =
      customDbHost && customDbName && customDbUsername && customDbPassword && customDbPort;

    /* 2. Cache check with validation ------------------------------ */
    if (mySqlConnectionCache.has(String(userId))) {
      const cached = mySqlConnectionCache.get(String(userId));
      const config = cached?.dbConnection?.config;

      // Determine desired mode
      const shouldBeCustom = Boolean(isCustomDb && hasAllCreds);

      // Get cached mode (default to false if undefined)
      const cachedIsCustom = Boolean(cached?.isCustom);

      // Extract credentials
      const cachedDbName = config?.database;
      const cachedHost = config?.host;
      const cachedPort = config?.port;
      const cachedUser = config?.username;

      // Check if credentials changed (only relevant if we want custom)
      const isCredsChanged =
        cachedDbName !== customDbName ||
        cachedHost !== customDbHost ||
        Number(cachedPort) !== Number(customDbPort) ||
        cachedUser !== customDbUsername;

      // Invalidate if:
      // 1. Mode switched (Custom <-> Global)
      // 2. Mode is Custom AND credentials changed
      if (
        cachedIsCustom !== shouldBeCustom ||
        (shouldBeCustom && isCredsChanged)
      ) {
        console.warn('⚠️ DB Connection Mismatch → clearing stale cache', {
          reason: cachedIsCustom !== shouldBeCustom ? 'Mode Switch' : 'Creds Changed',
          cached: { isCustom: cachedIsCustom, host: cachedHost || 'GLOBAL' },
          target: { isCustom: shouldBeCustom, host: customDbHost || 'GLOBAL' }
        });
        mySqlConnectionCache.delete(String(userId));
      } else {
        console.log('🟡 DB CACHE HIT → Returning cached connection');
        return cached;
      }
    } else {
      console.log('🟠 DB CACHE MISS → Creating new connection');
    }

    /* 3. Decide DB type ------------------------------------------- */
    if (isCustomDb && hasAllCreds) {
      console.log('🔵 Using CUSTOM MySQL connection');
      dbConnection = new Sequelize(customDbName, customDbUsername, customDbPassword, {
        host: customDbHost,
        port: Number(customDbPort) || 3306,
        dialect: 'mysql',
        logging: false,
        dialectModule: mysql2,
      });
      customDbConnected = true;
    } else {
      // Only log if we are NOT using custom
      console.log('🟢 Using GLOBAL MySQL connection');
    }

    /* 4. Authenticate (retry-3) ----------------------------------- */
    let retries = 3;
    while (retries) {
      try {
        console.log(`🔐 Authenticating ${customDbConnected ? 'CUSTOM' : 'GLOBAL'} MySQL...`);
        await dbConnection.authenticate();
        console.log('✅ MySQL authentication successful');
        break;
      } catch (err) {
        retries -= 1;
        console.error(
          `❌ MySQL auth failed (${customDbConnected ? 'CUSTOM' : 'GLOBAL'}) | Retries left: ${retries}`,
          err.message
        );
        if (!retries) throw err;
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    /* 5. Mark status & sync --------------------------------------- */
    userProfile.isCustomDbConnected = customDbConnected;
    await userProfile.save();

    console.log(`✅ CONNECTED → ${customDbConnected ? 'CUSTOM' : 'GLOBAL'} MySQL`, {
      userId,
      dbName: customDbConnected ? customDbName : 'GLOBAL_DB',
      host: customDbConnected ? customDbHost : 'DEFAULT_HOST',
    });

    console.log('📦 Initializing models...');
    const models = initModels(dbConnection);

    // console.log('🔄 Syncing database...');
    // await dbConnection.sync(); // ⚠️ RISK: Removed for production stability

    /* 6. Cache & return ------------------------------------------- */
    const payload = { dbConnection, models, isCustom: customDbConnected };
    mySqlConnectionCache.set(String(userId), payload);

    console.log('💾 DB connection cached successfully');
    console.log('================ DB CONNECTION END =================');

    return payload;
  } catch (err) {
    mySqlConnectionCache.delete(String(userId));
    console.error('🔥 DB CONNECTION FAILED:', err.message);
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
