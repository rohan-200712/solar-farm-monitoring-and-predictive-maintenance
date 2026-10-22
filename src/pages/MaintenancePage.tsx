import React, { useState, useEffect } from 'react';
import { maintenanceApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  MaintenanceRecord,
  MaintenancePriority,
  MaintenanceStatus,
} from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { Modal } from '../components/common/Modal.js';
import {
  Wrench,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const { role } = useAuth();
  const [tasks, setTasks] = useState<MaintenanceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState({
    maintenanceId: '',
    deviceId: 'PNL-04',
    deviceType: 'panel' as 'panel' | 'inverter',
    problem: '',
    technician: 'David Miller',
    priority: 'Medium' as MaintenancePriority,
    scheduledDate: new Date().toISOString().slice(0, 10),
    status: 'Scheduled' as MaintenanceStatus,
    description: '',
    costEstimate: 250,
  });

  const fetchMaintenance = async () => {
    try {
      setIsLoading(true);
      const res = await maintenanceApi.getAll();
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormData({
      maintenanceId: `MNT-${String(tasks.length + 1).padStart(3, '0')}`,
      deviceId: 'PNL-02',
      deviceType: 'panel',
      problem: 'Surface dust soiling and optical cleaning',
      technician: 'Sarah Conner',
      priority: 'Medium',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      status: 'Scheduled',
      description: 'Perform demineralized water pressure wash and IV curve trace inspection.',
      costEstimate: 180,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: MaintenanceRecord) => {
    setEditingTask(task);
    setFormData({
      maintenanceId: task.maintenanceId,
      deviceId: task.deviceId,
      deviceType: task.deviceType,
      problem: task.problem,
      technician: task.technician,
      priority: task.priority,
      scheduledDate: task.scheduledDate,
      status: task.status,
      description: task.description,
      costEstimate: task.costEstimate || 200,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const res = await maintenanceApi.update(editingTask._id, formData);
        if (res.data.success) {
          setTasks(prev => prev.map(t => (t._id === editingTask._id ? res.data.data : t)));
        }
      } else {
        const res = await maintenanceApi.create(formData);
        if (res.data.success) {
          setTasks(prev => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: MaintenanceStatus) => {
    try {
      const res = await maintenanceApi.update(taskId, { status: newStatus });
      if (res.data.success) {
        setTasks(prev => prev.map(t => (t._id === taskId ? res.data.data : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      t.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.technician.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: tasks.length,
    scheduled: tasks.filter(t => t.status === 'Scheduled').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Maintenance Management &amp; Work Orders
          </h1>
          <p className="text-xs text-slate-500">
            Track corrective repairs, scheduled panel cleanings, and inverter ventilation inspections
          </p>
        </div>

        {(role === 'admin' || role === 'operator') && (
          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Total Work Orders</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{counts.all}</div>
          <div className="text-[11px] text-slate-500 mt-1">Farm lifetime tickets</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Scheduled Queue</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">{counts.scheduled}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting dispatch</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">In Progress</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{counts.inProgress}</div>
          <div className="text-[11px] text-slate-500 mt-1">Field engineers active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Completed</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{counts.completed}</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified restored</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Tasks', count: counts.all },
            { id: 'scheduled', label: 'Scheduled', count: counts.scheduled },
            { id: 'in progress', label: 'In Progress', count: counts.inProgress },
            { id: 'completed', label: 'Completed', count: counts.completed },
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

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search device, problem, technician..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading maintenance schedule...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No work orders match the filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map(task => (
              <div
                key={task._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {task.maintenanceId}
                    </span>
                    <span className="font-mono font-bold text-xs text-amber-700">{task.deviceId}</span>
                    <StatusBadge status={task.priority} size="sm" />
                    <StatusBadge status={task.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{task.problem}</h3>
                  <p className="text-xs text-slate-600">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Date: {task.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Tech: {task.technician}
                    </span>
                    {task.costEstimate && (
                      <span className="font-mono font-semibold text-slate-700">
                        Est: ${task.costEstimate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                {(role === 'admin' || role === 'operator') && (
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    {task.status === 'Scheduled' && (
                      <button
                        onClick={() => handleQuickStatusChange(task._id, 'In Progress')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Start Work
                      </button>
                    )}
                    {task.status === 'In Progress' && (
                      <button
                        onClick={() => handleQuickStatusChange(task._id, 'Completed')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Complete Task
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Edit Work Order"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? `Edit Work Order ${editingTask.maintenanceId}` : 'Create Maintenance Work Order'}
        subtitle="Assign technicians, set priority, and schedule field repairs"
      >
        <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Device ID</label>
              <input
                type="text"
                required
                value={formData.deviceId}
                onChange={e => setFormData({ ...formData, deviceId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Device Type</label>
              <select
                value={formData.deviceType}
                onChange={e => setFormData({ ...formData, deviceType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
              >
                <option value="panel">Solar Panel</option>
                <option value="inverter">Inverter Station</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Problem Title</label>
            <input
              type="text"
              required
              value={formData.problem}
              onChange={e => setFormData({ ...formData, problem: e.target.value })}
              placeholder="e.g. Diode replacement / String cleaning"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Field Tech</label>
              <input
                type="text"
                required
                value={formData.technician}
                onChange={e => setFormData({ ...formData, technician: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description &amp; Procedures</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
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
              {editingTask ? 'Save Changes' : 'Schedule Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
