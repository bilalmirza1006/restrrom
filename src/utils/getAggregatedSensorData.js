import { initModels } from '@/sequelizeSchemas/initModels';
import { MODEL_CLASSES } from '@/sequelizeSchemas/models';
import { fn, col, Op, Sequelize } from 'sequelize';
import { sequelize } from '@/configs/connectDb';
import { RestRoom } from '@/models/restroom.model';
import mongoose from 'mongoose';

export const getSensorsAggregatedData = async ({
  sensors,
  groupBy = 'day',
  scope = 'building',
}) => {
  const models = initModels(sequelize);
  //   console.log('groupBygroupBygroupBy', groupBy);

  // Optional: test connection
  await sequelize.authenticate();
  //   console.log('✅ Sequelize connected and models initialized');

  if (!sensors || sensors.length === 0) {
    console.log('No sensors provided.');
    return [];
  }

  //   console.log(
  //     'Aggregating data for sensors:',
  //     sensors.map(s => s.uniqueId)
  //   );

  // Labels & date format
  let dateFormat, labels;
  switch (groupBy) {
    case 'day':
      dateFormat = '%H';
      labels = Array.from({ length: 24 }, (_, i) => `${i} ${i < 12 ? 'AM' : 'PM'}`);
      break;
    case 'week':
      dateFormat = '%w';
      labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      break;
    case 'month':
      dateFormat = '%u';
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      break;
    default:
      throw new Error('Invalid groupBy');
  }

  // Group sensors by type
  const sensorsByType = {};
  sensors.forEach(s => {
    if (!s.sensorType || !s.uniqueId) {
      console.log('Skipping invalid sensor:', s);
      return;
    }
    if (!sensorsByType[s.sensorType]) sensorsByType[s.sensorType] = [];
    sensorsByType[s.sensorType].push(s);
  });

  //   console.log('Sensors grouped by type:', sensorsByType);

  const results = await Promise.all(
    Object.entries(sensorsByType).map(async ([type, sensorList]) => {
      try {
        // console.log(`\nProcessing sensor type: ${type}`);

        // Get model class for sensor type
        const modelInfo = MODEL_CLASSES.find(m => m.name === type);
        if (!modelInfo) {
          //   console.log(`Model info not found for type: ${type}`);
          return { type, map: {} };
        }

        const ModelClass = modelInfo.cls;
        if (!ModelClass || typeof ModelClass.findAll !== 'function') {
          console.log(`ModelClass or findAll not available for type: ${type}`);
          return { type, map: {} };
        }

        // Numeric columns mapping
        const knownNumericColumns = {
          door_queue: ['count', 'windowCount'],
          stall_status: ['usageCount'],
          occupancy: ['occupancyDuration'],
          air_quality: ['tvoc', 'eCO2', 'pm2_5', 'aqi'],
          toilet_paper: ['level'],
          soap_dispenser: ['level'],
          water_leakage: ['waterLevel_mm'],
        };
        const numericCols = knownNumericColumns[type] || [];

        // Convert ObjectId to string for Sequelize
        const buildingIds = sensorList
          .map(s => s.buildingId)
          .filter(Boolean)
          .map(id => id.toString());
        const restroomIds = sensorList
          .map(s => s.restroomId)
          .filter(Boolean)
          .map(id => id.toString());
        const ownerIds = sensorList
          .map(s => s.ownerId)
          .filter(Boolean)
          .map(id => id.toString());
        const uniqueIds = sensorList.map(s => s.uniqueId).filter(Boolean);

        // Build where clause
        const where = {};

        switch (scope) {
          case 'building':
            if (buildingIds.length) where.buildingId = { [Op.in]: buildingIds };
            if (restroomIds.length) where.restroomId = { [Op.in]: restroomIds };
            if (uniqueIds.length) where.sensor_unique_id = { [Op.in]: uniqueIds };
            if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
            break;

          case 'restroom':
            if (restroomIds.length) where.restroomId = { [Op.in]: restroomIds };
            if (uniqueIds.length) where.sensor_unique_id = { [Op.in]: uniqueIds };
            if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
            break;

          case 'sensor':
            if (uniqueIds.length) where.sensor_unique_id = { [Op.in]: uniqueIds };
            if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
            break;

          case 'owner':
            if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
            break;

          default:
            throw new Error('Invalid aggregation scope');
        }

        // console.log(`Where clause for ${type}:`, where);

        // Attributes (aggregation)
        const attributes = [[fn('DATE_FORMAT', col('timestamp'), dateFormat), 'period']];
        if (numericCols.length > 0) {
          numericCols.forEach(c => attributes.push([fn('AVG', col(c)), c]));
        } else {
          attributes.push([fn('COUNT', '*'), 'count']);
        }

        // Fetch aggregated data
        const data = await ModelClass.findAll({
          where,
          attributes,
          group: ['period'],
          order: [['period', 'ASC']],
          raw: true,
          logging: console.log, // ✅ Logs the exact SQL query
        });

        // console.log(`Data fetched for ${type}:`, data.length, 'records', data);

        // Map results by period
        const map = {};
        data.forEach(d => {
          if (d.period !== null && d.period !== undefined) map[d.period] = d;
        });

        return { type, map };
      } catch (error) {
        console.error(`Error processing sensor type ${type}:`, error);
        return { type, map: {} };
      }
    })
  );

  //   console.log('Aggregation results:', results);

  // Merge results with labels
  const merged = labels.map((label, i) => {
    const obj = { name: label };
    results.forEach(r => {
      let key =
        groupBy === 'day'
          ? i.toString().padStart(2, '0')
          : groupBy === 'week'
            ? i.toString()
            : (i + 1).toString();
      obj[r.type] = r.map[key] || {};
    });
    return obj;
  });

  //   console.log('Merged sensor data:', merged);

  return merged;
};

export const getDoorQueueAndOccupancyStats = async sensorArray => {
  if (!Array.isArray(sensorArray) || sensorArray.length === 0) {
    return {
      totalOccupied: 0,
      totalVacant: 0,
      totalPeopleInQueue: 0,
      totalFlowCount: 0,
      restrooms: [], // new nested object
    };
  }

  initModels(sequelize);

  const doorQueueSensors = sensorArray.filter(s => s.sensorType === 'door_queue' && s.uniqueId);
  const occupancySensors = sensorArray.filter(s => s.sensorType === 'occupancy' && s.uniqueId);

  let totalPeopleInQueue = 0;
  let totalOccupancySensors = 0;
  let totalFlowCount = 0;
  let totalOccupied = 0;
  let totalVacant = 0;

  const restrooms = []; // new array to hold restroom info

  // === Door Queue ===
  const DoorQueueModelEntry = MODEL_CLASSES.find(m => m.name === 'door_queue');
  if (DoorQueueModelEntry?.cls && doorQueueSensors.length > 0) {
    const uniqueIds = doorQueueSensors.map(s => s.uniqueId);

    const dqRecords = await DoorQueueModelEntry.cls.findAll({
      where: { sensor_unique_id: { [Op.in]: uniqueIds } },
      attributes: ['sensor_unique_id', 'count', 'windowCount', 'timestamp'],
      order: [
        ['sensor_unique_id', 'ASC'],
        ['timestamp', 'DESC'],
      ],
      raw: true,
    });

    const latestDQ = {};
    dqRecords.forEach(r => {
      if (!latestDQ[r.sensor_unique_id]) latestDQ[r.sensor_unique_id] = r;
    });

    Object.values(latestDQ).forEach(r => {
      totalPeopleInQueue += r.count || 0;
      totalFlowCount += r.windowCount || 0;

      // Find the restroom info from sensorArray
      const sensorInfo = doorQueueSensors.find(s => s.uniqueId === r.sensor_unique_id);
      if (sensorInfo) {
        restrooms.push({
          restroomId: sensorInfo.restroomId || null,
          restroomName: sensorInfo.restroomName || null,
          queueCount: r.count || 0,
          flowCount: r.windowCount || 0,
        });
      }
    });
  }

  // === Occupancy ===
  const OccupancyModelEntry = MODEL_CLASSES.find(m => m.name === 'occupancy');
  if (OccupancyModelEntry?.cls && occupancySensors.length > 0) {
    const uniqueIds = occupancySensors.map(s => s.uniqueId);
    totalOccupancySensors = uniqueIds.length;

    const occRecords = await OccupancyModelEntry.cls.findAll({
      where: { sensor_unique_id: { [Op.in]: uniqueIds } },
      attributes: ['sensor_unique_id', 'occupied', 'timestamp'],
      order: [
        ['sensor_unique_id', 'ASC'],
        ['timestamp', 'DESC'],
      ],
      raw: true,
    });

    const latestOcc = {};
    occRecords.forEach(r => {
      if (!latestOcc[r.sensor_unique_id]) latestOcc[r.sensor_unique_id] = r;
    });

    Object.values(latestOcc).forEach(r => {
      if (Number(r.occupied) === 1) {
        totalOccupied += 1;
      } else if (Number(r.occupied) === 0) {
        totalVacant += 1;
      }
    });
  }

  return {
    totalOccupancySensors,
    totalOccupied,
    totalVacant,
    totalPeopleInQueue,
    totalFlowCount,
    restrooms, // nested object per restroom
  };
};

// export const getWaterLeakageAggregatedData = async ({ sensors, groupBy = 'day' }) => {
//   const models = initModels(sequelize);
//   await sequelize.authenticate();

//   if (!Array.isArray(sensors) || sensors.length === 0) return [];

//   // Filter water_leakage sensors
//   const waterLeakageSensors = sensors.filter(s => s.sensorType === 'water_leakage' && s.uniqueId);
//   if (waterLeakageSensors.length === 0) return [];

//   // Get model
//   const ModelClass = MODEL_CLASSES.find(m => m.name === 'water_leakage')?.cls;
//   if (!ModelClass) {
//     console.error('water_leakage model not found');
//     return [];
//   }

//   // Unique IDs
//   const uniqueIds = waterLeakageSensors.map(s => s.uniqueId);

//   // Determine period format
//   let dateFormat, labels;
//   switch (groupBy) {
//     case 'day':
//       dateFormat = '%H';
//       labels = Array.from({ length: 24 }, (_, i) => `${i} ${i < 12 ? 'AM' : 'PM'}`);
//       break;
//     case 'week':
//       dateFormat = '%w';
//       labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//       break;
//     case 'month':
//       dateFormat = '%u';
//       labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
//       break;
//     default:
//       throw new Error('Invalid groupBy');
//   }

//   // 1️⃣ Fetch per-sensor data
//   const sensorData = await ModelClass.findAll({
//     where: { sensor_unique_id: { [Op.in]: uniqueIds } },
//     attributes: [
//       'sensor_unique_id',
//       'waterLevel_mm',
//       [fn('DATE_FORMAT', col('timestamp'), dateFormat), 'period'],
//     ],
//     raw: true,
//     logging: false,
//   });

//   // 2️⃣ Map per period
//   const periodMap = {};
//   labels.forEach((label, idx) => {
//     const key =
//       groupBy === 'day'
//         ? idx.toString().padStart(2, '0')
//         : groupBy === 'week'
//           ? idx.toString()
//           : (idx + 1).toString();
//     periodMap[key] = { name: label, water_leakage_avg: 0, sensors: {} };
//   });

//   // 3️⃣ Fill data
//   sensorData.forEach(record => {
//     const { period, sensor_unique_id, waterLevel_mm } = record;
//     if (!periodMap[period]) return;
//     periodMap[period].sensors[sensor_unique_id] = waterLevel_mm;
//   });

//   // 4️⃣ Compute average per period
//   Object.values(periodMap).forEach(p => {
//     const values = Object.values(p.sensors);
//     p.water_leakage_avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
//   });

//   // 5️⃣ Return array
//   return Object.values(periodMap);
// };

export const getWaterLeakageAggregatedData = async ({
  sensors,
  groupBy = 'day',
  scope = 'building',
}) => {
  const models = initModels(sequelize);
  await sequelize.authenticate();

  if (!Array.isArray(sensors) || sensors.length === 0) return [];

  // Filter only sensors with uniqueId (can keep all types or filter specific types)
  const validSensors = sensors.filter(s => s.uniqueId);

  if (validSensors.length === 0) return [];

  const ModelClass = MODEL_CLASSES.find(m => m.name === 'water_leakage')?.cls;
  if (!ModelClass) {
    console.error('water_leakage model not found');
    return [];
  }

  // Extract IDs
  const buildingIds = validSensors
    .map(s => s.buildingId?._id || s.buildingId?.$oid || s.buildingId)
    .filter(Boolean)
    .map(String); // <- convert to string

  const restroomIds = validSensors
    .map(s => s.restroomId?._id || s.restroomId?.$oid || s.restroomId)
    .filter(Boolean)
    .map(String);

  const ownerIds = validSensors
    .map(s => s.ownerId?._id || s.ownerId?.$oid || s.ownerId)
    .filter(Boolean)
    .map(String);

  const uniqueIds = validSensors
    .map(s => s.uniqueId)
    .filter(Boolean)
    .map(String);

  // Build where clause dynamically based on scope
  const where = {};
  switch (scope) {
    case 'building':
      if (buildingIds.length) where.buildingId = { [Op.in]: buildingIds };
      if (restroomIds.length) where.restroomId = { [Op.in]: restroomIds };
      if (uniqueIds.length) where.sensor_unique_id = { [Op.in]: uniqueIds };
      if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
      break;

    case 'restroom':
      if (restroomIds.length) where.restroomId = { [Op.in]: restroomIds };
      if (uniqueIds.length) where.sensor_unique_id = { [Op.in]: uniqueIds };
      if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
      break;

    case 'sensor':
      if (uniqueIds.length) where.sensor_unique_id = { [Op.in]: uniqueIds };
      if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
      break;

    case 'owner':
      if (ownerIds.length) where.ownerId = { [Op.in]: ownerIds };
      break;

    default:
      throw new Error('Invalid aggregation scope');
  }

  // Determine period format
  let dateFormat, labels;
  switch (groupBy) {
    case 'day':
      dateFormat = '%H';
      labels = Array.from({ length: 24 }, (_, i) => `${i} ${i < 12 ? 'AM' : 'PM'}`);
      break;
    case 'week':
      dateFormat = '%w';
      labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      break;
    case 'month':
      dateFormat = '%u';
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      break;
    default:
      throw new Error('Invalid groupBy');
  }

  // Fetch data from SQL
  const sensorData = await ModelClass.findAll({
    where,
    attributes: [
      'sensor_unique_id',
      'waterLevel_mm',
      [fn('DATE_FORMAT', col('timestamp'), dateFormat), 'period'],
    ],
    raw: true,
    logging: false,
  });

  // Initialize period map
  const periodMap = {};
  labels.forEach((label, idx) => {
    const key =
      groupBy === 'day'
        ? idx.toString().padStart(2, '0')
        : groupBy === 'week'
          ? idx.toString()
          : (idx + 1).toString();
    periodMap[key] = { name: label };
  });

  // Fill period data per sensor
  sensorData.forEach(record => {
    const { period, sensor_unique_id, waterLevel_mm } = record;
    if (!periodMap[period]) return;
    periodMap[period][sensor_unique_id] = waterLevel_mm;
  });

  // Return array
  return Object.values(periodMap);
};

export const getRestroomChartReport = async sensorArray => {
  if (!Array.isArray(sensorArray) || sensorArray.length === 0) return [];

  initModels(sequelize);

  const occupancySensors = sensorArray.filter(s => s.sensorType === 'occupancy' && s.uniqueId);

  if (occupancySensors.length === 0) return [];

  const OccupancyModelEntry = MODEL_CLASSES.find(m => m.name === 'occupancy');
  if (!OccupancyModelEntry?.cls) return [];

  const uniqueIds = occupancySensors.map(s => s.uniqueId);

  // Fetch all occupancy records for the current year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const records = await OccupancyModelEntry.cls.findAll({
    where: {
      sensor_unique_id: { [Op.in]: uniqueIds },
      timestamp: { [Op.gte]: startOfYear },
    },
    attributes: [
      'restroomId',
      'occupied',
      [fn('DATE_FORMAT', col('timestamp'), '%Y-%m-%d %H:%i:%s'), 'timestamp'],
    ],
    raw: true,
  });

  const restroomsMap = {};

  records.forEach(r => {
    const id = r.restroomId;
    if (!restroomsMap[id]) {
      restroomsMap[id] = {
        name: id, // fallback to restroomId
        totalOccupied: 0,
        totalRecords: 0,
        chartData: {
          hour: [],
          day: [],
          week: [],
          month: [],
        },
        _hourMap: {},
        _dayMap: {},
        _weekMap: {},
        _monthMap: {},
      };
    }

    const rr = restroomsMap[id];

    const occupied = r.occupied ? 1 : 0;
    rr.totalOccupied += occupied;
    rr.totalRecords += 1;

    const date = new Date(r.timestamp);
    const hour = date.getHours();
    const day = date.getDate(); // 1-31
    const week = Math.ceil(date.getDate() / 7); // 1-5
    const month = date.getMonth() + 1; // 1-12

    rr._hourMap[hour] = (rr._hourMap[hour] || 0) + occupied;
    rr._dayMap[day] = (rr._dayMap[day] || 0) + occupied;
    rr._weekMap[week] = (rr._weekMap[week] || 0) + occupied;
    rr._monthMap[month] = (rr._monthMap[month] || 0) + occupied;
  });

  // Transform maps to arrays for chart data
  const report = Object.values(restroomsMap).map(r => {
    const percentage = r.totalRecords
      ? Math.round((r.totalOccupied / r.totalRecords) * 100) + '%'
      : '0%';

    const chartData = {
      hour: Object.entries(r._hourMap).map(([hour, value]) => ({ hour: parseInt(hour), value })),
      day: Object.entries(r._dayMap).map(([day, value]) => ({ day: parseInt(day), value })),
      week: Object.entries(r._weekMap).map(([week, value]) => ({ week: parseInt(week), value })),
      month: Object.entries(r._monthMap).map(([month, value]) => ({
        month: parseInt(month),
        value,
      })),
    };

    return {
      name: r.name,
      percentage,
      chartData,
    };
  });

  // Sort by percentage descending
  report.sort((a, b) => parseInt(b.percentage) - parseInt(a.percentage));

  return report;
};

export const getTotalToiletsByBuildingId = async buildingId => {
  if (!buildingId) return 0;

  const result = await RestRoom.aggregate([
    {
      $match: {
        buildingId: new mongoose.Types.ObjectId(buildingId),
      },
    },
    {
      $group: {
        _id: null,
        totalToilets: {
          $sum: { $ifNull: ['$numOfToilets', 0] },
        },
      },
    },
  ]);

  return result[0]?.totalToilets || 0;
};

export const getOccupancyStats = async sensorArray => {
  if (!Array.isArray(sensorArray) || sensorArray.length === 0) {
    return {
      totalOccupancySensors: 0,
      totalOccupied: 0,
      totalVacant: 0,
    };
  }

  // Init sequelize models
  initModels(sequelize);

  // ✅ Filter occupancy sensors only
  const occupancySensors = sensorArray.filter(s => s.sensorType === 'occupancy' && s.uniqueId);

  if (occupancySensors.length === 0) {
    return {
      totalOccupancySensors: 0,
      totalOccupied: 0,
      totalVacant: 0,
    };
  }

  const uniqueIds = occupancySensors.map(s => s.uniqueId);

  const OccupancyModelEntry = MODEL_CLASSES.find(m => m.name === 'occupancy');
  if (!OccupancyModelEntry?.cls) {
    return {
      totalOccupancySensors: uniqueIds.length,
      totalOccupied: 0,
      totalVacant: 0,
    };
  }

  // ✅ Get latest record per sensor
  const records = await OccupancyModelEntry.cls.findAll({
    where: { sensor_unique_id: { [Op.in]: uniqueIds } },
    attributes: ['sensor_unique_id', 'occupied', 'timestamp'],
    order: [
      ['sensor_unique_id', 'ASC'],
      ['timestamp', 'DESC'],
    ],
    raw: true,
  });

  // Keep only latest row per sensor
  const latestBySensor = {};
  for (const r of records) {
    if (!latestBySensor[r.sensor_unique_id]) {
      latestBySensor[r.sensor_unique_id] = r;
    }
  }

  let totalOccupied = 0;
  let totalVacant = 0;

  Object.values(latestBySensor).forEach(r => {
    if (Number(r.occupied) === 1) totalOccupied++;
    else if (Number(r.occupied) === 0) totalVacant++;
  });

  return {
    totalOccupancySensors: uniqueIds.length,
    totalOccupied,
    totalVacant,
  };
};
