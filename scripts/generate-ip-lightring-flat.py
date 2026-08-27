"""
Generate one flat IP-style ITZY cat-ear light ring asset.
Follows ip-as-logo-skill complexity budget (no image-model API available).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parents[1] / "apps" / "h5" / "src" / "assets"
OUT_PATH = OUT_DIR / "itzy-light-ring-ip-flat.png"
SIZE = 1536

# Semantic palette: background + 2 IP base colors (rainbow = tonal family in glow region)
BG = (96, 100, 109)          # #60646d — doll guide / site muted slate
IP_WHITE = (248, 248, 248)   # bottom plastic mass
IP_GLOW = (72, 210, 255)     # glow family anchor; arcs vary within family

# Glow arc tones (same semantic family — incidental variation allowed)
GLOW_BANDS = [
    (255, 128, 48),
    (255, 210, 56),
    (88, 220, 96),
    (56, 198, 255),
    (64, 120, 255),
    (200, 64, 248),
]


def _hole(img: Image.Image, cx: int, cy: int, r: int) -> Image.Image:
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    arr = np.array(img)
    arr[np.array(mask) > 0, 3] = 0
    return Image.fromarray(arr)


def draw_ip_light_ring() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (*BG, 255))
    d = ImageDraw.Draw(img)

    cx, cy = SIZE // 2, int(SIZE * 0.54)
    outer_r = int(SIZE * 0.28)
    inner_r = int(SIZE * 0.145)
    stroke = max(10, int(SIZE * 0.014))

    # Dominant ring silhouette — 2 ellipses
    d.ellipse(
        (cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r),
        outline=(0, 0, 0, 255),
        width=stroke,
    )
    d.ellipse(
        (cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r),
        outline=(0, 0, 0, 255),
        width=stroke,
    )

    # Bottom white mass (IP color 1)
    mask_bottom = Image.new("L", (SIZE, SIZE), 0)
    mb = ImageDraw.Draw(mask_bottom)
    mb.ellipse((cx - outer_r + 4, cy - outer_r + 4, cx + outer_r - 4, cy + outer_r - 4), fill=255)
    mb.rectangle((0, 0, SIZE, cy), fill=0)
    white_layer = Image.new("RGBA", (SIZE, SIZE), (*IP_WHITE, 255))
    ring = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    ring = Image.composite(white_layer, ring, mask_bottom)
    img = Image.alpha_composite(img.convert("RGBA"), ring)

    d = ImageDraw.Draw(img)

    # Top glow shell — soft tint of glow family
    mask_top = Image.new("L", (SIZE, SIZE), 0)
    mt = ImageDraw.Draw(mask_top)
    mt.ellipse((cx - outer_r + 4, cy - outer_r + 4, cx + outer_r - 4, cy + outer_r - 4), fill=255)
    mt.rectangle((0, 0, SIZE, cy), fill=0)
    shell = Image.new("RGBA", (SIZE, SIZE), (210, 228, 245, 72))
    img = Image.composite(shell, img, mask_top)
    d = ImageDraw.Draw(img)

    # Rainbow bands inside top semicircle (glow family variation)
    pad = int(SIZE * 0.035)
    arc_bbox = (
        cx - outer_r + pad,
        cy - outer_r + pad,
        cx + outer_r - pad,
        cy + outer_r - pad,
    )
    band_w = max(18, int(SIZE * 0.028))
    n = len(GLOW_BANDS)
    for i, color in enumerate(GLOW_BANDS):
        start = 200 + i * (160 / n)
        end = 200 + (i + 1) * (160 / n) + 1
        d.arc(arc_bbox, start=start, end=end, fill=(*color, 255), width=band_w)

    # Two cat ears — single defining paired feature
    ear_h = int(SIZE * 0.075)
    ear_w = int(SIZE * 0.048)
    ear_l = [
        (cx - int(outer_r * 0.72), cy - int(outer_r * 0.62)),
        (cx - int(outer_r * 0.48), cy - int(outer_r * 0.62) - ear_h),
        (cx - int(outer_r * 0.22), cy - int(outer_r * 0.66)),
    ]
    ear_r = [
        (cx + int(outer_r * 0.22), cy - int(outer_r * 0.66)),
        (cx + int(outer_r * 0.48), cy - int(outer_r * 0.62) - ear_h),
        (cx + int(outer_r * 0.72), cy - int(outer_r * 0.62)),
    ]
    ear_fill = (215, 228, 242, 200)
    d.polygon(ear_l, fill=ear_fill, outline=(0, 0, 0, 255))
    d.polygon(ear_r, fill=ear_fill, outline=(0, 0, 0, 255))

    # Minimal glitter — 6 soft dots only (subordinate detail)
    dots = [(-0.28, -0.50), (-0.08, -0.56), (0.12, -0.52), (0.28, -0.44), (-0.18, -0.38), (0.20, -0.36)]
    dr = max(6, int(SIZE * 0.006))
    for rx, ry in dots:
        gx = cx + int(rx * outer_r)
        gy = cy + int(ry * outer_r)
        if gy < cy - int(SIZE * 0.01):
            d.ellipse((gx - dr, gy - dr, gx + dr, gy + dr), fill=(240, 244, 252, 220))

    img = _hole(img, cx, cy, inner_r - stroke)

    # Tiny preview thumb for 32px readability check
    thumb = img.resize((32, 32), Image.LANCZOS)
    thumb_path = OUT_DIR / "itzy-light-ring-ip-flat-32px.png"
    thumb.save(thumb_path, "PNG")

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    result = draw_ip_light_ring()
    result.save(OUT_PATH, "PNG")
    print(f"Saved {OUT_PATH} ({result.size})")
    print(f"Saved {OUT_DIR / 'itzy-light-ring-ip-flat-32px.png'}")


if __name__ == "__main__":
    main()
