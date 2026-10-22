import { Request, Response } from 'express';
import { store } from '../db/store.js';

export async function getReadings(req: Request, res: Response) {
  try {
    const { deviceType, limit, timeframe, startDate, endDate } = req.query;
    let list = [...store.readings];

    if (deviceType) {
      list = list.filter(r => r.deviceType === deviceType);
    }

    const now = Date.now();
    if (timeframe === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      list = list.filter(r => new Date(r.timestamp).getTime() >= startOfDay.getTime());
    } else if (timeframe === '7d') {
      const cut = now - 7 * 86400000;
      list = list.filter(r => new Date(r.timestamp).getTime() >= cut);
    } else if (timeframe === '30d') {
      const cut = now - 30 * 86400000;
      list = list.filter(r => new Date(r.timestamp).getTime() >= cut);
    } else if (startDate && endDate) {
      const start = new Date(startDate as string).getTime();
      const end = new Date(endDate as string).getTime();
      list = list.filter(r => {
        const t = new Date(r.timestamp).getTime();
        return t >= start && t <= end;
      });
    }

    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (limit) {
      list = list.slice(0, Number(limit));
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

export async function getReadingsByDevice(req: Request, res: Response) {
  try {
    const { deviceId } = req.params;
    const list = store.readings
      .filter(r => r.deviceId.toLowerCase() === deviceId.toLowerCase())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return res.json({
      success: true,
      deviceId,
      count: list.length,
      data: list
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
