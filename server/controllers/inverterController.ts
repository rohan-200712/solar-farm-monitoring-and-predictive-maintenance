import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { calculateInverterRisk } from '../services/predictiveMaintenanceService.js';
import { IInverter } from '../types.js';

export async function getInverters(req: Request, res: Response) {
  try {
    const { status, search } = req.query;
    let list = [...store.inverters];

    if (status && status !== 'All') {
      list = list.filter(i => i.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(i => i.inverterId.toLowerCase().includes(q) || i.model.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
    }

    // Attach current predictive risk score to each inverter
    const enriched = list.map(inv => ({
      ...inv,
      predictiveRisk: calculateInverterRisk(inv, store.alerts)
    }));

    return res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getInverterById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const inverter = store.inverters.find(i => i._id === id || i.inverterId === id);

    if (!inverter) {
      return res.status(404).json({ success: false, message: 'Inverter not found' });
    }

    const historicalReadings = store.readings.filter(r => r.deviceId === inverter.inverterId).slice(-40);
    const alerts = store.alerts.filter(a => a.deviceId === inverter.inverterId);
    const maintenance = store.maintenance.filter(m => m.deviceId === inverter.inverterId);
    const predictiveRisk = calculateInverterRisk(inverter, store.alerts);

    return res.json({
      success: true,
      data: {
        ...inverter,
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

export async function createInverter(req: Request, res: Response) {
  try {
    const { inverterId, model, location, inputVoltage, outputVoltage, power, efficiency, temperature, operatingHours } = req.body;

    if (!inverterId || !model || !location) {
      return res.status(400).json({ success: false, message: 'Inverter ID, Model, and Location are required' });
    }

    const exists = store.inverters.some(i => i.inverterId.toLowerCase() === inverterId.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: `Inverter with ID '${inverterId}' already exists` });
    }

    const newInverter: IInverter = {
      _id: `inv-${Date.now()}`,
      inverterId: inverterId.toUpperCase(),
      model,
      location,
      inputVoltage: Number(inputVoltage) || 700,
      outputVoltage: Number(outputVoltage) || 400,
      power: Number(power) || 95.0,
      temperature: Number(temperature) || 52.0,
      efficiency: Number(efficiency) || 98.2,
      status: 'Online',
      operatingHours: Number(operatingHours) || 100,
      totalEnergyGenerated: 1200,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    store.inverters.push(newInverter);

    return res.status(201).json({
      success: true,
      message: 'Inverter registered successfully',
      data: newInverter
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateInverter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.inverters.findIndex(i => i._id === id || i.inverterId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Inverter not found' });
    }

    const updated = {
      ...store.inverters[index],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };

    store.inverters[index] = updated;

    return res.json({
      success: true,
      message: 'Inverter updated successfully',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteInverter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.inverters.findIndex(i => i._id === id || i.inverterId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Inverter not found' });
    }

    const deleted = store.inverters.splice(index, 1)[0];

    return res.json({
      success: true,
      message: `Inverter ${deleted.inverterId} deleted successfully`,
      data: deleted
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
