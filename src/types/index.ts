export type UserRole = 'admin' | 'operator' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export type PanelStatus = 'Normal' | 'Warning' | 'Fault' | 'Offline';
export type InverterStatus = 'Online' | 'Warning' | 'Fault' | 'Offline';

export interface SolarPanel {
  _id: string;
  panelId: string;
  name: string;
  location: string;
  voltage: number;
  current: number;
  power: number;
  efficiency: number;
  temperature: number;
  status: PanelStatus;
  ratedCapacity?: number;
  lastUpdated: string;
  createdAt: string;
}

export interface Inverter {
  _id: string;
  inverterId: string;
  model: string;
  location: string;
  inputVoltage: number;
  outputVoltage: number;
  power: number;
  temperature: number;
  efficiency: number;
  status: InverterStatus;
  operatingHours: number;
  totalEnergyGenerated: number;
  lastUpdated: string;
  createdAt: string;
  predictiveRisk?: PredictiveRisk;
}

export interface SensorReading {
  _id: string;
  deviceId: string;
  deviceType: 'panel' | 'inverter';
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  efficiency: number;
  irradiance: number;
  timestamp: string;
}

export interface WeatherData {
  _id?: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  cloudCoverage: number;
  pressure: number;
  irradiance: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  solarImpactDescription?: string;
  timestamp: string;
}

export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'Active' | 'Resolved';

export interface Alert {
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

export interface MaintenanceRecord {
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

export interface PredictiveRisk {
  deviceId: string;
  deviceType: 'panel' | 'inverter';
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  factors: {
    name: string;
    impact: 'Low' | 'Moderate' | 'High';
    value: string;
  }[];
}

export interface DashboardKPIs {
  totalPanels: number;
  activePanels: number;
  faultyPanels: number;
  totalInverters: number;
  onlineInverters: number;
  offlineInverters: number;
  currentGenerationKw: number;
  dailyProductionKwh: number;
  monthlyProductionMwh: number;
  avgEfficiency: number;
  currentTemperature: number;
  solarIrradiance: number;
  weatherCondition: string;
  activeAlerts: number;
  pendingMaintenance: number;
}
