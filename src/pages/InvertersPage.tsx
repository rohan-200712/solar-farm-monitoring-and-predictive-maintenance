import React, { useState, useEffect } from 'react';
import { invertersApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Inverter, InverterStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { Modal } from '../components/common/Modal.js';
import {
  Cpu,
  Zap,
  Thermometer,
  Gauge,
  Clock,
  Activity,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

interface InvertersPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const InvertersPage: React.FC<InvertersPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const { liveData } = useSocket();
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInverter, setEditingInverter] = useState<Inverter | null>(null);
  const [formData, setFormData] = useState({
    inverterId: '',
    model: 'SMA Sunny Central 1000CP',
    location: 'Inverter Station Central',
    inputVoltage: 680,
    outputVoltage: 400,
    power: 78.5,
    temperature: 52.0,
    efficiency: 98.4,
    status: 'Online' as InverterStatus,
  });

  const fetchInverters = async () => {
    try {
      setIsLoading(true);
      const res = await invertersApi.getAll();
      if (res.data.success) {
        setInverters(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInverters();
  }, []);

  // Update inverters dynamically from live telemetry
  useEffect(() => {
    if (liveData?.inverters && liveData.inverters.length > 0) {
      setInverters(prev =>
        prev.map(inv => {
          const live = liveData.inverters?.find((li: any) => li.inverterId === inv.inverterId);
          return live ? { ...inv, ...live } : inv;
        })
      );
    }
  }, [liveData]);

  const handleOpenAddModal = () => {
    setEditingInverter(null);
    setFormData({
      inverterId: `INV-${String(inverters.length + 1).padStart(2, '0')}`,
      model: 'SMA Sunny Central 1000CP',
      location: `Inverter Station North-${inverters.length + 1}`,
      inputVoltage: 690,
      outputVoltage: 400,
      power: 80.0,
      temperature: 50.0,
      efficiency: 98.5,
      status: 'Online',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inv: Inverter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInverter(inv);
    setFormData({
      inverterId: inv.inverterId,
      model: inv.model,
      location: inv.location,
      inputVoltage: inv.inputVoltage,
      outputVoltage: inv.outputVoltage,
      power: inv.power,
      temperature: inv.temperature,
      efficiency: inv.efficiency,
      status: inv.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteInverter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to decommission this inverter unit?')) return;
    try {
      await invertersApi.delete(id);
      setInverters(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveInverter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInverter) {
        const res = await invertersApi.update(editingInverter._id, formData);
        if (res.data.success) {
          setInverters(prev => prev.map(i => (i._id === editingInverter._id ? res.data.data : i)));
        }
      } else {
        const res = await invertersApi.create(formData);
        if (res.data.success) {
          setInverters(prev => [...prev, res.data.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Grid Inverter Stations ({inverters.length} Units)
          </h1>
          <p className="text-xs text-slate-500">
            Three-phase central inverter converters stepping up DC string voltage to 400V AC grid potential
          </p>
        </div>

        {(role === 'admin' || role === 'operator') && (
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Commission Inverter</span>
          </button>
        )}
      </div>

      {/* Inverter Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading inverter stations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inverters.map(inv => {
            const risk = inv.predictiveRisk;
            const isCritical = inv.status === 'Fault' || (risk && risk.riskLevel === 'High');

            return (
              <div
                key={inv._id}
                onClick={() => onNavigate('inverter-details', inv._id)}
                className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isCritical ? 'border-rose-300 hover:border-rose-400' : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                          {inv.inverterId}
                        </span>
                        <StatusBadge status={inv.status} size="sm" />
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{inv.model}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.location}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                  </div>

                  {/* 2x2 Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 my-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">AC Power Output</div>
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {inv.power} kW
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Conversion Eff.</div>
                      <div className="font-mono font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                        {inv.efficiency}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Core Temp</div>
                      <div className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Thermometer
                          className={`w-3.5 h-3.5 ${inv.temperature > 75 ? 'text-rose-500' : 'text-slate-500'}`}
                        />
                        {inv.temperature}°C
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Operating Hours</div>
                      <div className="font-mono text-slate-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {inv.operatingHours.toLocaleString()} hrs
                      </div>
                    </div>
                  </div>

                  {/* Predictive Risk Micro-Badge */}
                  {risk && (
                    <div
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-3 border ${
                        risk.riskLevel === 'High'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : risk.riskLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Risk: {risk.riskScore}% ({risk.riskLevel})
                      </span>
                      <span className="text-[10px] underline">Inspect factors</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Gen: {inv.totalEnergyGenerated.toLocaleString()} kWh
                  </span>

                  <div className="flex items-center gap-1">
                    {(role === 'admin' || role === 'operator') && (
                      <button
                        onClick={e => handleOpenEditModal(inv, e)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100"
                        title="Edit Inverter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {role === 'admin' && (
                      <button
                        onClick={e => handleDeleteInverter(inv._id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                        title="Decommission Inverter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs ml-1">
                      Diagnostics <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Inverter Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInverter ? `Edit Inverter ${editingInverter.inverterId}` : 'Commission Inverter Unit'}
        subtitle="Specify inverter station parameters and grid bus ratings"
      >
        <form onSubmit={handleSaveInverter} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inverter Identifier</label>
              <input
                type="text"
                required
                disabled={!!editingInverter}
                value={formData.inverterId}
                onChange={e => setFormData({ ...formData, inverterId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model / Manufacturer</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Station Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grid Feeder Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as InverterStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
              >
                <option value="Online">Online</option>
                <option value="Warning">Warning</option>
                <option value="Fault">Fault</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Input DC (V)</label>
              <input
                type="number"
                required
                value={formData.inputVoltage}
                onChange={e => setFormData({ ...formData, inputVoltage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Output AC (V)</label>
              <input
                type="number"
                required
                value={formData.outputVoltage}
                onChange={e => setFormData({ ...formData, outputVoltage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Power (kW)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.power}
                onChange={e => setFormData({ ...formData, power: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Core Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
            >
              {editingInverter ? 'Save Changes' : 'Commission Station'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
