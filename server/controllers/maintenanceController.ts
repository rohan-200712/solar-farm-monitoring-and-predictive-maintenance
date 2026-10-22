import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { IMaintenance } from '../types.js';

export async function getMaintenance(req: Request, res: Response) {
  try {
    const { status, priority, deviceId } = req.query;
    let list = [...store.maintenance];

    if (status && status !== 'All') {
      list = list.filter(m => m.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (priority && priority !== 'All') {
      list = list.filter(m => m.priority.toLowerCase() === (priority as string).toLowerCase());
    }

    if (deviceId) {
      list = list.filter(m => m.deviceId.toLowerCase() === (deviceId as string).toLowerCase());
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      count: list.length,
      pendingCount: store.maintenance.filter(m => m.status === 'Scheduled' || m.status === 'In Progress').length,
      data: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createMaintenance(req: Request, res: Response) {
  try {
    const { deviceId, deviceType, problem, technician, priority, scheduledDate, description, costEstimate } = req.body;

    if (!deviceId || !problem || !technician || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Device ID, Problem, Technician, and Scheduled Date are required' });
    }

    const newTicket: IMaintenance = {
      _id: `maint-${Date.now()}`,
      maintenanceId: `MNT-${new Date().getFullYear()}-${(store.maintenance.length + 1).toString().padStart(2, '0')}`,
      deviceId: deviceId.toUpperCase(),
      deviceType: deviceType || (deviceId.startsWith('INV') ? 'inverter' : 'panel'),
      problem,
      technician,
      priority: priority || 'Medium',
      scheduledDate,
      status: 'Scheduled',
      description: description || problem,
      costEstimate: Number(costEstimate) || 250,
      createdAt: new Date().toISOString()
    };

    store.maintenance.unshift(newTicket);

    return res.status(201).json({
      success: true,
      message: 'Maintenance ticket scheduled successfully',
      data: newTicket
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateMaintenance(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.maintenance.findIndex(m => m._id === id || m.maintenanceId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const updated = {
      ...store.maintenance[index],
      ...req.body
    };

    if (req.body.status === 'Completed' && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    }

    store.maintenance[index] = updated;

    return res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteMaintenance(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = store.maintenance.findIndex(m => m._id === id || m.maintenanceId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const deleted = store.maintenance.splice(index, 1)[0];

    return res.json({
      success: true,
      message: `Maintenance ticket ${deleted.maintenanceId} deleted`,
      data: deleted
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
