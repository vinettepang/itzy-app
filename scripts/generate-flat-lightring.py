"""Generate flat vector-style ITZY light ring PNG assets."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parents[1] / "apps" / "h5" / "src" / "assets"

RAINBOW = [
    (255, 118, 38),
    (255, 208, 48),
    (78, 218, 88),
    (48, 198, 255),
    (58, 118, 255),
    (198, 58, 255),
    (255, 72, 148),
]


def _cut_inner_hole(img: Image.Image, cx: int, cy: int, inner_r: int, pad: int) -> Image.Image:
    hole = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hole)
    hd.ellipse((cx - inner_r + pad, cy - inner_r + pad, cx + inner_r - pad, cy + inner_r - pad), fill=(0, 0, 0, 255))
    arr = np.array(img)
    hole_arr = np.array(hole)
    arr[hole_arr[:, :, 3] > 0, 3] = 0
    return Image.fromarray(arr)


def draw_flat_cat_ear_ring(scale: float = 4.0) -> Image.Image:
    """High-res flat ITZY cat-ear light ring matching product colors."""
    w, h = int(130 * scale), int(154 * scale)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx, cy = w // 2, int(h * 0.52)
    outer_r = int(54 * scale)
    inner_r = int(28 * scale)
    stroke = max(4, int(4 * scale))

    # Outer + inner ring outlines
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

    # Bottom white plastic half
    mask_bottom = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask_bottom)
    md.ellipse((cx - outer_r + 2, cy - outer_r + 2, cx + outer_r - 2, cy + outer_r - 2), fill=255)
    md.rectangle((0, cy, w, h), fill=0)
    bottom = Image.new("RGBA", (w, h), (248, 248, 248, 255))
    img = Image.composite(bottom, img, mask_bottom)

    mask_top = Image.new("L", (w, h), 0)
    mtd = ImageDraw.Draw(mask_top)
    mtd.ellipse((cx - outer_r + 2, cy - outer_r + 2, cx + outer_r - 2, cy + outer_r - 2), fill=255)
    mtd.rectangle((0, 0, w, cy), fill=0)
    top_shell = Image.new("RGBA", (w, h), (210, 220, 235, 90))
    img = Image.composite(top_shell, img, mask_top)

    d = ImageDraw.Draw(img)

    pad = int(8 * scale)
    arc_bbox = (cx - outer_r + pad, cy - outer_r + pad, cx + outer_r - pad, cy + outer_r - pad)
    arc_w = max(8, int(10 * scale))
    n = len(RAINBOW)
    for i, color in enumerate(RAINBOW):
        start = 200 + i * (160 / n)
        end = 200 + (i + 1) * (160 / n) + 1
        d.arc(arc_bbox, start=start, end=end, fill=(*color, 255), width=arc_w)

    # Glitter in top shell
    glitter = [
        (-0.34, -0.52), (-0.15, -0.58), (0.02, -0.55), (0.18, -0.48),
        (0.32, -0.38), (-0.38, -0.28), (0.12, -0.42), (-0.05, -0.46),
        (0.24, -0.22), (-0.22, -0.35), (0.08, -0.50), (0.28, -0.30),
    ]
    dot_r = max(2, int(2.5 * scale))
    for rx, ry in glitter:
        gx = cx + int(rx * outer_r)
        gy = cy + int(ry * outer_r)
        if gy < cy - int(4 * scale):
            d.ellipse(
                (gx - dot_r, gy - dot_r, gx + dot_r, gy + dot_r),
                fill=(235, 238, 245, 210),
                outline=(180, 190, 205, 120),
            )

    # Cat ears
    ear_h = int(22 * scale)
    ear_w = int(14 * scale)
    ear_l = [
        (cx - int(38 * scale), cy - int(32 * scale)),
        (cx - int(26 * scale), cy - int(32 * scale) - ear_h),
        (cx - int(12 * scale), cy - int(34 * scale)),
    ]
    ear_r = [
        (cx + int(12 * scale), cy - int(34 * scale)),
        (cx + int(26 * scale), cy - int(32 * scale) - ear_h),
        (cx + int(38 * scale), cy - int(32 * scale)),
    ]
    ear_fill = (205, 215, 228, 160)
    d.polygon(ear_l, fill=ear_fill, outline=(0, 0, 0, 255))
    d.polygon(ear_r, fill=ear_fill, outline=(0, 0, 0, 255))

    return _cut_inner_hole(img, cx, cy, inner_r, stroke)


def draw_flat_plain_ring(scale: float = 4.0) -> Image.Image:
    """Flat ring without cat ears."""
    ring = draw_flat_cat_ear_ring(scale)
    # Re-draw without ears by using lower canvas crop - simpler: duplicate draw without ear step
    w, h = int(130 * scale), int(154 * scale)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = w // 2, int(h * 0.52)
    outer_r = int(54 * scale)
    inner_r = int(28 * scale)
    stroke = max(4, int(4 * scale))

    d.ellipse((cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r), outline=(0, 0, 0, 255), width=stroke)
    d.ellipse((cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r), outline=(0, 0, 0, 255), width=stroke)

    mask_bottom = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask_bottom)
    md.ellipse((cx - outer_r + 2, cy - outer_r + 2, cx + outer_r - 2, cy + outer_r - 2), fill=255)
    md.rectangle((0, cy, w, h), fill=0)
    img = Image.composite(Image.new("RGBA", (w, h), (248, 248, 248, 255)), img, mask_bottom)

    mask_top = Image.new("L", (w, h), 0)
    mtd = ImageDraw.Draw(mask_top)
    mtd.ellipse((cx - outer_r + 2, cy - outer_r + 2, cx + outer_r - 2, cy + outer_r - 2), fill=255)
    mtd.rectangle((0, 0, w, cy), fill=0)
    img = Image.composite(Image.new("RGBA", (w, h), (210, 220, 235, 90)), img, mask_top)

    d = ImageDraw.Draw(img)

    pad = int(8 * scale)
    arc_bbox = (cx - outer_r + pad, cy - outer_r + pad, cx + outer_r - pad, cy + outer_r - pad)
    arc_w = max(8, int(10 * scale))
    n = len(RAINBOW)
    for i, color in enumerate(RAINBOW):
        start = 200 + i * (160 / n)
        end = 200 + (i + 1) * (160 / n) + 1
        d.arc(arc_bbox, start=start, end=end, fill=(*color, 255), width=arc_w)

    glitter = [
        (-0.34, -0.52), (-0.15, -0.58), (0.02, -0.55), (0.18, -0.48),
        (0.32, -0.38), (-0.38, -0.28), (0.12, -0.42), (-0.05, -0.46),
    ]
    dot_r = max(2, int(2.5 * scale))
    for rx, ry in glitter:
        gx, gy = cx + int(rx * outer_r), cy + int(ry * outer_r)
        if gy < cy - int(4 * scale):
            d.ellipse((gx - dot_r, gy - dot_r, gx + dot_r, gy + dot_r), fill=(235, 238, 245, 210))

    return _cut_inner_hole(img, cx, cy, inner_r, stroke)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    cat_ring = draw_flat_cat_ear_ring(scale=4.0)
    plain_ring = draw_flat_plain_ring(scale=4.0)

    cat_path = OUT_DIR / "itzy-light-ring-cat-ears-flat.png"
    plain_path = OUT_DIR / "itzy-light-ring-flat.png"

    cat_ring.save(cat_path, "PNG")
    plain_ring.save(plain_path, "PNG")

    # Preview on white background for reference
    preview = Image.new("RGBA", cat_ring.size, (255, 255, 255, 255))
    preview.paste(cat_ring, (0, 0), cat_ring)
    preview.save(OUT_DIR / "itzy-light-ring-cat-ears-flat-preview.png", "PNG")

    print(f"Saved {cat_path} ({cat_ring.size})")
    print(f"Saved {plain_path} ({plain_ring.size})")


if __name__ == "__main__":
    main()
