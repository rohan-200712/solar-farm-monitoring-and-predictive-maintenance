import mongoose, { Schema } from 'mongoose';
import { IWeatherData } from '../types.js';

const WeatherSchema = new Schema<IWeatherData>({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  condition: { type: String, required: true },
  cloudCoverage: { type: Number, required: true },
  pressure: { type: Number, required: true },
  irradiance: { type: Number, required: true },
  sunrise: { type: String, default: '06:12 AM' },
  sunset: { type: String, default: '06:48 PM' },
  uvIndex: { type: Number, default: 7.5 },
  solarImpactDescription: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString(), index: true }
});

export const WeatherModel = mongoose.models.Weather || mongoose.model<IWeatherData>('Weather', WeatherSchema);
