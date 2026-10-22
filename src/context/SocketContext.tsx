import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket.js';
import { alertsApi } from '../services/api.js';

interface LiveTelemetryData {
  timestamp: string;
  irradiance: number;
  totalGenerationKw: number;
  panelsCount: number;
  activePanelsCount: number;
  faultyPanelsCount: number;
  invertersCount: number;
  onlineInvertersCount: number;
  panels?: any[];
  inverters?: any[];
}

interface SocketContextType {
  isConnected: boolean;
  liveData: LiveTelemetryData | null;
  lastAlert: any | null;
  triggerDemoSpike: (deviceId: string, type: 'heat' | 'fault') => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<LiveTelemetryData | null>(null);
  const [lastAlert, setLastAlert] = useState<any | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleTelemetry = (data: LiveTelemetryData) => {
      setLiveData(data);
    };

    const handleAlert = (alertData: any) => {
      setLastAlert(alertData);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('telemetry:update', handleTelemetry);
    socket.on('telemetry:init', (data: any) => {
      setLiveData(prev => ({
        ...prev,
        ...data,
        totalGenerationKw: prev?.totalGenerationKw || 360,
        irradiance: prev?.irradiance || 880,
      }));
    });
    socket.on('alert:new', handleAlert);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('telemetry:update', handleTelemetry);
      socket.off('alert:new', handleAlert);
    };
  }, []);

  const triggerDemoSpike = async (deviceId: string, type: 'heat' | 'fault') => {
    try {
      await alertsApi.triggerSpike({ deviceId, type });
    } catch (e) {
      console.error('Failed to trigger spike', e);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        liveData,
        lastAlert,
        triggerDemoSpike,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
}
