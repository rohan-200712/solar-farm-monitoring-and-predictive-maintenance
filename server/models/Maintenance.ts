import mongoose, { Schema } from 'mongoose';
import { IMaintenance } from '../types.js';

const MaintenanceSchema = new Schema<IMaintenance>({
  maintenanceId: { type: String, required: true, unique: true, index: true },
  deviceId: { type: String, required: true, index: true },
  deviceType: { type: String, enum: ['panel', 'inverter'], required: true },
  problem: { type: String, required: true },
  technician: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  scheduledDate: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
  description: { type: String, required: true },
  completedAt: { type: String },
  costEstimate: { type: Number },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export const MaintenanceModel = mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
