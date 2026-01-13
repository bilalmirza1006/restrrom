// utils/sensorTypes.js

export const sensorTypes = [
  { option: 'Occupancy', value: 'occupancy' },
  { option: 'Air Quality', value: 'airQuality' },
  { option: 'Water Leakage', value: 'waterLeakage' },
  { option: 'Toilet Paper', value: 'toiletPaper' },
  { option: 'Soap Dispenser', value: 'soapDispenser' },
  { option: 'Door Queue', value: 'doorQueue' },
  { option: 'Stall Status', value: 'stallStatus' },
];

export const severityOptions = [
  { option: 'Low', value: 'low' },
  { option: 'Medium', value: 'medium' },
  { option: 'High', value: 'high' },
  { option: 'Critical', value: 'critical' },
];

export const SENSOR_ALERT_FIELDS = {
  occupancy: {
    label: 'Occupancy Status',
    type: 'boolean',
  },
  airQuality: {
    label: 'Air Quality Index (AQI)',
    type: 'range',
    unit: 'AQI',
  },
  waterLeakage: {
    label: 'Water Detected',
    type: 'boolean',
  },
  toiletPaper: {
    label: 'Toilet Paper Level',
    type: 'range',
    unit: '%',
  },
  soapDispenser: {
    label: 'Soap Level',
    type: 'range',
    unit: '%',
  },
  door_queue: {
    label: 'Queue Count',
    type: 'range',
    unit: 'People',
  },
  doorQueue: {
    label: 'Queue Count',
    type: 'range',
    unit: 'People',
  },
  stall_status: {
    label: 'Stall Status',
    type: 'select',
    options: [
      { option: 'Occupied', value: 'occupied' },
      { option: 'Vacant', value: 'vacant' },
      { option: 'Out of Order', value: 'out_of_order' },
    ],
  },
  stallStatus: {
    label: 'Stall Status',
    type: 'select',
    options: [
      { option: 'Occupied', value: 'occupied' },
      { option: 'Vacant', value: 'vacant' },
      { option: 'Out of Order', value: 'out_of_order' },
    ],
  },
};

export const normalizeSensorType = type => {
  if (!type) return '';
  if (type.includes('_')) {
    return type.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  return type;
};

export const getSensorFieldConfig = type => {
  const normalizedType = normalizeSensorType(type);
  const config = SENSOR_ALERT_FIELDS[normalizedType];
  if (!config) {
    return SENSOR_ALERT_FIELDS[type] || null;
  }
  return config;
};

export const formatSensorType = type => {
  if (!type) return '';
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
