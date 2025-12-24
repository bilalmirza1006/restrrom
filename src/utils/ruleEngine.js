// utils/ruleEngine.js
import Alert from '@/models/alert';
import Rule from '@/models/rule';

export async function evaluateSensorData(sensorData) {
  const rules = await Rule.find({ status: 'active' });

  const triggeredAlerts = [];

  for (const rule of rules) {
    const sensorValue = sensorData[rule.alertType]; // e.g., sensorData.occupied

    let match = false;
    if (rule.valueRange.booleanValue !== undefined) {
      match = sensorValue === rule.valueRange.booleanValue;
    } else if (rule.valueRange.min !== undefined || rule.valueRange.max !== undefined) {
      if (rule.valueRange.min !== undefined && sensorValue < rule.valueRange.min) continue;
      if (rule.valueRange.max !== undefined && sensorValue > rule.valueRange.max) continue;
      match = true;
    }

    if (match) {
      const alert = await Alert.create({
        name: rule.name,
        alertType: rule.alertType,
        severity: rule.severity,
        sensorId: rule.sensorId,
        value: sensorValue,
      });
      triggeredAlerts.push(alert);
    }
  }

  return triggeredAlerts;
}
