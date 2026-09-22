"""Recover helioteles.com Cargo pages via curl.exe, then emit site.json."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "public" / "helioteles" / "raw"
DATA = ROOT / "src" / "pages" / "helioteles" / "data"

SLUGS = [
    "",
    "about",
    "about-mobile",
    "index-mobile",
    "union",
    "péa",
    "plural",
    "orio",
    "graver-l'homme",
    "rice-talks",
    "laha-coffee",
    "eastlake",
    "repeet",
    "keos",
    "hoang-long-minerals",
    "cty",
    "the-sangomas",
    "rice-store",
    "coexist-or-die",
    "be-water",
    "autopista",
    "good-intentions",
    "whitman-emorson",
    "tomorrow-is-too-late",
    "nemesis",
    "above-view-below",
    "grand-junction-park",
    "fas",
    "assay",
]


def curl(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "curl.exe",
        "-sL",
        "--max-time",
        "45",
        "-A",
        "Mozilla/5.0 helioteles-restore",
        "-o",
        str(dest),
        url,
    ]
    print("GET", url, flush=True)
    r = subprocess.run(cmd)
    return r.returncode == 0 and dest.exists() and dest.stat().st_size > 2000


def extract_state(html: str) -> dict:
    start = html.find("window.__PRELOADED_STATE__=")
    if start < 0:
        raise RuntimeError("no state")
    start += len("window.__PRELOADED_STATE__=")
    decoder = json.JSONDecoder()
    obj, _ = decoder.raw_decode(html, start)
    return obj


def freight_url(item: dict, width: int = 1600) -> str:
    name = urllib.parse.quote(item.get("name") or "file")
    h = item["hash"]
    if item.get("is_video"):
        return f"https://freight.cargo.site/t/original/v/{h}/{name}"
    return f"https://freight.cargo.site/w/{width}/i/{h}/{name}"


def slim_page(page: dict) -> dict:
    media = []
    for item in page.get("media") or []:
        rec = {
            "id": item.get("id"),
            "hash": item.get("hash"),
            "name": item.get("name"),
            "file_type": item.get("file_type"),
            "mime_type": item.get("mime_type"),
            "width": item.get("width"),
            "height": item.get("height"),
            "is_image": item.get("is_image"),
            "is_video": item.get("is_video"),
            "duration": item.get("duration"),
            "src": freight_url(item),
            "poster": None,
        }
        poster = item.get("poster")
        if isinstance(poster, dict) and poster.get("hash"):
            rec["poster"] = freight_url(
                {"hash": poster["hash"], "name": poster.get("name"), "is_video": False}
            )
        media.append(rec)
    return {
        "id": page.get("id"),
        "title": page.get("title"),
        "purl": page.get("purl"),
        "content": page.get("content") or "",
        "local_css": page.get("local_css") or "",
        "display": page.get("display"),
        "pin": page.get("pin"),
        "pin_options": page.get("pin_options") or {},
        "media": media,
    }


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)

    # reuse already downloaded files
    home = ROOT / "public" / "_helioteles-home.html"
    union = ROOT / "public" / "_helioteles-union.html"
    if home.exists():
        (RAW / "home.html").write_bytes(home.read_bytes())
    if union.exists():
        (RAW / "union.html").write_bytes(union.read_bytes())

    for slug in SLUGS:
        name = "home" if slug == "" else re.sub(r"[^\w\-]+", "_", slug)
        dest = RAW / f"{name}.html"
        if dest.exists() and dest.stat().st_size > 2000:
            continue
        url = "https://helioteles.com/" if slug == "" else "https://helioteles.com/" + urllib.parse.quote(slug)
        ok = curl(url, dest)
        if not ok:
            print("FAIL", slug, flush=True)

    pages: dict = {}
    site_meta = {}
    media_lookup: dict = {}
    for html_path in sorted(RAW.glob("*.html")):
        html = html_path.read_text(encoding="utf-8", errors="replace")
        try:
            state = extract_state(html)
        except Exception as exc:
            print("parse fail", html_path.name, exc, flush=True)
            continue
        if not site_meta:
            site = state.get("site") or {}
            site_meta = {
                "website_title": site.get("website_title"),
                "display_url": site.get("display_url"),
                "favicon_url": site.get("favicon_url"),
                "fonts": site.get("fonts"),
            }
        for pid, page in (state.get("pages") or {}).get("byId", {}).items():
            if pid in pages:
                continue
            slim = slim_page(page)
            pages[pid] = slim
            for m in slim["media"]:
                media_lookup[m["hash"]] = m

    payload = {"site": site_meta, "pages": pages, "media": media_lookup}
    out = DATA / "site.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print("pages", len(pages), "media", len(media_lookup), "->", out, flush=True)


if __name__ == "__main__":
    sys.exit(main() or 0)
