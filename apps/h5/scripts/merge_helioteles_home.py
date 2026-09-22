"""Insert missing pages (especially home) from raw Cargo HTML into site.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from recover_helioteles import extract_state, slim_page  # noqa: E402

RAW = ROOT / "public" / "helioteles" / "raw"
DATA = ROOT / "src" / "pages" / "helioteles" / "data" / "site.json"


def main() -> None:
    site = json.loads(DATA.read_text(encoding="utf-8"))
    pages = site.setdefault("pages", {})
    media = site.setdefault("media", {})
    added = []

    for html_path in sorted(RAW.glob("*.html")):
        try:
            state = extract_state(html_path.read_text(encoding="utf-8", errors="replace"))
        except Exception as exc:
            print("skip", html_path.name, exc)
            continue
        for pid, page in (state.get("pages") or {}).get("byId", {}).items():
            slim = slim_page(page)
            if pid not in pages:
                pages[pid] = slim
                added.append(f"{slim.get('purl') or pid}")
            for item in slim.get("media") or []:
                h = item.get("hash")
                if h and (h not in media or not str(media[h]).startswith("http")):
                    media[h] = item.get("src") or media.get(h)

    DATA.write_text(json.dumps(site, ensure_ascii=False, indent=2), encoding="utf-8")
    print("added", added, "pages", len(pages), "media", len(media))


if __name__ == "__main__":
    main()
