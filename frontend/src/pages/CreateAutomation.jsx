import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap, ArrowLeft, CheckCircle, AlertCircle, ChevronRight,
  Clock, GitBranch, Send, Cpu, Layers
} from 'lucide-react';
import { automationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const TRIGGERS = [
  { value: 'Low Inventory', label: 'Low Inventory Alert', icon: '📦', desc: 'Trigger when stock falls below threshold' },
  { value: 'Schedule',       label: 'Scheduled Time',    icon: '🕐', desc: 'Run at a specific time or interval' },
  { value: 'New Task',       label: 'New Task Created',  icon: '📋', desc: 'Trigger when a task is added' },
  { value: 'File Added',     label: 'File Uploaded',     icon: '📁', desc: 'Trigger when a file is detected' },
  { value: 'Manual Trigger', label: 'Manual / On-Demand',icon: '⚡', desc: 'Run manually whenever needed' },
];
const ACTIONS = [
  { value: 'Send Restock Request', label: 'Send Restock Request', icon: '🛒', desc: 'Create a restock order automatically' },
  { value: 'Send Notification', label: 'Send Notification', icon: '🔔', desc: 'Push alert to subscribers' },
  { value: 'Create Task',       label: 'Create Task',       icon: '✅', desc: 'Auto-create a task in your system' },
  { value: 'Update Record',     label: 'Update Record',     icon: '🔄', desc: 'Sync data to your database' },
  { value: 'Generate Report',   label: 'Generate Report',   icon: '📊', desc: 'Build and save a report' },
  { value: 'Send Email',        label: 'Send Email',        icon: '📧', desc: 'Deliver email to recipients' },
];
const FREQUENCIES = [
  { value: 'Once',   label: 'Once',   icon: '1️⃣', desc: 'Run a single time' },
  { value: 'Daily',  label: 'Daily',  icon: '📅', desc: 'Every day at set time' },
  { value: 'Weekly', label: 'Weekly', icon: '📆', desc: 'Once a week' },
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
    name: '', trigger: '', action: '', frequency: 'Daily', description: '',
    metadata: { item: '', currentStock: '', threshold: '' }
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name, trigger: editData.trigger, action: editData.action,
        frequency: editData.frequency, description: editData.description || '',
        metadata: editData.metadata || { item: '', currentStock: '', threshold: '' }
      });
    } else if (prefill) {
      setForm(p => ({
        ...p,
        name: prefill.name || '', trigger: prefill.trigger || '',
        action: prefill.action || '', frequency: prefill.frequency || 'Daily'
      }));
    }
  }, []);

  const canNext = () => {
    if (step === 0) return !!form.trigger;
    if (step === 1) return !!form.action;
    if (step === 2) return !!form.frequency;
    return !!form.name.trim();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Please give your automation a name'); return; }
    // Build payload - include metadata for inventory automations
    const isInventory = form.trigger === 'Low Inventory';
    const payload = { ...form };
    if (isInventory) {
      payload.metadata = {
        item: form.metadata?.item || form.name,
        currentStock: Number(form.metadata?.currentStock) || 0,
        threshold: Number(form.metadata?.threshold) || 10,
      };
    }
    setLoading(true);
    try {
      if (isEditing) {
        await automationsAPI.update(editData._id, payload);
        toast.success('Automation updated!');
      } else {
        await automationsAPI.create(payload);
        setDone(true);
      }
      setTimeout(() => navigate('/automations'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save automation');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="page-inner flex items-center justify-center min-h-[70vh]">
      <div className="text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.25)' }}>
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Automation Created!</h2>
        <p className="text-slate-500">Redirecting to your automations...</p>
      </div>
    </div>
  );

  const currentTrigger = TRIGGERS.find(t => t.value === form.trigger);
  const currentAction  = ACTIONS.find(a => a.value === form.action);
  const currentFreq    = FREQUENCIES.find(f => f.value === form.frequency);

  return (
    <div className="page-inner">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}
          className="icon-btn"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="page-title mb-0">{isEditing ? 'Edit Automation' : 'Create Automation'}</h1>
          <p className="page-subtitle">{isEditing ? 'Update your workflow settings' : 'Build a new intelligent workflow in 4 steps'}</p>
        </div>
      </div>

      {/* Step Indicator */}
      {!isEditing && (
        <div className="flex items-center mb-8 max-w-2xl">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="step-item">
                <div className={`step-circle ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className="text-xs font-semibold" style={{ color: i === step ? '#60a5fa' : i < step ? '#10b981' : '#1e3a5f' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        {/* LEFT — Form */}
        <div className="xl:col-span-2">
          {/* STEP 0: Trigger */}
          {(step === 0 || isEditing) && !isEditing && (
            <div className="card animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">Choose Trigger</h2>
              <p className="text-slate-500 text-sm mb-5">What event starts this automation?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {TRIGGERS.map(t => (
                  <button key={t.value} onClick={() => setForm(p => ({ ...p, trigger: t.value }))}
                    className="p-4 rounded-xl text-left transition-all border"
                    style={{
                      background: form.trigger === t.value ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: form.trigger === t.value ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.05)',
                    }}
                    onMouseOver={e => { if (form.trigger !== t.value) e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; }}
                    onMouseOut={e => { if (form.trigger !== t.value) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{t.icon}</span>
                      {form.trigger === t.value && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-white font-semibold text-sm">{t.label}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Action */}
          {(step === 1 || isEditing) && !isEditing && (
            <div className="card animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">Choose Action</h2>
              <p className="text-slate-500 text-sm mb-5">What should happen when this automation runs?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {ACTIONS.map(a => (
                  <button key={a.value} onClick={() => setForm(p => ({ ...p, action: a.value }))}
                    className="p-4 rounded-xl text-left transition-all border"
                    style={{
                      background: form.action === a.value ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: form.action === a.value ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)',
                    }}
                    onMouseOver={e => { if (form.action !== a.value) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; }}
                    onMouseOut={e => { if (form.action !== a.value) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{a.icon}</span>
                      {form.action === a.value && <CheckCircle className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-white font-semibold text-sm">{a.label}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Frequency */}
          {(step === 2 || isEditing) && !isEditing && (
            <div className="card animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">Set Frequency</h2>
              <p className="text-slate-500 text-sm mb-5">How often should this run?</p>
              <div className="grid grid-cols-3 gap-3">
                {FREQUENCIES.map(f => (
                  <button key={f.value} onClick={() => setForm(p => ({ ...p, frequency: f.value }))}
                    className="p-5 rounded-xl text-center transition-all border"
                    style={{
                      background: form.frequency === f.value ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: form.frequency === f.value ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.05)',
                    }}
                    id={`freq-${f.value.toLowerCase()}`}>
                    <div className="text-3xl mb-2">{f.icon}</div>
                    <p className="text-white font-bold text-sm">{f.label}</p>
                    <p className="text-slate-600 text-xs mt-1">{f.desc}</p>
                    {form.frequency === f.value && <CheckCircle className="w-4 h-4 text-cyan-400 mx-auto mt-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 / EDIT: Review & Name */}
          {(step === 3 || isEditing) && (
            <div className="card animate-fade-in space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {isEditing ? 'Update Settings' : 'Review & Activate'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {isEditing ? 'Modify your automation settings below.' : 'Give your automation a name and activate it.'}
                </p>
              </div>

              {isEditing && (
                <>
                  <div>
                    <label className="form-label">Trigger</label>
                    <select value={form.trigger} onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))} className="form-select">
                      {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Action</label>
                    <select value={form.action} onChange={e => setForm(p => ({ ...p, action: e.target.value }))} className="form-select">
                      {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Frequency</label>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className="form-select">
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="form-label" htmlFor="auto-name">Automation Name *</label>
                <input id="auto-name" type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input text-base font-semibold"
                  placeholder="e.g. Low Inventory Alert" />
              </div>

              {/* Inventory-specific fields */}
              {form.trigger === 'Low Inventory' && (
                <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📦</span>
                    <p className="text-white font-bold text-sm">Inventory Configuration</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="form-label" htmlFor="inv-item">Item Name</label>
                      <input id="inv-item" type="text" value={form.metadata?.item || ''}
                        onChange={e => setForm(p => ({ ...p, metadata: { ...p.metadata, item: e.target.value } }))}
                        className="form-input" placeholder="e.g. Laptop Components" />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="inv-stock">Current Stock</label>
                      <input id="inv-stock" type="number" min="0" value={form.metadata?.currentStock ?? ''}
                        onChange={e => setForm(p => ({ ...p, metadata: { ...p.metadata, currentStock: e.target.value } }))}
                        className="form-input" placeholder="e.g. 5" />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="inv-threshold">Threshold</label>
                      <input id="inv-threshold" type="number" min="1" value={form.metadata?.threshold ?? ''}
                        onChange={e => setForm(p => ({ ...p, metadata: { ...p.metadata, threshold: e.target.value } }))}
                        className="form-input" placeholder="e.g. 10" />
                    </div>
                  </div>
                  {form.metadata?.currentStock !== '' && form.metadata?.threshold !== '' && (
                    <div className="flex items-center gap-2 text-xs font-semibold"
                      style={{ color: Number(form.metadata?.currentStock) < Number(form.metadata?.threshold) ? '#f87171' : '#34d399' }}>
                      <span>{Number(form.metadata?.currentStock) < Number(form.metadata?.threshold) ? '⚠️' : '✅'}</span>
                      {Number(form.metadata?.currentStock) < Number(form.metadata?.threshold)
                        ? `Stock (${form.metadata?.currentStock}) is below threshold (${form.metadata?.threshold}) — will trigger restock`
                        : `Stock is sufficient — automation will monitor`}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="form-label" htmlFor="auto-desc">Description <span className="text-slate-700 font-normal">(optional)</span></label>
                <textarea id="auto-desc" rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="form-input resize-none"
                  placeholder="Brief description of what this automation does..." />
              </div>

              <button id="submit-automation" onClick={handleSubmit} disabled={loading || !form.name.trim()}
                className="btn-primary btn-lg w-full justify-center">
                {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Zap className="w-5 h-5" />
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create & Activate'}
              </button>
            </div>
          )}

          {/* Navigation */}
          {!isEditing && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="btn-outline btn-md disabled:opacity-30">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {step < 3 && (
                <button onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="btn-primary btn-md disabled:opacity-40">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Preview */}
        <div className="hidden xl:block">
          <div className="card sticky top-6" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.06),rgba(124,58,237,0.04))', border: '1px solid rgba(37,99,235,0.15)' }}>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Workflow Preview
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Trigger', value: currentTrigger?.label, icon: currentTrigger?.icon, color: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', pending: 'Select a trigger' },
                { label: 'AI Analysis', value: 'Smart pattern matching', icon: '🤖', color: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.2)', static: true },
                { label: 'Action', value: currentAction?.label, icon: currentAction?.icon, color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', pending: 'Select an action' },
                { label: 'Frequency', value: currentFreq?.label, icon: currentFreq?.icon, color: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.2)', pending: 'Select frequency' },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: row.value || row.static ? row.color : 'rgba(255,255,255,0.02)', border: `1px solid ${row.value || row.static ? row.border : 'rgba(255,255,255,0.05)'}` }}>
                    <span className="text-xl w-8 text-center">{row.icon || '•'}</span>
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{row.label}</p>
                      <p className={`text-sm font-semibold ${row.value || row.static ? 'text-white' : 'text-slate-700'}`}>
                        {row.value || row.pending}
                      </p>
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="flex justify-center my-1">
                      <div className="w-px h-4" style={{ background: 'rgba(37,99,235,0.2)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {form.name && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-slate-600 mb-1">Name</p>
                <p className="text-white font-bold text-sm">{form.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
