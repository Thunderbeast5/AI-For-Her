"""
Offline scheme ingestion (resumable).
  python scripts/extract_schemes.py urls.txt
Fetches each page, has Groq structure it into our schema, appends to data/schemes_review.json.
Re-run any time: URLs already extracted are skipped. The LLM only structures text it is given.
Env: EXTRACT_MODEL (default llama-3.1-8b-instant), EXTRACT_SLEEP seconds between calls (default 3).
"""
import json, os, re, sys, time
from datetime import date
from pathlib import Path

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from groq import Groq

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from schemes import TAXONOMY  # noqa: E402

load_dotenv(ROOT / ".env")
client = Groq(api_key=os.environ["GROQ_API_KEY"])
MODEL = os.getenv("EXTRACT_MODEL", "llama-3.1-8b-instant")
SLEEP = float(os.getenv("EXTRACT_SLEEP", "3"))
OUT = ROOT / "data" / "schemes_review.json"
UA = {"User-Agent": "Mozilla/5.0 (Saharohi-AI research project)"}

PROMPT = """Extract ONE government scheme from the page content below into JSON.
Use ONLY facts present in the content. If a field is not stated use null (or [] for lists). Never guess numbers.
Schema: {{"id":slug,"name":str,"level":"central|state","state":str|null,
"domains":subset of {tax} or ["all"],"benefit_type":"subsidy|loan|grant|training|insurance|other",
"benefit_summary":str (max 2 sentences),"min_investment":int|null,"max_project_cost":int|null (INR),
"eligibility":[str] (max 5),"documents":[str] (max 5)}}
"domains" = business areas this scheme can fund/support.
CONTENT:
{text}"""


def page_text(url: str) -> str:
    html = httpx.get(url, timeout=30, follow_redirects=True, headers=UA).text
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if m:  # Next.js sites embed the page data as JSON
        try:
            page = json.loads(m.group(1)).get("props", {}).get("pageProps", {})
            text = json.dumps(page, ensure_ascii=False)
        except Exception:
            text = ""
    else:
        text = ""
    if len(text) < 300:
        soup = BeautifulSoup(html, "html.parser")
        for t in soup(["script", "style", "nav", "footer", "header"]):
            t.decompose()
        text = " ".join(soup.get_text(" ").split())
    return text[:9000]


def extract(text: str) -> dict:
    for attempt in range(4):
        try:
            res = client.chat.completions.create(
                model=MODEL, temperature=0, response_format={"type": "json_object"},
                messages=[{"role": "user", "content": PROMPT.format(tax=TAXONOMY, text=text)}],
            )
            return json.loads(res.choices[0].message.content)
        except Exception as e:
            if "429" in str(e) or "rate" in str(e).lower():
                time.sleep(15 * (attempt + 1))  # backoff on rate limit
            else:
                raise
    raise RuntimeError("rate limited too long")


def main(path: str):
    done = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else []
    seen = {r["source_url"] for r in done}
    urls = [u.strip() for u in open(path) if u.strip() and u.strip() not in seen]
    print(f"{len(urls)} to do, {len(done)} already done")
    for i, url in enumerate(urls, 1):
        try:
            text = page_text(url)
            if len(text) < 300:
                print(f"[{i}] too little text: {url}")
                continue
            rec = extract(text)
            rec.update(apply_url=url, source_url=url, verified=False, last_verified=str(date.today()))
            rec["min_investment"] = rec.get("min_investment") or 0
            done.append(rec)
            OUT.write_text(json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"[{i}/{len(urls)}] {rec.get('name')}")
        except Exception as e:
            print(f"[{i}] failed {url}: {e}")
        time.sleep(SLEEP)


if __name__ == "__main__":
    main(sys.argv[1])