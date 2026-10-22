import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Sun, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('admin@solarfarm.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      onNavigate('dashboard');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  const handleDemo = async (role: 'admin' | 'operator' | 'user') => {
    setIsLoading(true);
    setError(null);
    const res = await demoLogin(role);
    setIsLoading(false);
    if (res?.success) {
      onNavigate('dashboard');
    } else {
      setError(res?.message || 'Login failed');
    }
  };

  const applyCredentials = (newEmail: string, newPass: string) => {
    setEmail(newEmail);
    setPassword(newPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 cursor-pointer group mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
            <Sun className="w-6 h-6 fill-slate-950" />
          </div>
          <span className="text-xl font-black tracking-wider text-white">SOLARGUARD</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Sign in to Solar Farm Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter credentials or choose an instant pre-seeded role account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Quick Fill Presets:</span>
              <span className="text-[10px] text-amber-400 lowercase font-normal">click to load</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyCredentials('admin@solarfarm.com', 'admin123')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 rounded-lg border border-slate-700 font-medium cursor-pointer transition-colors"
              >
                Admin (Dr. Jenkins)
              </button>
              <button
                type="button"
                onClick={() => applyCredentials('rohanrohit79@gmail.com', 'admin123')}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-[11px] text-amber-200 rounded-lg border border-amber-500/30 font-medium cursor-pointer transition-colors"
              >
                Rohan (Admin)
              </button>
              <button
                type="button"
                onClick={() => applyCredentials('operator@solarfarm.com', 'operator123')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-sky-300 rounded-lg border border-slate-700 font-medium cursor-pointer transition-colors"
              >
                Operator (Marcus)
              </button>
              <button
                type="button"
                onClick={() => applyCredentials('user@solarfarm.com', 'user123')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-300 rounded-lg border border-slate-700 font-medium cursor-pointer transition-colors"
              >
                Viewer (Elena)
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@solarfarm.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-hidden transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Section */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click College Demo Accounts
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Demo (Dr. Sarah Jenkins)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">admin@solarfarm.com • admin123</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('operator')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-bold text-sky-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Operator Demo (Marcus Vance)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">operator@solarfarm.com • operator123</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                  OPERATOR
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('user')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Viewer Demo (Elena Rostova)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">user@solarfarm.com • user123</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  VIEWER
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Create Operator Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
