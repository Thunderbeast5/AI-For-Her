import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import { useAuth } from '../../hooks/useAuth';
import {
  SparklesIcon,
  ArrowUpIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  BuildingLibraryIcon,
  CheckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  LightBulbIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const QUESTIONS = [
  { 
    key: 'location', 
    title: 'Location & Target Market',
    text: "Namaste! I'm Saharohi AI, your venture coach 👋 Which Indian city or town do you want to start your business in?",
    chips: ['Pune, Maharashtra', 'Mumbai, Maharashtra', 'Jaipur, Rajasthan', 'Bengaluru, Karnataka', 'Indore, MP', 'Lucknow, UP']
  },
  { 
    key: 'budget', 
    title: 'Investment Budget',
    text: "What is your total investment budget? (e.g. ₹50,000, 2 Lakh, 5L, or 100000)",
    chips: ['₹50,000', '₹1 Lakh', '₹2.5 Lakh', '₹5 Lakh', '₹10 Lakh']
  },
  { 
    key: 'domain', 
    title: 'Sector & Interest',
    text: "Which industry or domain interests you? (e.g. Food, Agriculture, Handicrafts, Beauty, Tech, Retail)",
    chips: ['Food & Catering', 'Handicrafts & Decor', 'Beauty & Wellness', 'Agriculture & Farming', 'Retail & E-commerce', 'Education & Daycare']
  },
];

function parseBudget(s) {
  if (typeof s === 'number') return s;
  const m = String(s)
    .toLowerCase()
    .replace(/[₹,\s]/g, '')
    .match(/^(\d+(?:\.\d+)?)(l|lakh|lakhs|k|cr|crore)?$/);
  if (!m) return null;
  const mult = { l: 1e5, lakh: 1e5, lakhs: 1e5, k: 1e3, cr: 1e7, crore: 1e7 }[m[2]] || 1;
  return Math.round(parseFloat(m[1]) * mult);
}

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const SAHAROHI_API_BASE_URL = import.meta.env.VITE_SAHAROHI_AI_API_URL?.replace(/\/+$/, '');

async function postAI(endpoint, body) {
  const urls = SAHAROHI_API_BASE_URL
    ? [`${SAHAROHI_API_BASE_URL}/api${endpoint}`]
    : [`/api${endpoint}`, `http://localhost:8000/api${endpoint}`];
  let lastError = null;

  for (const url of urls) {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      lastError = err;
      continue;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }
  throw lastError || new Error('Could not connect to the Saharohi AI backend');
}

const Chat = () => {
  const { currentUser } = useAuth();
  const sidebar = useMemo(() => <EntrepreneurSidebar />, []);

  const [messages, setMessages] = useState([
    { 
      id: 'welcome',
      role: 'bot', 
      type: 'text', 
      text: QUESTIONS[0].text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [filters, setFilters] = useState({});
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [activeContext, setActiveContext] = useState(null);
  const [selectedIdeaForConfirm, setSelectedIdeaForConfirm] = useState(null);
  const [copiedPlanIndex, setCopiedPlanIndex] = useState(null);

  const scrollBottomRef = useRef(null);
  const textareaRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const addMessage = (msg) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...msg,
      },
    ]);
  };

  const addBotText = (text) => addMessage({ role: 'bot', type: 'text', text });

  const handleSendMessage = async (customValue = null) => {
    const rawVal = customValue !== null ? customValue : input.trim();
    if (!rawVal || loading || (step > 2 && step !== 5)) return;

    if (customValue === null) {
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    addMessage({ role: 'user', type: 'text', text: rawVal });

    if (step === 5) {
      if (/\b(no|nope|nah|skip|later|not|don'?t)\b/i.test(rawVal)) {
        return declineSchemes();
      }
      if (/\b(yes|yeah|yep|sure|ok|okay|haan|scheme|schemes|subsid\w*|loan|grant|govt|government|give|show)\b/i.test(rawVal)) {
        return loadSchemes();
      }
      return addBotText("Please reply 'Yes' to view matching government schemes, or 'No' to conclude.");
    }

    const currentKey = QUESTIONS[step].key;
    let parsedValue = rawVal;

    if (currentKey === 'budget') {
      parsedValue = parseBudget(rawVal);
      if (!parsedValue || parsedValue <= 0) {
        return addBotText("I couldn't parse that budget amount. Try entering something like ₹1,50,000 or 2 Lakh.");
      }
    }

    const updatedFilters = { ...filters, [currentKey]: parsedValue };
    setFilters(updatedFilters);

    if (step < 2) {
      setStep(step + 1);
      return addBotText(QUESTIONS[step + 1].text);
    }

    setStep(3);
    setLoading(true);
    setLoadingStatus(`Searching grounded opportunities for ${updatedFilters.domain} in ${updatedFilters.location} within ${formatINR(updatedFilters.budget)}…`);
    
    try {
      const data = await postAI('/ideas', updatedFilters);
      addMessage({
        role: 'bot',
        type: 'ideas',
        ideas: data.ideas || [],
        sources: data.sources || [],
        filters: updatedFilters,
      });
    } catch (err) {
      console.error('Ideas error:', err);
      addBotText(`⚠️ Idea generation error: ${err.message}. Please verify the Saharohi AI backend server is running.`);
      setStep(2);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const initiateSelectIdea = (idea, f) => {
    if (loading || step >= 4) return;
    setSelectedIdeaForConfirm({ idea, filters: f });
  };

  const confirmGeneratePlan = async () => {
    if (!selectedIdeaForConfirm) return;
    const { idea, filters: f } = selectedIdeaForConfirm;
    setSelectedIdeaForConfirm(null);

    setStep(4);
    setLoading(true);
    setLoadingStatus(`Formulating 90-day execution roadmap and financial estimates for ${idea.title}…`);
    
    addMessage({ role: 'user', type: 'text', text: `Selected Opportunity: ${idea.title}` });
    addBotText(`Formulating a comprehensive, verified 90-day business roadmap for **${idea.title}** in ${f.location}…`);

    try {
      const data = await postAI('/plan', { ...f, idea });
      addMessage({
        role: 'bot',
        type: 'plan',
        plan: data.plan,
        sources: data.sources || [],
        idea,
        filters: f,
      });
      setActiveContext({ f, idea, plan: data.plan });
      setStep(5);
      addMessage({ role: 'bot', type: 'offer', idea });
    } catch (err) {
      console.error('Plan error:', err);
      addBotText(`⚠️ Business plan error: ${err.message}`);
      setStep(3);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const loadSchemes = async () => {
    if (!activeContext || loading) return;
    setStep(6);
    setLoading(true);
    setLoadingStatus("Matching state and central government schemes, subsidies, and credit-linked grants…");
    addBotText("Connecting with verified central and state subsidy databases for your business…");

    try {
      const data = await postAI('/schemes', { ...activeContext.f, idea: activeContext.idea });
      addMessage({
        role: 'bot',
        type: 'schemes',
        schemes: data.schemes || [],
        state: data.state,
      });
    } catch (err) {
      console.error('Schemes error:', err);
      addBotText("Could not fetch government schemes at this time. Click 'Retry Schemes' below to try again.");
      setStep(5);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const declineSchemes = () => {
    setStep(6);
    addBotText("All set! Best of luck with your entrepreneurial journey 🚀");
  };

  const copyPlanToClipboard = (planText, index) => {
    navigator.clipboard.writeText(planText);
    setCopiedPlanIndex(index);
    toast.success('Business plan copied to clipboard');
    setTimeout(() => setCopiedPlanIndex(null), 2500);
  };

  const downloadPlanPDF = (planText, idea) => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let y = 20;

      doc.setFillColor(141, 70, 36);
      doc.rect(0, 0, doc.internal.pageSize.width, 36, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Saharohi AI • Business Execution Plan', doc.internal.pageSize.width / 2, 22, { align: 'center' });

      y = 48;
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(14);
      doc.text(idea?.title || 'Business Plan', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(110, 100, 95);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Verified AI Estimates`, margin, y);
      y += 12;

      const cleanText = planText
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`{1,3}/g, '');

      const lines = doc.splitTextToSize(cleanText, doc.internal.pageSize.width - margin * 2);

      doc.setFontSize(10);
      doc.setTextColor(50, 45, 42);

      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines[i], margin, y);
        y += 5.5;
      }

      const fileName = `${idea?.title?.replace(/\s+/g, '_') || 'Business_Plan'}_Saharohi.pdf`;
      doc.save(fileName);
      toast.success('Business plan downloaded as PDF');
    } catch (e) {
      console.error('PDF error:', e);
      toast.error('Could not generate PDF');
    }
  };

  return (
    <DashboardLayout sidebar={sidebar} className="is-chat" contentClassName="is-chat">
      <div className="relative flex flex-col h-full w-full min-h-0 overflow-hidden bg-background">
        
        {/* Scrollable Message History Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 pt-6 pb-6 scroll-smooth">
          <div className="w-full space-y-7">
            {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`w-full flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'user' ? (
                /* User Query Box: Thin, narrow, rounded-2xl container */
                <div className="max-w-[80%] sm:max-w-[55%] md:max-w-[42%] w-fit bg-[#f5e9dd] text-[#3d2417] px-3.5 py-2 rounded-2xl rounded-tr-sm text-xs sm:text-sm leading-relaxed border border-[#8d4624]/20 shadow-xs break-words">
                  {m.text}
                </div>
              ) : (
                /* Assistant Message Canvas */
                <div className="w-full flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-[#f5e9dd] border border-[#8d4624]/20 flex items-center justify-center text-[#8d4624] shrink-0 mt-0.5">
                    <SparklesIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-4 text-stone-900 text-sm leading-relaxed min-w-0">
                    {/* Direct Text Output */}
                    {m.type === 'text' && (
                      <div className="prose prose-stone text-sm max-w-none leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                      </div>
                    )}

                    {/* Curated Opportunities Grid */}
                    {m.type === 'ideas' && (
                      <div className="space-y-4 pt-1">
                        <div>
                          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                            <LightBulbIcon className="w-4 h-4 text-[#8d4624]" />
                            Curated Opportunities for {m.filters?.location}
                          </h3>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Tailored for {m.filters?.domain} with {formatINR(m.filters?.budget)} capital.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {m.ideas?.map((idea, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-2xl border border-[#8d4624]/20 hover:border-[#8d4624]/40 bg-transparent flex flex-col justify-between transition-all"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#8d4624] uppercase tracking-wider">
                                    Option {i + 1}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] font-bold px-2 py-0 border ${
                                      idea.difficulty?.toLowerCase() === 'easy'
                                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50/50'
                                        : 'border-[#8d4624]/30 text-[#8d4624] bg-[#f5e9dd]/50'
                                    }`}
                                  >
                                    {idea.difficulty || 'Medium'}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                                  {idea.title}
                                </h4>
                                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                                  {idea.summary}
                                </p>

                                <div className="pt-2 border-t border-[#8d4624]/10 space-y-1 text-xs">
                                  <div className="flex justify-between text-stone-500">
                                    <span>Setup:</span>
                                    <strong className="text-stone-900">{formatINR(idea.startup_cost_inr)}</strong>
                                  </div>
                                  <div className="flex justify-between text-stone-500">
                                    <span>Rev / Mo:</span>
                                    <strong className="text-emerald-700">{formatINR(idea.monthly_revenue_potential_inr)}</strong>
                                  </div>
                                </div>
                              </div>

                              <Button
                                disabled={loading || step >= 4}
                                onClick={() => initiateSelectIdea(idea, m.filters)}
                                className="mt-4 w-full bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold h-8 shadow-xs"
                              >
                                Select Opportunity
                              </Button>
                            </div>
                          ))}
                        </div>

                        <SourcesInline sources={m.sources} />
                      </div>
                    )}

                    {/* Business Roadmap */}
                    {m.type === 'plan' && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b border-[#8d4624]/15 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#8d4624]">
                              90-Day Execution Roadmap
                            </span>
                            <span className="text-xs text-stone-400">•</span>
                            <span className="text-xs font-semibold text-stone-700">{m.idea?.title}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPlanToClipboard(m.plan, idx)}
                              className="h-7 text-xs text-stone-600 hover:text-[#8d4624] rounded-lg px-2"
                              title="Copy plan"
                            >
                              {copiedPlanIndex === idx ? (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadPlanPDF(m.plan, m.idea)}
                              className="h-7 text-xs text-stone-600 hover:text-[#8d4624] rounded-lg px-2"
                              title="Download PDF"
                            >
                              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="prose prose-stone text-sm max-w-none leading-relaxed space-y-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.plan}</ReactMarkdown>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-[#8d4624]/10">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <ShieldCheckIcon className="w-3.5 h-3.5" /> Validated market estimates
                          </span>
                          <span className="italic">Verify regional licenses locally</span>
                        </div>

                        <SourcesInline sources={m.sources} />
                      </div>
                    )}

                    {/* Government Scheme Offer Prompt */}
                    {m.type === 'offer' && (
                      <div className="p-4 rounded-2xl border border-[#8d4624]/20 space-y-3 bg-transparent">
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                          <BuildingLibraryIcon className="w-4 h-4 text-[#8d4624]" />
                          Explore matching government schemes & subsidies?
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          Saharohi AI can match state and central subsidy frameworks (e.g. PMEGP, Mudra, Stand-Up India) tailored to this setup.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            disabled={step !== 5 || loading}
                            onClick={() => {
                              addMessage({ role: 'user', type: 'text', text: 'Yes, match schemes' });
                              loadSchemes();
                            }}
                            className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs h-8 px-4 font-semibold shadow-xs"
                          >
                            Yes, Match Schemes
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={step !== 5 || loading}
                            onClick={() => {
                              addMessage({ role: 'user', type: 'text', text: 'No, thank you' });
                              declineSchemes();
                            }}
                            className="text-stone-500 hover:text-stone-800 text-xs h-8 px-3 rounded-xl"
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Schemes Direct Grid */}
                    {m.type === 'schemes' && (
                      <div className="space-y-4 pt-1">
                        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <BuildingLibraryIcon className="w-4 h-4 text-[#8d4624]" />
                          Eligible Government Subsidies & Schemes {m.state ? `(${m.state})` : ''}
                        </h3>

                        {m.schemes?.length === 0 ? (
                          <p className="text-xs text-stone-500 italic">
                            No direct state grants recorded for this scale. Check local DIC/MSME facilitation offices.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {m.schemes?.map((s) => (
                              <div
                                key={s.id || s.name}
                                className="p-4 rounded-2xl border border-[#8d4624]/20 hover:border-[#8d4624]/40 flex flex-col justify-between transition-all bg-transparent"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge className="bg-[#f5e9dd] text-[#8d4624] text-[9px] font-bold px-2 py-0 border-none">
                                      {s.benefit_type || 'Support'}
                                    </Badge>
                                    {s.verified && (
                                      <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-700">
                                        <CheckCircleIcon className="w-3.5 h-3.5" /> Verified
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-stone-900 leading-snug">
                                    {s.name}
                                  </h4>
                                  <p className="text-xs text-stone-600 line-clamp-2">
                                    {s.benefit_summary}
                                  </p>

                                  {s.eligibility?.length > 0 && (
                                    <div className="text-[11px] text-stone-500 pt-1">
                                      <span className="font-semibold text-stone-700">Criteria: </span>
                                      {s.eligibility.slice(0, 2).join(' • ')}
                                    </div>
                                  )}
                                </div>

                                <a
                                  href={s.apply_url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#8d4624]/25 text-[#8d4624] hover:bg-[#8d4624]/10 transition-colors"
                                >
                                  <span>Official Portal</span>
                                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Streaming Indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <div className="w-7 h-7 rounded-lg bg-[#f5e9dd] border border-[#8d4624]/20 flex items-center justify-center text-[#8d4624] shrink-0">
                <SparklesIcon className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8d4624] animate-pulse" />
                <span>{loadingStatus || 'Thinking…'}</span>
              </div>
            </div>
          )}

            <div ref={scrollBottomRef} />
          </div>
        </div>

        {/* Bottom Input Dock - Contained inside chat container, no overlapping */}
        <div className="shrink-0 w-full px-3 sm:px-6 pb-4 pt-3 bg-white/95 backdrop-blur-md z-10">
          <div className="w-full space-y-2">
            {/* Quick Suggestion Chips */}
            {step <= 2 && QUESTIONS[step]?.chips && !loading && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUESTIONS[step].chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="px-3 py-1 rounded-full text-xs bg-[#f5e9dd]/70 hover:bg-[#8d4624] hover:text-white text-[#8d4624] border border-[#8d4624]/25 transition-all font-medium whitespace-nowrap shadow-xs shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Capsule pinned cleanly at the bottom */}
            {(step <= 2 || step === 5) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center rounded-3xl bg-white border border-[#8d4624]/30 shadow-xs p-1.5 transition-all focus-within:border-[#8d4624] focus-within:ring-1 focus-within:ring-[#8d4624]/20 w-full"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    step === 5
                      ? "Type 'Yes' to view schemes, or 'No' to skip…"
                      : `Message Saharohi AI (${QUESTIONS[step]?.title || 'Answer'})…`
                  }
                  className="w-full resize-none bg-transparent px-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none max-h-36 leading-relaxed"
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-[#8d4624] hover:bg-[#72371c] text-white shrink-0 disabled:opacity-30 transition-all shadow-xs mr-0.5"
                >
                  <ArrowUpIcon className="w-4 h-4 stroke-[2.5]" />
                </Button>
              </form>
            )}

            <p className="text-[10px] text-center text-stone-400">
              Saharohi AI generates verified entrepreneurial roadmaps. Cross-check official subsidy mandates.
            </p>
          </div>
        </div>

      </div>

      {/* Idea Confirmation Dialog */}
      <Dialog open={!!selectedIdeaForConfirm} onOpenChange={(open) => !open && setSelectedIdeaForConfirm(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-[#f5e9dd]/95 backdrop-blur-md border border-[#8d4624]/20 p-6">
          <DialogHeader>
            <div className="w-9 h-9 rounded-xl bg-[#8d4624] text-white flex items-center justify-center mb-2">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-bold text-stone-900">
              Generate 90-Day Execution Roadmap?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600 mt-1 leading-relaxed">
              Formulating execution strategy for <strong>{selectedIdeaForConfirm?.idea?.title}</strong> with itemized setup cost, monthly recurring targets, and supplier licensing paths.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIdeaForConfirm(null)}
              className="rounded-xl text-xs border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10"
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={confirmGeneratePlan}
              className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold"
            >
              Generate Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

function SourcesInline({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
      <span className="flex items-center gap-1 text-stone-400 font-medium">
        <GlobeAltIcon className="w-3.5 h-3.5 text-stone-400" />
        Sources:
      </span>
      {sources.map((src, i) => (
        <a
          key={i}
          href={src.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#8d4624]/20 text-stone-700 hover:text-[#8d4624] hover:bg-[#8d4624]/10 transition-colors"
          title={src.snippet || src.title}
        >
          <span className="truncate max-w-[140px]">{src.title}</span>
          <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 text-stone-400 shrink-0" />
        </a>
      ))}
    </div>
  );
}

export default Chat;