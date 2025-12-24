export const STATUS_DATA_CONFIG = {
  occupancy: d => [
    {
      title: 'Status',
      value: d.occupied === true || d.occupied === 1 ? 'Occupied' : 'Vacant',
    },
  ],

  air_quality: d => [{ title: 'Air Quality (AQI)', value: d.aqi }],

  door_queue: d => [
    { title: 'Queue Status', value: d.queueState },
    { title: 'People Count', value: d.count },
  ],

  stall_status: d => [{ title: 'Stall State', value: d.state }],

  toilet_paper: d => [
    { title: 'Status', value: d.status },
    { title: 'Level', value: `${d.level}%` },
  ],

  soap_dispenser: d => [
    { title: 'Status', value: d.status },
    { title: 'Level', value: `${d.level}%` },
  ],

  water_leakage: d => [
    {
      title: 'Leak Detected',
      value: d.waterDetected === 1 ? 'Yes' : 'No',
    },
  ],
};
export const SENSOR_UI_CONFIG = {
  occupancy: [
    {
      label: 'Occupancy Duration (sec)',
      value: d => d.occupancyDuration ?? '-',
    },
    {
      label: 'Last Occupied At',
      value: d => (d.lastOccupiedAt ? new Date(d.lastOccupiedAt).toLocaleString() : '-'),
    },
  ],

  air_quality: [
    { label: 'TVOC', value: d => d.tvoc },
    { label: 'eCO₂', value: d => d.eCO2 },
    { label: 'PM2.5', value: d => d.pm2_5 },
    { label: 'Smell Level', value: d => d.smellLevel },
  ],

  door_queue: [
    { label: 'Event', value: d => d.event },
    { label: 'Window Count', value: d => d.windowCount },
  ],

  stall_status: [{ label: 'Usage Count', value: d => d.usageCount }],

  toilet_paper: [
    {
      label: 'Last Refilled',
      value: d => (d.lastRefilledAt ? new Date(d.lastRefilledAt).toLocaleString() : '-'),
    },
  ],

  soap_dispenser: [
    {
      label: 'Last Dispensed',
      value: d => (d.lastDispenseAt ? new Date(d.lastDispenseAt).toLocaleString() : '-'),
    },
  ],

  water_leakage: [{ label: 'Water Level (mm)', value: d => d.waterLevel_mm }],
};

export const RULE_SENSOR_CONFIG = {
  occupancy: {
    label: 'Occupancy',
    fields: [
      {
        field: 'occupied',
        label: 'Occupied',
        type: 'boolean',
        operators: ['='],
      },
      {
        field: 'occupancyDuration',
        label: 'Occupancy Duration (sec)',
        type: 'number',
        operators: ['>', '<', '>=', '<='],
      },
    ],
  },

  waterLeakage: {
    label: 'Water Leakage',
    fields: [
      {
        field: 'waterDetected',
        label: 'Water Detected',
        type: 'boolean',
        operators: ['='],
      },
      {
        field: 'waterLevel_mm',
        label: 'Water Level (mm)',
        type: 'number',
        operators: ['>', '<'],
      },
    ],
  },

  airQuality: {
    label: 'Air Quality',
    fields: [
      { field: 'tvoc', label: 'TVOC', type: 'number', operators: ['>', '<'] },
      { field: 'eCO2', label: 'eCO₂', type: 'number', operators: ['>', '<'] },
      { field: 'pm2_5', label: 'PM 2.5', type: 'number', operators: ['>', '<'] },
      { field: 'aqi', label: 'AQI', type: 'number', operators: ['>', '<'] },
      {
        field: 'smellLevel',
        label: 'Smell Level',
        type: 'string',
        operators: ['='],
      },
    ],
  },

  toiletPaper: {
    label: 'Toilet Paper',
    fields: [
      { field: 'level', label: 'Level (%)', type: 'number', operators: ['<'] },
      { field: 'status', label: 'Status', type: 'string', operators: ['='] },
    ],
  },

  soapDispenser: {
    label: 'Soap Dispenser',
    fields: [
      { field: 'level', label: 'Level (%)', type: 'number', operators: ['<'] },
      {
        field: 'dispenseEvent',
        label: 'Dispense Event',
        type: 'string',
        operators: ['='],
      },
    ],
  },

  doorQueue: {
    label: 'Door Queue',
    fields: [
      { field: 'count', label: 'People Count', type: 'number', operators: ['>'] },
      {
        field: 'queueState',
        label: 'Queue State',
        type: 'string',
        operators: ['='],
      },
    ],
  },

  stallStatus: {
    label: 'Stall Status',
    fields: [
      {
        field: 'state',
        label: 'State',
        type: 'string',
        operators: ['='],
      },
      {
        field: 'usageCount',
        label: 'Usage Count',
        type: 'number',
        operators: ['>'],
      },
    ],
  },
};
