import { Server as SocketIOServer } from 'socket.io';
import { store } from '../db/store.js';
import { IAlert } from '../types.js';

let ioInstance: SocketIOServer | null = null;
let simulationInterval: NodeJS.Timeout | null = null;

export function initTelemetrySimulator(io: SocketIOServer) {
  ioInstance = io;

  if (simulationInterval) {
    clearInterval(simulationInterval);
  }

  // Broadcast live telemetry updates every 4 seconds
  simulationInterval = setInterval(() => {
    simulateTelemetryCycle();
  }, 4000);

  console.log('[TelemetrySimulator] Real-time sensor simulator started (4-second interval).');
}

export function simulateTelemetryCycle() {
  if (!ioInstance) return;

  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  let baseIrradianceFactor = 0;
  if (hour >= 6 && hour <= 18) {
    baseIrradianceFactor = Math.sin(((hour - 6) / 12) * Math.PI);
  } else {
    baseIrradianceFactor = 0.05; // Ambient faint night light or testing value
  }

  const irradiance = Math.max(10, Math.round(baseIrradianceFactor * 940 + (Math.random() * 30 - 15)));

  // 1. Update Panels with small micro-fluctuations
  const updatedPanels = store.panels.map(panel => {
    if (panel.status === 'Offline') return panel;

    // Small jitter
    const jitter = (Math.random() - 0.5) * 0.4;
    const tempJitter = (Math.random() - 0.5) * 0.3;

    if (panel.status === 'Normal') {
      const v = Math.max(30, Math.min(45, panel.voltage + jitter * 0.5));
      const c = Math.max(5, Math.min(12, panel.current + jitter * 0.2));
      const eff = Math.max(18, Math.min(22.5, panel.efficiency + jitter * 0.1));
      const temp = Math.max(35, Math.min(62, panel.temperature + tempJitter));
      const power = Math.round(v * c);

      panel.voltage = Number(v.toFixed(1));
      panel.current = Number(c.toFixed(2));
      panel.power = power;
      panel.efficiency = Number(eff.toFixed(1));
      panel.temperature = Number(temp.toFixed(1));
      panel.lastUpdated = new Date().toISOString();
    } else if (panel.status === 'Warning') {
      panel.temperature = Number(Math.min(74, Math.max(64, panel.temperature + tempJitter)).toFixed(1));
      panel.lastUpdated = new Date().toISOString();
    }

    // Check Threshold: Panel Temp > 75°C
    if (panel.temperature >= 75 && panel.status !== 'Fault') {
      triggerAutomaticAlert({
        alertId: `ALT-${Date.now().toString().slice(-4)}`,
        deviceId: panel.panelId,
        deviceType: 'panel',
        type: 'Panel Thermal Threshold Exceeded',
        severity: 'High',
        message: `Panel ${panel.panelId} cell temperature reached ${panel.temperature}°C (Limit: 75°C). Thermal runaway risk.`,
        status: 'Active',
        timestamp: new Date().toISOString()
      });
    }

    return panel;
  });

  // 2. Update Inverters
  const updatedInverters = store.inverters.map(inv => {
    if (inv.status === 'Offline') return inv;

    const jitter = (Math.random() - 0.5) * 0.6;
    if (inv.status === 'Online') {
      inv.power = Number(Math.max(40, Math.min(110, inv.power + jitter)).toFixed(1));
      inv.temperature = Number(Math.max(45, Math.min(68, inv.temperature + jitter * 0.3)).toFixed(1));
      inv.lastUpdated = new Date().toISOString();
    } else if (inv.status === 'Warning') {
      inv.temperature = Number(Math.max(76, Math.min(84, inv.temperature + jitter * 0.4)).toFixed(1));
      inv.lastUpdated = new Date().toISOString();

      if (inv.temperature >= 80) {
        triggerAutomaticAlert({
          alertId: `ALT-${Date.now().toString().slice(-4)}`,
          deviceId: inv.inverterId,
          deviceType: 'inverter',
          type: 'Inverter Over-temperature',
          severity: 'Critical',
          message: `Inverter ${inv.inverterId} reached ${inv.temperature}°C! Cooling system failure detected.`,
          status: 'Active',
          timestamp: new Date().toISOString()
        });
      }
    }
    return inv;
  });

  // 3. Store high-frequency sample reading
  if (store.readings.length > 300) {
    store.readings.splice(0, 10);
  }
  const samplePanel = store.panels[0];
  store.readings.push({
    _id: `rd-live-${Date.now()}`,
    deviceId: samplePanel.panelId,
    deviceType: 'panel',
    voltage: samplePanel.voltage,
    current: samplePanel.current,
    power: samplePanel.power,
    temperature: samplePanel.temperature,
    efficiency: samplePanel.efficiency,
    irradiance,
    timestamp: new Date().toISOString()
  });

  // Calculate live summary
  const totalGenerationKw = Number(
    (store.inverters.reduce((acc, inv) => acc + (inv.status === 'Online' || inv.status === 'Warning' ? inv.power : 0), 0)).toFixed(1)
  );

  // Broadcast to all connected clients
  ioInstance.emit('telemetry:update', {
    timestamp: new Date().toISOString(),
    irradiance,
    totalGenerationKw,
    panelsCount: store.panels.length,
    activePanelsCount: store.panels.filter(p => p.status === 'Normal').length,
    faultyPanelsCount: store.panels.filter(p => p.status === 'Fault' || p.status === 'Warning').length,
    invertersCount: store.inverters.length,
    onlineInvertersCount: store.inverters.filter(i => i.status === 'Online').length,
    panels: updatedPanels.slice(0, 8), // quick subset for high-speed streaming
    inverters: updatedInverters
  });
}

export function triggerAutomaticAlert(alert: Omit<IAlert, '_id'> & { _id?: string }) {
  const fullAlert: IAlert = {
    _id: alert._id || `alt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...alert
  };

  // Prevent duplicate spamming of identical alerts within 1 minute
  const exists = store.alerts.some(
    a => a.deviceId === fullAlert.deviceId && a.type === fullAlert.type && a.status === 'Active'
  );
  if (!exists) {
    store.alerts.unshift(fullAlert);
    if (ioInstance) {
      ioInstance.emit('alert:new', fullAlert);
    }
  }
}

export function triggerManualSpike(deviceId: string, type: 'heat' | 'fault' | 'offline') {
  if (type === 'heat') {
    const inv = store.inverters.find(i => i.inverterId === deviceId);
    if (inv) {
      inv.temperature = 82.5;
      inv.status = 'Warning';
      triggerAutomaticAlert({
        alertId: `ALT-${Date.now().toString().slice(-4)}`,
        deviceId: inv.inverterId,
        deviceType: 'inverter',
        type: 'Inverter Over-temperature',
        severity: 'Critical',
        message: `Simulated High Temp spike on ${inv.inverterId}: Core running at 82.5°C`,
        status: 'Active',
        timestamp: new Date().toISOString()
      });
    }
  } else if (type === 'fault') {
    const pnl = store.panels.find(p => p.panelId === deviceId);
    if (pnl) {
      pnl.status = 'Fault';
      pnl.efficiency = 10.5;
      pnl.power = 95;
      triggerAutomaticAlert({
        alertId: `ALT-${Date.now().toString().slice(-4)}`,
        deviceId: pnl.panelId,
        deviceType: 'panel',
        type: 'Module Efficiency Collapse',
        severity: 'Critical',
        message: `Simulated Fault on ${pnl.panelId}: Cell degradation dropping yield to 10.5%`,
        status: 'Active',
        timestamp: new Date().toISOString()
      });
    }
  }
  if (ioInstance) {
    simulateTelemetryCycle();
  }
}
