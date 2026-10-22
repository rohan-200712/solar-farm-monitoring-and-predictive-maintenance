import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Sun,
  Shield,
  Activity,
  Cpu,
  CloudSun,
  Wrench,
  ArrowRight,
  Database,
  Radio,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { demoLogin } = useAuth();

  const handleDemo = async (role: 'admin' | 'operator' | 'user') => {
    await demoLogin(role);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Public Topbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <Sun className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-white">SOLARGUARD</span>
              <span className="block text-[10px] text-amber-400 font-mono font-semibold">FSD MERN MONITORING</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Real-Time IoT Telemetry &amp; Fault Prediction</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Solar Farm Monitoring &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                Predictive Maintenance
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
              A comprehensive Full Stack MERN platform unifying solar panel telemetry, central inverter health,
              atmospheric OpenWeather data, automated threshold alert triggers, and transparent failure risk prediction.
            </p>

            {/* Instant Demo Launch Buttons */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl max-w-2xl mx-auto mb-10">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Instant College Demo Access (1-Click Login):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleDemo('admin')}
                  className="px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex flex-col items-center justify-center cursor-pointer shadow-md"
                >
                  <span>Admin Mode</span>
                  <span className="text-[10px] opacity-80">Full Control &amp; Users</span>
                </button>
                <button
                  onClick={() => handleDemo('operator')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs transition-all flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>Operator Mode</span>
                  <span className="text-[10px] text-slate-400">Telemetry &amp; Maintenance</span>
                </button>
                <button
                  onClick={() => handleDemo('user')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>Viewer Mode</span>
                  <span className="text-[10px] text-slate-400">Read-Only Analytics</span>
                </button>
              </div>
            </div>

            {/* Quick Live Preview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="text-xs text-slate-400">Monitored Panels</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">20 Modules</div>
                <div className="text-[11px] text-emerald-400 mt-1">4 Field Arrays</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="text-xs text-slate-400">Grid Inverters</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">5 Stations</div>
                <div className="text-[11px] text-sky-400 mt-1">98.2% Avg Efficiency</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="text-xs text-slate-400">Real-Time Sync</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">Socket.io</div>
                <div className="text-[11px] text-amber-400 mt-1">4s Telemetry Cycle</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="text-xs text-slate-400">Predictive Engine</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">Risk Rules</div>
                <div className="text-[11px] text-emerald-400 mt-1">Degradation Scoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Overview */}
      <section className="py-16 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Full Stack MERN Architecture</h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed according to academic Full Stack Development standards with clean role separation,
              Mongoose schemas, and real-time event streaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">MongoDB &amp; Mongoose Models</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean schemas for Users, Solar Panels, Inverters, Sensor Readings, Atmospheric Weather,
                Threshold Alerts, and Scheduled Maintenance records with seed automation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Node.js, Express &amp; Socket.io</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure JWT authentication, bcrypt password hashing, role-based protection, RESTful CRUD APIs,
                and bidirectional real-time sensor telemetry broadcasting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">React, Recharts &amp; OpenWeather</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                14+ functional responsive pages with interactive generation curves, efficiency gauges,
                solar irradiance analysis, CSV export, and predictive risk meters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>Solar Farm Monitoring &amp; Predictive Maintenance System • Full Stack Development (FSD) Project</p>
        <p className="mt-1 text-slate-600">Built with MongoDB, Express.js, React.js, Node.js, Socket.io, Recharts &amp; Tailwind CSS</p>
      </footer>
    </div>
  );
};
