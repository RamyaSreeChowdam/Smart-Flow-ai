import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, Users, Flame, Percent, Sparkles,
  ArrowUpRight, ArrowDownRight, Plus, Play, ChevronRight, Cpu,
  Send, BarChart3, Bot, AlertTriangle, CheckCircle2, ShieldAlert,
  Target, Zap, Activity, RefreshCw, Layers, ExternalLink, ArrowRight,
  Filter
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { automationsAPI, activityAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AIAssistant from '../components/AIAssistant';
import ExecutionModal from '../components/ExecutionModal';
import toast from 'react-hot-toast';

/* ── helpers ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatRelative = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ── Sales Performance Historical Data ── */
const SALES_TREND_DATA = [
  { date: 'Mon', revenue: 18400, conversions: 24, growth: 12 },
  { date: 'Tue', revenue: 22100, conversions: 31, growth: 18 },
  { date: 'Wed', revenue: 19800, conversions: 28, growth: 15 },
  { date: 'Thu', revenue: 26500, conversions: 38, growth: 24 },
  { date: 'Fri', revenue: 31200, conversions: 45, growth: 31 },
  { date: 'Sat', revenue: 24600, conversions: 34, growth: 22 },
  { date: 'Sun', revenue: 28900, conversions: 41, growth: 29 },
];

/* ── Sales Funnel Data ── */
const SALES_FUNNEL_STAGES = [
  { stage: 'Prospecting', count: 1420, val: '$840,000', conv: '100%', color: '#60a5fa' },
  { stage: 'Qualified Leads', count: 680, val: '$510,000', conv: '47.8%', color: '#a78bfa' },
  { stage: 'Proposal Sent', count: 240, val: '$290,000', conv: '35.2%', color: '#22d3ee' },
  { stage: 'Closed-Won', count: 84, val: '$148,250', conv: '35.0%', color: '#34d399' },
];

/* ── Hot & At-Risk Lead Insights ── */
const HOT_LEADS = [
  { id: 1, company: 'Acme Enterprise Corp', score: 96, val: '$45,000', intent: 'High Intent (Downloaded Pricing)', contact: 'Sarah Jenkins (VP Sales)', status: 'Hot Lead' },
  { id: 2, company: 'Nexus Global Tech', score: 92, val: '$28,000', intent: 'Demo Requested', contact: 'David Vance (CTO)', status: 'Hot Lead' },
  { id: 3, company: 'Apex Digital Solutions', score: 89, val: '$35,000', intent: 'Proposal Under Review', contact: 'Elena Rostova (Head of Growth)', status: 'High Intent' },
];

const AT_RISK_LEADS = [
  { id: 101, company: 'Global Logistics Ltd', score: 42, val: '$52,000', issue: 'Inactive for 14 days', action: 'Trigger AI Re-engagement', risk: 'High Churn' },
  { id: 102, company: 'CloudTech Systems', score: 48, val: '$19,500', issue: 'Decision Call Postponed', action: 'Send Exec Summary', risk: 'Medium Risk' },
];

/* ── Custom High-Contrast Chart Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-2xl text-sm space-y-1.5 shadow-2xl" style={{ background: '#09132b', border: '2px solid rgba(59,130,246,0.4)' }}>
      <p className="text-slate-200 font-extrabold mb-1.5 text-base">{label} Sales Performance</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-5 font-bold">
          <span className="flex items-center gap-2 text-slate-100" style={{ color: p.color }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            {p.name}:
          </span>
          <span className="font-extrabold text-white text-base">
            {p.name === 'Revenue' ? `$${p.value.toLocaleString()}` : p.name === 'Growth' ? `+${p.value}%` : `${p.value} deals`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [automations, setAutomations] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [execModal, setExecModal] = useState(null);
  const [activeChartMetric, setActiveChartMetric] = useState('revenue');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, actRes, anlRes] = await Promise.allSettled([
        automationsAPI.getAll(),
        activityAPI.getLogs({ limit: 6 }),
        analyticsAPI.getStats()
      ]);
      if (aRes.status === 'fulfilled') setAutomations(aRes.value.data.automations || []);
      if (actRes.status === 'fulfilled') setRecentLogs(actRes.value.data.logs || []);
      if (anlRes.status === 'fulfilled') setAnalytics(anlRes.value.data);
    } catch {
      toast.error('Failed to update sales dashboard');
    } finally {
      setLoading(false);
    }
  };

  /* ── 6 KPI Cards Data ── */
  const KPI_CARDS = [
    {
      label: 'Total Revenue', value: '$148,250',
      icon: DollarSign, gradient: 'card-gradient-emerald',
      iconBg: 'rgba(16,185,129,0.22)', iconColor: '#34d399',
      change: '+18.4%', up: true, sub: 'vs previous month'
    },
    {
      label: 'Conversion Rate', value: '24.8%',
      icon: Percent, gradient: 'card-gradient-blue',
      iconBg: 'rgba(37,99,235,0.22)', iconColor: '#60a5fa',
      change: '+4.2%', up: true, sub: 'lead to deal win rate'
    },
    {
      label: 'Active Leads', value: '1,420',
      icon: Users, gradient: 'card-gradient-purple',
      iconBg: 'rgba(124,58,237,0.22)', iconColor: '#c084fc',
      change: '+12.6%', up: true, sub: '320 high-intent prospects'
    },
    {
      label: 'Hot Leads', value: '84',
      icon: Flame, gradient: 'card-gradient-red',
      iconBg: 'rgba(245,158,11,0.22)', iconColor: '#fbbf24',
      change: '+28%', up: true, sub: 'ready to close deals'
    },
    {
      label: 'Sales Growth', value: '+32.6%',
      icon: TrendingUp, gradient: 'card-gradient-cyan',
      iconBg: 'rgba(6,182,212,0.22)', iconColor: '#22d3ee',
      change: '+8.1%', up: true, sub: 'pipeline momentum'
    },
    {
      label: 'AI Recommendations', value: '18 Active',
      icon: Sparkles, gradient: 'card-gradient-purple',
      iconBg: 'rgba(168,85,247,0.22)', iconColor: '#e9d5ff',
      change: 'High Impact', up: true, sub: 'revenue optimization triggers'
    },
  ];

  if (loading) return (
    <div className="page-inner flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center animate-pulse" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-200 text-lg font-bold">Initializing AI Sales Intelligence Center...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-inner space-y-10">

        {/* ── HERO SECTION ── */}
        <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 animate-fade-in-up"
          style={{ background: 'linear-gradient(135deg, #060c20 0%, #0d1e44 50%, #081636 100%)', border: '2px solid rgba(59,130,246,0.3)' }}>
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-extrabold"
                style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Next-Gen Sales Intelligence Engine</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                AI Sales Intelligence <span className="gradient-text">Center</span>
              </h1>
              <p className="text-slate-200 text-lg lg:text-xl leading-relaxed max-w-3xl font-medium">
                Turn your sales data into smarter decisions and higher conversions.<br />
                <span className="text-slate-300 font-normal">Predict customer intent, identify hot deals, and automate high-converting sales outreach.</span>
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button id="hero-create-btn" onClick={() => navigate('/create-automation')}
                  className="btn-primary btn-lg">
                  <Plus className="w-6 h-6" />
                  Deploy Sales Automation
                </button>
                <button onClick={() => navigate('/analytics')}
                  className="btn-outline btn-lg">
                  <BarChart3 className="w-6 h-6" />
                  Explore Revenue Analytics
                </button>
              </div>
            </div>

            {/* AI Sales Visual Card */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0">
              <div className="relative p-7 rounded-3xl min-w-[320px]" style={{ background: 'rgba(15,23,42,0.85)', border: '2px solid rgba(59,130,246,0.3)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-800">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-300 text-xs font-bold uppercase tracking-wider">Monthly Revenue</div>
                    <div className="text-white font-black text-2xl lg:text-3xl">$148,250</div>
                    <div className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                      <ArrowUpRight className="w-4 h-4" /> +18.4% Revenue Growth
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold gap-6">
                    <span className="text-slate-300">Predicted Closing Target</span>
                    <span className="text-white font-extrabold text-base">$174,500</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div className="h-full rounded-full" style={{ width: '85%', background: 'linear-gradient(90deg,#2563eb,#10b981)' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 font-bold">
                    <span className="text-slate-400">Target: $160,000</span>
                    <span className="text-emerald-400">109% of target projected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6 KPI CARDS ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-heading">Sales Performance Metrics</h2>
              <p className="section-sub">Real-time pipeline tracking and deal conversion velocity</p>
            </div>
            <button onClick={loadData} className="btn-ghost btn-md font-bold">
              <RefreshCw className="w-4 h-4" />
              Sync Data
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
            {KPI_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`stat-card ${card.gradient} animate-fade-in-up hover:border-blue-400/50 transition-all p-6`}
                  style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                      style={{ background: card.iconBg }}>
                      <Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                    </div>
                    <span className={card.up ? 'stat-badge-up' : 'stat-badge-down'}>
                      {card.change}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="stat-number">{card.value}</div>
                    <div className="stat-label">{card.label}</div>
                    <div className="text-xs text-slate-300 font-medium">{card.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SALES PERFORMANCE CHART + AI ASSISTANT PANEL ── */}
        <div className="grid xl:grid-cols-3 gap-8">

          {/* Sales Performance & Trend Chart */}
          <div className="xl:col-span-2 card flex flex-col justify-between p-6 lg:p-8">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
                <div>
                  <h2 className="section-heading mb-1 flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-blue-400" />
                    Sales & Revenue Performance Trend
                  </h2>
                  <p className="text-slate-200 text-sm font-medium">Track weekly revenue generation, deal conversions, and growth rate</p>
                </div>

                {/* Metric Selector Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-700">
                  <button
                    onClick={() => setActiveChartMetric('revenue')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeChartMetric === 'revenue' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
                  >
                    Revenue ($)
                  </button>
                  <button
                    onClick={() => setActiveChartMetric('conversions')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeChartMetric === 'conversions' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
                  >
                    Conversions
                  </button>
                  <button
                    onClick={() => setActiveChartMetric('growth')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeChartMetric === 'growth' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
                  >
                    Growth (%)
                  </button>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_TREND_DATA}>
                    <defs>
                      <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="conv-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="growth-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />

                    {activeChartMetric === 'revenue' && (
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3.5}
                        fill="url(#rev-grad)" dot={{ r: 5, fill: '#3b82f6' }} name="Revenue" />
                    )}

                    {activeChartMetric === 'conversions' && (
                      <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3.5}
                        fill="url(#conv-grad)" dot={{ r: 5, fill: '#10b981' }} name="Conversions" />
                    )}

                    {activeChartMetric === 'growth' && (
                      <Area type="monotone" dataKey="growth" stroke="#8b5cf6" strokeWidth={3.5}
                        fill="url(#growth-grad)" dot={{ r: 5, fill: '#8b5cf6' }} name="Growth" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Chart Summary Footer */}
            <div className="grid grid-cols-3 gap-6 pt-5 mt-6 border-t border-slate-800 text-center">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Weekly Total</span>
                <span className="text-white font-extrabold text-lg sm:text-xl">$171,900</span>
              </div>
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Avg Daily Deals</span>
                <span className="text-emerald-400 font-extrabold text-lg sm:text-xl">34 Deals / Day</span>
              </div>
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Peak Performance</span>
                <span className="text-purple-400 font-extrabold text-lg sm:text-xl">Friday ($31.2K)</span>
              </div>
            </div>
          </div>

          {/* AI Sales Assistant Panel */}
          <AIAssistant onAutomationCreated={loadData} />
        </div>

        {/* ── AI LEAD INSIGHTS SECTION ── */}
        <div className="card p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <Target className="w-7 h-7 text-purple-400" />
                <h2 className="section-heading mb-0">AI Lead Insights & Prioritization</h2>
              </div>
              <p className="text-slate-200 text-sm font-medium">AI-driven intent scores, hot lead triggers, and automated re-engagement actions</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-hot text-sm px-3.5 py-1.5">3 Hot Leads Ready</span>
              <span className="badge-risk text-sm px-3.5 py-1.5">2 At-Risk Deals</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* Hot Leads Column */}
            <div className="space-y-4">
              <h3 className="text-white text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Hot Deals (High Closing Probability)
              </h3>
              <div className="space-y-4">
                {HOT_LEADS.map(lead => (
                  <div key={lead.id} className="p-5 rounded-3xl flex items-center justify-between gap-4 transition-all hover:border-amber-400/40"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.25)' }}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-white font-extrabold text-base">{lead.company}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">Score: {lead.score}/100</span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm font-medium">{lead.contact} · <span className="text-amber-200 font-bold">{lead.intent}</span></p>
                      <p className="text-emerald-400 font-extrabold text-sm">Opportunity: {lead.val}</p>
                    </div>

                    <button
                      onClick={() => toast.success(`AI outreach dispatched to ${lead.company}!`)}
                      className="btn-primary btn-sm flex-shrink-0 text-xs lg:text-sm font-bold"
                    >
                      <Send className="w-4 h-4" /> Close Deal
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* At-Risk Leads Column */}
            <div className="space-y-4">
              <h3 className="text-white text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                At-Risk Deals (Requires Action)
              </h3>
              <div className="space-y-4">
                {AT_RISK_LEADS.map(lead => (
                  <div key={lead.id} className="p-5 rounded-3xl flex items-center justify-between gap-4 transition-all hover:border-red-400/40"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-white font-extrabold text-base">{lead.company}</span>
                        <span className="badge-risk text-xs px-2.5 py-0.5">{lead.risk}</span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm font-medium">Issue: <span className="text-red-300 font-bold">{lead.issue}</span></p>
                      <p className="text-slate-100 font-extrabold text-sm">Deal Value: {lead.val}</p>
                    </div>

                    <button
                      onClick={() => toast.success(`AI re-engagement workflow triggered for ${lead.company}!`)}
                      className="btn-outline btn-sm text-xs lg:text-sm font-bold border-red-500/50 text-red-400 hover:bg-red-500/15 flex-shrink-0"
                    >
                      {lead.action}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-700 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <p className="text-slate-200 text-xs sm:text-sm font-medium">
                  <strong className="text-white font-extrabold">AI Recommendation:</strong> Automated follow-ups sent within 2 hours increase lead conversion rates by <strong className="text-emerald-400 font-extrabold">+34%</strong>.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── TOP PRODUCTS & SALES FUNNEL VISUALIZATION ── */}
        <div className="grid xl:grid-cols-2 gap-8">

          {/* Sales Funnel Stages */}
          <div className="card p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="section-heading mb-1">Sales Pipeline Funnel</h2>
                  <p className="text-slate-200 text-sm font-medium">Conversion velocity across deal stages</p>
                </div>
                <span className="text-sm text-emerald-400 font-extrabold">Total Value: $1.78M</span>
              </div>

              <div className="space-y-4">
                {SALES_FUNNEL_STAGES.map((s, i) => (
                  <div key={s.stage} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 transition-all space-y-2.5">
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-2.5 font-extrabold text-white">
                        <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                        {s.stage}
                      </div>
                      <div className="flex items-center gap-4 text-slate-300 font-bold">
                        <span>{s.count} Leads</span>
                        <strong className="text-white">{s.val}</strong>
                        <span className="text-cyan-400 font-extrabold">{s.conv}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${100 - i * 20}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 mt-6 flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold">
              <span>Average Deal Velocity: <strong className="text-white font-extrabold">14.2 Days</strong></span>
              <button onClick={() => navigate('/analytics')} className="text-blue-400 font-bold hover:underline flex items-center gap-1">
                Full Pipeline Report <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="section-heading mb-1">Top Performing Sales Products</h2>
                  <p className="text-slate-200 text-sm font-medium">Revenue contribution by product line</p>
                </div>
                <span className="text-sm text-purple-300 font-extrabold">3 Core Products</span>
              </div>

              <div className="space-y-5">
                {[
                  { name: 'SmartSales AI Enterprise Suite', share: 42, rev: '$62,400', deals: 28, trend: '+28%' },
                  { name: 'Automated CRM Sync Module', share: 31, rev: '$46,000', deals: 36, trend: '+14%' },
                  { name: 'Lead Intelligence API Integration', share: 27, rev: '$39,850', deals: 20, trend: '+19%' },
                ].map((prod, idx) => (
                  <div key={idx} className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <div>
                        <h4 className="text-white font-extrabold text-base">{prod.name}</h4>
                        <span className="text-slate-300 text-xs sm:text-sm font-medium">{prod.deals} Deals Closed · <strong className="text-emerald-400 font-bold">{prod.trend} growth</strong></span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-lg block">{prod.rev}</span>
                        <span className="text-purple-300 font-extrabold text-xs sm:text-sm">{prod.share}% share</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                      <div className="h-full rounded-full" style={{ width: `${prod.share}%`, background: 'linear-gradient(90deg,#7c3aed,#2563eb)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 mt-6 flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold">
              <span>Highest Growth: <strong className="text-white font-extrabold">SmartSales AI Enterprise</strong></span>
              <button onClick={() => navigate('/automations')} className="text-blue-400 font-bold hover:underline flex items-center gap-1">
                Configure Sales Automations <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* ── ACTIVE SALES AUTOMATIONS ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-heading mb-0">Active Sales Workflows & Automations</h2>
              <p className="section-sub">{automations.length} sales intelligence automations deployed</p>
            </div>
            <button onClick={() => navigate('/automations')} className="btn-outline btn-md font-bold">
              View All Workflows <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {automations.length === 0 ? (
            <div className="card empty-state py-12">
              <div className="empty-icon mb-4">
                <Zap className="w-10 h-10 text-blue-500/40" />
              </div>
              <h3 className="text-white font-extrabold text-xl mb-2">No Sales Automations Configured</h3>
              <p className="text-slate-300 text-base mb-6">Create your first automated sales workflow to score leads and auto-send proposals.</p>
              <button onClick={() => navigate('/create-automation')} className="btn-primary btn-md">
                <Plus className="w-5 h-5" /> Create Sales Automation
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {automations.slice(0, 6).map((auto, i) => (
                <SalesAutomationMiniCard key={auto._id} auto={auto} index={i}
                  onRun={(a) => setExecModal(a)} navigate={navigate} />
              ))}
            </div>
          )}
        </div>

        {/* ── RECENT SALES ACTIVITIES & SMART ACTIONS ── */}
        <div className="card p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-heading mb-0">Recent Sales Activity & Smart Actions</h2>
              <p className="text-slate-200 text-sm font-medium">Live feed of AI lead qualification and customer interactions</p>
            </div>
            <button onClick={() => navigate('/activity')} className="btn-ghost btn-md text-sm font-bold">
              View full log <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="empty-state py-10">
              <Activity className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-300 text-base font-semibold">No sales activity logs recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentLogs.map((log) => (
                <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                      background: log.status === 'Success' ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
                      border: log.status === 'Success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
                    }}>
                      {log.status === 'Success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-white text-base font-extrabold truncate">{log.automationName}</p>
                        <span className="badge-active text-xs px-2.5 py-0.5">{log.status}</span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5 truncate">{log.action} · {log.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                    <span className="text-slate-400 text-xs sm:text-sm font-semibold">{formatRelative(log.executedAt)}</span>
                    <button onClick={() => toast.success(`Synced record for ${log.automationName}`)} className="btn-ghost btn-sm text-xs font-bold">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {execModal && (
        <ExecutionModal
          automation={execModal}
          onClose={() => { setExecModal(null); loadData(); }}
          onComplete={() => loadData()}
        />
      )}
    </>
  );
}

/* ── SALES AUTOMATION MINI CARD ── */
function SalesAutomationMiniCard({ auto, index, onRun, navigate }) {
  const [running, setRunning] = useState(false);
  const actionIcons = { 'Generate Report': '📊', 'Send Notification': '🔔', 'Send Email': '📧', 'Create Task': '✅', 'Update Record': '🔄' };

  const handleRun = (e) => {
    e.stopPropagation();
    onRun(auto);
  };

  const successRate = auto.runCount > 0 ? Math.round((auto.successCount / auto.runCount) * 100) : 100;

  return (
    <div className="automation-card p-6 animate-fade-in-up hover:border-purple-400/50 transition-all space-y-4" style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => navigate('/automations')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(59,130,246,0.3)' }}>
            {actionIcons[auto.action] || '⚡'}
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-extrabold text-base truncate">{auto.name}</h4>
            <p className="text-slate-300 text-xs font-medium">Trigger: {auto.trigger}</p>
          </div>
        </div>
        <span className="badge-active text-xs px-2.5 py-0.5">{auto.status || 'Active'}</span>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold">
        <span>Action: <strong className="text-white font-bold">{auto.action}</strong></span>
        <span>{auto.frequency}</span>
      </div>

      <div>
        <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-bold">
          <span className="text-slate-300">Conversion Accuracy</span>
          <span className="text-emerald-400 font-extrabold">{successRate}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${successRate}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleRun}
          disabled={running || auto.status === 'Running'}
          className="btn-success btn-sm flex-1 justify-center font-bold"
        >
          {running || auto.status === 'Running' ? (
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : <Play className="w-3.5 h-3.5" />}
          {running || auto.status === 'Running' ? 'Executing...' : 'Run Sales Automation'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); navigate('/automations'); }}
          className="btn-outline btn-sm px-3.5">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
