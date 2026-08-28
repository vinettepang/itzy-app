"""Scream figure holds the white BOTTOM of the cat-ear lamp with BOTH hands."""
from __future__ import annotations

import math
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "apps" / "h5" / "src" / "assets"
CURSOR_ASSETS = Path(
    r"C:\Users\Administrator\.cursor\projects\C-Users-ADMINI-1-AppData-Local-Temp-a0869930-0c4f-4d1d-8e2b-6a418e802ae6\assets"
)

LAMP_CANDIDATES = sorted(CURSOR_ASSETS.glob("*019cfbd7*.jpg"))
LAMP_CANDIDATES.append(ASSETS / "catear-lamp-source.jpg")
GIF_CANDIDATES = [
    CURSOR_ASSETS
    / "c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_f677026054a3091eaca1353ed262501c_images_scream-figure-jump-transparent-124d811f-122d-43ea-b016-7f1fb0628b6e.gif",
    ASSETS / "scream-figure-jump-transparent.gif",
    ROOT / "scream-figure-jump-transparent.gif",
]

OUT_PATH = ASSETS / "scream-figure-jump-catear-lamp-bottom.gif"
LAMP_PNG_PATH = ASSETS / "catear-lamp-bottom-cutout.png"


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


def extract_lamp_bottom(src: Path, target_w: int = 168) -> Image.Image:
    """Keep only the opaque white lower arc of the ring lamp."""
    img = Image.open(win_path(src)).convert("RGBA")
    arr = np.array(img)
    rgb = arr[:, :, :3].astype(np.int16)

    # Drop near-white studio backdrop
    white_bg = (rgb[:, :, 0] > 235) & (rgb[:, :, 1] > 235) & (rgb[:, :, 2] > 235)
    arr[white_bg, 3] = 0

    # Subject bbox
    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 20)
    if len(xs) == 0:
        raise RuntimeError("Lamp cutout failed — no opaque pixels")

    pad = 2
    x0, x1 = max(0, int(xs.min()) - pad), min(arr.shape[1], int(xs.max()) + pad)
    y0, y1 = max(0, int(ys.min()) - pad), min(arr.shape[0], int(ys.max()) + pad)
    crop = arr[y0:y1, x0:x1].copy()
    h, w = crop.shape[:2]

    # White plastic bottom (near-white, not pure backdrop already removed)
    r, g, b = crop[:, :, 0], crop[:, :, 1], crop[:, :, 2]
    a = crop[:, :, 3]
    near_white = (
        (r > 200)
        & (g > 200)
        & (b > 200)
        & (np.abs(r.astype(np.int16) - g.astype(np.int16)) < 28)
        & (np.abs(g.astype(np.int16) - b.astype(np.int16)) < 28)
        & (a > 20)
    )
    # Prefer lower half of ring (bottom housing)
    yy = np.arange(h)[:, None]
    lower = yy > h * 0.42
    bottom_mask = near_white & lower

    # Soften rainbow / glitter residue above the equator
    crop[~bottom_mask, 3] = 0

    # Small morphological close to fill holes in white plastic
    mask_img = Image.fromarray((crop[:, :, 3] > 20).astype(np.uint8) * 255)
    mask_img = mask_img.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    m = np.array(mask_img) > 0
    # Restore RGB only where we had bottom pixels; fill tiny gaps with white
    out = crop.copy()
    out[~m, 3] = 0
    gaps = m & (out[:, :, 3] < 20)
    out[gaps, :3] = 245
    out[gaps, 3] = 255
    out[m & (out[:, :, 3] > 0), 3] = np.maximum(out[m & (out[:, :, 3] > 0), 3], 220)

    ys2, xs2 = np.where(out[:, :, 3] > 20)
    if len(xs2) == 0:
        raise RuntimeError("Bottom extraction empty — tune thresholds")
    x0b, x1b = int(xs2.min()), int(xs2.max()) + 1
    y0b, y1b = int(ys2.min()), int(ys2.max()) + 1
    bottom = Image.fromarray(out[y0b:y1b, x0b:x1b])

    scale = target_w / bottom.width
    new_h = max(1, int(bottom.height * scale))
    return bottom.resize((target_w, new_h), Image.LANCZOS)


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
    left_idx = txs < body_cx - 18
    right_idx = txs > body_cx + 18

    left = None
    right = None
    if left_idx.any():
        lxs, lys = txs[left_idx], tys[left_idx]
        # Prefer lower fingertips (holding from below / sides)
        left = (int(lxs.mean()), int(np.percentile(lys, 78)))
    if right_idx.any():
        rxs, rys = txs[right_idx], tys[right_idx]
        right = (int(rxs.mean()), int(np.percentile(rys, 78)))
    return left, right, body_cx


def overlay_hands(
    original: Image.Image,
    frame: Image.Image,
    left,
    right,
    body_cx: float,
) -> Image.Image:
    """Bring finger pixels back on top of the lamp so hands grip it."""
    orig = np.array(original.convert("RGBA"))
    out = np.array(frame.convert("RGBA"))
    h, w = orig.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]

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

    def region_for(hx: int, hy: int, side_left: bool):
        side_band = xx <= hx + 38 if side_left else xx >= hx - 38
        anchor_y = hy - 6
        dx = (xx - hx) / 40.0
        dy = (yy - anchor_y) / 52.0
        return side_band & ((dx * dx + dy * dy) <= 1.0)

    mask = np.zeros((h, w), dtype=bool)
    if left:
        mask |= region_for(*left, True)
    if right:
        mask |= region_for(*right, False)

    keep = mask & (red | ink)
    out[keep] = orig[keep]
    return Image.fromarray(out)


def paste_bottom_between_hands(
    frame: Image.Image,
    lamp_bottom: Image.Image,
    left,
    right,
) -> Image.Image:
    lx, ly = left
    rx, ry = right
    cx = (lx + rx) / 2
    cy = (ly + ry) / 2

    # Slight tilt from hand height difference
    angle = math.degrees(math.atan2(ry - ly, rx - lx))
    # Cap tilt so the white arc stays readable
    angle = max(-12.0, min(12.0, angle * 0.35))

    rotated = lamp_bottom.rotate(angle, expand=True, resample=Image.BICUBIC)
    # Grip along the outer bottom curve (lower third of the cutout)
    grip_local_y = lamp_bottom.height * 0.62
    rad = np.deg2rad(angle)
    rcx, rcy = lamp_bottom.width / 2, grip_local_y
    dx, dy = 0.0, grip_local_y - lamp_bottom.height / 2
    rx_ = dx * np.cos(rad) - dy * np.sin(rad)
    ry_ = dx * np.sin(rad) + dy * np.cos(rad)
    rot_gx = rotated.width / 2 + rx_
    rot_gy = rotated.height / 2 + ry_

    # Sit the bottom arc into the hands (slightly above fingertip centroids)
    px = int(cx - rot_gx)
    py = int(cy - rot_gy - 6)
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
    lamp_src = pick_first(LAMP_CANDIDATES)
    gif_src = pick_first(GIF_CANDIDATES)

    lamp_bottom = extract_lamp_bottom(lamp_src)
    ASSETS.mkdir(parents=True, exist_ok=True)
    lamp_bottom.save(LAMP_PNG_PATH)

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

        if left_pos and right_pos:
            paste_bottom_between_hands(frame, lamp_bottom, left_pos, right_pos)
            frame = overlay_hands(original, frame, left_pos, right_pos, body_cx)

        frames_out.append(frame)
        frame_idx += 1

    save_transparent_gif(frames_out, OUT_PATH, durations)
    root_copy = ROOT / "scream-figure-jump-catear-lamp-bottom.gif"
    save_transparent_gif(frames_out, root_copy, durations)
    print(
        f"Saved {OUT_PATH} ({len(frames_out)} frames, bottom {lamp_bottom.size}, "
        f"lamp={lamp_src.name})"
    )


if __name__ == "__main__":
    main()
