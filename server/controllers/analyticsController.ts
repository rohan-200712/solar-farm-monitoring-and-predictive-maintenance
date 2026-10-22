import { Request, Response } from 'express';
import { store } from '../db/store.js';

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const totalPanels = store.panels.length;
    const activePanels = store.panels.filter(p => p.status === 'Normal').length;
    const faultyPanels = store.panels.filter(p => p.status === 'Fault' || p.status === 'Warning').length;

    const totalInverters = store.inverters.length;
    const onlineInverters = store.inverters.filter(i => i.status === 'Online').length;
    const offlineInverters = store.inverters.filter(i => i.status === 'Offline' || i.status === 'Fault').length;

    // Current Generation
    const currentGenerationKw = Number(
      store.inverters
        .reduce((sum, inv) => sum + (inv.status === 'Online' || inv.status === 'Warning' ? inv.power : 0), 0)
        .toFixed(1)
    );

    // Daily & Monthly Production calculations
    const dailyProductionKwh = Math.round(currentGenerationKw * 5.8 + 1420);
    const monthlyProductionMwh = Number(((dailyProductionKwh * 29.5) / 1000).toFixed(1));

    // Average panel efficiency
    const normalPanels = store.panels.filter(p => p.status !== 'Offline');
    const avgEfficiency = normalPanels.length > 0
      ? Number((normalPanels.reduce((sum, p) => sum + p.efficiency, 0) / normalPanels.length).toFixed(1))
      : 0;

    // Current Weather
    const currentWeather = store.weather[0] || {
      temperature: 28.4,
      condition: 'Sunny',
      irradiance: 890,
      cloudCoverage: 12
    };

    const activeAlerts = store.alerts.filter(a => a.status === 'Active').length;
    const pendingMaintenance = store.maintenance.filter(m => m.status === 'Scheduled' || m.status === 'In Progress').length;

    // Generation Graph (Hourly today, 06:00 to 18:00)
    const hourlyGeneration = [
      { time: '06:00', generation: 22, irradiance: 95, efficiency: 19.8, temp: 21 },
      { time: '07:00', generation: 75, irradiance: 280, efficiency: 20.1, temp: 23 },
      { time: '08:00', generation: 165, irradiance: 470, efficiency: 20.4, temp: 26 },
      { time: '09:00', generation: 245, irradiance: 640, efficiency: 20.5, temp: 29 },
      { time: '10:00', generation: 320, irradiance: 790, efficiency: 20.3, temp: 33 },
      { time: '11:00', generation: 380, irradiance: 910, efficiency: 20.1, temp: 38 },
      { time: '12:00', generation: 412, irradiance: 960, efficiency: 19.9, temp: 42 },
      { time: '13:00', generation: 418, irradiance: 980, efficiency: 19.8, temp: 44 },
      { time: '14:00', generation: 395, irradiance: 920, efficiency: 19.7, temp: 45 },
      { time: '15:00', generation: 340, irradiance: 800, efficiency: 19.9, temp: 43 },
      { time: '16:00', generation: 250, irradiance: 620, efficiency: 20.2, temp: 39 },
      { time: '17:00', generation: 140, irradiance: 390, efficiency: 20.3, temp: 34 },
      { time: '18:00', generation: 45, irradiance: 140, efficiency: 20.0, temp: 29 },
    ];

    // Daily production past 7 days (kWh)
    const weeklyProduction = [
      { day: 'Mon', actual: 2340, expected: 2400, irradiance: 880 },
      { day: 'Tue', actual: 2520, expected: 2450, irradiance: 920 },
      { day: 'Wed', actual: 1890, expected: 2400, irradiance: 690 }, // Rainy / cloudy
      { day: 'Thu', actual: 2480, expected: 2420, irradiance: 905 },
      { day: 'Fri', actual: 2610, expected: 2480, irradiance: 940 },
      { day: 'Sat', actual: 2550, expected: 2500, irradiance: 915 },
      { day: 'Sun', actual: dailyProductionKwh, expected: 2450, irradiance: currentWeather.irradiance }
    ];

    // Monthly production past 6 months (MWh)
    const monthlyProduction = [
      { month: 'Apr', production: 64.2, baseline: 62.0 },
      { month: 'May', production: 74.8, baseline: 71.5 },
      { month: 'Jun', production: 81.5, baseline: 79.0 },
      { month: 'Jul', production: 84.1, baseline: 82.0 },
      { month: 'Aug', production: 79.3, baseline: 77.0 },
      { month: 'Sep', production: monthlyProductionMwh, baseline: 70.0 }
    ];

    // Panel strings efficiency comparison
    const arrayPerformance = [
      { string: 'Array North', efficiency: 20.6, output: 96.2, panels: 4 },
      { string: 'Array East', efficiency: 20.4, output: 95.8, panels: 4 },
      { string: 'Array South', efficiency: 19.8, output: 93.1, panels: 4 },
      { string: 'Array West', efficiency: 20.2, output: 94.7, panels: 4 },
      { string: 'Rooftop & Sub', efficiency: 17.5, output: 78.4, panels: 4 }
    ];

    // Fault trend over 6 months
    const faultTrend = [
      { month: 'Apr', critical: 1, high: 2, medium: 4 },
      { month: 'May', critical: 0, high: 3, medium: 5 },
      { month: 'Jun', critical: 2, high: 4, medium: 7 },
      { month: 'Jul', critical: 1, high: 2, medium: 3 },
      { month: 'Aug', critical: 3, high: 5, medium: 8 },
      { month: 'Sep', critical: 2, high: 3, medium: 4 }
    ];

    return res.json({
      success: true,
      kpis: {
        totalPanels,
        activePanels,
        faultyPanels,
        totalInverters,
        onlineInverters,
        offlineInverters,
        currentGenerationKw,
        dailyProductionKwh,
        monthlyProductionMwh,
        avgEfficiency,
        currentTemperature: currentWeather.temperature,
        solarIrradiance: currentWeather.irradiance,
        weatherCondition: currentWeather.condition,
        activeAlerts,
        pendingMaintenance
      },
      charts: {
        hourlyGeneration,
        weeklyProduction,
        monthlyProduction,
        arrayPerformance,
        faultTrend
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getEnergyAnalytics(req: Request, res: Response) {
  try {
    const { period } = req.query; // 'day' | 'week' | 'month' | 'year'

    const hourly = [
      { hour: '06:00', generation: 22, irradiance: 95, ambientTemp: 21, panelTemp: 23 },
      { hour: '07:00', generation: 75, irradiance: 280, ambientTemp: 23, panelTemp: 27 },
      { hour: '08:00', generation: 165, irradiance: 470, ambientTemp: 26, panelTemp: 32 },
      { hour: '09:00', generation: 245, irradiance: 640, ambientTemp: 29, panelTemp: 38 },
      { hour: '10:00', generation: 320, irradiance: 790, ambientTemp: 33, panelTemp: 44 },
      { hour: '11:00', generation: 380, irradiance: 910, ambientTemp: 38, panelTemp: 52 },
      { hour: '12:00', generation: 412, irradiance: 960, ambientTemp: 42, panelTemp: 58 },
      { hour: '13:00', generation: 418, irradiance: 980, ambientTemp: 44, panelTemp: 60 },
      { hour: '14:00', generation: 395, irradiance: 920, ambientTemp: 45, panelTemp: 59 },
      { hour: '15:00', generation: 340, irradiance: 800, ambientTemp: 43, panelTemp: 53 },
      { hour: '16:00', generation: 250, irradiance: 620, ambientTemp: 39, panelTemp: 46 },
      { hour: '17:00', generation: 140, irradiance: 390, ambientTemp: 34, panelTemp: 38 },
      { hour: '18:00', generation: 45, irradiance: 140, ambientTemp: 29, panelTemp: 31 },
    ];

    return res.json({
      success: true,
      period: period || 'day',
      data: hourly
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getEfficiencyAnalytics(req: Request, res: Response) {
  try {
    const panels = store.panels.map(p => ({
      id: p.panelId,
      name: p.name,
      efficiency: p.efficiency,
      status: p.status,
      temperature: p.temperature
    }));

    const inverters = store.inverters.map(i => ({
      id: i.inverterId,
      model: i.model,
      efficiency: i.efficiency,
      status: i.status,
      temperature: i.temperature
    }));

    return res.json({
      success: true,
      data: { panels, inverters }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFaultAnalytics(req: Request, res: Response) {
  try {
    const alertsBySeverity = {
      Critical: store.alerts.filter(a => a.severity === 'Critical').length,
      High: store.alerts.filter(a => a.severity === 'High').length,
      Medium: store.alerts.filter(a => a.severity === 'Medium').length,
      Low: store.alerts.filter(a => a.severity === 'Low').length
    };

    const alertsByType: Record<string, number> = {};
    store.alerts.forEach(a => {
      alertsByType[a.type] = (alertsByType[a.type] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        total: store.alerts.length,
        active: store.alerts.filter(a => a.status === 'Active').length,
        resolved: store.alerts.filter(a => a.status === 'Resolved').length,
        bySeverity: alertsBySeverity,
        byType: alertsByType
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
