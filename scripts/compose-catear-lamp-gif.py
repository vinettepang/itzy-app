"""Composite cat-ear rainbow lamp (from photo) into both hands of scream-figure GIF."""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "apps" / "h5" / "src" / "assets"
CURSOR_ASSETS = Path(
    r"C:\Users\Administrator\.cursor\projects\C-Users-ADMINI-1-AppData-Local-Temp-a0869930-0c4f-4d1d-8e2b-6a418e802ae6\assets"
)

LAMP_CANDIDATES = sorted(CURSOR_ASSETS.glob("*019cfbd7*.jpg"))
LAMP_CANDIDATES.append(ASSETS / "catear-lamp-source.jpg")
GIF_CANDIDATES = [
    CURSOR_ASSETS / "c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_f677026054a3091eaca1353ed262501c_images_scream-figure-jump-transparent-124d811f-122d-43ea-b016-7f1fb0628b6e.gif",
    ASSETS / "scream-figure-jump-transparent.gif",
    ROOT / "scream-figure-jump-transparent.gif",
]

OUT_PATH = ASSETS / "scream-figure-jump-catear-lamp.gif"
LAMP_PNG_PATH = ASSETS / "catear-lamp-cutout.png"


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


def extract_lamp(src: Path, target_h: int = 130) -> Image.Image:
    img = Image.open(win_path(src)).convert("RGBA")
    arr = np.array(img)
    rgb = arr[:, :, :3].astype(np.int16)
    # White backdrop -> transparent; keep lamp body + rainbow arc.
    white = (rgb[:, :, 0] > 235) & (rgb[:, :, 1] > 235) & (rgb[:, :, 2] > 235)
    arr[white, 3] = 0

    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 20)
    if len(xs) == 0:
        raise RuntimeError("Lamp cutout failed — no opaque pixels")

    pad = 4
    x0, x1 = max(0, xs.min() - pad), min(arr.shape[1], xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(arr.shape[0], ys.max() + pad)
    cropped = Image.fromarray(arr[y0:y1, x0:x1])

    scale = target_h / cropped.height
    new_w = max(1, int(cropped.width * scale))
    return cropped.resize((new_w, target_h), Image.LANCZOS)


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


def paste_lamp(
    frame: Image.Image,
    lamp: Image.Image,
    hx: int,
    hy: int,
    angle: float,
    *,
    offset_y: int = 24,
    mirror: bool = False,
) -> Image.Image:
    stick = lamp.transpose(Image.FLIP_LEFT_RIGHT) if mirror else lamp
    px = hx - stick.width // 2
    py = hy - stick.height + offset_y
    rotated = stick.rotate(angle, expand=True, resample=Image.BICUBIC)
    px -= (rotated.width - stick.width) // 2
    py -= (rotated.height - stick.height) // 2
    frame.paste(rotated, (px, py), rotated)
    return frame


def save_transparent_gif(
    frames: list[Image.Image],
    path: Path,
    durations: list[int],
) -> None:
    """Write animated GIF while keeping transparent background pixels."""
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

    lamp = extract_lamp(lamp_src)
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
        frame = gif.convert("RGBA").copy()
        left_pos, right_pos = hand_positions(np.array(frame))

        if left_pos:
            paste_lamp(frame, lamp, *left_pos, angle=-18, offset_y=26, mirror=False)
        if right_pos:
            paste_lamp(frame, lamp, *right_pos, angle=18, offset_y=26, mirror=True)

        frames_out.append(frame)
        frame_idx += 1

    save_transparent_gif(frames_out, OUT_PATH, durations)
    print(
        f"Saved {OUT_PATH} ({len(frames_out)} frames, lamp {lamp.size}, "
        f"source lamp={lamp_src.name})"
    )


if __name__ == "__main__":
    main()
