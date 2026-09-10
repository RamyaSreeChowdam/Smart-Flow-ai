import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, CheckCheck, RefreshCw, Zap } from 'lucide-react';
import { alertsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ALERT_CFG = {
  error:   { icon: AlertTriangle, color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'Failure',  dot: 'bg-red-400' },
  warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  label: 'Warning',  dot: 'bg-yellow-400' },
  success: { icon: CheckCircle,   color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)', label: 'Success',  dot: 'bg-emerald-400' },
  info:    { icon: Info,          color: '#60a5fa', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)',  label: 'Info',     dot: 'bg-blue-400' },
};

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await alertsAPI.getAll();
      setAlerts(res.data.alerts || []);
      setUnread(res.data.unreadCount || 0);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await alertsAPI.markRead(id);
      setAlerts(p => p.map(a => a._id === id ? { ...a, read: true } : a));
      setUnread(p => Math.max(0, p - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts(p => p.map(a => ({ ...a, read: true })));
      setUnread(0);
      toast.success('All alerts marked as read');
    } catch { toast.error('Failed'); }
  };

  const dismiss = async (id, e) => {
    e.stopPropagation();
    try {
      await alertsAPI.delete(id);
      setAlerts(p => {
        const removed = p.find(a => a._id === id);
        if (removed && !removed.read) setUnread(u => Math.max(0, u - 1));
        return p.filter(a => a._id !== id);
      });
    } catch { toast.error('Failed to dismiss'); }
  };

  const handleClick = (alert) => {
    setExpanded(expanded === alert._id ? null : alert._id);
    if (!alert.read) markRead(alert._id);
  };

  return (
    <div className="page-inner space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            Notifications
            {unread > 0 && (
              <span className="text-lg font-black px-3 py-0.5 rounded-full"
                style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.25)', fontSize: '14px' }}>
                {unread} new
              </span>
            )}
          </h1>
          <p className="page-subtitle">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-outline btn-md" id="refresh-alerts">
            <RefreshCw className="w-4 h-4" />
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-outline btn-md" id="mark-all-read">
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ALERT_CFG).map(([type, cfg]) => {
          const count = alerts.filter(a => a.type === type).length;
          const Icon = cfg.icon;
          return (
            <div key={type} className="card p-4 flex items-center gap-3"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.2)' }}>
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: cfg.color }}>{count}</p>
                <p className="text-xs text-slate-600">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card empty-state py-16">
          <div className="empty-icon mb-4">
            <Bell className="w-10 h-10" style={{ color: 'rgba(37,99,235,0.3)' }} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">All clear!</h3>
          <p className="text-slate-600 text-sm">You're all caught up. Alerts appear here when automations need attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const cfg = ALERT_CFG[alert.type] || ALERT_CFG.info;
            const Icon = cfg.icon;
            const isExpanded = expanded === alert._id;
            return (
              <div key={alert._id} id={`alert-${alert._id}`}
                className={`rounded-2xl p-4 cursor-pointer transition-all animate-fade-in-up ${!alert.read ? 'ring-1' : 'opacity-85'}`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  ringColor: alert.read ? 'transparent' : 'rgba(37,99,235,0.2)'
                }}
                onClick={() => handleClick(alert)}>

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${cfg.border}` }}>
                    <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-bold text-sm">{alert.title}</h4>
                        {!alert.read && (
                          <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(0,0,0,0.25)', color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="text-slate-600 text-xs whitespace-nowrap flex-shrink-0">
                        {timeAgo(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{alert.message}</p>
                    {alert.automationName && (
                      <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {alert.automationName}
                      </p>
                    )}

                    {/* Expanded details */}
                    {isExpanded && alert.details && (
                      <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Error Details</p>
                        <p className="text-red-400 text-xs font-mono leading-relaxed">{alert.details}</p>
                      </div>
                    )}
                  </div>

                  {/* Dismiss */}
                  <button id={`dismiss-${alert._id}`}
                    onClick={(e) => dismiss(alert._id, e)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: '#334155' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
