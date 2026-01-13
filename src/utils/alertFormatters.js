// utils/alertFormatters.js

/**
 * Format conditions for display in table
 */
export const formatConditionsForDisplay = conditions => {
  if (!conditions || typeof conditions !== 'object') return '-';

  return Object.entries(conditions)
    .map(([sensorId, cond]) => {
      if (!cond) return '';
      const { label, min, max } = cond;

      if (min !== undefined && max !== undefined) {
        return `${label} (${min} - ${max})`;
      } else if (min !== undefined) {
        return `${label} (${min})`;
      }
      return label;
    })
    .filter(Boolean)
    .join(' | ');
};

/**
 * Create building options from buildings data
 */
export const createBuildingOptions = buildingsList => [
  { option: 'All Buildings', value: '' },
  ...(buildingsList?.map(b => ({
    option: b.name,
    value: b._id,
  })) || []),
];

/**
 * Create restroom options from restrooms data
 */
export const createRestroomOptions = restroomsList => [
  { option: 'All Restrooms', value: '' },
  ...(restroomsList?.map(r => ({
    option: `${r.name}`,
    value: r._id,
  })) || []),
];

/**
 * Create sensor options from sensors data with formatting
 */
export const createSensorOptions = (sensors, formatSensorType) => {
  if (!sensors || !sensors.length) {
    return [{ option: 'All Sensors', value: null }];
  }

  return [
    { option: 'All Sensors', value: null },
    ...sensors.map(s => {
      const sensorType = s.sensorType || s.type || '';
      const displayType = formatSensorType(sensorType);

      return {
        option: `${s.name} (${displayType})`,
        value: {
          id: s._id,
          name: s.name,
          type: sensorType,
        },
      };
    }),
  ];
};
