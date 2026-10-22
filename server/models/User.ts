import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types.js';

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator', 'user'], default: 'user' },
  department: { type: String, default: 'Operations' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
