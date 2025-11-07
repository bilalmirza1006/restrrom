// models.js
import { Model, DataTypes } from 'sequelize';

export const baseAttrs = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sensor_unique_id: { type: DataTypes.STRING },
  level: { type: DataTypes.FLOAT },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
  readAt: { type: DataTypes.DATE, field: 'reading_time' },
};

export class Humidity extends Model {}
export class Temperature extends Model {}
export class CH extends Model {}
export class CO extends Model {}
export class CO2 extends Model {}
export class TVOC extends Model {}

export const MODEL_CLASSES = [
  { cls: Humidity, name: 'humidity' },
  { cls: Temperature, name: 'temperature' },
  { cls: CH, name: 'ch' },
  { cls: CO, name: 'co' },
  { cls: CO2, name: 'co2' },
  { cls: TVOC, name: 'tvoc' },
];

export const globalModelOptions = {
  freezeTableName: true,
  timestamps: false,
};
