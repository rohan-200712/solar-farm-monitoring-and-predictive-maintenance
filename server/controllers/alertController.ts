import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { triggerManualSpike } from '../services/telemetrySimulator.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getAlerts(req: Request, res: Response) {
  try {
    const { status, severity } = req.query;
    let list = [...store.alerts];

    if (status && status !== 'All') {
      list = list.filter(a => a.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (severity && severity !== 'All') {
      list = list.filter(a => a.severity.toLowerCase() === (severity as string).toLowerCase());
    }

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      success: true,
      count: list.length,
      activeCount: store.alerts.filter(a => a.status === 'Active').length,
      data: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateAlert(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const alert = store.alerts.find(a => a._id === id || a.alertId === id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (req.body.status) {
      alert.status = req.body.status;
      if (req.body.status === 'Resolved') {
        alert.resolvedAt = new Date().toISOString();
        alert.resolvedBy = req.user?.name || 'Operator';
      }
    }

    return res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function triggerTestSpike(req: Request, res: Response) {
  try {
    const { deviceId, type } = req.body;
    triggerManualSpike(deviceId || 'INV-03', type || 'heat');

    return res.json({
      success: true,
      message: `Simulated ${type || 'heat'} spike triggered on ${deviceId || 'INV-03'}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
