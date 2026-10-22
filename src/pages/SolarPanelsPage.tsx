import React, { useState, useEffect } from 'react';
import { panelsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { SolarPanel, PanelStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { Modal } from '../components/common/Modal.js';
import {
  Grid,
  List,
  Search,
  Plus,
  Zap,
  Thermometer,
  Gauge,
  Activity,
  ArrowRight,
  Filter,
  Edit2,
  Trash2,
} from 'lucide-react';

interface SolarPanelsPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const SolarPanelsPage: React.FC<SolarPanelsPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const { liveData } = useSocket();
  const [panels, setPanels] = useState<SolarPanel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<SolarPanel | null>(null);
  const [formData, setFormData] = useState({
    panelId: '',
    name: '',
    location: 'String A1',
    voltage: 48.5,
    current: 8.5,
    efficiency: 21.0,
    temperature: 38.0,
    status: 'Normal' as PanelStatus,
  });

  const fetchPanels = async () => {
    try {
      setIsLoading(true);
      const res = await panelsApi.getAll();
      if (res.data.success) {
        setPanels(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  // Update panels with live telemetry if available
  useEffect(() => {
    if (liveData?.panels && liveData.panels.length > 0) {
      setPanels(prev =>
        prev.map(p => {
          const live = liveData.panels?.find((lp: any) => lp.panelId === p.panelId);
          return live ? { ...p, ...live } : p;
        })
      );
    }
  }, [liveData]);

  const filteredPanels = panels.filter(panel => {
    const matchesSearch =
      panel.panelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panel.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || panel.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: panels.length,
    normal: panels.filter(p => p.status === 'Normal').length,
    warning: panels.filter(p => p.status === 'Warning').length,
    fault: panels.filter(p => p.status === 'Fault').length,
    offline: panels.filter(p => p.status === 'Offline').length,
  };

  const handleOpenAddModal = () => {
    setEditingPanel(null);
    setFormData({
      panelId: `PNL-${String(panels.length + 1).padStart(2, '0')}`,
      name: `Solar Module ${panels.length + 1}`,
      location: 'String D5',
      voltage: 48.0,
      current: 8.2,
      efficiency: 20.5,
      temperature: 36.0,
      status: 'Normal',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: SolarPanel, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPanel(p);
    setFormData({
      panelId: p.panelId,
      name: p.name,
      location: p.location,
      voltage: p.voltage,
      current: p.current,
      efficiency: p.efficiency,
      temperature: p.temperature,
      status: p.status,
    });
    setIsModalOpen(true);
  };

  const handleDeletePanel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to decommission and remove this solar panel?')) return;
    try {
      await panelsApi.delete(id);
      setPanels(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePanel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPanel) {
        const res = await panelsApi.update(editingPanel._id, formData);
        if (res.data.success) {
          setPanels(prev => prev.map(p => (p._id === editingPanel._id ? res.data.data : p)));
        }
      } else {
        const res = await panelsApi.create(formData);
        if (res.data.success) {
          setPanels(prev => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Solar Panel Array Management ({panels.length} Monitored Modules)
          </h1>
          <p className="text-xs text-slate-500">
            Real-time module level power electronics (MLPE), string voltage, current, and cell temperature
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'admin' || role === 'operator') && (
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Panels', count: counts.all },
            { id: 'normal', label: 'Normal', count: counts.normal },
            { id: 'warning', label: 'Warning', count: counts.warning },
            { id: 'fault', label: 'Fault', count: counts.fault },
            { id: 'offline', label: 'Offline', count: counts.offline },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ID, model, or string..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Panel Listing: Grid View vs Table View */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading solar panels...</div>
      ) : filteredPanels.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          No solar panels matching your filter criteria.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPanels.map(panel => (
            <div
              key={panel._id}
              onClick={() => onNavigate('panel-details', panel._id)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {panel.panelId}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{panel.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{panel.location}</div>
                  </div>
                  <StatusBadge status={panel.status} size="sm" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Power</div>
                    <div className="font-mono font-bold text-slate-900 flex items-center gap-0.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {panel.power} W
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Efficiency</div>
                    <div className="font-mono font-bold text-slate-900 flex items-center gap-0.5">
                      <Gauge className="w-3 h-3 text-emerald-500" />
                      {panel.efficiency}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Voltage / Current</div>
                    <div className="font-mono text-slate-700 text-[11px]">
                      {panel.voltage}V • {panel.current}A
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Cell Temp</div>
                    <div className="font-mono font-bold text-slate-900 flex items-center gap-0.5">
                      <Thermometer className="w-3 h-3 text-rose-500" />
                      {panel.temperature}°C
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(panel.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>

                <div className="flex items-center gap-1">
                  {(role === 'admin' || role === 'operator') && (
                    <button
                      onClick={e => handleOpenEditModal(panel, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Panel Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={e => handleDeletePanel(panel._id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Decommission Panel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-amber-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px] ml-1">
                    Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Panel ID &amp; Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Voltage (V)</th>
                  <th className="px-4 py-3">Current (A)</th>
                  <th className="px-4 py-3">Power (W)</th>
                  <th className="px-4 py-3">Efficiency (%)</th>
                  <th className="px-4 py-3">Cell Temp (°C)</th>
                  <th className="px-4 py-3">Last Sync</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPanels.map(panel => (
                  <tr
                    key={panel._id}
                    onClick={() => onNavigate('panel-details', panel._id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900">{panel.panelId}</div>
                      <div className="text-[11px] text-slate-500">{panel.name} • {panel.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={panel.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{panel.voltage} V</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{panel.current} A</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-600">{panel.power} W</td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-600">{panel.efficiency}%</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{panel.temperature}°C</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(panel.lastUpdated).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        {(role === 'admin' || role === 'operator') && (
                          <button
                            onClick={e => handleOpenEditModal(panel, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {role === 'admin' && (
                          <button
                            onClick={e => handleDeletePanel(panel._id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onNavigate('panel-details', panel._id)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Panel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPanel ? `Edit Solar Panel ${editingPanel.panelId}` : 'Add New Photovoltaic Module'}
        subtitle="Configure module telemetry attributes and string assignment"
      >
        <form onSubmit={handleSavePanel} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Panel Identifier</label>
              <input
                type="text"
                required
                disabled={!!editingPanel}
                value={formData.panelId}
                onChange={e => setFormData({ ...formData, panelId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Module Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">String Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as PanelStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
              >
                <option value="Normal">Normal</option>
                <option value="Warning">Warning</option>
                <option value="Fault">Fault</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Voltage (V)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.voltage}
                onChange={e => setFormData({ ...formData, voltage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current (A)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.current}
                onChange={e => setFormData({ ...formData, current: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Efficiency (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.efficiency}
                onChange={e => setFormData({ ...formData, efficiency: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cell Temp (°C)</label>
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
              {editingPanel ? 'Save Changes' : 'Create Module'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
