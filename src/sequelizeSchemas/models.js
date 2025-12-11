// models.js
import { Model, DataTypes } from 'sequelize';

// Common fields present in all sensor tables
const commonFields = {
  idPrimary: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  ownerId: { type: DataTypes.STRING(128) },
  buildingId: { type: DataTypes.STRING(128) },
  restroomId: { type: DataTypes.STRING(128) },
  stallId: { type: DataTypes.STRING(64) },
  sensorId: { type: DataTypes.STRING(128) },
  sensor_unique_id: { type: DataTypes.STRING(128) },
  timestamp: { type: DataTypes.DATE },
};

// Door Queue specific attributes
export const doorQueueAttrs = {
  ...commonFields,
  event: { type: DataTypes.STRING(16) },
  count: { type: DataTypes.INTEGER },
  queueState: { type: DataTypes.STRING(32) },
  windowCount: { type: DataTypes.INTEGER },
};

// Stall Status specific attributes
export const stallStatusAttrs = {
  ...commonFields,
  state: { type: DataTypes.STRING(32) },
  usageCount: { type: DataTypes.INTEGER },
};

// Occupancy specific attributes
export const occupancyAttrs = {
  ...commonFields,
  occupied: { type: DataTypes.BOOLEAN },
  occupancyDuration: { type: DataTypes.INTEGER },
  lastOccupiedAt: { type: DataTypes.DATE },
};

// Air Quality specific attributes
export const airQualityAttrs = {
  ...commonFields,
  tvoc: { type: DataTypes.FLOAT },
  eCO2: { type: DataTypes.INTEGER },
  pm2_5: { type: DataTypes.FLOAT },
  aqi: { type: DataTypes.INTEGER },
  smellLevel: { type: DataTypes.STRING(32) },
};

// Toilet Paper specific attributes
export const toiletPaperAttrs = {
  ...commonFields,
  level: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING(32) },
  lastRefilledAt: { type: DataTypes.DATE },
};

// Soap Dispenser (Handwash) specific attributes
export const soapDispenserAttrs = {
  ...commonFields,
  dispenseEvent: { type: DataTypes.STRING(32) },
  lastDispenseAt: { type: DataTypes.DATE },
  level: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING(32) },
};

// Water Leakage specific attributes
export const waterLeakageAttrs = {
  ...commonFields,
  waterDetected: { type: DataTypes.BOOLEAN },
  waterLevel_mm: { type: DataTypes.FLOAT },
};

export class DoorQueue extends Model { }
export class StallStatus extends Model { }
export class Occupancy extends Model { }
export class AirQuality extends Model { }
export class ToiletPaper extends Model { }
export class SoapDispenser extends Model { }
export class WaterLeakage extends Model { }

export const MODEL_CLASSES = [
  { cls: DoorQueue, name: 'door_queue', attrs: doorQueueAttrs },
  { cls: StallStatus, name: 'stall_status', attrs: stallStatusAttrs },
  { cls: Occupancy, name: 'occupancy', attrs: occupancyAttrs },
  { cls: AirQuality, name: 'air_quality', attrs: airQualityAttrs },
  { cls: ToiletPaper, name: 'toilet_paper', attrs: toiletPaperAttrs },
  { cls: SoapDispenser, name: 'soap_dispenser', attrs: soapDispenserAttrs },
  { cls: WaterLeakage, name: 'water_leakage', attrs: waterLeakageAttrs },
];

export const globalModelOptions = {
  freezeTableName: true,
  timestamps: false,
};
