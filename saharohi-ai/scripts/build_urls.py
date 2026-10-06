"""
Builds urls.txt from myScheme's sitemap.
  python scripts/build_urls.py            # business-relevant schemes, first 500
  python scripts/build_urls.py --all      # every scheme in the sitemap (thousands)
  python scripts/build_urls.py --limit 800
"""
import re, sys
from pathlib import Path

import httpx

SITEMAP = "https://www.myscheme.gov.in/sitemap.xml"
UA = {"User-Agent": "Mozilla/5.0 (Saharohi-AI research project)"}
KEYWORDS = [
    "loan", "credit", "enterprise", "entrepreneur", "startup", "start-up", "msme", "business", "self-employ",
    "subsidy", "mudra", "udyam", "industr", "manufactur", "food", "processing", "agri", "farmer", "kisan",
    "dairy", "fish", "poultry", "livestock", "horticulture", "artisan", "craft", "handloom", "handicraft",
    "weaver", "khadi", "village", "rural", "women", "mahila", "sc-st", "skill", "employment", "rozgar",
    "swarojgar", "vishwakarma", "cluster", "export", "tech", "incubat",
]


def locs(xml: str) -> list[str]:
    return re.findall(r"<loc>\s*(.*?)\s*</loc>", xml)


def main():
    args = sys.argv[1:]
    limit = int(args[args.index("--limit") + 1]) if "--limit" in args else 500
    take_all = "--all" in args

    urls, queue = [], [SITEMAP]
    while queue:
        xml = httpx.get(queue.pop(), timeout=30, follow_redirects=True, headers=UA).text
        found = locs(xml)
        if "<sitemapindex" in xml:
            queue += found
        else:
            urls += found

    schemes = sorted({u for u in urls if "/schemes/" in u})
    print(f"{len(schemes)} scheme URLs in sitemap")
    if not take_all:
        schemes = [u for u in schemes if any(k in u.lower() for k in KEYWORDS)][:limit]
    out = Path(__file__).resolve().parents[1] / "urls.txt"
    out.write_text("\n".join(schemes) + "\n")
    print(f"wrote {len(schemes)} URLs -> {out}")


if __name__ == "__main__":
    main()