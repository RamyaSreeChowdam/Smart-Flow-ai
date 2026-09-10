import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Cpu, Zap, Bot, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: Bot,       label: 'AI-Powered',     desc: 'Smart workflow & trigger suggestions' },
  { icon: Zap,       label: 'One-Click Run',   desc: 'Instant background task execution' },
  { icon: BarChart3, label: 'Real Analytics',  desc: '91.4% success rate monitoring' },
  { icon: Shield,    label: 'Enterprise Auth', desc: 'Encrypted JWT & MongoDB Atlas' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 🚀`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'demo@smartflow.ai', password: 'demo1234' });
    setError('');
    toast.success('Demo credentials loaded! Click Sign In.');
  };

  return (
    <div className="min-h-screen flex text-slate-100 relative overflow-hidden" style={{ background: '#050918' }}>
      {/* Dynamic background lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />

      {/* LEFT — Branding & Hero Visual Picture */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-y-auto flex-col justify-between p-10 xl:p-14 border-r border-blue-500/15"
        style={{ background: 'linear-gradient(135deg, rgba(8,14,31,0.95) 0%, rgba(13,26,53,0.95) 50%, rgba(10,18,37,0.98) 100%)' }}>

        {/* Subtle hero grid pattern */}
        <div className="absolute inset-0 hero-grid opacity-25 pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 25px rgba(37,99,235,0.45)' }}>
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-xl tracking-tight flex items-center gap-2">
              SmartFlow <span style={{ color: '#60a5fa' }}>AI</span>
            </div>
            <div className="text-xs font-semibold text-blue-400">Intelligent Automation Platform</div>
          </div>
        </div>

        {/* Middle Hero Section with Picture */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-500/15 border border-blue-400/30 text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI-Powered Automation Engine</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Automate the work.<br />
            <span className="gradient-text">Focus on what matters.</span>
          </h1>

          <p className="text-slate-300 text-base xl:text-lg max-w-xl font-medium leading-relaxed">
            Build intelligent workflows in minutes. Let SmartFlow AI handle repetitive tasks while you focus on core strategic goals.
          </p>

          {/* 🖼️ HERO PICTURE CARD INTEGRATION */}
          <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl group transition-all duration-300 hover:border-blue-400/50"
            style={{ background: 'rgba(10,18,38,0.8)', backdropFilter: 'blur(12px)' }}>
            
            <img
              src="/login-hero.jpg"
              alt="AI Automation Workflows Preview"
              className="w-full h-56 xl:h-64 object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500"
            />
            
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Floating Live Telemetry Overlay Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/70 text-xs font-bold text-slate-200 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Workflows Active</span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-lg">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>99.9% Uptime</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Smart Flow Execution Engine</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                12ms Latency
              </span>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3 p-3.5 rounded-2xl border transition-colors"
                  style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm">{f.label}</p>
                    <p className="text-slate-400 text-xs font-medium leading-snug">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="relative z-10 flex items-center gap-8 pt-4 border-t border-slate-800/80">
          {[
            ['1,284', 'Total Executions'],
            ['91.4%', 'Success Rate'],
            ['42h', 'Time Saved']
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-xl xl:text-2xl font-black text-white">{num}</div>
              <div className="text-xs text-slate-400 font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Interactive Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Logo Header */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-black text-xl">SmartFlow <span style={{ color: '#60a5fa' }}>AI</span></span>
              <p className="text-xs text-slate-400 font-medium">Automation Platform</p>
            </div>
          </div>

          {/* Glass Form Card */}
          <div className="p-8 sm:p-10 rounded-3xl border border-blue-500/25 shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(13,22,46,0.92) 0%, rgba(9,16,36,0.96) 100%)',
              backdropFilter: 'blur(20px)'
            }}>

            {/* Glowing decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight mb-1.5">Welcome back</h2>
              <p className="text-slate-400 text-sm font-medium">
                Sign in to manage and monitor your AI workflows
              </p>
            </div>

            {/* Quick One-Click Demo Fill Banner */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full mb-6 p-4 rounded-2xl text-left transition-all duration-200 border group"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.1) 100%)',
                borderColor: 'rgba(59,130,246,0.35)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform border border-blue-400/30">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-extrabold text-sm">Quick Demo Account</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                        1-Click Fill
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">
                      demo@smartflow.ai &bull; demo1234
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl text-sm bg-red-500/10 border border-red-500/25">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-red-300 font-semibold">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 0 25px rgba(37,99,235,0.35)'
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
              <p className="text-slate-400 text-sm font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-extrabold transition-colors underline decoration-cyan-500/40 underline-offset-4">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
