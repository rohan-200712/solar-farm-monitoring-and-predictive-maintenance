import mongoose, { Schema } from 'mongoose';
import { IInverter } from '../types.js';

const InverterSchema = new Schema<IInverter>({
  inverterId: { type: String, required: true, unique: true, index: true },
  model: { type: String, required: true },
  location: { type: String, required: true },
  inputVoltage: { type: Number, required: true },
  outputVoltage: { type: Number, required: true },
  power: { type: Number, required: true },
  temperature: { type: Number, required: true },
  efficiency: { type: Number, required: true },
  status: { type: String, enum: ['Online', 'Warning', 'Fault', 'Offline'], default: 'Online' },
  operatingHours: { type: Number, default: 1200 },
  totalEnergyGenerated: { type: Number, default: 28400 },
  lastUpdated: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export const InverterModel = mongoose.models.Inverter || mongoose.model<IInverter>('Inverter', InverterSchema);
