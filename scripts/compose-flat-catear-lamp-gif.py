"""Draw flat-style cat-ear lamp (fig-2 style) and composite into scream-figure GIF."""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "apps" / "h5" / "src" / "assets"
CURSOR_ASSETS = Path(
    r"C:\Users\Administrator\.cursor\projects\C-Users-ADMINI-1-AppData-Local-Temp-a0869930-0c4f-4d1d-8e2b-6a418e802ae6\assets"
)

GIF_CANDIDATES = [
    CURSOR_ASSETS
    / "c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_f677026054a3091eaca1353ed262501c_images_scream-figure-jump-transparent-f51d7017-8b4b-4e26-92c5-9fb680134a3e.gif",
    ASSETS / "scream-figure-jump-transparent.gif",
    ROOT / "scream-figure-jump-transparent.gif",
]

OUT_PATH = ASSETS / "scream-figure-jump-flat-catear-lamp.gif"
LAMP_PNG_PATH = ASSETS / "catear-lamp-flat.png"

# Flat rainbow bands — bold poster colors like fig-2
RAINBOW = [
    (255, 118, 36),
    (255, 208, 48),
    (72, 214, 88),
    (46, 196, 255),
    (118, 92, 255),
    (214, 72, 230),
]

INK = (0, 0, 0, 255)
WHITE = (250, 250, 250, 255)
EAR_FILL = (210, 218, 228, 255)
GLITTER = (255, 255, 255, 220)


def win_path(p: Path) -> str:
    s = str(p.resolve())
    if os.name == "nt" and not s.startswith("\\\\?\\"):
        return "\\\\?\\" + s
    return s


def pick_first(paths: list[Path]) -> Path:
    for p in paths:
        if p.exists() or (os.name == "nt" and os.path.exists(win_path(p))):
            return p
    raise FileNotFoundError(f"Missing asset: {paths}")


def _punch_hole(img: Image.Image, cx: int, cy: int, inner_r: int) -> Image.Image:
    hole = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hole)
    hd.ellipse(
        (cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r),
        fill=(0, 0, 0, 255),
    )
    arr = np.array(img)
    hole_arr = np.array(hole)
    arr[hole_arr[:, :, 3] > 0, 3] = 0
    return Image.fromarray(arr)


def draw_flat_catear_lamp() -> Image.Image:
    """Fig-2 flat poster style — ring lamp from fig-1 reference."""
    w, h = 112, 132
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx, cy = w // 2, h // 2 + 10
    outer_r = 44
    inner_r = 23
    stroke = 5

    # Cat ears (behind ring)
    ear_l = [(cx - 32, cy - 28), (cx - 22, cy - 56), (cx - 8, cy - 30)]
    ear_r = [(cx + 8, cy - 30), (cx + 22, cy - 56), (cx + 32, cy - 28)]
    d.polygon(ear_l, fill=EAR_FILL, outline=INK, width=stroke)
    d.polygon(ear_r, fill=EAR_FILL, outline=INK, width=stroke)

    # Outer + inner ring strokes
    d.ellipse(
        (cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r),
        outline=INK,
        width=stroke,
    )
    d.ellipse(
        (cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r),
        outline=INK,
        width=stroke,
    )

    # White bottom half of ring
    bottom_mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(bottom_mask)
    md.ellipse((cx - outer_r + 3, cy - outer_r + 3, cx + outer_r - 3, cy + outer_r - 3), fill=255)
    md.rectangle((0, cy + 2, w, h), fill=0)
    bottom = Image.new("RGBA", (w, h), WHITE)
    img = Image.composite(bottom, img, bottom_mask)

    d = ImageDraw.Draw(img)
    d.ellipse(
        (cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r),
        outline=INK,
        width=stroke,
    )
    d.ellipse(
        (cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r),
        outline=INK,
        width=stroke,
    )

    # Rainbow upper arc — flat bands
    arc_bbox = (cx - outer_r + 8, cy - outer_r + 8, cx + outer_r - 8, cy + outer_r - 8)
    band_w = 10
    for i, color in enumerate(RAINBOW):
        start = 198 + i * 11
        end = 198 + (i + 1) * 11 + 1
        d.arc(arc_bbox, start=start, end=end, fill=(*color, 255), width=band_w)

    # Simple glitter dots (flat, no photo texture)
    for gx, gy in [
        (cx - 20, cy - 30),
        (cx - 6, cy - 36),
        (cx + 8, cy - 34),
        (cx + 22, cy - 28),
        (cx - 14, cy - 22),
        (cx + 16, cy - 20),
    ]:
        d.ellipse((gx - 2, gy - 2, gx + 2, gy + 2), fill=GLITTER, outline=INK, width=1)

    # Re-stroke ears on top
    d.polygon(ear_l, fill=EAR_FILL, outline=INK, width=stroke)
    d.polygon(ear_r, fill=EAR_FILL, outline=INK, width=stroke)

    grip_y = cy + 30
    return _punch_hole(img, cx, cy, inner_r - 1), grip_y


def hand_positions(frame_arr: np.ndarray):
    red = (
        (frame_arr[:, :, 0] > 200)
        & (frame_arr[:, :, 1] < 80)
        & (frame_arr[:, :, 2] < 80)
        & (frame_arr[:, :, 3] > 100)
    )
    ys, xs = np.where(red)
    if not len(xs):
        return None, None, 0.0

    mid_y = (ys.min() + ys.max()) // 2
    top = red.copy()
    top[np.arange(frame_arr.shape[0]) >= mid_y, :] = False
    tys, txs = np.where(top)
    if not len(txs):
        return None, None, 0.0

    body_cx = (xs.min() + xs.max()) / 2
    left_idx = txs < body_cx - 20
    right_idx = txs > body_cx + 20

    left = None
    right = None
    if left_idx.any():
        lxs, lys = txs[left_idx], tys[left_idx]
        left = (int(lxs.mean()), int(np.percentile(lys, 72)))
    if right_idx.any():
        rxs, rys = txs[right_idx], tys[right_idx]
        right = (int(rxs.mean()), int(np.percentile(rys, 72)))
    return left, right, body_cx


def overlay_hand(
    original: Image.Image,
    frame: Image.Image,
    hx: int,
    hy: int,
    body_cx: float,
) -> Image.Image:
    """Re-draw hand/finger pixels on top of the lamp for a gripping look."""
    orig = np.array(original.convert("RGBA"))
    out = np.array(frame.convert("RGBA"))
    h, w = orig.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]

    side_left = hx < body_cx
    side_band = xx <= hx + 32 if side_left else xx >= hx - 32

    # Ellipse shifted upward so spread fingers wrap over the lamp ring.
    anchor_y = hy - 8
    dx = (xx - hx) / 36.0
    dy = (yy - anchor_y) / 50.0
    region = (dx * dx + dy * dy) <= 1.0

    red = (
        (orig[:, :, 0] > 200)
        & (orig[:, :, 1] < 80)
        & (orig[:, :, 2] < 80)
        & (orig[:, :, 3] > 100)
    )
    ink = (
        (orig[:, :, 0] < 40)
        & (orig[:, :, 1] < 40)
        & (orig[:, :, 2] < 40)
        & (orig[:, :, 3] > 100)
    )
    mask = region & side_band & (red | ink)
    out[mask] = orig[mask]
    return Image.fromarray(out)


def paste_lamp(
    frame: Image.Image,
    lamp: Image.Image,
    hx: int,
    hy: int,
    angle: float,
    grip_y: int,
    *,
    mirror: bool = False,
) -> Image.Image:
    stick = lamp.transpose(Image.FLIP_LEFT_RIGHT) if mirror else lamp
    rotated = stick.rotate(angle, expand=True, resample=Image.NEAREST)
    grip_x = stick.width // 2

    # Map grip point through rotation around image center.
    rad = np.deg2rad(angle)
    rcx, rcy = stick.width / 2, grip_y
    dx, dy = grip_x - rcx, grip_y - rcy
    rx = dx * np.cos(rad) - dy * np.sin(rad)
    ry = dx * np.sin(rad) + dy * np.cos(rad)
    rot_grip_x = rotated.width / 2 + rx
    rot_grip_y = rotated.height / 2 + ry

    px = int(hx - rot_grip_x)
    py = int(hy - rot_grip_y)
    frame.paste(rotated, (px, py), rotated)
    return frame


def save_transparent_gif(
    frames: list[Image.Image],
    path: Path,
    durations: list[int],
) -> None:
    cleaned: list[Image.Image] = []
    for frame in frames:
        rgba = frame.convert("RGBA")
        arr = np.array(rgba)
        arr[arr[:, :, 3] < 20] = (0, 0, 0, 0)
        cleaned.append(Image.fromarray(arr))

    cleaned[0].save(
        path,
        save_all=True,
        append_images=cleaned[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=False,
    )


def main() -> None:
    gif_src = pick_first(GIF_CANDIDATES)
    lamp, grip_y = draw_flat_catear_lamp()
    ASSETS.mkdir(parents=True, exist_ok=True)
    lamp.save(LAMP_PNG_PATH)

    gif = Image.open(win_path(gif_src))
    frames_out: list[Image.Image] = []
    durations: list[int] = []
    frame_idx = 0

    while True:
        try:
            gif.seek(frame_idx)
        except EOFError:
            break

        durations.append(gif.info.get("duration", 70))
        original = gif.convert("RGBA").copy()
        frame = original.copy()
        left_pos, right_pos, body_cx = hand_positions(np.array(original))

        if left_pos:
            paste_lamp(frame, lamp, *left_pos, angle=-14, grip_y=grip_y, mirror=False)
            frame = overlay_hand(original, frame, *left_pos, body_cx)
        if right_pos:
            paste_lamp(frame, lamp, *right_pos, angle=14, grip_y=grip_y, mirror=True)
            frame = overlay_hand(original, frame, *right_pos, body_cx)

        frames_out.append(frame)
        frame_idx += 1

    save_transparent_gif(frames_out, OUT_PATH, durations)
    root_copy = ROOT / "scream-figure-jump-flat-catear-lamp.gif"
    save_transparent_gif(frames_out, root_copy, durations)
    print(
        f"Saved {OUT_PATH} ({len(frames_out)} frames, flat lamp {lamp.size}, "
        f"gif={gif_src.name})"
    )


if __name__ == "__main__":
    main()
