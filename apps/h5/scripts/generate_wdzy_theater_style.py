"""
Extract TWINZY doll silhouettes and render in theater-poster flat vector style (fig2).
Run: python apps/h5/scripts/generate_wdzy_theater_style.py
"""
from __future__ import annotations

import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "src/data/img"
OUT_DIR = ROOT / "src/assets/wdzy-theater-style"
EXTRACTED_DIR = OUT_DIR / "extracted"
CARDS_DIR = OUT_DIR / "cards"

CHARACTERS = [
    {
        "name": "KKengEE",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825737_01_1d85fc09-5b44-4dfb-88e1-30237c3f79f9.jpg?v=1754586069",
        "filename": "twinzy_kkengee_original_plush_2024.jpg",
    },
    {
        "name": "Li-Li",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825744_01_d2e9871c-ef6c-40da-a35c-aefa2bbfd461.jpg?v=1754586072",
        "filename": "twinzy_lili_original_plush_2024.jpg",
    },
    {
        "name": "RyuJJi",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825751_01_a70af6f4-f0c4-4bf7-abfe-5551a77a3980.jpg?v=1754586074",
        "filename": "twinzy_ryujji_original_plush_2024.jpg",
    },
    {
        "name": "RyeoWoo",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825768_01_1_92a03b6d-493f-48e9-a8e3-c46612e837eb.jpg?v=1754586077",
        "filename": "twinzy_ryeowoo_original_plush_2024.jpg",
    },
    {
        "name": "NAong",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825775_01.jpg?v=1716522235",
        "filename": "twinzy_naong_original_plush_2024.jpg",
    },
]

# Sampled from theater reference (fig2): cerulean sky + vermillion accent
SKY = (74, 141, 216)
HILL = (232, 72, 48)
WHITE = (255, 255, 255)


def download(url: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 1000:
        return
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as res:
        dest.write_bytes(res.read())


def remove_background(im: Image.Image, threshold: int = 238) -> Image.Image:
    rgba = im.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[:, :, :3]
    # White / near-white studio backdrop
    mask = (rgb.min(axis=2) < threshold).astype(np.uint8) * 255
    # Drop isolated noise specks
    mask_img = Image.fromarray(mask, mode="L")
    mask_img = mask_img.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = np.array(mask_img)
    arr[:, :, 3] = mask
    return Image.fromarray(arr, mode="RGBA")


def trim_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.array(im)
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 16)
    if len(xs) == 0:
        return im
    x0, x1 = xs.min(), xs.max()
    y0, y1 = ys.min(), ys.max()
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width - 1, x1 + pad)
    y1 = min(im.height - 1, y1 + pad)
    return im.crop((x0, y0, x1 + 1, y1 + 1))


def white_silhouette(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    alpha = arr[:, :, 3]
    out = np.zeros_like(arr)
    out[:, :, :3] = 255
    out[:, :, 3] = alpha
    return Image.fromarray(out, mode="RGBA")


def scalloped_circle_points(cx: float, cy: float, radius: float, bumps: int = 14) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    steps = bumps * 2
    for i in range(steps):
        angle = 2 * math.pi * i / steps - math.pi / 2
        r = radius * (1.12 if i % 2 == 0 else 0.88)
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts


def fluffy_cloud(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, color: tuple[int, int, int]) -> None:
    r = int(18 * scale)
    blobs = [(0, 0), (r, -r // 2), (2 * r, 0), (r, r // 2), (-r // 2, r // 3)]
    for dx, dy in blobs:
        draw.ellipse((x + dx - r, y + dy - r, x + dx + r, y + dy + r), fill=color)


def draw_theater_backdrop(
    size: tuple[int, int],
    with_sun: bool = True,
    with_clouds: bool = True,
    with_hill: bool = True,
) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size, SKY)
    draw = ImageDraw.Draw(img)

    if with_hill:
        hill_top = int(h * 0.58)
        pts = [(0, h), (0, hill_top + 40), (w * 0.15, hill_top), (w * 0.42, hill_top + 55),
               (w * 0.68, hill_top - 20), (w, hill_top + 30), (w, h)]
        draw.polygon(pts, fill=HILL)

    if with_sun:
        sun_pts = scalloped_circle_points(w * 0.14, h * 0.16, min(w, h) * 0.11)
        draw.polygon(sun_pts, fill=HILL)

    if with_clouds:
        fluffy_cloud(draw, int(w * 0.55), int(h * 0.12), 1.1, WHITE)
        fluffy_cloud(draw, int(w * 0.78), int(h * 0.08), 0.85, WHITE)
        fluffy_cloud(draw, int(w * 0.35), int(h * 0.18), 0.7, WHITE)

    return img


def fit_sprite(sprite: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / sprite.width, max_h / sprite.height)
    if ratio >= 1:
        return sprite
    new_size = (max(1, int(sprite.width * ratio)), max(1, int(sprite.height * ratio)))
    return sprite.resize(new_size, Image.Resampling.LANCZOS)


def paste_center(base: Image.Image, sprite: Image.Image, cx: int, cy: int) -> None:
    x = cx - sprite.width // 2
    y = cy - sprite.height // 2
    base.paste(sprite, (x, y), sprite)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def render_character_card(name: str, silhouette: Image.Image, card_size: tuple[int, int] = (360, 480)) -> Image.Image:
    w, h = card_size
    card = draw_theater_backdrop(card_size, with_sun=False, with_clouds=False, with_hill=True)

    # Rounded card panel
    panel = Image.new("RGBA", card_size, (0, 0, 0, 0))
    panel_draw = ImageDraw.Draw(panel)
    radius = 28
    panel_draw.rounded_rectangle((8, 8, w - 8, h - 8), radius=radius, fill=(74, 141, 216, 255))
    card = Image.alpha_composite(card.convert("RGBA"), panel).convert("RGB")

    overlay = Image.new("RGBA", card_size, (0, 0, 0, 0))
    o_draw = ImageDraw.Draw(overlay)
    hill_top = int(h * 0.58)
    pts = [(0, h), (0, hill_top + 30), (w * 0.3, hill_top), (w * 0.7, hill_top + 40), (w, hill_top + 10), (w, h)]
    o_draw.polygon(pts, fill=HILL + (255,))

    font = load_font(26, bold=True)
    tw = o_draw.textlength(name, font=font)
    o_draw.text(((w - tw) / 2, 22), name, fill=WHITE + (255,), font=font)

    card_rgba = card.convert("RGBA")
    card_rgba = Image.alpha_composite(card_rgba, overlay)

    sprite = fit_sprite(silhouette, int(w * 0.72), int(h * 0.48))
    paste_center(card_rgba, sprite, w // 2, int(h * 0.52))

    return card_rgba.convert("RGB")


def render_scene_poster(silhouettes: list[tuple[str, Image.Image]], size: tuple[int, int] = (1200, 720)) -> Image.Image:
    w, h = size
    scene = draw_theater_backdrop(size, with_sun=True, with_clouds=True, with_hill=True)
    scene_rgba = scene.convert("RGBA")

    font_title = load_font(22, bold=False)
    draw = ImageDraw.Draw(scene_rgba)
    draw.text((int(w * 0.08), int(h * 0.22)), "TWINZY ON STAGE", fill=WHITE + (255,), font=font_title)

    # Place dolls along the hill like fig2 pedestrians
    slots = [0.12, 0.28, 0.44, 0.60, 0.76]
    base_y = int(h * 0.72)
    for i, (name, sil) in enumerate(silhouettes):
        sprite = fit_sprite(sil, int(w * 0.11), int(h * 0.22))
        cx = int(w * slots[i])
        cy = base_y - sprite.height // 2
        paste_center(scene_rgba, sprite, cx, cy)

    return scene_rgba.convert("RGB")


def render_cards_composite(
    cards: list[tuple[str, Image.Image]],
    card_size: tuple[int, int] = (360, 480),
    gap: int = 16,
    bg: tuple[int, int, int] = (245, 245, 245),
) -> Image.Image:
    """Layout mirroring fig1: 3 cards top row, 2 cards bottom row."""
    cw, ch = card_size
    row_gap = gap
    col_gap = gap
    top_w = cw * 3 + col_gap * 2
    bottom_w = cw * 2 + col_gap
    total_w = max(top_w, bottom_w)
    total_h = ch * 2 + row_gap
    canvas = Image.new("RGB", (total_w, total_h), bg)

    top_x0 = (total_w - top_w) // 2
    bottom_x0 = (total_w - bottom_w) // 2

    for i, (_, card) in enumerate(cards[:3]):
        x = top_x0 + i * (cw + col_gap)
        canvas.paste(card, (x, 0))

    for i, (_, card) in enumerate(cards[3:5]):
        x = bottom_x0 + i * (cw + col_gap)
        canvas.paste(card, (x, ch + row_gap))

    return canvas


def main() -> None:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    CARDS_DIR.mkdir(parents=True, exist_ok=True)

    silhouettes: list[tuple[str, Image.Image]] = []
    theater_cards: list[tuple[str, Image.Image]] = []

    for char in CHARACTERS:
        name = char["name"]
        src_path = IMG_DIR / char["filename"]
        print(f"Downloading {name}...")
        download(char["url"], src_path)

        raw = Image.open(src_path)
        extracted = trim_alpha(remove_background(raw))
        if name == "NAong":
            # Product photo is full-body; crop to head region for card consistency
            ew, eh = extracted.size
            extracted = extracted.crop((int(ew * 0.08), 0, int(ew * 0.92), int(eh * 0.62)))
            extracted = trim_alpha(extracted)
        extracted_path = EXTRACTED_DIR / f"{name}-extracted.png"
        extracted.save(extracted_path)

        silhouette = white_silhouette(extracted)
        sil_path = EXTRACTED_DIR / f"{name}-silhouette.png"
        silhouette.save(sil_path)

        card = render_character_card(name, silhouette)
        card_path = CARDS_DIR / f"{name}-theater-card.png"
        card.save(card_path)

        silhouettes.append((name, silhouette))
        theater_cards.append((name, card))
        print(f"  -> {extracted_path.name}, {card_path.name}")

    composite_cards = render_cards_composite(theater_cards)
    composite_cards.save(OUT_DIR / "twinzy-theater-cards-composite.png")

    scene = render_scene_poster(silhouettes)
    scene.save(OUT_DIR / "twinzy-theater-scene.png")

    print(f"\nDone. Outputs in {OUT_DIR}")


if __name__ == "__main__":
    main()
