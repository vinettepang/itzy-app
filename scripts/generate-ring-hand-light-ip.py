"""
IP-as-logo flat ring hand light — rainbow top, cat ears on top rim, corner emergence.
Programmatic fallback when no image-model API is available.
"""
from pathlib import Path
import math

import numpy as np
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parents[1] / "apps" / "h5" / "src" / "assets"
SIZE = 1536
BG = (96, 100, 109)  # #60646d
IP_WHITE = (248, 248, 248)
GLOW_BANDS = [
    (255, 128, 48),
    (255, 210, 56),
    (88, 220, 96),
    (56, 198, 255),
    (64, 120, 255),
    (200, 64, 248),
]

# Lower-right emergence — ring center offset toward corner
CX = int(SIZE * 0.58)
CY = int(SIZE * 0.62)
OUTER_R = int(SIZE * 0.42)
INNER_R = int(SIZE * 0.22)
STROKE = max(12, int(SIZE * 0.012))


def _rim_point(cx: int, cy: int, r: int, angle_deg: float):
    rad = math.radians(angle_deg)
    return int(cx + r * math.cos(rad)), int(cy + r * math.sin(rad))


def _cat_ears_on_top_rim(d: ImageDraw.ImageDraw, cx: int, cy: int, outer_r: int) -> None:
    """Cat ears rooted on the outer top edge of the ring (paired defining feature)."""
    ear_fill = (*IP_WHITE, 255)
    ear_h = int(SIZE * 0.095)
    # PIL angles: 270° = top of circle; ears sit just left/right of apex on outer rim
    left_base_a = 248
    left_base_b = 262
    right_base_a = 278
    right_base_b = 292
    left_tip_angle = 255
    right_tip_angle = 285
    tip_r = outer_r + ear_h

    ear_l = [
        _rim_point(cx, cy, outer_r, left_base_a),
        _rim_point(cx, cy, outer_r, left_base_b),
        _rim_point(cx, cy, tip_r, left_tip_angle),
    ]
    ear_r = [
        _rim_point(cx, cy, outer_r, right_base_a),
        _rim_point(cx, cy, outer_r, right_base_b),
        _rim_point(cx, cy, tip_r, right_tip_angle),
    ]
    d.polygon(ear_l, fill=ear_fill, outline=(0, 0, 0, 255))
    d.polygon(ear_r, fill=ear_fill, outline=(0, 0, 0, 255))


def _annulus_bottom_white() -> Image.Image:
    mask = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((CX - OUTER_R, CY - OUTER_R, CX + OUTER_R, CY + OUTER_R), fill=255)
    d.rectangle((0, 0, SIZE, CY), fill=0)
    inner = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(inner).ellipse(
        (CX - INNER_R, CY - INNER_R, CX + INNER_R, CY + INNER_R), fill=255
    )
    mb = np.array(mask)
    mb[np.array(inner) > 0] = 0
    layer = Image.new("RGBA", (SIZE, SIZE), (*IP_WHITE, 255))
    return Image.composite(layer, Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0)), Image.fromarray(mb))


def _annulus_top_mask() -> Image.Image:
    mask = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((CX - OUTER_R, CY - OUTER_R, CX + OUTER_R, CY + OUTER_R), fill=255)
    d.rectangle((0, CY, SIZE, SIZE), fill=0)
    inner = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(inner).ellipse(
        (CX - INNER_R, CY - INNER_R, CX + INNER_R, CY + INNER_R), fill=255
    )
    mb = np.array(mask)
    mb[np.array(inner) > 0] = 0
    return Image.fromarray(mb)


def draw_ring_ip(corner: str = "lower-right") -> Image.Image:
    global CX, CY
    if corner == "lower-left":
        CX, CY = int(SIZE * 0.42), int(SIZE * 0.62)
    else:
        CX, CY = int(SIZE * 0.58), int(SIZE * 0.62)

    img = Image.new("RGBA", (SIZE, SIZE), (*BG, 255))
    d = ImageDraw.Draw(img)

    # Ring contours — essential for 32px readability
    d.ellipse(
        (CX - OUTER_R, CY - OUTER_R, CX + OUTER_R, CY + OUTER_R),
        outline=(0, 0, 0, 255),
        width=STROKE,
    )
    d.ellipse(
        (CX - INNER_R, CY - INNER_R, CX + INNER_R, CY + INNER_R),
        outline=(0, 0, 0, 255),
        width=STROKE,
    )

    white_part = _annulus_bottom_white()
    img = Image.alpha_composite(img, white_part)

    top_mask = _annulus_top_mask()
    shell = Image.new("RGBA", (SIZE, SIZE), (220, 232, 244, 90))
    img = Image.composite(shell, img, top_mask)

    outer_box = (CX - OUTER_R, CY - OUTER_R, CX + OUTER_R, CY + OUTER_R)
    inner_box = (CX - INNER_R, CY - INNER_R, CX + INNER_R, CY + INNER_R)
    rainbow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rainbow)
    n = len(GLOW_BANDS)
    for i, color in enumerate(GLOW_BANDS):
        start = 180 + i * (180 / n)
        end = 180 + (i + 1) * (180 / n)
        rd.pieslice(outer_box, start, end, fill=(*color, 255))
    inner_cut = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(inner_cut).ellipse(inner_box, fill=255)
    ra = np.array(rainbow)
    ra[np.array(inner_cut) > 0, 3] = 0
    rainbow = Image.fromarray(ra)
    img = Image.composite(rainbow, img, top_mask)

    d = ImageDraw.Draw(img)
    _cat_ears_on_top_rim(d, CX, CY, OUTER_R)

    # Transparent inner hole
    hole = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(hole).ellipse(
        (CX - INNER_R + STROKE, CY - INNER_R + STROKE, CX + INNER_R - STROKE, CY + INNER_R - STROKE),
        fill=255,
    )
    arr = np.array(img)
    arr[np.array(hole) > 0, 3] = 0
    return Image.fromarray(arr)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / "itzy-ring-hand-light-ip.png"
    result = draw_ring_ip("lower-right")
    result.save(out, "PNG")
    result.resize((32, 32), Image.LANCZOS).save(
        OUT_DIR / "itzy-ring-hand-light-ip-32px.png", "PNG"
    )
    print(f"Saved {out} ({result.size})")


if __name__ == "__main__":
    main()
