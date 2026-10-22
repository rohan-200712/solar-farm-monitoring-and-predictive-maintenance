import React from 'react';
import { PredictiveRisk } from '../../types/index.js';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  risk: PredictiveRisk;
  showFactors?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk, showFactors = true }) => {
  const { riskScore, riskLevel, recommendation, factors } = risk;

  let color = 'emerald';
  let Icon = ShieldCheck;
  let textClass = 'text-emerald-700';
  let bgClass = 'bg-emerald-50 border-emerald-200';
  let barColor = 'bg-emerald-500';

  if (riskLevel === 'High' || riskScore >= 70) {
    color = 'rose';
    Icon = ShieldAlert;
    textClass = 'text-rose-700';
    bgClass = 'bg-rose-50 border-rose-200';
    barColor = 'bg-rose-500';
  } else if (riskLevel === 'Medium' || riskScore >= 35) {
    color = 'amber';
    Icon = AlertTriangle;
    textClass = 'text-amber-700';
    bgClass = 'bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
  }

  return (
    <div id={`risk-gauge-${risk.deviceId}`} className={`p-4 rounded-xl border ${bgClass} transition-all`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${barColor} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Predictive Failure Risk</h4>
            <p className="text-xs text-slate-500">Real-time health degradation assessment</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">
            {riskScore}%
          </div>
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${textClass}`}>
            Risk: {riskScore}% – {riskLevel}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${barColor} transition-all duration-700 rounded-full`}
          style={{ width: `${riskScore}%` }}
        />
      </div>

      <div className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-slate-200/60 mb-3">
        <span className="font-semibold text-slate-900">Recommendation: </span>
        {recommendation}
      </div>

      {showFactors && factors && factors.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Risk Factor Breakdown:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {factors.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-white border border-slate-200"
              >
                <span className="text-slate-600 truncate mr-2">{f.name}</span>
                <span
                  className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                    f.impact === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : f.impact === 'Moderate'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
