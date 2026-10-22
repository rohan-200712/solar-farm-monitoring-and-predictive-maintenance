import React from 'react';
import { useSocket } from '../../context/SocketContext.js';
import { Radio } from 'lucide-react';

export const LiveIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isConnected } = useSocket();

  return (
    <div
      id="live-telemetry-indicator"
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
        isConnected
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
          : 'bg-slate-100 text-slate-500 border-slate-200'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        ></span>
      </span>
      <span className="flex items-center gap-1 font-mono uppercase tracking-wider">
        <Radio className="w-3 h-3" />
        {isConnected ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  );
};
