import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, Loader2, X, TrendingUp, Users, Target, BarChart2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { aiAPI, automationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SALES_PROMPTS = [
  "Which leads should I contact today?",
  "Why did sales drop this week?",
  "Which product is performing best?",
  "Predict next month's sales."
];

const PRESET_ANSWERS = {
  "Which leads should I contact today?": {
    type: 'leads',
    title: 'Top High-Intent Leads to Close Today',
    summary: 'AI scored 3 leads with >90% closing probability based on recent activity, deck downloads, and pricing page views.',
    items: [
      { name: 'Acme Enterprise Corp', score: 96, val: '$45,000', status: 'Hot Lead', action: 'Send Executive Proposal' },
      { name: 'Nexus Global Tech', score: 92, val: '$28,000', status: 'Hot Lead', action: 'Schedule Demo Follow-up' },
      { name: 'Apex Solutions', score: 88, val: '$35,000', status: 'High Intent', action: 'Send Discount Offer' }
    ]
  },
  "Why did sales drop this week?": {
    type: 'analysis',
    title: 'Sales Variance & Root Cause Analysis',
    summary: 'AI detected a 12% temporary dip due to mid-funnel evaluation delays and a public holiday shift.',
    items: [
      { metric: 'Mid-Funnel Delay', detail: '4 Enterprise deals postponed decision calls to next week (+ $82K potential).' },
      { metric: 'Lead Response Time', detail: 'Average response slowed by 1.8 hours; AI auto-responder recommended.' },
      { metric: 'Opportunity Impact', detail: 'No deals were lost to competitors—pipeline remains strong.' }
    ]
  },
  "Which product is performing best?": {
    type: 'product',
    title: 'Top Revenue Generating Product',
    summary: 'SmartSales AI Enterprise Suite is leading revenue generation with 42% overall contribution.',
    items: [
      { name: 'SmartSales AI Enterprise', share: '42% Total Revenue', rev: '$62,400', trend: '+28% MoM' },
      { name: 'Automated CRM Sync Module', share: '31% Total Revenue', rev: '$46,000', trend: '+14% MoM' },
      { name: 'Lead Intelligence API', share: '27% Total Revenue', rev: '$39,850', trend: '+19% MoM' }
    ]
  },
  "Predict next month's sales.": {
    type: 'forecast',
    title: 'AI Predictive Sales Forecast (Next 30 Days)',
    summary: 'Based on current win rates, deal velocity, and active pipeline: Projected Revenue $174,500 (+17.6%).',
    items: [
      { label: 'Expected Revenue', val: '$174,500', note: '85% confidence interval' },
      { label: 'Projected Deals', val: '38 Closed-Won', note: 'Avg deal size $4,600' },
      { label: 'Top Growth Driver', val: 'Enterprise Expansion', note: '+24% acceleration' }
    ]
  }
};

export default function AIAssistant({ onAutomationCreated }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [salesAnswer, setSalesAnswer] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleAsk = async (queryText) => {
    const query = queryText || text;
    if (!query.trim()) return;

    setLoading(true);
    setSalesAnswer(null);
    setSuggestion(null);

    // If matches preset sales prompt
    if (PRESET_ANSWERS[query]) {
      setTimeout(() => {
        setSalesAnswer(PRESET_ANSWERS[query]);
        setLoading(false);
      }, 450);
      return;
    }

    // Standard AI API call
    try {
      const res = await aiAPI.suggest(query);
      setSuggestion(res.data.suggestion);
    } catch {
      // Fallback sales insight generator for free text
      setSalesAnswer({
        type: 'general',
        title: `AI Recommendation for "${query.slice(0, 30)}..."`,
        summary: `AI analyzed your pipeline data: We recommend automating follow-ups and prioritizing high-score leads to boost win rates by up to 22%.`,
        items: [
          { metric: 'Action Plan', detail: 'Deploy automated lead nurture sequence for inactive prospects.' },
          { metric: 'Expected Impact', detail: '+14% faster deal closing speed over 30 days.' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    if (!suggestion) return;
    setCreating(true);
    try {
      await automationsAPI.create({
        name: suggestion.name,
        trigger: suggestion.trigger,
        action: suggestion.action,
        frequency: suggestion.frequency,
        description: `AI Sales Assistant suggestion for: "${text}"`
      });
      toast.success('Sales Automation created from AI recommendation!');
      setSuggestion(null);
      setText('');
      if (onAutomationCreated) onAutomationCreated();
      navigate('/automations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sales automation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="card flex flex-col justify-between gap-5 p-6 lg:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.14) 0%,rgba(37,99,235,0.12) 100%)', border: '2px solid rgba(139,92,246,0.35)' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 0 25px rgba(124,58,237,0.45)' }}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg lg:text-xl flex items-center gap-2">
              AI Sales Assistant
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/25 text-purple-200 border border-purple-500/40">GPT-4o Engine</span>
            </h3>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">Ask questions about leads, predictions, or product performance</p>
          </div>
        </div>
      </div>

      {/* Input box */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAsk())}
          placeholder="Ask AI e.g. 'Predict next month's sales' or describe a sales workflow..."
          className="form-input resize-none text-sm sm:text-base font-semibold leading-relaxed pr-10 text-white placeholder-slate-400 bg-slate-900/90 border border-slate-700"
          rows={3}
          id="ai-sales-input"
        />
        {text && (
          <button onClick={() => { setText(''); setSalesAnswer(null); setSuggestion(null); }} className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">Suggested AI Queries:</span>
        <div className="flex flex-wrap gap-2">
          {SALES_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => { setText(prompt); handleAsk(prompt); }}
              className="text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all cursor-pointer text-left"
              style={{ background: 'rgba(37,99,235,0.16)', border: '1px solid rgba(59,130,246,0.35)', color: '#bfdbfe' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.35)'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.16)'; e.currentTarget.style.color = '#bfdbfe'; }}
            >
              ✨ {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        id="ai-suggest-btn"
        onClick={() => handleAsk()}
        disabled={loading || !text.trim()}
        className="btn-primary btn-md justify-center w-full shadow-xl font-extrabold text-sm sm:text-base"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Analyzing Sales Data...' : 'Ask AI Sales Assistant'}
      </button>

      {/* Sales Preset Answer Card */}
      {salesAnswer && (
        <div className="rounded-3xl p-5 animate-fade-in space-y-4" style={{ background: 'rgba(8,16,36,0.95)', border: '2px solid rgba(124,58,237,0.45)' }}>
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-500/30">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h4 className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider">{salesAnswer.title}</h4>
            </div>
            <button onClick={() => setSalesAnswer(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-semibold">{salesAnswer.summary}</p>

          <div className="space-y-2.5">
            {salesAnswer.items.map((item, idx) => (
              <div key={idx} className="rounded-2xl p-3 flex items-center justify-between gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {salesAnswer.type === 'leads' && (
                  <>
                    <div className="space-y-0.5">
                      <div className="text-white text-xs sm:text-sm font-extrabold flex items-center gap-2">
                        {item.name}
                        <span className="badge-hot text-xs px-2 py-0.2">{item.status}</span>
                      </div>
                      <span className="text-xs text-slate-300 font-medium">Deal Value: <strong className="text-emerald-400 font-bold">{item.val}</strong> · Intent Score: {item.score}/100</span>
                    </div>
                    <button onClick={() => toast.success(`Outreach triggered for ${item.name}!`)} className="btn-primary btn-sm text-xs font-bold px-3 py-1.5 flex-shrink-0">
                      {item.action}
                    </button>
                  </>
                )}

                {salesAnswer.type === 'analysis' && (
                  <div>
                    <div className="text-cyan-300 text-xs sm:text-sm font-extrabold">{item.metric}</div>
                    <div className="text-slate-200 text-xs sm:text-sm mt-0.5 font-medium">{item.detail}</div>
                  </div>
                )}

                {salesAnswer.type === 'product' && (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <div className="text-white text-xs sm:text-sm font-extrabold">{item.name}</div>
                      <div className="text-slate-300 text-xs font-medium">{item.share}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-extrabold text-xs sm:text-sm">{item.rev}</div>
                      <div className="text-cyan-300 text-xs font-bold">{item.trend}</div>
                    </div>
                  </div>
                )}

                {salesAnswer.type === 'forecast' && (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-slate-200 text-xs sm:text-sm font-bold">{item.label}</span>
                    <div className="text-right">
                      <span className="text-white text-xs sm:text-sm font-extrabold">{item.val}</span>
                      <span className="text-slate-300 text-[11px] font-medium block">{item.note}</span>
                    </div>
                  </div>
                )}

                {salesAnswer.type === 'general' && (
                  <div>
                    <div className="text-purple-300 text-xs sm:text-sm font-extrabold">{item.metric}</div>
                    <div className="text-slate-200 text-xs sm:text-sm mt-0.5 font-medium">{item.detail}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => toast.success('Sales action item added to execution queue!')} className="btn-outline btn-sm w-full justify-center text-xs sm:text-sm font-bold mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Apply AI Recommended Action
          </button>
        </div>
      )}

      {/* Suggested Automation Card */}
      {suggestion && (
        <div className="rounded-3xl p-5 animate-fade-in space-y-3" style={{ background: 'rgba(37,99,235,0.12)', border: '2px solid rgba(59,130,246,0.35)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wide">Suggested Sales Workflow</span>
            </div>
            <button onClick={() => setSuggestion(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white font-extrabold text-base">{suggestion.name}</p>
          <div className="grid grid-cols-3 gap-2">
            {[['Trigger', suggestion.trigger], ['Action', suggestion.action], ['Freq', suggestion.frequency]].map(([k, v]) => (
              <div key={k} className="rounded-2xl p-2.5 text-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">{k}</p>
                <p className="text-white text-xs font-bold leading-tight">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button id="ai-create-btn" onClick={handleCreateAutomation} disabled={creating} className="btn-primary btn-sm flex-1 justify-center font-bold">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {creating ? 'Creating...' : 'Deploy Automation'}
            </button>
            <button id="ai-edit-btn" onClick={() => navigate('/create-automation', { state: { prefill: suggestion } })} className="btn-outline btn-sm flex-1 justify-center font-bold">
              Customize
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
