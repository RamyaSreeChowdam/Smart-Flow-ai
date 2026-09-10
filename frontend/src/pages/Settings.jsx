import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Zap, LogOut, Save, Cpu, Check, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Toggle({ checked, onChange, id }) {
  return (
    <button id={id} type="button" onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 transition-colors duration-200"
      style={{ background: checked ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.08)' }}>
      <span className="inline-block w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.15)' }}>
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between py-1 gap-4">
      <div>
        <p className="text-white text-sm font-semibold">{label}</p>
        <p className="text-slate-600 text-xs mt-0.5">{desc}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [notifs, setNotifs] = useState(user?.notificationPreferences || {
    email: true, browser: true, failureAlerts: true, successAlerts: false
  });
  const [autoPrefs, setAutoPrefs] = useState(user?.automationPreferences || {
    defaultFrequency: 'Daily', autoRetry: true, maxRetries: 3
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    setSaving(true);
    try {
      const res = await authAPI.updateSettings({
        name: name.trim(),
        notificationPreferences: notifs,
        automationPreferences: autoPrefs
      });
      if (updateUser) updateUser(res.data.user);
      setSaved(true);
      toast.success('Settings saved successfully!');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-inner">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences and platform settings</p>
        </div>

        {/* Profile card */}
        <Section title="User Profile" icon={User}>
          {/* Avatar block */}
          <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-white font-bold">{user?.name}</p>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Active Account</span>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="settings-name">Display Name</label>
            <input id="settings-name" type="text" value={name}
              onChange={e => setName(e.target.value)}
              className="form-input" placeholder="Your full name" />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <div className="relative">
              <input type="email" value={user?.email || ''} disabled
                className="form-input opacity-40 cursor-not-allowed" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-medium">Locked</div>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notification Preferences" icon={Bell}>
          <ToggleRow id="notif-email" label="Email Notifications" desc="Receive alerts via email" checked={notifs.email} onChange={v => setNotifs(p => ({ ...p, email: v }))} />
          <div className="divider" />
          <ToggleRow id="notif-browser" label="Browser Notifications" desc="Show in-browser push alerts" checked={notifs.browser} onChange={v => setNotifs(p => ({ ...p, browser: v }))} />
          <div className="divider" />
          <ToggleRow id="notif-failure" label="Failure Alerts" desc="Alert when an automation fails" checked={notifs.failureAlerts} onChange={v => setNotifs(p => ({ ...p, failureAlerts: v }))} />
          <div className="divider" />
          <ToggleRow id="notif-success" label="Success Alerts" desc="Notify on successful completions" checked={notifs.successAlerts} onChange={v => setNotifs(p => ({ ...p, successAlerts: v }))} />
        </Section>

        {/* Automation Prefs */}
        <Section title="Automation Defaults" icon={Zap}>
          <div>
            <label className="form-label" htmlFor="default-freq">Default Frequency</label>
            <select id="default-freq" value={autoPrefs.defaultFrequency}
              onChange={e => setAutoPrefs(p => ({ ...p, defaultFrequency: e.target.value }))}
              className="form-select">
              <option>Once</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="divider" />
          <ToggleRow id="auto-retry" label="Auto-Retry on Failure" desc="Automatically retry failed automations" checked={autoPrefs.autoRetry} onChange={v => setAutoPrefs(p => ({ ...p, autoRetry: v }))} />
          {autoPrefs.autoRetry && (
            <div>
              <label className="form-label" htmlFor="max-retries">Max Retry Attempts</label>
              <select id="max-retries" value={autoPrefs.maxRetries}
                onChange={e => setAutoPrefs(p => ({ ...p, maxRetries: parseInt(e.target.value) }))}
                className="form-select">
                {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n} attempt{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          )}
        </Section>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button id="save-settings" onClick={handleSave} disabled={saving}
            className="btn-primary btn-lg flex-1 justify-center">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
          <button id="logout-btn" onClick={handleLogout} className="btn-danger btn-lg flex-1 justify-center">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* Version footer */}
        <div className="text-center pb-4">
          <div className="inline-flex items-center gap-2 text-slate-700 text-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>SmartFlow AI v1.0 · Hackathon Edition · Built with ❤️ using React + Node.js + MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
