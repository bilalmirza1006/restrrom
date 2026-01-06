import { initModels } from '@/sequelizeSchemas/initModels';
import { col, fn, Op } from 'sequelize';

import { sequelize } from '@/configs/connectDb';

export const SENSOR_MAX_VALUES = {
  door_queue: 25, // count max
  stall_status: 500, // usageCount max
  occupancy: 1800, // occupancyDuration max (seconds)
  air_quality: 300, // aqi max
  toilet_paper: 100, // level max
  soap_dispenser: 100, // level max
  water_leakage: 250, // waterLevel_mm max
};

const getPeriodConfig = period => {
  const now = new Date();

  switch (period) {
    case 'day':
      return {
        key: 'day',
        format: '%H',
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        filter: {
          timestamp: {
            [Op.between]: [
              new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
            ],
          },
        },
      };

    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);

      return {
        key: 'week',
        format: '%w',
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        filter: { timestamp: { [Op.between]: [start, now] } },
      };
    }

    case 'month':
      return {
        key: 'month',
        format: '%u',
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        filter: {
          timestamp: {
            [Op.between]: [
              new Date(now.getFullYear(), now.getMonth(), 1),
              new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
            ],
          },
        },
      };

    default:
      throw new Error('Invalid period');
  }
};

async function buildBuildingPerformance(models, sensors, periodConfig) {
  const sensorsByType = {};

  sensors.forEach(s => {
    const type = s.sensorType?.toLowerCase();
    if (!type) return;
    if (!sensorsByType[type]) sensorsByType[type] = [];
    sensorsByType[type].push(s.uniqueId);
  });

  const aggregated = {};

  for (const [type, sensorIds] of Object.entries(sensorsByType)) {
    const ModelClass = models[type];
    if (!ModelClass || !sensorIds.length) continue;

    const valueColumn = {
      door_queue: 'count',
      stall_status: 'usageCount',
      occupancy: 'occupancyDuration',
      air_quality: 'aqi',
      toilet_paper: 'level',
      soap_dispenser: 'level',
      water_leakage: 'waterLevel_mm',
    }[type];

    const data = await ModelClass.findAll({
      where: { sensor_unique_id: { [Op.in]: sensorIds }, ...periodConfig.filter },
      attributes: [
        [fn('DATE_FORMAT', col('timestamp'), periodConfig.format), 'period'],
        [fn('AVG', col(valueColumn)), 'value'],
      ],
      group: ['period'],
      raw: true,
    });

    aggregated[type] = data.reduce((acc, d) => {
      acc[d.period] = d.value;
      return acc;
    }, {});
  }

  // Normalize + fill missing labels
  return periodConfig.labels.map((label, i) => {
    const key =
      periodConfig.key === 'day'
        ? i.toString().padStart(2, '0')
        : periodConfig.key === 'week'
          ? i.toString()
          : (i + 1).toString();

    let totalSum = 0;

    Object.keys(SENSOR_MAX_VALUES).forEach(type => {
      const rawVal = aggregated[type]?.[key] || 0;
      const maxVal = SENSOR_MAX_VALUES[type] || 1;

      const normalized = Math.min(rawVal / maxVal, 1);
      totalSum += normalized;
    });

    return {
      name: label,
      value: +totalSum.toFixed(2),
    };
  });
}

export const getBuildingPerformanceFromSensors = async (sensorsArray, period = 'day') => {
  if (!sensorsArray?.length) return [];

  const models = initModels(sequelize);
  const periodConfig = getPeriodConfig(period);

  // Group sensors by building
  const sensorsByBuilding = {};
  sensorsArray.forEach(s => {
    if (!s.buildingId) return;
    if (!sensorsByBuilding[s.buildingId]) {
      sensorsByBuilding[s.buildingId] = [];
    }
    sensorsByBuilding[s.buildingId].push(s);
  });

  const response = [];

  for (const [buildingId, sensors] of Object.entries(sensorsByBuilding)) {
    const performance = await buildBuildingPerformance(models, sensors, periodConfig);

    response.push({
      buildingId,
      [periodConfig.key]: performance,
    });
  }

  return response;
};

export const getLatestBuildingPerformance = async sensorsArray => {
  if (!sensorsArray?.length) return [];

  const models = initModels(sequelize);

  // Group sensors by building
  const sensorsByBuilding = {};
  sensorsArray.forEach(s => {
    if (!s.buildingId) return;
    if (!sensorsByBuilding[s.buildingId]) sensorsByBuilding[s.buildingId] = [];
    sensorsByBuilding[s.buildingId].push(s);
  });

  const response = [];

  for (const [buildingId, sensors] of Object.entries(sensorsByBuilding)) {
    const sensorsByType = {};
    sensors.forEach(s => {
      const type = s.sensorType?.toLowerCase();
      if (!type) return;
      if (!sensorsByType[type]) sensorsByType[type] = [];
      sensorsByType[type].push(s.uniqueId);
    });

    const buildingPerformance = {};

    for (const [type, sensorIds] of Object.entries(sensorsByType)) {
      const ModelClass = models[type];
      if (!ModelClass || !sensorIds.length) continue;

      const valueColumn = {
        door_queue: 'count',
        stall_status: 'usageCount',
        occupancy: 'occupancyDuration',
        air_quality: 'aqi',
        toilet_paper: 'level',
        soap_dispenser: 'level',
        water_leakage: 'waterLevel_mm',
      }[type];

      // Get latest value for each sensor
      const latestValues = await Promise.all(
        sensorIds.map(async id => {
          const record = await ModelClass.findOne({
            where: { sensor_unique_id: id },
            order: [['timestamp', 'DESC']],
            attributes: [valueColumn],
            raw: true,
          });
          return record?.[valueColumn] || 0;
        })
      );

      // Average normalized value across sensors of this type
      const maxVal = SENSOR_MAX_VALUES[type] || 1;
      const avgValue =
        latestValues.reduce((sum, val) => sum + val / maxVal, 0) / latestValues.length;

      buildingPerformance[type] = +avgValue.toFixed(2);
    }

    response.push({
      buildingId,
      performance: buildingPerformance,
    });
  }

  return response;
};
