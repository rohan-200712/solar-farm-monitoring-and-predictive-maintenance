import bcrypt from 'bcryptjs';
import {
  IUser,
  ISolarPanel,
  IInverter,
  ISensorReading,
  IWeatherData,
  IAlert,
  IMaintenance
} from '../types.js';

class DataStore {
  public users: IUser[] = [];
  public panels: ISolarPanel[] = [];
  public inverters: IInverter[] = [];
  public readings: ISensorReading[] = [];
  public weather: IWeatherData[] = [];
  public alerts: IAlert[] = [];
  public maintenance: IMaintenance[] = [];
  private isInitialized = false;

  constructor() {
    this.initDemoData();
  }

  public initDemoData() {
    if (this.isInitialized) return;

    // 1. Pre-seed users
    const salt = bcrypt.genSaltSync(10);
    this.users = [
      {
        _id: 'usr-admin-01',
        name: 'Dr. Sarah Jenkins',
        email: 'admin@solarfarm.com',
        password: bcrypt.hashSync('admin123', salt),
        role: 'admin',
        department: 'Plant Operations & Engineering',
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
      },
      {
        _id: 'usr-op-01',
        name: 'Marcus Vance',
        email: 'operator@solarfarm.com',
        password: bcrypt.hashSync('operator123', salt),
        role: 'operator',
        department: 'Grid Monitoring Center',
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
      },
      {
        _id: 'usr-viewer-01',
        name: 'Elena Rostova',
        email: 'user@solarfarm.com',
        password: bcrypt.hashSync('user123', salt),
        role: 'user',
        department: 'Clean Energy Stakeholder',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        _id: 'usr-admin-rohan',
        name: 'Rohan (Plant Administrator)',
        email: 'rohanrohit79@gmail.com',
        password: bcrypt.hashSync('admin123', salt),
        role: 'admin',
        department: 'Plant Operations & Engineering',
        createdAt: new Date().toISOString()
      }
    ];

    // 2. Pre-seed 20 Solar Panels
    const panelLocations = [
      'Array North - String 1', 'Array North - String 2', 'Array North - String 3', 'Array North - String 4',
      'Array East - String 1', 'Array East - String 2', 'Array East - String 3', 'Array East - String 4',
      'Array South - String 1', 'Array South - String 2', 'Array South - String 3', 'Array South - String 4',
      'Array West - String 1', 'Array West - String 2', 'Array West - String 3', 'Array West - String 4',
      'Rooftop Array 1', 'Rooftop Array 2', 'Substation Array A', 'Substation Array B'
    ];

    this.panels = Array.from({ length: 20 }).map((_, i) => {
      const idNum = i + 1;
      const panelId = `PNL-${idNum.toString().padStart(2, '0')}`;
      const isFaulty = idNum === 4 || idNum === 17;
      const isWarning = idNum === 9 || idNum === 14;
      const isOffline = idNum === 20;

      let status: 'Normal' | 'Warning' | 'Fault' | 'Offline' = 'Normal';
      let voltage = 39.5 + (Math.random() * 2 - 1);
      let current = 9.8 + (Math.random() * 0.8 - 0.4);
      let efficiency = 20.4 + (Math.random() * 1.5 - 0.75);
      let temperature = 42.0 + Math.random() * 6;

      if (isFaulty) {
        status = 'Fault';
        voltage = 21.0;
        current = 3.2;
        efficiency = 11.2;
        temperature = 78.4;
      } else if (isWarning) {
        status = 'Warning';
        voltage = 33.0;
        current = 7.1;
        efficiency = 16.5;
        temperature = 66.8;
      } else if (isOffline) {
        status = 'Offline';
        voltage = 0.0;
        current = 0.0;
        efficiency = 0.0;
        temperature = 24.0;
      }

      const power = Math.round(voltage * current);

      return {
        _id: `panel-${idNum}`,
        panelId,
        name: `Monocrystalline Bifacial ${panelId}`,
        location: panelLocations[i],
        voltage: Number(voltage.toFixed(1)),
        current: Number(current.toFixed(2)),
        power,
        efficiency: Number(efficiency.toFixed(1)),
        temperature: Number(temperature.toFixed(1)),
        status,
        ratedCapacity: 450,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date(Date.now() - (60 - i) * 86400000).toISOString()
      };
    });

    // 3. Pre-seed 5 Inverters
    const inverterConfigs = [
      { id: 'INV-01', model: 'SMA Sunny Tripower CORE2 110kW', loc: 'Inverter Station Alpha', status: 'Online' as const, vIn: 680, vOut: 400, power: 98.4, temp: 52.3, eff: 98.2, hrs: 4210, gen: 142500 },
      { id: 'INV-02', model: 'SolarEdge SE100K High Power', loc: 'Inverter Station Beta', status: 'Online' as const, vIn: 710, vOut: 400, power: 94.8, temp: 54.1, eff: 97.9, hrs: 3890, gen: 131200 },
      { id: 'INV-03', model: 'Fronius Eco 27.0-3-S Dual MPPT', loc: 'Inverter Station Gamma', status: 'Warning' as const, vIn: 590, vOut: 395, power: 64.2, temp: 81.6, eff: 93.1, hrs: 5620, gen: 198400 },
      { id: 'INV-04', model: 'Huawei SUN2000-100KTL-M1', loc: 'Inverter Station Delta', status: 'Online' as const, vIn: 725, vOut: 400, power: 102.1, temp: 49.8, eff: 98.6, hrs: 2150, gen: 76800 },
      { id: 'INV-05', model: 'Schneider Conext CL 60E', loc: 'Auxiliary Substation 2', status: 'Offline' as const, vIn: 0, vOut: 0, power: 0, temp: 28.5, eff: 0, hrs: 6840, gen: 215300 },
    ];

    this.inverters = inverterConfigs.map((cfg, idx) => ({
      _id: `inv-${idx + 1}`,
      inverterId: cfg.id,
      model: cfg.model,
      location: cfg.loc,
      inputVoltage: cfg.vIn,
      outputVoltage: cfg.vOut,
      power: cfg.power,
      temperature: cfg.temp,
      efficiency: cfg.eff,
      status: cfg.status,
      operatingHours: cfg.hrs,
      totalEnergyGenerated: cfg.gen,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString()
    }));

    // 4. Pre-seed Weather Records
    const now = Date.now();
    this.weather = [
      {
        _id: 'w-curr',
        temperature: 28.4,
        humidity: 42,
        windSpeed: 14.5,
        condition: 'Clear Sky / Sunny',
        cloudCoverage: 12,
        pressure: 1013.2,
        irradiance: 890,
        sunrise: '06:14 AM',
        sunset: '06:52 PM',
        uvIndex: 8.2,
        solarImpactDescription: 'Optimal conditions. Low cloud attenuation (~3%) allows near-peak PV generation.',
        timestamp: new Date().toISOString()
      },
      {
        _id: 'w-prev-1',
        temperature: 26.8,
        humidity: 48,
        windSpeed: 11.2,
        condition: 'Partly Cloudy',
        cloudCoverage: 28,
        pressure: 1014.0,
        irradiance: 760,
        sunrise: '06:14 AM',
        sunset: '06:52 PM',
        uvIndex: 7.0,
        solarImpactDescription: 'Mild irradiance scattering with ~12% attenuation from light cumulus clouds.',
        timestamp: new Date(now - 3600000).toISOString()
      }
    ];

    // 5. Pre-seed 120+ Historical & Today Sensor Readings
    this.readings = [];
    // Generate hourly readings for the last 5 days
    for (let h = 120; h >= 0; h -= 2) {
      const readTime = new Date(now - h * 3600000);
      const hourOfDay = readTime.getHours();

      // Realistic solar radiation curve (peaks at 12-13 PM, zero at night)
      let sunMultiplier = 0;
      if (hourOfDay >= 6 && hourOfDay <= 18) {
        sunMultiplier = Math.sin(((hourOfDay - 6) / 12) * Math.PI);
      }
      const irradiance = Math.round(sunMultiplier * 950 + (sunMultiplier > 0 ? (Math.random() * 40 - 20) : 0));

      // Panel telemetry sample
      const pnlPower = Math.round(sunMultiplier * 420);
      const pnlVolt = sunMultiplier > 0 ? 38.5 + (Math.random() * 2) : 0;
      const pnlCurr = sunMultiplier > 0 ? Number(((pnlPower / (pnlVolt || 1))).toFixed(2)) : 0;
      const pnlTemp = Math.round(22 + sunMultiplier * 25 + Math.random() * 3);
      const pnlEff = sunMultiplier > 0 ? Number((20.2 + (Math.random() * 0.8)).toFixed(1)) : 0;

      this.readings.push({
        _id: `rd-pnl-${h}`,
        deviceId: 'PNL-01',
        deviceType: 'panel',
        voltage: Number(pnlVolt.toFixed(1)),
        current: pnlCurr,
        power: pnlPower,
        temperature: pnlTemp,
        efficiency: pnlEff,
        irradiance,
        timestamp: readTime.toISOString()
      });

      // Inverter telemetry sample
      const invPower = Math.round(sunMultiplier * 98.5);
      const invTemp = Math.round(25 + sunMultiplier * 32 + Math.random() * 4);
      const invEff = sunMultiplier > 0 ? Number((98.1 + (Math.random() * 0.4)).toFixed(1)) : 0;

      this.readings.push({
        _id: `rd-inv-${h}`,
        deviceId: 'INV-01',
        deviceType: 'inverter',
        voltage: sunMultiplier > 0 ? 400 : 0,
        current: sunMultiplier > 0 ? Number((invPower * 1000 / 400).toFixed(1)) : 0,
        power: invPower,
        temperature: invTemp,
        efficiency: invEff,
        irradiance,
        timestamp: readTime.toISOString()
      });
    }

    // 6. Pre-seed Alerts
    this.alerts = [
      {
        _id: 'alt-01',
        alertId: 'ALT-1001',
        deviceId: 'INV-03',
        deviceType: 'inverter',
        type: 'High Temperature Threshold',
        severity: 'High',
        message: 'Inverter Station Gamma temperature reached 81.6°C (Threshold: 80°C). Thermal throttling initiated.',
        status: 'Active',
        timestamp: new Date(now - 25 * 60000).toISOString()
      },
      {
        _id: 'alt-02',
        alertId: 'ALT-1002',
        deviceId: 'PNL-04',
        deviceType: 'panel',
        type: 'Low Efficiency Fault',
        severity: 'Critical',
        message: 'Panel PNL-04 efficiency dropped to 11.2% (Threshold: 70% of rated capacity). Possible cell crack or bypass diode failure.',
        status: 'Active',
        timestamp: new Date(now - 110 * 60000).toISOString()
      },
      {
        _id: 'alt-03',
        alertId: 'ALT-1003',
        deviceId: 'INV-05',
        deviceType: 'inverter',
        type: 'Grid Inverter Offline',
        severity: 'Critical',
        message: 'Inverter INV-05 communication lost. DC breaker open or auxiliary power supply disconnected.',
        status: 'Active',
        timestamp: new Date(now - 340 * 60000).toISOString()
      },
      {
        _id: 'alt-04',
        alertId: 'ALT-1004',
        deviceId: 'PNL-14',
        deviceType: 'panel',
        type: 'Abnormal Soiling & Shading',
        severity: 'Medium',
        message: 'String 4 current mismatch of 28% observed between adjacent modules. Cleaning recommended.',
        status: 'Active',
        timestamp: new Date(now - 800 * 60000).toISOString()
      },
      {
        _id: 'alt-05',
        alertId: 'ALT-1005',
        deviceId: 'PNL-09',
        deviceType: 'panel',
        type: 'Elevated Operating Temp',
        severity: 'Low',
        message: 'Panel PNL-09 junction box temperature running 66.8°C under 890 W/m² irradiance.',
        status: 'Resolved',
        timestamp: new Date(now - 1440 * 60000).toISOString(),
        resolvedAt: new Date(now - 600 * 60000).toISOString(),
        resolvedBy: 'Marcus Vance'
      },
      {
        _id: 'alt-06',
        alertId: 'ALT-1006',
        deviceId: 'INV-02',
        deviceType: 'inverter',
        type: 'Grid Voltage Fluctuation',
        severity: 'Medium',
        message: 'AC line voltage momentarily sagged to 382V; automatic ride-through successfully engaged.',
        status: 'Resolved',
        timestamp: new Date(now - 2800 * 60000).toISOString(),
        resolvedAt: new Date(now - 2750 * 60000).toISOString(),
        resolvedBy: 'System Auto-Recovery'
      }
    ];

    // 7. Pre-seed Maintenance Records
    this.maintenance = [
      {
        _id: 'maint-01',
        maintenanceId: 'MNT-2025-01',
        deviceId: 'INV-03',
        deviceType: 'inverter',
        problem: 'Cooling fan degradation and heat sink blockage causing thermal throttle',
        technician: 'David Miller (Certified High-Voltage Tech)',
        priority: 'High',
        scheduledDate: new Date(now + 86400000).toISOString().split('T')[0],
        status: 'Scheduled',
        description: 'Clean external heatsink fins, inspect and replace dual high-RPM ball-bearing cooling fans, reapply thermal compound if necessary.',
        costEstimate: 450,
        createdAt: new Date(now - 18000000).toISOString()
      },
      {
        _id: 'maint-02',
        maintenanceId: 'MNT-2025-02',
        deviceId: 'PNL-04',
        deviceType: 'panel',
        problem: 'Micro-cracking on cell quadrant 2 with failed bypass diode in junction box',
        technician: 'Avery Chen (Solar Field Specialist)',
        priority: 'Critical',
        scheduledDate: new Date(now + 43200000).toISOString().split('T')[0],
        status: 'In Progress',
        description: 'Conduct electroluminescence imaging, replace junction box diode block or swap module with replacement PNL unit from inventory.',
        costEstimate: 320,
        createdAt: new Date(now - 36000000).toISOString()
      },
      {
        _id: 'maint-03',
        maintenanceId: 'MNT-2025-03',
        deviceId: 'INV-05',
        deviceType: 'inverter',
        problem: 'Auxiliary substation breaker trip and control board communication timeout',
        technician: 'David Miller',
        priority: 'High',
        scheduledDate: new Date(now + 172800000).toISOString().split('T')[0],
        status: 'Scheduled',
        description: 'Perform insulation resistance test, verify DC disconnector contacts, update firmware and recalibrate grid monitoring board.',
        costEstimate: 600,
        createdAt: new Date(now - 50000000).toISOString()
      },
      {
        _id: 'maint-04',
        maintenanceId: 'MNT-2025-04',
        deviceId: 'PNL-14',
        deviceType: 'panel',
        problem: 'Periodic cleaning and dust washing for String 4 modules',
        technician: 'Solar Wash Crew Alpha',
        priority: 'Low',
        scheduledDate: new Date(now + 259200000).toISOString().split('T')[0],
        status: 'Scheduled',
        description: 'Automated demineralized water spray wash to restore optical transmittance and eliminate hot spots caused by bird droppings.',
        costEstimate: 150,
        createdAt: new Date(now - 70000000).toISOString()
      },
      {
        _id: 'maint-05',
        maintenanceId: 'MNT-2025-05',
        deviceId: 'INV-01',
        deviceType: 'inverter',
        problem: 'Quarterly preventive maintenance and terminal torque calibration',
        technician: 'Marcus Vance',
        priority: 'Medium',
        scheduledDate: new Date(now - 604800000).toISOString().split('T')[0],
        status: 'Completed',
        description: 'Tightened AC/DC lug connections to 25 Nm specification, checked surge protection devices, cleared debris from intake filters.',
        completedAt: new Date(now - 590000000).toISOString(),
        costEstimate: 200,
        createdAt: new Date(now - 800000000).toISOString()
      }
    ];

    this.isInitialized = true;
  }
}

export const store = new DataStore();
