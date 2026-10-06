import json
from pathlib import Path

TAXONOMY = ["food", "agri", "manufacturing", "retail", "services", "tech", "handicrafts", "education", "health", "other"]

DATA = json.loads((Path(__file__).parent / "data" / "schemes.json").read_text(encoding="utf-8"))


def match_schemes(state: str | None, budget: int, category: str, k: int = 5) -> list[dict]:
    """Pure code matching. No LLM involved."""
    scored = []
    for s in DATA["schemes"]:
        if s["level"].lower() == "state" and (not state or (s.get("state") or "").lower() != state.lower()):
            continue
        if budget < s.get("min_investment", 0):
            continue
        cap = s.get("max_project_cost")
        if cap and budget > cap * 5:  # wildly above the scheme's scale -> skip
            continue
            
        score = 1
        cat_str = (s.get("categories", "") + " " + s.get("sub_categories", "") + " " + s.get("tags", "")).lower()
        if category in cat_str:
            score = 3
            
        if s["level"].lower() == "state":
            score += 1  # local schemes first
        scored.append((score, s))
        
    scored.sort(key=lambda x: -x[0])
    
    res = []
    for _, s in scored[:k]:
        res.append({
            "id": s.get("id"),
            "name": s.get("scheme_name", "Unknown Scheme"),
            "benefit_type": s.get("benefit_type", "Support"),
            "benefit_summary": s.get("brief_description", ""),
            "why_relevant": s.get("benefits", ""),
            "eligibility": [e.strip() for e in str(s.get("eligibility", "")).split(";") if e.strip()],
            "next_steps": [str(s.get("application_mode", "Apply online or offline"))],
            "apply_url": s.get("official_link", "#"),
            "verified": True
        })
    return res
