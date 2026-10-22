import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { calculatePanelRisk } from '../services/predictiveMaintenanceService.js';
import { ISolarPanel } from '../types.js';

export async function getPanels(req: Request, res: Response) {
  try {
    const { status, search } = req.query;
    let list = [...store.panels];

    if (status && status !== 'All') {
      list = list.filter(p => p.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(p => p.panelId.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPanelById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const panel = store.panels.find(p => p._id === id || p.panelId === id);

    if (!panel) {
      return res.status(404).json({ success: false, message: 'Solar panel not found' });
    }

    // Historical readings for this panel
    const historicalReadings = store.readings.filter(r => r.deviceId === panel.panelId).slice(-40);

    // Fault & Alert history
    const alerts = store.alerts.filter(a => a.deviceId === panel.panelId);

    // Maintenance history
    const maintenance = store.maintenance.filter(m => m.deviceId === panel.panelId);

    // Predictive Risk
    const predictiveRisk = calculatePanelRisk(panel, store.alerts);

    return res.json({
      success: true,
      data: {
        ...panel,
        historicalReadings,
        alerts,
        maintenance,
        predictiveRisk
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPanel(req: Request, res: Response) {
  try {
    const { panelId, name, location, voltage, current, efficiency, temperature, ratedCapacity } = req.body;

    if (!panelId || !name || !location) {
      return res.status(400).json({ success: false, message: 'Panel ID, Name, and Location are required' });
    }

    const exists = store.panels.some(p => p.panelId.toLowerCase() === panelId.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: `Panel with ID '${panelId}' already exists` });
    }

    const v = Number(voltage) || 40.0;
    const c = Number(current) || 9.5;
    const power = Math.round(v * c);

    const newPanel: ISolarPanel = {
      _id: `panel-${Date.now()}`,
      panelId: panelId.toUpperCase(),
      name,
      location,
      voltage: v,
      current: c,
      power,
      efficiency: Number(efficiency) || 20.2,
      temperature: Number(temperature) || 42.0,
      status: 'Normal',
      ratedCapacity: Number(ratedCapacity) || 450,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    store.panels.push(newPanel);

    return res.status(201).json({
      success: true,
      message: 'Solar panel registered successfully',
      data: newPanel
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updatePanel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.panels.findIndex(p => p._id === id || p.panelId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Solar panel not found' });
    }

    const updated = {
      ...store.panels[index],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };

    if (req.body.voltage !== undefined || req.body.current !== undefined) {
      updated.power = Math.round((updated.voltage || 0) * (updated.current || 0));
    }

    store.panels[index] = updated;

    return res.json({
      success: true,
      message: 'Solar panel updated successfully',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePanel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.panels.findIndex(p => p._id === id || p.panelId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Solar panel not found' });
    }

    const deleted = store.panels.splice(index, 1)[0];

    return res.json({
      success: true,
      message: `Panel ${deleted.panelId} deleted successfully`,
      data: deleted
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
