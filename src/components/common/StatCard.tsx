import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = 'slate',
  badge,
  trend,
  onClick,
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50/70 hover:bg-emerald-50',
      iconBg: 'bg-emerald-500 text-white',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/70 hover:bg-amber-50',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-sky-50/70 hover:bg-sky-50',
      iconBg: 'bg-sky-500 text-white',
      border: 'border-sky-100',
    },
    rose: {
      bg: 'bg-rose-50/70 hover:bg-rose-50',
      iconBg: 'bg-rose-500 text-white',
      border: 'border-rose-100',
    },
    slate: {
      bg: 'bg-white hover:bg-slate-50/60',
      iconBg: 'bg-slate-800 text-white',
      border: 'border-slate-200',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative p-5 rounded-2xl border ${current.border} ${current.bg} shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl shadow-xs ${current.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        {subtitle && <span className="truncate">{subtitle}</span>}
        {badge && <div>{badge}</div>}
        {trend && (
          <span
            className={`inline-flex items-center font-semibold font-mono text-[11px] px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
