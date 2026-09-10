import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Cpu, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({ name: form.name.trim(), email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Welcome to SmartFlow AI! 🚀');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Good' : form.password.length > 0 ? 'Weak' : '';
  const strengthPct = form.password.length >= 10 ? 100 : form.password.length >= 6 ? 65 : form.password.length > 0 ? 30 : 0;
  const strengthColor = strength === 'Strong' ? '#10b981' : strength === 'Good' ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10 relative overflow-hidden text-slate-100" style={{ background: '#050918' }}>
      {/* Dynamic background lights */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl">SmartFlow <span style={{ color: '#60a5fa' }}>AI</span></span>
          </div>
          <button onClick={() => navigate('/login')} className="btn-ghost btn-sm text-xs font-bold text-slate-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60">
            <ArrowLeft className="w-4 h-4 text-blue-400" /> Back
          </button>
        </div>

        {/* Card */}
        <div className="p-8 sm:p-10 rounded-3xl border border-blue-500/25 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(13,22,46,0.92) 0%, rgba(9,16,36,0.96) 100%)',
            backdropFilter: 'blur(20px)'
          }}>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Create account</h1>
            <p className="text-slate-400 text-sm font-medium">Join SmartFlow AI and build intelligent automated workflows</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl text-sm bg-red-500/10 border border-red-500/25">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-300 font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="reg-name" type="text" name="name" value={form.name}
                  onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Ramya Sree" autoComplete="name" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="reg-email" type="email" name="email" value={form.email}
                  onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="you@company.com" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="reg-password" type={showPw ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Min. 6 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Strength</span>
                    <span style={{ color: strengthColor }}>{strength}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${strengthPct}%`, background: strengthColor }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="reg-confirm" type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Repeat password" autoComplete="new-password" />
                {form.confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                )}
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 0 25px rgba(37,99,235,0.35)'
              }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
            <p className="text-slate-400 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-extrabold transition-colors underline decoration-cyan-500/40 underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
