import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from './models/User.js';
import { SolarPanelModel } from './models/SolarPanel.js';
import { InverterModel } from './models/Inverter.js';
import { SensorReadingModel } from './models/SensorReading.js';
import { WeatherModel } from './models/Weather.js';
import { AlertModel } from './models/Alert.js';
import { MaintenanceModel } from './models/Maintenance.js';
import { store } from './db/store.js';

dotenv.config();

export async function seedDatabase() {
  console.log('--- [SEED] Starting Solar Farm Database Seeding ---');

  const mongoUri = process.env.MONGO_URI;
  let isMongoConnected = false;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[SEED] Connected to MongoDB at:', mongoUri);
      isMongoConnected = true;
    } catch (e: any) {
      console.warn('[SEED] Could not connect to MongoDB (' + e.message + '). Seeding active in-memory / JSON store.');
    }
  } else {
    console.log('[SEED] No MONGO_URI provided in .env, seeding default runtime store.');
  }

  // Ensure store data is initialized
  store.initDemoData();

  if (isMongoConnected) {
    try {
      // Clear existing collections
      await Promise.all([
        UserModel.deleteMany({}),
        SolarPanelModel.deleteMany({}),
        InverterModel.deleteMany({}),
        SensorReadingModel.deleteMany({}),
        WeatherModel.deleteMany({}),
        AlertModel.deleteMany({}),
        MaintenanceModel.deleteMany({})
      ]);

      // Insert Seed Data from store
      await UserModel.insertMany(store.users);
      await SolarPanelModel.insertMany(store.panels);
      await InverterModel.insertMany(store.inverters);
      await SensorReadingModel.insertMany(store.readings);
      await WeatherModel.insertMany(store.weather);
      await AlertModel.insertMany(store.alerts);
      await MaintenanceModel.insertMany(store.maintenance);

      console.log(`[SEED] Success! Seeded MongoDB with:
        - ${store.users.length} Users
        - ${store.panels.length} Solar Panels
        - ${store.inverters.length} Inverters
        - ${store.readings.length} Sensor Readings
        - ${store.weather.length} Weather Records
        - ${store.alerts.length} Alerts
        - ${store.maintenance.length} Maintenance Records`);

      await mongoose.disconnect();
    } catch (dbErr: any) {
      console.error('[SEED] Error seeding MongoDB:', dbErr.message);
    }
  } else {
    console.log(`[SEED] In-memory datastore successfully initialized with:
      - ${store.users.length} Users
      - ${store.panels.length} Solar Panels
      - ${store.inverters.length} Inverters
      - ${store.readings.length} Sensor Readings
      - ${store.weather.length} Weather Records
      - ${store.alerts.length} Alerts
      - ${store.maintenance.length} Maintenance Records`);
  }

  console.log('--- [SEED] Completed Successfully ---');
}

// If executed directly via `npm run seed` or `tsx server/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
