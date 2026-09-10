import { useState, useEffect } from 'react';
import {
  X, CheckCircle, Loader2, AlertTriangle, GitBranch,
  Cpu, Zap, Send, BarChart3, RefreshCw, ArrowRight,
  Package, AlertOctagon, ShoppingCart, Activity
} from 'lucide-react';
import { automationsAPI } from '../services/api';

/* ── icons for each step ── */
const STEP_ICONS = {
  'Trigger':    GitBranch,
  'AI Analyze': Cpu,
  'Decision':   Zap,
  'Execute':    Send,
  'Result':     CheckCircle,
};

/* ── step state styles ── */
const stepStyle = (state) => ({
  idle:    { ring: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.03)', text: '#334155', icon: '#334155' },
  active:  { ring: 'rgba(37,99,235,0.6)',   bg: 'rgba(37,99,235,0.1)',    text: '#60a5fa', icon: '#3b82f6' },
  done:    { ring: 'rgba(16,185,129,0.5)',  bg: 'rgba(16,185,129,0.08)', text: '#34d399', icon: '#10b981' },
  failed:  { ring: 'rgba(239,68,68,0.5)',   bg: 'rgba(239,68,68,0.08)',  text: '#f87171', icon: '#ef4444' },
}[state] || {});

export default function ExecutionModal({ automation, onClose, onComplete }) {
  const [phase, setPhase]       = useState('idle');   // idle | running | done | error
  const [steps, setSteps]       = useState([]);        // from API
  const [activeStep, setActive] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult]     = useState(null);

  const isInventory = automation?.trigger === 'Low Inventory' ||
    automation?.metadata?.currentStock !== undefined;
  const meta = automation?.metadata || {};

  const IDLE_STEPS = ['Trigger', 'AI Analyze', 'Decision', 'Execute', 'Result'];

  /* auto-start on open */
  useEffect(() => {
    runExecution();
  }, []);

  const runExecution = async () => {
    setPhase('running');
    setActive(-1);
    setSteps([]);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await automationsAPI.runDetail(automation._id);
      const apiSteps = res.data.steps || [];

      // Animate steps in sequence using the delay values from backend
      for (let i = 0; i < apiSteps.length; i++) {
        const s = apiSteps[i];
        const delay = i === 0 ? 300 : (s.delay - (apiSteps[i - 1]?.delay || 0));
        await sleep(Math.max(delay, 700));
        setActive(i);
        setSteps(prev => [...prev, s]);
      }

      await sleep(600);
      setPhase('done');
      setResult(res.data);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Execution failed';
      setErrorMsg(msg);
      setPhase('error');
    }
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const getStepState = (idx) => {
    if (phase === 'error' && idx === activeStep) return 'failed';
    if (idx < activeStep || (phase === 'done' && idx <= steps.length - 1)) return 'done';
    if (idx === activeStep) return 'active';
    return 'idle';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      
      <div className="w-full max-w-xl rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#080e1f,#0d1a35)', border: '1px solid rgba(37,99,235,0.2)' }}>
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b"
          style={{ borderColor: 'rgba(37,99,235,0.12)' }}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
              {isInventory ? '📦' : '⚡'}
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{automation?.name}</h2>
              <p className="text-slate-500 text-xs mt-0.5">{automation?.trigger} → {automation?.action}</p>
            </div>
          </div>
          {(phase === 'done' || phase === 'error') && (
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Inventory Config Block */}
        {isInventory && (
          <div className="mx-6 mt-4 p-4 rounded-2xl grid grid-cols-3 gap-3"
            style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}>
            <div className="text-center">
              <p className="text-slate-600 text-xs mb-1">Item</p>
              <p className="text-white font-bold text-sm">{meta.item || 'Laptop Components'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Package className="w-3 h-3 text-red-400" />
                <p className="text-slate-600 text-xs">Stock</p>
              </div>
              <p className="text-red-400 font-black text-xl">{meta.currentStock ?? 5}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertOctagon className="w-3 h-3 text-yellow-400" />
                <p className="text-slate-600 text-xs">Threshold</p>
              </div>
              <p className="text-yellow-400 font-black text-xl">{meta.threshold ?? 10}</p>
            </div>
          </div>
        )}

        {/* Execution Pipeline */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">
            {phase === 'running' ? '⚡ Executing Pipeline...' : phase === 'done' ? '✅ Pipeline Complete' : phase === 'error' ? '❌ Pipeline Failed' : 'Ready'}
          </p>

          {/* Pipeline Steps */}
          <div className="space-y-3">
            {IDLE_STEPS.map((label, i) => {
              const state    = getStepState(i);
              const sty      = stepStyle(state);
              const Icon     = STEP_ICONS[label] || Zap;
              const apiStep  = steps[i];
              const isActive = i === activeStep && phase === 'running';

              return (
                <div key={label}
                  className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-500"
                  style={{ background: sty.bg, border: `1px solid ${sty.ring}` }}>
                  
                  {/* Step icon / number */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ background: state === 'idle' ? 'rgba(255,255,255,0.03)' : sty.bg, border: `1px solid ${sty.ring}` }}>
                    {state === 'done'   && <CheckCircle className="w-4 h-4" style={{ color: sty.icon }} />}
                    {state === 'active' && <Loader2 className="w-4 h-4 animate-spin" style={{ color: sty.icon }} />}
                    {state === 'failed' && <AlertTriangle className="w-4 h-4" style={{ color: sty.icon }} />}
                    {state === 'idle'   && <span className="text-xs font-bold" style={{ color: sty.icon }}>{i + 1}</span>}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: sty.text }}>{label}</span>
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full animate-pulse"
                          style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                          processing...
                        </span>
                      )}
                    </div>
                    {apiStep ? (
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: state === 'done' ? '#94a3b8' : sty.text }}>
                        {apiStep.detail}
                      </p>
                    ) : (
                      <p className="text-xs mt-0.5" style={{ color: '#1e3a5f' }}>
                        {['Inventory check initiated', 'AI scans stock data', 'Smart decision engine', 'Perform automation action', 'Final status'][i]}
                      </p>
                    )}
                  </div>

                  {/* Progress connector */}
                  {i < IDLE_STEPS.length - 1 && state === 'done' && (
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-2.5" style={{ color: '#10b981' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Result Banner */}
          {phase === 'done' && result && (
            <div className="mt-5 p-4 rounded-2xl animate-fade-in"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">Automation Completed Successfully</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{result.message}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Logged to Activity</span>
                <span className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> Analytics Updated</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-500" /> Successful Runs +1</span>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="mt-5 p-4 rounded-2xl animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-bold text-sm">Execution Failed</span>
              </div>
              <p className="text-slate-500 text-sm">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex gap-3">
          {phase === 'done' && (
            <>
              <button onClick={onClose}
                className="flex-1 btn-primary btn-md justify-center">
                <CheckCircle className="w-4 h-4" /> Done
              </button>
              <button onClick={runExecution}
                className="btn-outline btn-md">
                <RefreshCw className="w-4 h-4" /> Run Again
              </button>
            </>
          )}
          {phase === 'error' && (
            <>
              <button onClick={runExecution}
                className="flex-1 btn-primary btn-md justify-center">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
              <button onClick={onClose} className="btn-outline btn-md">
                Close
              </button>
            </>
          )}
          {phase === 'running' && (
            <div className="flex-1 flex items-center justify-center gap-3 py-2 rounded-xl"
              style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}>
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-400 text-sm font-medium">Running automation pipeline...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
