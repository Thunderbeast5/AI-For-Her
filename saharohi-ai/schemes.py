import json
from pathlib import Path

TAXONOMY = ["food", "agri", "manufacturing", "retail", "services", "tech", "handicrafts", "education", "health", "other"]

DATA = json.loads((Path(__file__).parent / "data" / "schemes.json").read_text(encoding="utf-8"))


def match_schemes(state: str | None, budget: int, category: str, k: int = 5) -> list[dict]:
    """Pure code matching. No LLM involved."""
    scored = []
    for s in DATA:
        if s["level"] == "state" and (not state or (s.get("state") or "").lower() != state.lower()):
            continue
        if budget < s.get("min_investment", 0):
            continue
        cap = s.get("max_project_cost")
        if cap and budget > cap * 5:  # wildly above the scheme's scale -> skip
            continue
        doms = s["domains"]
        if category in doms:
            score = 3
        elif "all" in doms:
            score = 1
        else:
            continue
        if s["level"] == "state":
            score += 1  # local schemes first
        scored.append((score, s))
    scored.sort(key=lambda x: -x[0])
    return [dict(s) for _, s in scored[:k]]
