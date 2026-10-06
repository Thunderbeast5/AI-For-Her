import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const QUESTIONS = [
  { key: "location", text: "Namaste! I'm Saharohi AI 👋 Which city/town do you want to start your business in?" },
  { key: "budget", text: "What's your total budget in ₹? (e.g. 200000, 2 lakh, 50k)" },
  { key: "domain", text: "Which domain or interest? (e.g. food, agriculture, tech, retail)" },
];

// "2 lakh" / "5L" / "50k" / "200000" -> number
function parseBudget(s) {
  const m = s.toLowerCase().replace(/[₹,\s]/g, "").match(/^(\d+(?:\.\d+)?)(l|lakh|lakhs|k|cr|crore)?$/);
  if (!m) return null;
  const mult = { l: 1e5, lakh: 1e5, lakhs: 1e5, k: 1e3, cr: 1e7, crore: 1e7 }[m[2]] || 1;
  return Math.round(parseFloat(m[1]) * mult);
}

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

export default function App() {
  const [messages, setMessages] = useState([{ role: "bot", type: "text", text: QUESTIONS[0].text }]);
  const [filters, setFilters] = useState({});
  const [step, setStep] = useState(0); // 0..2 = questions, 3 = ideas, 4 = plan
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState(null); // {f, idea} of the chosen idea
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const add = (m) => setMessages((p) => [...p, m]);
  const bot = (text) => add({ role: "bot", type: "text", text });

  async function submit(e) {
    e.preventDefault();
    const val = input.trim();
    if (!val || loading || (step > 2 && step !== 5)) return;
    setInput("");
    add({ role: "user", type: "text", text: val });

    if (step === 5) {
      if (/\b(no|nope|nah|skip|later|not|don'?t)\b/i.test(val)) return declineSchemes();
      if (/\b(yes|yeah|yep|sure|ok|okay|haan|scheme|schemes|subsid\w*|loan|grant|govt|government|give|show)\b/i.test(val))
        return loadSchemes();
      return bot("Just say yes or no: want to see government schemes for this idea?");
    }

    const key = QUESTIONS[step].key;
    let value = val;
    if (key === "budget") {
      value = parseBudget(val);
      if (!value) return bot("Couldn't read that budget. Try something like 150000 or 1.5 lakh.");
    }
    const next = { ...filters, [key]: value };
    setFilters(next);

    if (step < 2) {
      setStep(step + 1);
      return bot(QUESTIONS[step + 1].text);
    }

    setStep(3);
    setLoading(true);
    bot(`Searching ideas for ${next.domain} in ${next.location} within ${inr(next.budget)}…`);
    try {
      const { ideas, sources } = await post("/api/ideas", next);
      add({ role: "bot", type: "ideas", ideas, sources, filters: next });
    } catch (err) {
      bot("⚠️ " + err.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function selectIdea(idea, f) {
    if (loading || step >= 4) return;
    setStep(4);
    setLoading(true);
    add({ role: "user", type: "text", text: `I'll go with: ${idea.title}` });
    bot("Great choice! Building your business plan…");
    try {
      const { plan, sources } = await post("/api/plan", { ...f, idea });
      add({ role: "bot", type: "plan", plan, sources });
      setCtx({ f, idea });
      setStep(5);
      add({ role: "bot", type: "offer" });
    } catch (err) {
      bot("⚠️ " + err.message);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  async function loadSchemes() {
    if (!ctx || loading) return;
    setStep(6);
    setLoading(true);
    bot("Finding government schemes for your idea…");
    try {
      const sc = await post("/api/schemes", { ...ctx.f, idea: ctx.idea });
      add({ role: "bot", type: "schemes", ...sc });
    } catch {
      bot("Couldn't load government schemes right now. Type yes to try again.");
      setStep(5);
    } finally {
      setLoading(false);
    }
  }

  function declineSchemes() {
    setStep(6);
    bot("No problem! Good luck with your business 🚀 Hit “New chat” to explore another idea.");
  }

  function reset() {
    setMessages([{ role: "bot", type: "text", text: QUESTIONS[0].text }]);
    setFilters({});
    setStep(0);
    setCtx(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full max-w-3xl flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-emerald-700">Saharohi AI</h1>
        <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-800">New chat</button>
      </header>

      <main className="w-full max-w-3xl flex-1 px-4 space-y-4 pb-28">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.type === "text" && (
              <div className={`rounded-2xl px-4 py-2 max-w-[85%] ${m.role === "user" ? "bg-emerald-600 text-white" : "bg-white shadow-sm border border-slate-200"}`}>
                {m.text}
              </div>
            )}

            {m.type === "ideas" && (
              <div className="w-full space-y-3">
                <p className="text-sm text-slate-600">Top 3 ideas that fit your filters. Pick one:</p>
                {m.ideas.map((idea, j) => (
                  <div key={j} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-lg">{j + 1}. {idea.title}</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-1 whitespace-nowrap">{idea.difficulty}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{idea.summary}</p>
                    <p className="text-sm text-slate-500 mt-2">{idea.why_it_fits}</p>
                    <div className="flex flex-wrap gap-4 text-sm mt-3">
                      <span>💰 Setup: <b>{inr(idea.startup_cost_inr)}</b></span>
                      <span>📈 Monthly potential: <b>{inr(idea.monthly_revenue_potential_inr)}</b></span>
                    </div>
                    <button
                      disabled={loading || step >= 4}
                      onClick={() => selectIdea(idea, m.filters)}
                      className="mt-3 rounded-lg bg-emerald-600 text-white px-4 py-1.5 text-sm hover:bg-emerald-700 disabled:opacity-40"
                    >
                      Select this idea
                    </button>
                  </div>
                ))}
                <Sources sources={m.sources} />
              </div>
            )}

            {m.type === "offer" && (
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl px-4 py-3 max-w-[85%]">
                <p>Do you want government schemes (subsidies, loans, grants) for this idea?</p>
                <div className="flex gap-2 mt-3">
                  <button disabled={step !== 5 || loading} onClick={() => { add({ role: "user", type: "text", text: "Yes, show schemes" }); loadSchemes(); }}
                    className="rounded-lg bg-emerald-600 text-white px-4 py-1.5 text-sm hover:bg-emerald-700 disabled:opacity-40">Yes, show schemes</button>
                  <button disabled={step !== 5 || loading} onClick={() => { add({ role: "user", type: "text", text: "No thanks" }); declineSchemes(); }}
                    className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40">No thanks</button>
                </div>
              </div>
            )}

            {m.type === "schemes" && (
              <div className="w-full space-y-3">
                <p className="text-sm text-slate-600">
                  Government schemes that may apply{m.state ? ` (${m.state} + central)` : ""}:
                </p>
                {m.schemes.length === 0 && (
                  <p className="text-sm text-slate-500">No matching schemes in our database yet.</p>
                )}
                {m.schemes.map((s) => (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{s.name}</h3>
                      <span className="text-xs bg-sky-100 text-sky-700 rounded-full px-2 py-1">{s.benefit_type}</span>
                    </div>
                    <p className="text-slate-700 mt-1 text-sm">{s.benefit_summary}</p>
                    {s.why_relevant && <p className="text-sm text-slate-500 mt-2">{s.why_relevant}</p>}
                    {s.eligibility?.length > 0 && (
                      <ul className="list-disc pl-5 text-sm mt-2 text-slate-600">
                        {s.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                    {s.next_steps?.length > 0 && (
                      <p className="text-sm mt-2"><b>Next:</b> {s.next_steps.join(" → ")}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-sm">
                      <a href={s.apply_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">Official site ↗</a>
                      {!s.verified && <span className="text-xs text-amber-600">Verify details on the official site</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {m.type === "plan" && (
              <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <article className="prose prose-slate max-w-none">
                  <ReactMarkdown>{m.plan}</ReactMarkdown>
                </article>
                <Sources sources={m.sources} />
                <p className="text-xs text-slate-400 mt-3">All figures are AI estimates — verify locally before investing.</p>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-slate-400 animate-pulse">Thinking…</div>}
        <div ref={endRef} />
      </main>

      {(step <= 2 || step === 5) && (
        <form onSubmit={submit} className="fixed bottom-0 w-full max-w-3xl p-4 bg-slate-50 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={step === 5 ? "Type yes or no…" : "Type your answer…"}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button className="rounded-xl bg-emerald-600 text-white px-5 hover:bg-emerald-700">Send</button>
        </form>
      )}
    </div>
  );
}

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <details className="text-xs text-slate-500 mt-3">
      <summary className="cursor-pointer">Web sources used</summary>
      <ul className="list-disc pl-5 mt-1 space-y-0.5">
        {sources.map((s, i) => (
          <li key={i}><a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">{s.title}</a></li>
        ))}
      </ul>
    </details>
  );
}