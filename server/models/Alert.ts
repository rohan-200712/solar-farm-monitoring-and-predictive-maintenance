import mongoose, { Schema } from 'mongoose';
import { IAlert } from '../types.js';

const AlertSchema = new Schema<IAlert>({
  alertId: { type: String, required: true, unique: true, index: true },
  deviceId: { type: String, required: true, index: true },
  deviceType: { type: String, enum: ['panel', 'inverter', 'system'], default: 'panel' },
  type: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  resolvedAt: { type: String },
  resolvedBy: { type: String }
});

export const AlertModel = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
