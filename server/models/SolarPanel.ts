import mongoose, { Schema } from 'mongoose';
import { ISolarPanel } from '../types.js';

const SolarPanelSchema = new Schema<ISolarPanel>({
  panelId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  power: { type: Number, required: true },
  efficiency: { type: Number, required: true },
  temperature: { type: Number, required: true },
  status: { type: String, enum: ['Normal', 'Warning', 'Fault', 'Offline'], default: 'Normal' },
  ratedCapacity: { type: Number, default: 450 },
  lastUpdated: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export const SolarPanelModel = mongoose.models.SolarPanel || mongoose.model<ISolarPanel>('SolarPanel', SolarPanelSchema);
