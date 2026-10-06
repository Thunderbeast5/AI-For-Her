"""
Merge reviewed extractions into data/schemes.json (dedupe by id, validate fields).
  python scripts/merge_schemes.py
Existing hand-curated records win on id conflicts.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from schemes import TAXONOMY  # noqa: E402

main_f, review_f = ROOT / "data" / "schemes.json", ROOT / "data" / "schemes_review.json"
base = json.loads(main_f.read_text(encoding="utf-8"))
ids = {s["id"] for s in base}
added = skipped = 0

for r in json.loads(review_f.read_text(encoding="utf-8")):
    name = (r.get("name") or "").strip()
    if not name:
        skipped += 1
        continue
    r["id"] = re.sub(r"[^a-z0-9]+", "-", (r.get("id") or name).lower()).strip("-")
    if r["id"] in ids:
        skipped += 1
        continue
    if r.get("level") not in ("central", "state"):
        r["level"] = "central"
    if r["level"] == "state" and not r.get("state"):
        skipped += 1  # can't match a state scheme without a state
        continue
    doms = [d for d in (r.get("domains") or []) if d in TAXONOMY or d == "all"]
    r["domains"] = doms or ["other"]
    r["eligibility"] = r.get("eligibility") or []
    r["documents"] = r.get("documents") or []
    r["benefit_summary"] = r.get("benefit_summary") or ""
    base.append(r)
    ids.add(r["id"])
    added += 1

main_f.write_text(json.dumps(base, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"added {added}, skipped {skipped}, total {len(base)}")