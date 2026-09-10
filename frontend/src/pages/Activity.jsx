import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Activity, RefreshCw, Clock, Filter } from 'lucide-react';
import { activityAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Success: { badge: 'badge-success', icon: CheckCircle, iconColor: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)' },
  Failed:  { badge: 'badge-failed',  icon: AlertTriangle, iconColor: 'text-red-400', bg: 'rgba(239,68,68,0.08)' },
  Running: { badge: 'badge-running', icon: Activity, iconColor: 'text-blue-400', bg: 'rgba(59,130,246,0.08)' },
};

const FILTERS = ['All', 'Success', 'Failed', 'Running'];

const formatFull = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};
const formatRelative = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
};

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== 'All') params.status = filter;
      const res = await activityAPI.getLogs(params);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load activity'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-inner space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">{total} execution record{total !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={load} className="btn-outline btn-md self-start sm:self-auto" id="refresh-activity">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl flex-wrap w-fit"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {FILTERS.map(f => (
          <button key={f} id={`filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`filter-tab ${filter === f ? 'active' : ''}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-icon mb-4">
              <Activity className="w-10 h-10" style={{ color: 'rgba(37,99,235,0.3)' }} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No activity found</h3>
            <p className="text-slate-600 text-sm">
              {filter === 'All' ? 'Run an automation to see execution history here.' : `No ${filter} executions found.`}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1e3a5f' }}>
                <div className="col-span-1" />
                <div className="col-span-3">Automation</div>
                <div className="col-span-2 hidden md:block">Action</div>
                <div className="col-span-2 hidden lg:block">Status</div>
                <div className="col-span-2 hidden sm:block">Time</div>
                <div className="col-span-2">Message</div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
              {logs.map((log, i) => {
                const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.Running;
                const Icon = cfg.icon;
                return (
                  <div key={log._id}
                    className="px-5 py-4 grid grid-cols-12 gap-4 items-center transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(37,99,235,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    
                    {/* Icon */}
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: cfg.bg }}>
                        <Icon className={`w-4 h-4 ${cfg.iconColor} ${log.status === 'Running' ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{log.automationName}</p>
                    </div>

                    {/* Action */}
                    <div className="col-span-2 hidden md:block">
                      <p className="text-slate-500 text-sm truncate">{log.action}</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 hidden lg:block">
                      <span className={cfg.badge}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-400' : log.status === 'Failed' ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`} />
                        {log.status}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="col-span-2 hidden sm:block">
                      <p className="text-slate-600 text-xs" title={formatFull(log.executedAt)}>
                        {formatRelative(log.executedAt)}
                      </p>
                    </div>

                    {/* Message */}
                    <div className="col-span-2 min-w-0">
                      <p className={`text-xs truncate ${log.status === 'Failed' ? 'text-red-400' : 'text-slate-600'}`}>
                        {log.message || '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
