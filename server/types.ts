export type UserRole = 'admin' | 'operator' | 'user';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export type PanelStatus = 'Normal' | 'Warning' | 'Fault' | 'Offline';
export type InverterStatus = 'Online' | 'Warning' | 'Fault' | 'Offline';

export interface ISolarPanel {
  _id: string;
  panelId: string;
  name: string;
  location: string;
  voltage: number; // Volts (V)
  current: number; // Amperes (A)
  power: number; // Watts (W)
  efficiency: number; // Percentage (%)
  temperature: number; // Celsius (°C)
  status: PanelStatus;
  ratedCapacity?: number; // e.g., 400W
  lastUpdated: string;
  createdAt: string;
}

export interface IInverter {
  _id: string;
  inverterId: string;
  model: string;
  location: string;
  inputVoltage: number; // DC Volts
  outputVoltage: number; // AC Volts (e.g. 230V / 400V)
  power: number; // kW
  temperature: number; // Celsius (°C)
  efficiency: number; // Percentage (%)
  status: InverterStatus;
  operatingHours: number;
  totalEnergyGenerated: number; // kWh
  lastUpdated: string;
  createdAt: string;
}

export interface ISensorReading {
  _id: string;
  deviceId: string;
  deviceType: 'panel' | 'inverter';
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  efficiency: number;
  irradiance: number; // W/m²
  timestamp: string;
}

export interface IWeatherData {
  _id?: string;
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h or m/s
  condition: string; // Sunny, Partly Cloudy, Overcast, Rainy
  cloudCoverage: number; // %
  pressure: number; // hPa
  irradiance: number; // W/m²
  sunrise: string;
  sunset: string;
  uvIndex: number;
  solarImpactDescription?: string;
  timestamp: string;
}

export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'Active' | 'Resolved';

export interface IAlert {
  _id: string;
  alertId: string;
  deviceId: string;
  deviceType?: 'panel' | 'inverter' | 'system';
  type: string;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface IMaintenance {
  _id: string;
  maintenanceId: string;
  deviceId: string;
  deviceType: 'panel' | 'inverter';
  problem: string;
  technician: string;
  priority: MaintenancePriority;
  scheduledDate: string;
  status: MaintenanceStatus;
  description: string;
  completedAt?: string;
  costEstimate?: number;
  createdAt: string;
}

export interface IPredictiveRisk {
  deviceId: string;
  deviceType: 'panel' | 'inverter';
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  factors: {
    name: string;
    impact: 'Low' | 'Moderate' | 'High';
    value: string;
  }[];
}
