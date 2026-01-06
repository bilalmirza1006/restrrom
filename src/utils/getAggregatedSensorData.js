import { initModels } from '@/sequelizeSchemas/initModels';
import { MODEL_CLASSES } from '@/sequelizeSchemas/models';
import { col, fn, literal, Op } from 'sequelize';

import { sequelize } from '@/configs/connectDb';
import { RestRoom } from '@/models/restroom.model';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import mongoose from 'mongoose';
dayjs.extend(weekOfYear);
export const getSensorsAggregatedData = async ({
  sensors,
  groupBy = 'day',
  scope = 'building',
}) => {
  const models = initModels(sequelize);

  // Optional: test connection
  await sequelize.authenticate();
  //   console.log('✅ Sequelize connected and models initialized');

  if (!sensors || sensors.length === 0) {
    console.log('No sensors provided.');
    return [];
  }

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

  // Filter occupancy sensors
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

  if (!records.length) return [];

  // Use only the first valid restroomId (assuming all sensors are in the same restroom)
  const restroomId = records.find(r => r.restroomId)?.restroomId;
  if (!restroomId) return [];

  // Optional: fetch actual restroom name
  const restroom = await RestRoom.findOne({
    where: { id: restroomId },
    attributes: ['id', 'name'],
    raw: true,
  });
  const restroomName = restroom?.name || restroomId;

  // Initialize aggregation maps
  const rr = {
    name: restroomName,
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

  // Aggregate records
  records.forEach(r => {
    const occupied = r.occupied ? 1 : 0;
    rr.totalOccupied += occupied;
    rr.totalRecords += 1;

    const date = new Date(r.timestamp);
    const hour = date.getHours();
    const day = date.getDate();
    const week = Math.ceil(date.getDate() / 7);
    const month = date.getMonth() + 1;

    rr._hourMap[hour] = (rr._hourMap[hour] || 0) + occupied;
    rr._dayMap[day] = (rr._dayMap[day] || 0) + occupied;
    rr._weekMap[week] = (rr._weekMap[week] || 0) + occupied;
    rr._monthMap[month] = (rr._monthMap[month] || 0) + occupied;
  });

  // Transform maps to arrays
  rr.chartData.hour = Object.entries(rr._hourMap).map(([hour, value]) => ({
    hour: parseInt(hour),
    value,
  }));
  rr.chartData.day = Object.entries(rr._dayMap).map(([day, value]) => ({
    day: parseInt(day),
    value,
  }));
  rr.chartData.week = Object.entries(rr._weekMap).map(([week, value]) => ({
    week: parseInt(week),
    value,
  }));
  rr.chartData.month = Object.entries(rr._monthMap).map(([month, value]) => ({
    month: parseInt(month),
    value,
  }));

  // Calculate percentage
  const percentage = rr.totalRecords
    ? Math.round((rr.totalOccupied / rr.totalRecords) * 100) + '%'
    : '0%';

  return [
    {
      restroomId: rr.name,
      percentage,
      chartData: rr.chartData,
    },
  ];
};

export const getSlateChartReport = async sensorArray => {
  if (!Array.isArray(sensorArray) || sensorArray.length === 0) return [];

  initModels(sequelize);

  // Only occupancy sensors
  const occupancySensors = sensorArray.filter(
    s => s.sensorType === 'occupancy' && s.uniqueId && s._id
  );

  if (occupancySensors.length === 0) return [];

  const OccupancyModelEntry = MODEL_CLASSES.find(m => m.name === 'occupancy');
  if (!OccupancyModelEntry?.cls) return [];

  // Map SQL uniqueId -> Mongo Sensor _id and sensor object
  const uniqueIdToSensor = {};
  occupancySensors.forEach(s => {
    uniqueIdToSensor[s.uniqueId] = s;
  });

  const uniqueIds = Object.keys(uniqueIdToSensor);

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  // Fetch occupancy records from SQL
  const records = await OccupancyModelEntry.cls.findAll({
    where: {
      sensor_unique_id: { [Op.in]: uniqueIds },
      timestamp: { [Op.gte]: startOfYear },
    },
    attributes: [
      'sensor_unique_id',
      'occupied',
      'restroomId', // if available
      [fn('DATE_FORMAT', col('timestamp'), '%Y-%m-%d %H:%i:%s'), 'timestamp'],
    ],
    raw: true,
  });

  const sensorMap = {};

  records.forEach(r => {
    const sensorObj = uniqueIdToSensor[r.sensor_unique_id];
    if (!sensorObj) return;

    const mongoSensorId = String(sensorObj._id);

    if (!sensorMap[mongoSensorId]) {
      sensorMap[mongoSensorId] = {
        sensorId: mongoSensorId,
        sensorName: sensorObj.name || null,
        // restroomName: sensorObj.restroomName || null, // assuming you have this in sensorArray
        totalOccupied: 0,
        totalRecords: 0,
        _hourMap: {},
        _dayMap: {},
        _weekMap: {},
        _monthMap: {},
      };
    }

    const s = sensorMap[mongoSensorId];
    const occupied = r.occupied ? 1 : 0;

    s.totalOccupied += occupied;
    s.totalRecords += 1;

    const date = new Date(r.timestamp);
    const hour = date.getHours();
    const day = date.getDate();
    const week = Math.ceil(day / 7);
    const month = date.getMonth() + 1;

    s._hourMap[hour] = (s._hourMap[hour] || 0) + occupied;
    s._dayMap[day] = (s._dayMap[day] || 0) + occupied;
    s._weekMap[week] = (s._weekMap[week] || 0) + occupied;
    s._monthMap[month] = (s._monthMap[month] || 0) + occupied;
  });

  // Transform map into array
  const report = Object.values(sensorMap).map(s => {
    const percentage = s.totalRecords ? Math.round((s.totalOccupied / s.totalRecords) * 100) : 0;

    return {
      sensorId: s.sensorId,
      sensorName: s.sensorName,
      // restroomName: s.restroomName,
      percentage: `${percentage}%`,
      chartData: {
        hour: Object.entries(s._hourMap).map(([hour, value]) => ({
          hour: Number(hour),
          value,
        })),
        day: Object.entries(s._dayMap).map(([day, value]) => ({
          day: Number(day),
          value,
        })),
        week: Object.entries(s._weekMap).map(([week, value]) => ({
          week: Number(week),
          value,
        })),
        month: Object.entries(s._monthMap).map(([month, value]) => ({
          month: Number(month),
          value,
        })),
      },
    };
  });

  // Sort by highest occupancy percentage
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

export const getSensorHistory = async (SqlModel, sensor, range = 'day') => {
  if (!SqlModel || !sensor) return [];

  let dateFrom;

  const now = new Date();

  switch (range) {
    case 'hour':
      dateFrom = new Date(now.getTime() - 60 * 60 * 1000); // last 1 hour
      break;
    case 'day':
      dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24h
      break;
    case 'week':
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
      break;
    case 'month':
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1); // start of this month
      break;
    default:
      dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  // Fetch data
  const data = await SqlModel.findAll({
    where: {
      sensor_unique_id: sensor.uniqueId,
      timestamp: { [Op.gte]: dateFrom },
    },
    order: [['timestamp', 'ASC']],
    raw: true,
  });

  // Aggregate per time unit
  const grouped = {};

  data.forEach(d => {
    let key;
    const ts = new Date(d.timestamp);

    switch (range) {
      case 'hour':
        key = `${ts.getHours()} AM`;
        break;
      case 'day':
        key = `${ts.getDate()} ${ts.toLocaleString('default', { month: 'short' })}`;
        break;
      case 'week':
        const weekNumber = Math.ceil(ts.getDate() / 7);
        key = `Week ${weekNumber}`;
        break;
      case 'month':
        key = ts.toLocaleString('default', { month: 'short' });
        break;
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  // Transform into chart data
  return Object.entries(grouped).map(([date, records]) => {
    const bar = records.length;
    const line = records.reduce((sum, r) => sum + (r.value || 0), 0) / (records.length || 1);
    return { date, bar, line: Math.round(line) };
  });
};

export const getSensorCounts = async (SqlModel, sensor, range = 'day') => {
  if (!SqlModel || !sensor) return [];

  const now = dayjs();
  let dateFrom;
  let periodKeys = [];
  let groupBy;

  switch (range) {
    // 🔹 LAST 3 HOURS (2–3 hours)
    case 'hour': {
      dateFrom = now.subtract(3, 'hour').startOf('hour').toDate();

      periodKeys = Array.from({ length: 3 }, (_, i) => now.subtract(2 - i, 'hour').hour());

      groupBy = literal('HOUR(timestamp)');
      break;
    }

    // 🔹 LAST 24 HOURS (HOURLY)

    case 'day': {
      dateFrom = now.subtract(24, 'hour').startOf('hour').toDate();
      periodKeys = Array.from({ length: 24 }, (_, i) => now.subtract(23 - i, 'hour').hour());
      groupBy = literal('HOUR(timestamp)');
      break;
    }

    // 🔹 LAST 4 WEEKS
    case 'week': {
      dateFrom = now.subtract(4, 'week').startOf('week').toDate();

      periodKeys = Array.from({ length: 4 }, (_, i) => now.subtract(3 - i, 'week').week());

      groupBy = literal('WEEK(timestamp)');
      break;
    }

    // 🔹 FULL CURRENT MONTH (DAILY)
    case 'month': {
      dateFrom = now.startOf('month').toDate();
      const daysInMonth = now.daysInMonth();
      periodKeys = Array.from({ length: daysInMonth }, (_, i) => i + 1); // 1…daysInMonth
      groupBy = literal('DAY(timestamp)');
      break;
    }
    default:
      return [];
  }

  // 🔹 Fetch counts from DB
  const counts = await SqlModel.findAll({
    attributes: [
      [groupBy, 'period'],
      [fn('COUNT', col('idPrimary')), 'count'],
    ],
    where: {
      ownerId: sensor.ownerId.toString(),
      sensorId: sensor._id.toString(),
      sensor_unique_id: sensor.uniqueId,
      timestamp: { [Op.gte]: dateFrom },
    },
    group: ['period'],
    order: [['period', 'ASC']],
    raw: true,
  });

  // 🔹 Normalize results
  const countsMap = {};
  counts.forEach(c => {
    countsMap[c.period] = Number(c.count);
  });

  // 🔹 Fill missing periods with 0
  return periodKeys.map(k => ({
    date: k,
    count: countsMap[k] || 0,
  }));
};

// Define max values for each sensor type
export const SENSOR_MAX_VALUES = {
  door_queue: 25, // count max
  stall_status: 500, // usageCount max
  occupancy: 1800, // occupancyDuration max (seconds)
  air_quality: 300, // aqi max
  toilet_paper: 100, // level max
  soap_dispenser: 100, // level max
  water_leakage: 250, // waterLevel_mm max
};

// export const getTopBuildings = sensorsArray => {
//   const buildingScores = {};

//   sensorsArray.forEach(sensor => {
//     const { buildingId, sensorType } = sensor;
//     const maxVal = SENSOR_MAX_VALUES[sensorType] || 0;
//     if (!buildingScores[buildingId]) buildingScores[buildingId] = 0;

//     // Add normalized value or max potential
//     let value = 0;
//     switch (sensorType) {
//       case 'door_queue':
//         value = sensor.count || 0;
//         break;
//       case 'stall_status':
//         value = sensor.usageCount || 0;
//         break;
//       case 'occupancy':
//         value = sensor.occupancyDuration || 0;
//         break;
//       case 'air_quality':
//         value = sensor.aqi || 0;
//         break;
//       case 'toilet_paper':
//       case 'soap_dispenser':
//         value = sensor.level || 0;
//         break;
//       case 'water_leakage':
//         value = sensor.waterLevel_mm || 0;
//         break;
//       default:
//         value = 0;
//     }

//     const normalized = maxVal ? Math.min(value / maxVal, 1) : 0;
//     buildingScores[buildingId] += normalized;
//   });

//   // Sort buildings by total normalized score
//   return Object.entries(buildingScores)
//     .map(([buildingId, score]) => ({ buildingId, score: +score.toFixed(2) }))
//     .sort((a, b) => b.score - a.score);
// };
export function getTopBuildings(allSensors) {
  const SENSOR_MAX_VALUES = {
    door_queue: 25,
    stall_status: 500,
    occupancy: 1800,
    air_quality: 300,
    toilet_paper: 100,
    soap_dispenser: 100,
    water_leakage: 250,
  };

  // Group sensors by building
  const buildingMap = {};

  allSensors.forEach(sensor => {
    if (!sensor.buildingId) return; // skip sensors without building

    if (!buildingMap[sensor.buildingId]) {
      buildingMap[sensor.buildingId] = { buildingId: sensor.buildingId, score: 0, count: 0 };
    }

    const building = buildingMap[sensor.buildingId];
    const sensorType = sensor.sensorType;

    if (!SENSOR_MAX_VALUES[sensorType]) return;

    // Determine value based on sensor type
    let value = 0;
    switch (sensorType) {
      case 'door_queue':
        value = sensor.count || 0;
        break;
      case 'stall_status':
        value = sensor.usageCount || 0;
        break;
      case 'occupancy':
        value = sensor.occupancyDuration || 0;
        break;
      case 'air_quality':
        value = sensor.aqi || 0;
        break;
      case 'toilet_paper':
      case 'soap_dispenser':
        value = sensor.level || 0;
        break;
      case 'water_leakage':
        value = SENSOR_MAX_VALUES.water_leakage - (sensor.waterLevel_mm || 0); // invert
        break;
      default:
        value = 0;
    }

    // Normalize and add to score
    const normalized = value / SENSOR_MAX_VALUES[sensorType];
    building.score += normalized;
    building.count += 1;
  });

  // Compute average score per building
  const buildings = Object.values(buildingMap).map(b => ({
    buildingId: b.buildingId,
    performanceScore: b.count ? b.score / b.count : 0,
  }));

  // Sort descending and take top 3
  return buildings.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3);
}

// export const getBuildingPerformanceFromSensors = async sensorsArray => {
//   if (!sensorsArray || !sensorsArray.length) return [];

//   // Initialize models
//   const models = initModels(sequelize);

//   // Group sensors by type
//   const sensorsByType = {};
//   sensorsArray.forEach(sensor => {
//     const { sensorType } = sensor;
//     if (!sensorType) return;
//     const type = sensorType.toLowerCase();
//     if (!sensorsByType[type]) sensorsByType[type] = [];
//     sensorsByType[type].push(sensor);
//   });

//   const buildingData = {};

//   // Loop over each sensor type
//   for (const [type, sensors] of Object.entries(sensorsByType)) {
//     const modelInfo = MODEL_CLASSES.find(m => m.name === type);
//     if (!modelInfo) continue;

//     const ModelClass = models[type];
//     if (!ModelClass) continue;

//     const sensorIds = sensors.map(s => s.uniqueId).filter(Boolean);
//     if (!sensorIds.length) continue;

//     // Fetch latest records per sensor in a single query
//     const latestRecords = await ModelClass.findAll({
//       where: { sensor_unique_id: { [Op.in]: sensorIds } },
//       order: [['timestamp', 'DESC']],
//       group: ['sensor_unique_id'],
//       raw: true,
//     });

//     // Map latest records to building performance
//     latestRecords.forEach(record => {
//       const sensor = sensors.find(s => s.uniqueId === record.sensor_unique_id);
//       if (!sensor) return;

//       const buildingId = sensor.buildingId;
//       let value = 0;

//       // Determine value based on sensor type
//       switch (type) {
//         case 'door_queue':
//           value = record.count || 0;
//           break;
//         case 'stall_status':
//           value = record.usageCount || 0;
//           break;
//         case 'occupancy':
//           value = record.occupancyDuration || 0;
//           break;
//         case 'air_quality':
//           value = record.aqi || 0;
//           break;
//         case 'toilet_paper':
//         case 'soap_dispenser':
//           value = record.level || 0;
//           break;
//         case 'water_leakage':
//           value = record.waterLevel_mm || 0;
//           break;
//         default:
//           value = 0;
//       }

//       // Normalize value
//       const maxVal = SENSOR_MAX_VALUES[type] || 0;
//       const normalized = maxVal ? Math.min(value / maxVal, 1) : 0;

//       // Aggregate per building
//       if (!buildingData[buildingId]) buildingData[buildingId] = { total: 0, count: 0 };
//       buildingData[buildingId].total += normalized;
//       buildingData[buildingId].count += 1;
//     });
//   }

//   // Convert to array and calculate % performance
//   return Object.entries(buildingData)
//     .map(([buildingId, { total, count }]) => ({
//       buildingId,
//       performance: count > 0 ? +((total / count) * 100).toFixed(2) : 0,
//     }))
//     .sort((a, b) => b.performance - a.performance);
// };

// import { initModels } from './initModels.js';
// import { MODEL_CLASSES } from './models.js';
// import { Op, literal } from 'sequelize';
// import sequelize from './db.js';
// import { SENSOR_MAX_VALUES } from './constants.js';

// import { initModels } from './initModels.js';
// import { MODEL_CLASSES } from './models.js';
// import { Op, fn, col, literal } from 'sequelize';
// import sequelize from './db.js';
// import { SENSOR_MAX_VALUES } from './constants.js';

// export const getBuildingPeriodPerformance = async (sensorsArray, period) => {
//   const models = initModels(sequelize);
//   const sensorsByType = {};

//   sensorsArray.forEach(sensor => {
//     const type = sensor.sensorType?.toLowerCase();
//     if (!type) return;
//     if (!sensorsByType[type]) sensorsByType[type] = [];
//     sensorsByType[type].push(sensor);
//   });

//   const now = new Date();
//   let dateFilter = {};
//   let periodFormat = '';
//   let labels = [];

//   switch (period) {
//     case 'day':
//       dateFilter = {
//         timestamp: {
//           [Op.between]: [
//             new Date(now.getFullYear(), now.getMonth(), now.getDate()),
//             new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
//           ],
//         },
//       };
//       periodFormat = '%H';
//       labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
//       break;

//     case 'week': {
//       const start = new Date(now);
//       start.setDate(now.getDate() - now.getDay());
//       start.setHours(0, 0, 0, 0);
//       const end = new Date(start);
//       end.setDate(start.getDate() + 6);
//       end.setHours(23, 59, 59, 999);
//       dateFilter = { timestamp: { [Op.between]: [start, end] } };
//       periodFormat = '%w';
//       labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//       break;
//     }

//     case 'month': {
//       const start = new Date(now.getFullYear(), now.getMonth(), 1);
//       const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
//       dateFilter = { timestamp: { [Op.between]: [start, end] } };
//       periodFormat = '%u';
//       labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
//       break;
//     }

//     default:
//       throw new Error('Invalid period');
//   }

//   const results = [];

//   for (const [type, sensors] of Object.entries(sensorsByType)) {
//     const ModelClass = models[type];
//     if (!ModelClass) continue;

//     const sensorIds = sensors.map(s => s.uniqueId).filter(Boolean);
//     if (!sensorIds.length) continue;

//     const numericCols =
//       {
//         door_queue: ['count'],
//         stall_status: ['usageCount'],
//         occupancy: ['occupancyDuration'],
//         air_quality: ['aqi'],
//         toilet_paper: ['level'],
//         soap_dispenser: ['level'],
//         water_leakage: ['waterLevel_mm'],
//       }[type] || [];

//     const attributes = [[fn('DATE_FORMAT', col('timestamp'), periodFormat), 'period']];
//     numericCols.forEach(c => attributes.push([fn('AVG', col(c)), c]));

//     const data = await ModelClass.findAll({
//       where: {
//         sensor_unique_id: { [Op.in]: sensorIds },
//         ...dateFilter,
//       },
//       attributes,
//       group: ['period'],
//       order: [['period', 'ASC']],
//       raw: true,
//     });

//     const map = {};
//     data.forEach(d => (map[d.period] = d));
//     results.push({ type, map });
//   }

//   return labels.map((label, i) => {
//     const obj = { name: label };
//     results.forEach(r => {
//       const key =
//         period === 'day'
//           ? i.toString().padStart(2, '0')
//           : period === 'week'
//             ? i.toString()
//             : (i + 1).toString();

//       const record = r.map[key];
//       if (!record) return;

//       const value = Object.values(record).find(v => typeof v === 'number') || 0;
//       const max = SENSOR_MAX_VALUES[r.type] || 1;
//       obj[r.type] = +Math.min(value / max, 1).toFixed(2);
//     });
//     return obj;
//   });
// };
