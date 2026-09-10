import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap, ArrowLeft, CheckCircle, AlertCircle, ChevronRight,
  Clock, GitBranch, Send, Cpu, Layers, Sparkles, RefreshCw
} from 'lucide-react';
import { automationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const TRIGGERS = [
  { value: 'Low Inventory', label: 'Low Inventory Alert', icon: '📦', desc: 'Trigger when warehouse stock falls below threshold' },
  { value: 'Schedule',       label: 'Scheduled Time',    icon: '🕐', desc: 'Run at a specific time or recurring interval' },
  { value: 'New Task',       label: 'New Task Created',  icon: '📋', desc: 'Trigger when a task or lead is added' },
  { value: 'File Added',     label: 'File Uploaded',     icon: '📁', desc: 'Trigger when a new dataset or file is detected' },
  { value: 'Manual Trigger', label: 'Manual / On-Demand',icon: '⚡', desc: 'Run manually anytime from the dashboard' },
];

const ACTIONS = [
  { value: 'Send Restock Request', label: 'Send Restock Request', icon: '🛒', desc: 'Auto-create procurement order when low stock' },
  { value: 'Send Notification',    label: 'Send Notification',    icon: '🔔', desc: 'Push alert to Slack or dashboard team' },
  { value: 'Create Task',          label: 'Create Task',          icon: '✅', desc: 'Auto-assign a task in your sales pipeline' },
  { value: 'Update Record',        label: 'Update Record',        icon: '🔄', desc: 'Sync data instantly to your database/ERP' },
  { value: 'Generate Report',      label: 'Generate Report',      icon: '📊', desc: 'Build and compile executive summary report' },
  { value: 'Send Email',           label: 'Send Email',           icon: '📧', desc: 'Deliver tailored emails to customers/stakeholders' },
];

const FREQUENCIES = [
  { value: 'Once',   label: 'Once (Instant)', icon: '1️⃣', desc: 'Run a single time on trigger' },
  { value: 'Daily',  label: 'Daily',          icon: '📅', desc: 'Every day at scheduled time' },
  { value: 'Weekly', label: 'Weekly',         icon: '📆', desc: 'Once a week automatically' },
];

const PRESETS = [
  {
    title: 'Low Inventory Restock Alert',
    trigger: 'Low Inventory',
    action: 'Send Restock Request',
    frequency: 'Daily',
    name: 'Low Inventory Alert & Auto-Restock',
    desc: 'Monitors inventory levels and automatically places restock orders when items drop below safety buffer.',
    metadata: { item: 'Laptop Components', currentStock: '5', threshold: '10' }
  },
  {
    title: 'Instant Lead Qualification',
    trigger: 'Manual Trigger',
    action: 'Send Notification',
    frequency: 'Once',
    name: 'AI Lead Scoring & Instant Qualification',
    desc: 'Evaluates prospect buying signals and scores deals 0-100 with automated executive notifications.',
    metadata: {}
  },
  {
    title: 'Daily Executive Digest',
    trigger: 'Schedule',
    action: 'Generate Report',
    frequency: 'Daily',
    name: 'Daily Executive Performance Digest',
    desc: 'Compiles 24h KPI telemetry and broadcasts a summary digest to team channels.',
    metadata: {}
  },
  {
    title: 'Customer Churn Re-engagement',
    trigger: 'Schedule',
    action: 'Send Email',
    frequency: 'Weekly',
    name: 'Customer Churn Prevention & Retention',
    desc: 'Detects 14-day inactivity drops and automatically sends personalized VIP re-engagement offers.',
    metadata: {}
  }
];

const STEPS = ['Trigger', 'Action', 'Frequency', 'Review'];

export default function CreateAutomation() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData  = location.state?.edit;
  const prefill   = location.state?.prefill;
  const isEditing = !!editData;

  const [step, setStep] = useState(isEditing ? 3 : 0);
  const [form, setForm] = useState({
    name: '',
    trigger: 'Low Inventory',
    action: 'Send Restock Request',
    frequency: 'Daily',
    description: '',
    metadata: { item: 'Laptop Components', currentStock: '5', threshold: '10' }
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        trigger: editData.trigger || 'Low Inventory',
        action: editData.action || 'Send Restock Request',
        frequency: editData.frequency || 'Daily',
        description: editData.description || '',
        metadata: editData.metadata || { item: '', currentStock: '', threshold: '' }
      });
    } else if (prefill) {
      setForm(p => ({
        ...p,
        name: prefill.name || '',
        trigger: prefill.trigger || 'Manual Trigger',
        action: prefill.action || 'Send Notification',
        frequency: prefill.frequency || 'Daily',
        description: prefill.description || ''
      }));
    }
  }, [editData, prefill]);

  const canNext = () => {
    if (step === 0) return !!form.trigger;
    if (step === 1) return !!form.action;
    if (step === 2) return !!form.frequency;
    return !!form.name.trim();
  };

  const applyPreset = (preset) => {
    setForm({
      name: preset.name,
      trigger: preset.trigger,
      action: preset.action,
      frequency: preset.frequency,
      description: preset.desc,
      metadata: preset.metadata || {}
    });
    setStep(3);
    toast.success(`Loaded template: "${preset.title}"`);
  };

  const handleSubmit = async () => {
    const finalName = form.name.trim() || (form.trigger === 'Low Inventory' ? 'Low Inventory Alert' : `${form.trigger} Automation`);
    const isInventory = form.trigger === 'Low Inventory';
    const payload = {
      ...form,
      name: finalName
    };

    if (isInventory) {
      payload.metadata = {
        item: form.metadata?.item || finalName,
        currentStock: Number(form.metadata?.currentStock) || 0,
        threshold: Number(form.metadata?.threshold) || 10,
      };
    }

    setLoading(true);
    try {
      if (isEditing) {
        await automationsAPI.update(editData._id, payload);
        toast.success('Automation updated successfully!');
        navigate('/automations');
      } else {
        await automationsAPI.create(payload);
        toast.success('Automation created & activated!');
        setDone(true);
        setTimeout(() => navigate('/automations'), 900);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save automation');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="page-inner flex items-center justify-center min-h-[70vh]">
      <div className="text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)' }}>
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-white mb-2">Automation Created & Activated!</h2>
        <p className="text-slate-400 font-medium">Redirecting to your automation workspace...</p>
      </div>
    </div>
  );

  const currentTrigger = TRIGGERS.find(t => t.value === form.trigger);
  const currentAction  = ACTIONS.find(a => a.value === form.action);
  const currentFreq    = FREQUENCIES.find(f => f.value === form.frequency);

  return (
    <div className="page-inner space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="icon-btn" title="Go back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title mb-0">{isEditing ? 'Edit Automation' : 'Create Automation'}</h1>
            <p className="page-subtitle">{isEditing ? 'Update workflow configurations' : 'Build and deploy autonomous workflows in seconds'}</p>
          </div>
        </div>

        {/* Quick presets button */}
        {!isEditing && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">1-Click Starters:</span>
            {PRESETS.slice(0, 2).map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-all"
              >
                ⚡ {p.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step Indicator - Interactive & Clickable */}
      {!isEditing && (
        <div className="flex items-center mb-6 max-w-2xl bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => setStep(i)}
                className="step-item group cursor-pointer focus:outline-none"
              >
                <div className={`step-circle transition-all ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className="text-xs font-bold transition-colors"
                  style={{ color: i === step ? '#60a5fa' : i < step ? '#10b981' : '#64748b' }}>
                  {s}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < step ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        {/* LEFT — Form Content */}
        <div className="xl:col-span-2 space-y-6">

          {/* STEP 0: Trigger Selection */}
          {(step === 0 || isEditing) && !isEditing && (
            <div className="card animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-0.5">1. Select Trigger</h2>
                  <p className="text-slate-400 text-sm">Choose what event automatically starts this automation</p>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Step 1 of 4
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {TRIGGERS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setForm(p => ({
                        ...p,
                        trigger: t.value,
                        name: p.name || `${t.label} Automation`
                      }));
                    }}
                    className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                      form.trigger === t.value
                        ? 'border-blue-500 bg-blue-600/15 shadow-lg shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{t.icon}</span>
                      {form.trigger === t.value && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <p className="text-white font-bold text-sm">{t.label}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Action Selection */}
          {(step === 1 || isEditing) && !isEditing && (
            <div className="card animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-0.5">2. Choose Action</h2>
                  <p className="text-slate-400 text-sm">What should happen when this automation is triggered?</p>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Step 2 of 4
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {ACTIONS.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setForm(p => ({ ...p, action: a.value }))}
                    className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                      form.action === a.value
                        ? 'border-purple-500 bg-purple-600/15 shadow-lg shadow-purple-500/10'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{a.icon}</span>
                      {form.action === a.value && (
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <p className="text-white font-bold text-sm">{a.label}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Frequency Selection */}
          {(step === 2 || isEditing) && !isEditing && (
            <div className="card animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-0.5">3. Set Frequency</h2>
                  <p className="text-slate-400 text-sm">How often should this automation evaluate conditions?</p>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Step 3 of 4
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {FREQUENCIES.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setForm(p => ({ ...p, frequency: f.value }))}
                    className={`p-5 rounded-2xl text-center transition-all border cursor-pointer ${
                      form.frequency === f.value
                        ? 'border-cyan-500 bg-cyan-600/15 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">{f.icon}</div>
                    <p className="text-white font-bold text-sm">{f.label}</p>
                    <p className="text-slate-400 text-xs mt-1">{f.desc}</p>
                    {form.frequency === f.value && (
                      <CheckCircle className="w-4 h-4 text-cyan-400 mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 / EDIT: Review & Activate */}
          {(step === 3 || isEditing) && (
            <div className="card animate-fade-in space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {isEditing ? 'Update Settings' : 'Review & Activate'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isEditing ? 'Modify your workflow settings below.' : 'Give your automation a name and activate it.'}
                </p>
              </div>

              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Trigger</label>
                    <select
                      value={form.trigger}
                      onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))}
                      className="form-select"
                    >
                      {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Action</label>
                    <select
                      value={form.action}
                      onChange={e => setForm(p => ({ ...p, action: e.target.value }))}
                      className="form-select"
                    >
                      {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Frequency</label>
                    <select
                      value={form.frequency}
                      onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                      className="form-select"
                    >
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label" htmlFor="auto-name">Automation Name *</label>
                <input
                  id="auto-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input text-base font-semibold"
                  placeholder="e.g. Low Inventory Alert & Auto-Restock"
                />
              </div>

              {/* Inventory-specific configuration */}
              {form.trigger === 'Low Inventory' && (
                <div className="rounded-2xl p-5 space-y-4 bg-blue-950/40 border border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📦</span>
                    <p className="text-white font-bold text-sm">Inventory Monitoring Configuration</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="form-label" htmlFor="inv-item">Item Name</label>
                      <input
                        id="inv-item"
                        type="text"
                        value={form.metadata?.item || ''}
                        onChange={e => setForm(p => ({ ...p, metadata: { ...p.metadata, item: e.target.value } }))}
                        className="form-input"
                        placeholder="e.g. Laptop Components"
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="inv-stock">Current Stock</label>
                      <input
                        id="inv-stock"
                        type="number"
                        min="0"
                        value={form.metadata?.currentStock ?? ''}
                        onChange={e => setForm(p => ({ ...p, metadata: { ...p.metadata, currentStock: e.target.value } }))}
                        className="form-input"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="inv-threshold">Threshold</label>
                      <input
                        id="inv-threshold"
                        type="number"
                        min="1"
                        value={form.metadata?.threshold ?? ''}
                        onChange={e => setForm(p => ({ ...p, metadata: { ...p.metadata, threshold: e.target.value } }))}
                        className="form-input"
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>
                  {form.metadata?.currentStock !== '' && form.metadata?.threshold !== '' && (
                    <div
                      className="flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl"
                      style={{
                        background: Number(form.metadata?.currentStock) < Number(form.metadata?.threshold) ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: Number(form.metadata?.currentStock) < Number(form.metadata?.threshold) ? '#f87171' : '#34d399'
                      }}
                    >
                      <span>{Number(form.metadata?.currentStock) < Number(form.metadata?.threshold) ? '⚠️' : '✅'}</span>
                      {Number(form.metadata?.currentStock) < Number(form.metadata?.threshold)
                        ? `Current stock (${form.metadata?.currentStock}) is below threshold (${form.metadata?.threshold}) — will trigger restock request`
                        : `Stock is sufficient (${form.metadata?.currentStock} >= ${form.metadata?.threshold}) — automation will monitor`}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="form-label" htmlFor="auto-desc">
                  Description <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="auto-desc"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="form-input resize-none"
                  placeholder="Brief description of what this automation does..."
                />
              </div>

              <button
                id="submit-automation"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary btn-lg w-full justify-center text-base font-extrabold shadow-xl cursor-pointer"
              >
                {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Zap className="w-5 h-5" />
                {loading ? 'Activating Workflow...' : isEditing ? 'Save Changes' : 'Create & Activate Workflow'}
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          {!isEditing && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="btn-outline btn-md disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="btn-primary btn-md disabled:opacity-40 cursor-pointer font-bold"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setStep(0)}
                  className="btn-ghost btn-sm text-xs font-bold text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start Over
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Live Workflow Preview */}
        <div className="space-y-4">
          <div className="card sticky top-6 space-y-4 bg-slate-900/90 border border-blue-500/20 backdrop-blur-xl">
            <h3 className="text-white font-extrabold text-base flex items-center gap-2 pb-3 border-b border-slate-800">
              <Layers className="w-4 h-4 text-blue-400" /> Live Workflow Pipeline
            </h3>

            <div className="space-y-2.5">
              {[
                { label: 'Trigger', value: currentTrigger?.label, icon: currentTrigger?.icon, color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', pending: 'Select trigger' },
                { label: 'AI Engine', value: 'Neural Pattern Matching', icon: '🤖', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', static: true },
                { label: 'Action', value: currentAction?.label, icon: currentAction?.icon, color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', pending: 'Select action' },
                { label: 'Frequency', value: currentFreq?.label, icon: currentFreq?.icon, color: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', pending: 'Select frequency' },
              ].map((row, i) => (
                <div key={i}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      background: row.value || row.static ? row.color : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${row.value || row.static ? row.border : 'rgba(255,255,255,0.06)'}`
                    }}
                  >
                    <span className="text-xl w-7 text-center">{row.icon || '•'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{row.label}</p>
                      <p className={`text-xs font-bold truncate ${row.value || row.static ? 'text-white' : 'text-slate-600'}`}>
                        {row.value || row.pending}
                      </p>
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="flex justify-center my-1">
                      <div className="w-px h-3 bg-blue-500/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {form.name && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Workflow Name</p>
                <p className="text-white font-black text-sm truncate">{form.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
