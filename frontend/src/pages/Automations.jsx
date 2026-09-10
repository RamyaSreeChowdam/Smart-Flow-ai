import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Play, Pause, Pencil, Trash2, Plus, RefreshCw, Clock,
  CheckCircle, AlertTriangle, Activity, Search, Filter, Sparkles,
  Bot, ArrowRight, ShieldCheck, Cpu, ChevronRight, Layers, Workflow
} from 'lucide-react';
import { automationsAPI } from '../services/api';
import ExecutionModal from '../components/ExecutionModal';
import toast from 'react-hot-toast';

const triggerEmoji = { 'Schedule': '🕐', 'File Added': '📁', 'New Task': '📋', 'Manual Trigger': '⚡', 'Low Inventory': '📦' };
const actionEmoji  = { 'Generate Report': '📊', 'Send Notification': '🔔', 'Send Email': '📧', 'Create Task': '✅', 'Update Record': '🔄', 'Send Restock Request': '🚚' };

/* ── Pre-Configured AI Workflow Templates ── */
const AI_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: 'AI Lead Scoring & Instant Qualification',
    trigger: 'Manual Trigger',
    action: 'Generate Report',
    frequency: 'Daily',
    tag: 'Sales Intelligence',
    badgeColor: 'rgba(37,99,235,0.2)',
    tagColor: '#60a5fa',
    desc: 'Evaluates prospect buying signals and scores deals 0-100 with automated executive notifications.'
  },
  {
    id: 'tmpl-2',
    name: 'High-Value Deal Closer Escalation',
    trigger: 'Schedule',
    action: 'Send Notification',
    frequency: 'Daily',
    tag: 'Revenue Acceleration',
    badgeColor: 'rgba(16,185,129,0.2)',
    tagColor: '#34d399',
    desc: 'Monitors deals above $50k in proposal stage and triggers high-priority closing alerts.'
  },
  {
    id: 'tmpl-3',
    name: 'Customer Churn Prevention & Retention',
    trigger: 'Schedule',
    action: 'Send Email',
    frequency: 'Weekly',
    tag: 'Retention AI',
    badgeColor: 'rgba(239,68,68,0.2)',
    tagColor: '#f87171',
    desc: 'Detects 14-day inactivity drops and automatically sends personalized VIP re-engagement offers.'
  },
  {
    id: 'tmpl-4',
    name: 'Daily Executive Sales Briefing',
    trigger: 'Schedule',
    action: 'Generate Report',
    frequency: 'Daily',
    tag: 'Operations',
    badgeColor: 'rgba(168,85,247,0.2)',
    tagColor: '#c084fc',
    desc: 'Aggregates 24-hour pipeline conversion metrics and delivers an automated morning performance summary.'
  }
];

function StatusBadge({ status }) {
  const cfg = {
    Active: 'badge-active', Inactive: 'badge-inactive',
    Running: 'badge-running', Failed: 'badge-failed'
  };
  return (
    <span className={cfg[status] || 'badge-inactive'}>
      <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-emerald-400' : status === 'Running' ? 'bg-blue-400 animate-pulse' : status === 'Failed' ? 'bg-red-400' : 'bg-slate-500'}`} />
      {status}
    </span>
  );
}

function SuccessRing({ rate }) {
  const r = 18, circ = 2 * Math.PI * r;
  const dash = circ * (rate / 100);
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" className="flex-shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
      <circle cx="24" cy="24" r={r} fill="none"
        stroke={rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444'}
        strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      <text x="24" y="28" textAnchor="middle" fontSize="10.5" fontWeight="800"
        fill={rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444'}>
        {rate}%
      </text>
    </svg>
  );
}

const formatDate = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatNext = (d) => {
  if (!d) return '—';
  const diff = new Date(d) - Date.now();
  if (diff < 0) return 'Overdue';
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export default function Automations() {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [runningIds, setRunningIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [execModal, setExecModal] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await automationsAPI.getAll();
      setAutomations(res.data.automations || []);
    } catch {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = (auto) => {
    setExecModal(auto);
  };

  const handleExecComplete = (resultData) => {
    if (resultData?.automation) {
      setAutomations(prev => prev.map(a =>
        a._id === execModal?._id
          ? { ...a, ...resultData.automation, status: 'Active' }
          : a
      ));
    }
  };

  const handleExecClose = () => {
    setExecModal(null);
    load();
  };

  const handleToggle = async (id) => {
    try {
      const res = await automationsAPI.toggle(id);
      setAutomations(p => p.map(a => a._id === id ? { ...a, status: res.data.status } : a));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to toggle automation');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await automationsAPI.delete(id);
      setAutomations(p => p.filter(a => a._id !== id));
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete automation');
    }
  };

  /* Deploy a single template */
  const handleDeployTemplate = async (tmpl) => {
    try {
      await automationsAPI.create({
        name: tmpl.name,
        trigger: tmpl.trigger,
        action: tmpl.action,
        frequency: tmpl.frequency,
        description: tmpl.desc
      });
      toast.success(`Deployed "${tmpl.name}"!`);
      await load();
    } catch {
      toast.error(`Failed to deploy ${tmpl.name}`);
    }
  };

  /* Bulk load all 4 starter automations */
  const handleLoadStarters = async () => {
    setDeploying(true);
    try {
      for (const tmpl of AI_TEMPLATES) {
        await automationsAPI.create({
          name: tmpl.name,
          trigger: tmpl.trigger,
          action: tmpl.action,
          frequency: tmpl.frequency,
          description: tmpl.desc
        });
      }
      toast.success('Successfully deployed 4 intelligent starter workflows!');
      await load();
    } catch {
      toast.error('Failed to load starter workflows');
    } finally {
      setDeploying(false);
    }
  };

  const filtered = automations.filter(a => {
    const matchFilter = filter === 'All' || a.status === filter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase())
      || a.action.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    All: automations.length,
    Active: automations.filter(a => a.status === 'Active').length,
    Inactive: automations.filter(a => a.status === 'Inactive').length,
    Failed: automations.filter(a => a.status === 'Failed').length,
  };

  return (
    <>
      {/* ── HIGH-TECH BACKGROUND IMAGE LAYER ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/automation-bg.jpg')",
          backgroundAttachment: 'fixed',
          opacity: 0.32,
          filter: 'brightness(0.75) contrast(1.2)'
        }}
      />
      {/* Dark gradient overlay for extreme readability */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 10%, rgba(37,99,235,0.15) 0%, transparent 60%), linear-gradient(180deg, rgba(6,11,26,0.85) 0%, rgba(5,9,24,0.95) 100%)'
        }}
      />

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="relative z-10 page-inner space-y-8">

        {/* ── COMMAND CENTER HERO HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-blue-500/30 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(13,22,48,0.92) 0%, rgba(8,16,36,0.95) 100%)',
            backdropFilter: 'blur(16px)'
          }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/15 border border-blue-400/40 text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Autonomous Workflow Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Automations & <span className="gradient-text">Workflows</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
                Connect triggers, AI decision logic, and automated business actions into resilient pipelines.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={load}
                className="btn-outline btn-md font-bold px-4 py-3"
                title="Sync and refresh automations"
              >
                <RefreshCw className="w-4 h-4 text-slate-300" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLoadStarters}
                disabled={deploying}
                className="px-5 py-3 rounded-2xl font-black text-sm text-cyan-300 border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all flex items-center gap-2 shadow-lg"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{deploying ? 'Deploying...' : '⚡ Load Starter Workflows'}</span>
              </button>
              <button
                onClick={() => navigate('/create-automation')}
                className="btn-primary btn-md font-extrabold px-6 py-3 shadow-xl"
                id="create-automation-btn"
              >
                <Plus className="w-5 h-5" />
                <span>New Automation</span>
              </button>
            </div>
          </div>

          {/* KPI Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Workflows</div>
              <div className="text-2xl font-black text-white mt-0.5">{automations.length} Active</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Rate</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">99.4%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Latency</div>
              <div className="text-2xl font-black text-cyan-400 mt-0.5">142 ms</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Optimizer</div>
              <div className="text-2xl font-black text-purple-400 mt-0.5">GPT-4o Live</div>
            </div>
          </div>
        </div>

        {/* ── SEARCH & STATUS FILTERS ── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md flex-wrap">
            {Object.entries(counts).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`filter-tab font-bold text-sm px-4 py-2 rounded-xl transition-all ${
                  filter === k
                    ? 'active bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {k}
                <span className="text-xs font-extrabold ml-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {v}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-11 h-12 w-full font-semibold text-white placeholder-slate-400 bg-slate-900/80 border-slate-700 rounded-2xl focus:border-blue-400"
              placeholder="Search by workflow name, trigger, or action..."
            />
          </div>
        </div>

        {/* ── AUTOMATION LIST OR RICH TEMPLATES LAUNCHER ── */}
        {loading ? (
          <div className="card flex flex-col items-center justify-center p-16 space-y-4">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 font-bold text-base">Loading workflows...</p>
          </div>
        ) : filtered.length === 0 ? (
          /* When 0 automations, show rich launcher + instant starters */
          <div className="space-y-8">
            <div className="card p-10 text-center relative overflow-hidden border-2 border-blue-500/30 bg-slate-900/80 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-2xl"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-2">
                {search || filter !== 'All' ? 'No Matching Automations Found' : 'No Automations Configured Yet'}
              </h2>
              <p className="text-slate-300 text-base font-medium max-w-xl mx-auto mb-8">
                {search || filter !== 'All'
                  ? 'Try modifying your search or filter keywords to find your configured workflows.'
                  : 'Start automating your sales and operations in seconds. Deploy recommended AI templates below or load our 4 starter automations with one click.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleLoadStarters}
                  disabled={deploying}
                  className="btn-primary btn-lg font-black text-base px-8 py-3.5 shadow-2xl"
                >
                  <Cpu className="w-5 h-5" />
                  {deploying ? 'Deploying Workflows...' : '⚡ Load 4 Starter Automations'}
                </button>
                <button
                  onClick={() => navigate('/create-automation')}
                  className="btn-outline btn-lg font-bold text-base px-6 py-3.5"
                >
                  <Plus className="w-5 h-5" /> Build Custom Automation
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Automations List */
          <div className="grid gap-4">
            {filtered.map((auto, i) => {
              const successRate = auto.runCount > 0 ? Math.round((auto.successCount / auto.runCount) * 100) : null;
              const isRunning = runningIds.has(auto._id) || auto.status === 'Running';
              return (
                <div
                  key={auto._id}
                  id={`automation-${auto._id}`}
                  className="card p-6 lg:p-7 border border-blue-500/20 bg-slate-900/85 backdrop-blur-xl hover:border-blue-400/50 transition-all rounded-3xl shadow-xl animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
                    {/* Left Info */}
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg border border-blue-400/30"
                        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))' }}
                      >
                        {actionEmoji[auto.action] || '⚡'}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-white font-black text-lg lg:text-xl tracking-tight">{auto.name}</h3>
                          <StatusBadge status={auto.status} />
                        </div>
                        <p className="text-cyan-300 text-sm font-semibold flex items-center gap-2">
                          <span>{triggerEmoji[auto.trigger]} {auto.trigger}</span>
                          <span className="text-slate-500 font-bold">➔</span>
                          <span>{auto.action}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 font-normal">{auto.frequency}</span>
                        </p>
                        {auto.description && (
                          <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-2xl">
                            {auto.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-5 text-xs font-bold text-slate-300 pt-1">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" /> Last Run: {formatDate(auto.lastRun)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Next Run: {formatNext(auto.nextRun)}
                          </span>
                          {auto.runCount > 0 && (
                            <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                              <CheckCircle className="w-3.5 h-3.5" /> {auto.successCount}/{auto.runCount} Successful Runs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Center Success Ring */}
                    {successRate !== null && (
                      <div className="hidden md:flex flex-col items-center gap-1 flex-shrink-0 px-4">
                        <SuccessRing rate={successRate} />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Success</span>
                      </div>
                    )}

                    {/* Right Controls */}
                    <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <button
                        id={`run-btn-${auto._id}`}
                        onClick={() => handleRun(auto)}
                        disabled={auto.status === 'Running'}
                        className="btn-success btn-md font-black px-4 py-2.5 shadow-lg flex items-center gap-2"
                      >
                        {auto.status === 'Running' ? (
                          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : <Play className="w-4 h-4 fill-current" />}
                        <span>{auto.status === 'Running' ? 'Executing...' : 'Run Now'}</span>
                      </button>

                      <button
                        id={`toggle-btn-${auto._id}`}
                        onClick={() => handleToggle(auto._id)}
                        disabled={isRunning}
                        className="btn-outline btn-md font-bold px-3 py-2.5"
                        title={auto.status === 'Active' ? 'Disable Workflow' : 'Enable Workflow'}
                      >
                        <Pause className="w-4 h-4" />
                        <span className="hidden sm:inline">{auto.status === 'Active' ? 'Pause' : 'Resume'}</span>
                      </button>

                      <button
                        id={`edit-btn-${auto._id}`}
                        onClick={() => navigate('/create-automation', { state: { edit: auto } })}
                        className="btn-ghost btn-md font-bold px-3 py-2.5"
                        title="Edit Configuration"
                      >
                        <Pencil className="w-4 h-4 text-slate-300" />
                      </button>

                      <button
                        id={`delete-btn-${auto._id}`}
                        onClick={() => handleDelete(auto._id, auto.name)}
                        className="btn-danger btn-md font-bold px-3 py-2.5"
                        title="Delete Workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PRE-BUILT AI WORKFLOW TEMPLATES GALLERY ── */}
        <div className="mt-12 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-cyan-400" />
                Featured AI Automation Templates
              </h2>
              <p className="text-slate-300 text-sm font-medium">
                One-click deployable neural sales intelligence and operation templates.
              </p>
            </div>
            <span className="text-xs font-extrabold text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              Instant Deployment Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {AI_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="card p-6 flex flex-col justify-between border border-blue-500/25 bg-slate-900/80 backdrop-blur-lg hover:border-blue-400 transition-all rounded-3xl group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                      style={{ background: tmpl.badgeColor, borderColor: tmpl.tagColor, color: tmpl.tagColor }}
                    >
                      {tmpl.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{tmpl.frequency}</span>
                  </div>
                  <h3 className="text-white font-extrabold text-base leading-snug group-hover:text-cyan-300 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    {tmpl.desc}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>⚡ {tmpl.trigger}</span>
                    <span className="text-cyan-400 font-black">➔</span>
                    <span>{tmpl.action}</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleDeployTemplate(tmpl)}
                    className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Deploy Workflow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── EXECUTION PIPELINE MODAL ── */}
      {execModal && (
        <ExecutionModal
          automation={execModal}
          onClose={handleExecClose}
          onComplete={handleExecComplete}
        />
      )}
    </>
  );
}
