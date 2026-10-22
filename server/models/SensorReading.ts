import mongoose, { Schema } from 'mongoose';
import { ISensorReading } from '../types.js';

const SensorReadingSchema = new Schema<ISensorReading>({
  deviceId: { type: String, required: true, index: true },
  deviceType: { type: String, enum: ['panel', 'inverter'], required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  power: { type: Number, required: true },
  temperature: { type: Number, required: true },
  efficiency: { type: Number, required: true },
  irradiance: { type: Number, required: true },
  timestamp: { type: String, default: () => new Date().toISOString(), index: true }
});

export const SensorReadingModel = mongoose.models.SensorReading || mongoose.model<ISensorReading>('SensorReading', SensorReadingSchema);
