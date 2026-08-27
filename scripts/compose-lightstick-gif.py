"""Draw flat-style ITZY light rings and composite into scream-figure GIF."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).resolve().parents[1] / "apps" / "h5" / "src" / "assets"
GIF_PATH = OUT_DIR / "scream-figure-jump-transparent.gif"
OUT_PATH = OUT_DIR / "scream-figure-jump-lightstick.gif"

# Ring canvas (cat-ear version)
RING_W, RING_H = 100, 118

RAINBOW = [
    (255, 120, 40),
    (255, 210, 50),
    (80, 220, 90),
    (50, 200, 255),
    (60, 120, 255),
    (200, 60, 255),
]


def _cut_inner_hole(img: Image.Image, cx: int, cy: int, inner_r: int, stroke: int) -> Image.Image:
    hole = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hole)
    hd.ellipse(
        (cx - inner_r + stroke, cy - inner_r + stroke, cx + inner_r - stroke, cy + inner_r - stroke),
        fill=(0, 0, 0, 255),
    )
    img_arr = np.array(img)
    hole_arr = np.array(hole)
    img_arr[hole_arr[:, :, 3] > 0, 3] = 0
    return Image.fromarray(img_arr)


def draw_rainbow_ring(cat_ears: bool = False) -> Image.Image:
    """Flat ITZY light ring; optional cat ears for the right-hand variant."""
    img = Image.new("RGBA", (RING_W, RING_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx, cy = RING_W // 2, RING_H // 2 + 8
    outer_r = 42
    inner_r = 22
    stroke = 4

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

    mask_bottom = Image.new("L", (RING_W, RING_H), 0)
    md = ImageDraw.Draw(mask_bottom)
    md.ellipse((cx - outer_r + 2, cy - outer_r + 2, cx + outer_r - 2, cy + outer_r - 2), fill=255)
    md.rectangle((0, cy, RING_W, RING_H), fill=0)
    bottom = Image.new("RGBA", (RING_W, RING_H), (245, 245, 245, 255))
    img = Image.composite(bottom, img, mask_bottom)

    d = ImageDraw.Draw(img)

    arc_bbox = (cx - outer_r + 6, cy - outer_r + 6, cx + outer_r - 6, cy + outer_r - 6)
    for i, color in enumerate(RAINBOW):
        start = 200 + i * 10
        end = 200 + (i + 1) * 10 + 2
        d.arc(arc_bbox, start=start, end=end, fill=(*color, 255), width=9)

    glitter_pts = [
        (cx - 18, cy - 28), (cx - 8, cy - 32), (cx + 4, cy - 30),
        (cx + 16, cy - 26), (cx + 24, cy - 18), (cx - 22, cy - 14),
        (cx + 10, cy - 20), (cx - 4, cy - 24), (cx + 18, cy - 12),
    ]
    for gx, gy in glitter_pts:
        if gy < cy - 4:
            d.ellipse((gx - 2, gy - 2, gx + 2, gy + 2), fill=(220, 220, 230, 200))

    if cat_ears:
        ear_l = [(cx - 30, cy - 30), (cx - 22, cy - 52), (cx - 10, cy - 32)]
        ear_r = [(cx + 10, cy - 32), (cx + 22, cy - 52), (cx + 30, cy - 30)]
        d.polygon(ear_l, fill=(200, 210, 225, 180), outline=(0, 0, 0, 255))
        d.polygon(ear_r, fill=(200, 210, 225, 180), outline=(0, 0, 0, 255))

    return _cut_inner_hole(img, cx, cy, inner_r, stroke)


def draw_plain_lightstick() -> Image.Image:
    """Classic vertical lightstick with rainbow glow head (left hand, no cat ears)."""
    w, h = 52, 115
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx = w // 2
    handle_top = 52
    handle_bot = h - 4
    stroke = 3

    # White handle
    d.rounded_rectangle(
        (cx - 9, handle_top, cx + 9, handle_bot),
        radius=6,
        fill=(245, 245, 245, 255),
        outline=(0, 0, 0, 255),
        width=stroke,
    )

    # Rainbow glow dome at top
    head_cy = 28
    head_r = 22
    d.ellipse(
        (cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r),
        outline=(0, 0, 0, 255),
        width=stroke,
    )

    arc_bbox = (cx - head_r + 4, head_cy - head_r + 4, cx + head_r - 4, head_cy + head_r - 4)
    for i, color in enumerate(RAINBOW):
        start = 200 + i * 12
        end = 200 + (i + 1) * 12 + 2
        d.arc(arc_bbox, start=start, end=end, fill=(*color, 255), width=8)

    # Inner bright core
    d.ellipse((cx - 8, head_cy - 8, cx + 8, head_cy + 8), fill=(255, 255, 255, 180))

    # Small button on handle
    d.ellipse((cx - 3, handle_top + 18, cx + 3, handle_top + 24), fill=(200, 200, 200, 255), outline=(0, 0, 0, 255))

    return img


def hand_positions(frame_arr: np.ndarray):
    red = (
        (frame_arr[:, :, 0] > 200)
        & (frame_arr[:, :, 1] < 80)
        & (frame_arr[:, :, 2] < 80)
        & (frame_arr[:, :, 3] > 100)
    )
    ys, xs = np.where(red)
    if not len(xs):
        return None, None

    mid_y = (ys.min() + ys.max()) // 2
    top = red.copy()
    top[np.arange(frame_arr.shape[0]) >= mid_y, :] = False
    tys, txs = np.where(top)
    if not len(txs):
        return None, None

    body_cx = (xs.min() + xs.max()) / 2
    left_idx = txs < body_cx - 20
    right_idx = txs > body_cx + 20

    left = None
    right = None
    if left_idx.any():
        left = (int(txs[left_idx].mean()), int(tys[left_idx].mean()))
    if right_idx.any():
        right = (int(txs[right_idx].mean()), int(tys[right_idx].mean()))
    return left, right


def paste_stick(
    frame: Image.Image,
    stick: Image.Image,
    hx: int,
    hy: int,
    angle: float,
    offset_y: int = 18,
) -> Image.Image:
    px = hx - stick.width // 2
    py = hy - stick.height + offset_y
    rotated = stick.rotate(angle, expand=True, resample=Image.BICUBIC)
    px -= (rotated.width - stick.width) // 2
    py -= (rotated.height - stick.height) // 2
    frame.paste(rotated, (px, py), rotated)
    return frame


def main() -> None:
    stick_left = draw_plain_lightstick()
    stick_right = draw_rainbow_ring(cat_ears=True)

    gif = Image.open(GIF_PATH)
    frames_out = []
    durations = []
    frame_idx = 0

    while True:
        try:
            gif.seek(frame_idx)
        except EOFError:
            break

        durations.append(gif.info.get("duration", 70))
        frame = gif.convert("RGBA").copy()
        left_pos, right_pos = hand_positions(np.array(frame))

        if left_pos:
            paste_stick(frame, stick_left, *left_pos, angle=-14, offset_y=22)
        if right_pos:
            paste_stick(frame, stick_right, *right_pos, angle=14, offset_y=18)

        frames_out.append(frame)
        frame_idx += 1

    frames_out[0].save(
        OUT_PATH,
        save_all=True,
        append_images=frames_out[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=False,
    )
    print(
        f"Saved {OUT_PATH} ({len(frames_out)} frames, "
        f"left stick {stick_left.size}, right ring {stick_right.size})"
    )


if __name__ == "__main__":
    main()
