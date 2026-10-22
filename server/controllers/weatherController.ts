import { Request, Response } from 'express';
import { fetchCurrentWeather } from '../services/weatherService.js';
import { store } from '../db/store.js';

export async function getWeather(req: Request, res: Response) {
  try {
    const current = await fetchCurrentWeather();
    const history = store.weather.slice(0, 10);

    return res.json({
      success: true,
      data: current,
      history
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
