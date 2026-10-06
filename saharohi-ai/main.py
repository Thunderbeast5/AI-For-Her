import json
import os
from datetime import date

from dotenv import load_dotenv
from duckduckgo_search import DDGS
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()
client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")
YEAR = date.today().year

app = FastAPI(title="Saharohi AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Filters(BaseModel):
    location: str = Field(min_length=2)
    budget: int = Field(gt=0, description="Total budget in INR")
    domain: str = Field(min_length=2)


class PlanReq(Filters):
    idea: dict


# ---------- helpers ----------
def web_search(query: str, n: int = 5) -> list[dict]:
    try:
        with DDGS() as d:
            return [
                {"title": r["title"], "url": r["href"], "snippet": r["body"]}
                for r in d.text(query, max_results=n)
            ]
    except Exception as e:  # search must never kill the request
        print("search failed:", e)
        return []


def to_context(results: list[dict]) -> str:
    return "\n".join(f"- {r['title']}: {r['snippet']} ({r['url']})" for r in results) or "No web results."


def llm(system: str, user: str, json_mode: bool = False, temperature: float = 0.4) -> str:
    kw = {"response_format": {"type": "json_object"}} if json_mode else {}
    res = client.chat.completions.create(
        model=MODEL,
        temperature=temperature,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        **kw,
    )
    return res.choices[0].message.content


def generate_ideas(f: Filters, sources: list[dict], strict: bool = False) -> list[dict]:
    system = (
        "You are Saharohi AI, a practical business advisor for Indian entrepreneurs. "
        "Reply with JSON only."
    )
    user = f"""Suggest 5 business ideas.

USER FILTERS (hard constraints):
- Location: {f.location}
- Total budget: ₹{f.budget}
- Domain/interest: {f.domain}

WEB CONTEXT (use for grounding; do not invent statistics or facts not supported here):
{to_context(sources)}

Rules:
- Every idea MUST belong to the domain and be realistic in {f.location}.
- startup_cost_inr is your realistic TOTAL setup + first-3-months cost and MUST be <= {f.budget}.{" Be conservative: stay under 85% of the budget." if strict else ""}
- No fake numbers presented as facts; costs are estimates.

JSON schema:
{{"ideas":[{{"title":str,"summary":str (2 lines),"why_it_fits":str (location + budget + domain),
"startup_cost_inr":int,"monthly_revenue_potential_inr":int,"difficulty":"Easy|Medium|Hard"}}]}}"""
    data = json.loads(llm(system, user, json_mode=True))
    return data.get("ideas", [])


# ---------- routes ----------
@app.post("/api/ideas")
def ideas(f: Filters):
    sources = web_search(f"low investment {f.domain} business ideas {f.location} {YEAR}")
    sources += web_search(f"{f.domain} business demand {f.location} India {YEAR}", 3)

    valid: list[dict] = []
    for attempt in range(2):  # retry once with a stricter prompt if filter is violated
        try:
            candidates = generate_ideas(f, sources, strict=attempt == 1)
        except Exception as e:
            print("idea generation failed:", e)
            continue
        # hard filter enforced in code, not just in the prompt
        valid = [
            i for i in candidates
            if isinstance(i.get("startup_cost_inr"), (int, float))
            and 0 < i["startup_cost_inr"] <= f.budget
        ]
        if len(valid) >= 3:
            break

    if not valid:
        raise HTTPException(422, "Couldn't find ideas that fit this budget. Try a higher budget or a different domain.")
    return {"ideas": valid[:3], "sources": sources[:5]}


@app.post("/api/plan")
def plan(req: PlanReq):
    title = req.idea.get("title", req.domain)
    sources = web_search(f"{title} business requirements cost {req.location} India {YEAR}")
    system = "You are Saharohi AI, a practical business-plan writer for Indian small businesses. Output Markdown."
    user = f"""Write a business plan for: {json.dumps(req.idea, ensure_ascii=False)}

Constraints: Location = {req.location}; Total budget = ₹{req.budget}; Domain = {req.domain}.

WEB CONTEXT (ground in this where possible):
{to_context(sources)}

Sections: 1. Overview 2. Target customers & local market in {req.location}
3. Budget breakdown (table in ₹; MUST total <= ₹{req.budget}) 4. Setup steps (first 90 days)
5. Operations 6. Marketing (low-cost, local) 7. Revenue & break-even (clearly labelled estimates)
8. Risks & mitigation 9. Licenses/registrations typically needed (say "verify locally" when unsure).

Rules: label all numbers as estimates, never invent statistics, do NOT mention government schemes
or mentors yet. Be concise and specific."""
    return {"plan": llm(system, user, temperature=0.5), "sources": sources[:5]}


@app.get("/api/health")
def health():
    return {"ok": True}
