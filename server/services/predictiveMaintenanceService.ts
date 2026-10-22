import { IPredictiveRisk, ISolarPanel, IInverter, IAlert } from '../types.js';

export function calculateInverterRisk(inverter: IInverter, recentAlerts: IAlert[]): IPredictiveRisk {
  let riskScore = 10; // Baseline healthy risk
  const factors: { name: string; impact: 'Low' | 'Moderate' | 'High'; value: string }[] = [];

  // Factor 1: Temperature Threshold (rated safe: < 65°C, warning: 65-75°C, critical: > 75°C)
  if (inverter.temperature > 78) {
    riskScore += 35;
    factors.push({
      name: 'Critical Core Temperature',
      impact: 'High',
      value: `${inverter.temperature}°C (Threshold: 75°C)`
    });
  } else if (inverter.temperature > 65) {
    riskScore += 18;
    factors.push({
      name: 'Elevated Heatsink Temperature',
      impact: 'Moderate',
      value: `${inverter.temperature}°C`
    });
  } else {
    factors.push({
      name: 'Operating Temperature',
      impact: 'Low',
      value: `${inverter.temperature}°C (Optimal)`
    });
  }

  // Factor 2: Conversion Efficiency (rated: ~98.5%)
  if (inverter.efficiency < 92) {
    riskScore += 25;
    factors.push({
      name: 'Severe Inversion Loss',
      impact: 'High',
      value: `${inverter.efficiency}% (Rated: 98.5%)`
    });
  } else if (inverter.efficiency < 96) {
    riskScore += 12;
    factors.push({
      name: 'Moderate Efficiency Sag',
      impact: 'Moderate',
      value: `${inverter.efficiency}%`
    });
  } else {
    factors.push({
      name: 'Conversion Efficiency',
      impact: 'Low',
      value: `${inverter.efficiency}% (High)`
    });
  }

  // Factor 3: Operating Hours (Standard service interval: ~5,000 hrs)
  if (inverter.operatingHours > 6000) {
    riskScore += 15;
    factors.push({
      name: 'High Cumulative Operating Hours',
      impact: 'Moderate',
      value: `${inverter.operatingHours} hrs`
    });
  } else if (inverter.operatingHours > 4000) {
    riskScore += 8;
    factors.push({
      name: 'Mid-lifecycle Runtime',
      impact: 'Low',
      value: `${inverter.operatingHours} hrs`
    });
  }

  // Factor 4: Fault and Alert Frequency
  const deviceAlerts = recentAlerts.filter(a => a.deviceId === inverter.inverterId && a.status === 'Active');
  if (deviceAlerts.length >= 2) {
    riskScore += 20;
    factors.push({
      name: 'Active Alert Incidents',
      impact: 'High',
      value: `${deviceAlerts.length} unresolved alerts`
    });
  } else if (deviceAlerts.length === 1) {
    riskScore += 10;
    factors.push({
      name: 'Active Alert Incident',
      impact: 'Moderate',
      value: `1 unresolved alert`
    });
  }

  // Factor 5: Status Check
  if (inverter.status === 'Offline') {
    riskScore += 30;
    factors.push({
      name: 'Disconnection State',
      impact: 'High',
      value: 'Inverter is completely offline'
    });
  } else if (inverter.status === 'Fault') {
    riskScore += 35;
    factors.push({
      name: 'Active Fault State',
      impact: 'High',
      value: 'Fault tripped on inverter'
    });
  }

  // Clamp risk score to 0 - 100
  riskScore = Math.min(100, Math.max(5, Math.round(riskScore)));

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  let recommendation = 'Unit is operating within normal parameters. Continue standard routine inspection schedule.';

  if (riskScore >= 70) {
    riskLevel = 'High';
    recommendation = 'Urgent: Disconnect unit for diagnostic isolation, verify cooling fans, check DC bridge, and inspect capacitors.';
  } else if (riskScore >= 35) {
    riskLevel = 'Medium';
    recommendation = 'Warning: Schedule preventive inspection within 48-72 hours. Check intake filters and ventilation clearance.';
  }

  return {
    deviceId: inverter.inverterId,
    deviceType: 'inverter',
    riskScore,
    riskLevel,
    recommendation,
    factors
  };
}

export function calculatePanelRisk(panel: ISolarPanel, recentAlerts: IAlert[]): IPredictiveRisk {
  let riskScore = 8;
  const factors: { name: string; impact: 'Low' | 'Moderate' | 'High'; value: string }[] = [];

  // Temperature
  if (panel.temperature > 72) {
    riskScore += 35;
    factors.push({
      name: 'Severe Hotspot Detected',
      impact: 'High',
      value: `${panel.temperature}°C (Safe < 60°C)`
    });
  } else if (panel.temperature > 60) {
    riskScore += 15;
    factors.push({
      name: 'Elevated Junction Temp',
      impact: 'Moderate',
      value: `${panel.temperature}°C`
    });
  } else {
    factors.push({
      name: 'Cell Temperature',
      impact: 'Low',
      value: `${panel.temperature}°C (Optimal)`
    });
  }

  // Efficiency
  if (panel.efficiency < 13) {
    riskScore += 30;
    factors.push({
      name: 'Severe Degradation / Diode Fault',
      impact: 'High',
      value: `${panel.efficiency}% (Rated ~20.5%)`
    });
  } else if (panel.efficiency < 17) {
    riskScore += 15;
    factors.push({
      name: 'Sub-nominal Efficiency',
      impact: 'Moderate',
      value: `${panel.efficiency}%`
    });
  }

  // Power output vs expected
  if (panel.status === 'Fault' || panel.power < 100) {
    riskScore += 25;
    factors.push({
      name: 'Critical Power Drop',
      impact: 'High',
      value: `${panel.power}W (Expected ~400W)`
    });
  }

  const deviceAlerts = recentAlerts.filter(a => a.deviceId === panel.panelId && a.status === 'Active');
  if (deviceAlerts.length > 0) {
    riskScore += 15;
    factors.push({
      name: 'Unresolved Field Alert',
      impact: 'High',
      value: `${deviceAlerts.length} active alerts`
    });
  }

  riskScore = Math.min(100, Math.max(5, Math.round(riskScore)));

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  let recommendation = 'Module is healthy. No intervention required.';

  if (riskScore >= 70) {
    riskLevel = 'High';
    recommendation = 'Dispatch field technician for bypass diode replacement or module swap. Electroluminescence check advised.';
  } else if (riskScore >= 35) {
    riskLevel = 'Medium';
    recommendation = 'Schedule array wash to remove surface dust/soiling and inspect MC4 connectors for loose contact.';
  }

  return {
    deviceId: panel.panelId,
    deviceType: 'panel',
    riskScore,
    riskLevel,
    recommendation,
    factors
  };
}
