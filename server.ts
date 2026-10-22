import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/db/database.js';
import { store } from './server/db/store.js';
import { initTelemetrySimulator } from './server/services/telemetrySimulator.js';

import authRoutes from './server/routes/authRoutes.js';
import panelRoutes from './server/routes/panelRoutes.js';
import inverterRoutes from './server/routes/inverterRoutes.js';
import readingRoutes from './server/routes/readingRoutes.js';
import alertRoutes from './server/routes/alertRoutes.js';
import maintenanceRoutes from './server/routes/maintenanceRoutes.js';
import weatherRoutes from './server/routes/weatherRoutes.js';
import analyticsRoutes from './server/routes/analyticsRoutes.js';
import userRoutes from './server/routes/userRoutes.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  // Enable middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to Database and verify demo seed data
  await connectDB();
  store.initDemoData();

  // Socket.io connection lifecycle
  io.on('connection', socket => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Send immediate initial state
    socket.emit('telemetry:init', {
      timestamp: new Date().toISOString(),
      panelsCount: store.panels.length,
      invertersCount: store.inverters.length,
      activeAlertsCount: store.alerts.filter(a => a.status === 'Active').length,
      inverters: store.inverters
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // Start background IoT telemetry generator
  initTelemetrySimulator(io);

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Solar Farm Monitoring & Predictive Maintenance API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/panels', panelRoutes);
  app.use('/api/inverters', inverterRoutes);
  app.use('/api/readings', readingRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/users', userRoutes);

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[SolarFarm Web App] Server is running!`);
    console.log(`[SolarFarm Web App] Open in browser: http://localhost:${PORT}`);
    console.log(`[SolarFarm Web App] Network binding: http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server Fatal] Failed to start server:', err);
});
