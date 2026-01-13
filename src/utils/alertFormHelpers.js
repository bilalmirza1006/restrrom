// utils/alertFormHelpers.js

/**
 * Initial form state
 */
export const initialFormState = {
  ruleName: '',
  buildingId: '',
  restroomId: '',
  sensors: [],
  severity: '',
  sensorTypes: [], // Array of sensor types
  email: '',
  platform: '',
};

/**
 * Reset form and related UI states
 */
export const resetForm = () => {
  return {
    formData: initialFormState,
    selectedBuilding: '',
    selectedRestroom: '',
    selectedSensor: [],
    inputEmail: false,
  };
};

/**
 * Create sensor condition object for a sensor
 */
export const createSensorCondition = (sensor, field) => {
  return {
    sensorId: sensor.id,
    sensorType: normalizeSensorType(sensor.type),
    label: field?.label || sensor.name,
    min: '',
    max: '',
    type: field?.type || 'range',
    ...(field?.unit && { unit: field.unit }),
    ...(field?.options && { options: field.options }),
  };
};

/**
 * Sync conditions with selected sensors
 */
export const syncConditionsWithSensors = (sensors, currentConditions, getSensorFieldConfig) => {
  if (!Array.isArray(sensors)) sensors = [];

  const updatedConditions = { ...currentConditions };

  sensors.forEach(sensor => {
    if (sensor && sensor.id && !updatedConditions[sensor.id]) {
      const field = getSensorFieldConfig(sensor.type);

      updatedConditions[sensor.id] = createSensorCondition(sensor, field);
    }
  });

  // Remove conditions for unselected sensors
  Object.keys(updatedConditions).forEach(id => {
    if (!sensors.find(s => s && s.id === id)) {
      delete updatedConditions[id];
    }
  });

  return updatedConditions;
};

/**
 * Prepare alert data for API submission with new structure
 */
export const prepareAlertPayload = formData => {
  const {
    ruleName,
    buildingId,
    restroomId,
    sensors,
    severity,
    sensorTypes,
    platform,
    email,
    conditions,
  } = formData;

  // Convert conditions object to array
  const conditionsArray = Object.values(conditions || {});

  return {
    name: ruleName,
    buildingId: buildingId || null,
    restroomId: restroomId || null,
    sensors: sensors.map(sensor => sensor.id), // Array of sensor IDs
    severity,
    sensorTypes, // Array of sensor type strings
    conditions: conditionsArray, // Array of condition objects
    platform,
    ...(platform === 'email' && email ? { email } : {}),
  };
};

/**
 * Convert API data to form data structure
 */
export const apiDataToFormData = (alert, allSensors) => {
  const formData = {
    ruleName: alert.name || '',
    buildingId: alert.buildingId || '',
    restroomId: alert.restroomId || '',
    sensors: [],
    severity: alert.severity || '',
    sensorTypes: alert.sensorTypes || [],
    platform: alert.platform || '',
    email: alert.email || '',
    conditions: {},
  };

  // If alert has sensors data
  if (alert.sensors && Array.isArray(alert.sensors)) {
    alert.sensors.forEach(sensorId => {
      const sensor = allSensors.find(s => s._id === sensorId);
      if (sensor) {
        formData.sensors.push({
          id: sensor._id,
          name: sensor.name,
          type: sensor.sensorType || sensor.type,
        });
      }
    });
  }

  // Convert conditions array to object
  if (alert.conditions && Array.isArray(alert.conditions)) {
    alert.conditions.forEach(condition => {
      if (condition.sensorId) {
        formData.conditions[condition.sensorId] = condition;
      }
    });
  } else if (alert.conditions && typeof alert.conditions === 'object') {
    formData.conditions = { ...alert.conditions };
  }

  return formData;
};

/**
 * Validate form data
 */
export const validateAlertForm = formData => {
  const { ruleName, severity, sensorTypes, platform, email, sensors, conditions } = formData;

  const errors = [];

  if (!ruleName.trim()) errors.push('Rule name is required');
  if (!severity) errors.push('Severity is required');
  if (!sensorTypes.length) errors.push('At least one sensor type is required');
  if (!platform) errors.push('Notification platform is required');
  if (platform === 'email' && !email) errors.push('Email is required for email notifications');

  // Validate each sensor condition
  sensors.forEach(sensor => {
    const condition = conditions[sensor.id];
    if (!condition) {
      errors.push(`Condition for sensor ${sensor.name} is required`);
      return;
    }

    const field = getSensorFieldConfig(sensor.type);
    if (!field) {
      errors.push(`Invalid sensor type for ${sensor.name}`);
      return;
    }

    if (field.type === 'range') {
      if (!condition.min && !condition.max) {
        errors.push(`Either min or max value is required for ${sensor.name}`);
      }
    } else if (field.type === 'select' || field.type === 'boolean') {
      if (condition.min === undefined && condition.max === undefined) {
        errors.push(`Value is required for ${sensor.name}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function from sensorTypes.js (or import it)
export const normalizeSensorType = type => {
  if (!type) return '';
  if (type.includes('_')) {
    return type.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  return type;
};
