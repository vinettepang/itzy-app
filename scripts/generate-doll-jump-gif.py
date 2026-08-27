"""
Replace scream-figure jump GIF center character with TWINZY dolls cycling each jump.
Each doll: arms raised, no tail, both hands hold cat-ear light ring (fig3 style).
"""
from __future__ import annotations

import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "apps" / "h5" / "src" / "assets"
WORK = ROOT / "apps" / "h5" / "src" / "assets" / "doll-jump-work"
OUT_GIF = ASSETS / "twinzy-doll-jump-lightstick.gif"

CURSOR_ASSETS = Path(
    r"C:\Users\Administrator\.cursor\projects"
    r"\C-Users-ADMINI-1-AppData-Local-Temp-a0869930-0c4f-4d1d-8e2b-6a418e802ae6\assets"
)

GIF_CANDIDATES = [
    CURSOR_ASSETS / "c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_f677026054a3091eaca1353ed262501c_images_scream-figure-jump-transparent-c506f3a8-42f5-4e21-967b-7fd1fa329614.gif",
    CURSOR_ASSETS / "c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_f677026054a3091eaca1353ed262501c_images_scream-figure-jump-transparent-ae9fee41-6cf0-4619-b2b1-115d76f8be04.gif",
    ASSETS / "scream-figure-jump-transparent.gif",
]

DOLL_SHEET_CANDIDATES = list(CURSOR_ASSETS.glob("*doll-f38a7d01*")) + [
    ASSETS / "twinzy-dolls.png",
    ASSETS / "twinzy-dolls-flat.png",
]

CHARACTERS = [
    {
        "name": "KKengEE",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825737_01_1d85fc09-5b44-4dfb-88e1-30237c3f79f9.jpg?v=1754586069",
    },
    {
        "name": "Li-Li",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825744_01_d2e9871c-ef6c-40da-a35c-aefa2bbfd461.jpg?v=1754586072",
    },
    {
        "name": "RyuJJi",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825751_01_a70af6f4-f0c4-4bf7-abfe-5551a77a3980.jpg?v=1754586074",
    },
    {
        "name": "RyeoWoo",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825768_01_1_92a03b6d-493f-48e9-a8e3-c46612e837eb.jpg?v=1754586077",
    },
    {
        "name": "NAong",
        "url": "https://cdn.shopify.com/s/files/1/0537/6835/6036/files/4570192825775_01.jpg?v=1716522235",
    },
]

GLOW_BANDS = [
    (255, 128, 48),
    (255, 210, 56),
    (88, 220, 96),
    (56, 198, 255),
    (64, 120, 255),
    (200, 64, 248),
]

CANVAS_W, CANVAS_H = 520, 591
JUMP_FRAMES = 12
JUMP_HEIGHT = 42
FRAME_MS = 70
CHARACTER_CY = 360


def download(url: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 1000:
        return
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as res:
        dest.write_bytes(res.read())


def find_first_existing(paths):
    for p in paths:
        if p.exists():
            return p
    return None


def remove_background(im: Image.Image, threshold: int = 235) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    rgb = arr[:, :, :3]
    mask = (rgb.min(axis=2) < threshold).astype(np.uint8) * 255
    m = Image.fromarray(mask, "L").filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    arr[:, :, 3] = np.array(m)
    return Image.fromarray(arr)


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 20)
    if not len(xs):
        return im
    x0, x1 = max(0, xs.min() - pad), min(im.width - 1, xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(im.height - 1, ys.max() + pad)
    return im.crop((x0, y0, x1 + 1, y1 + 1))


def flat_cartoon(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    alpha = rgba.split()[3]
    flat = rgba.convert("RGB").quantize(colors=64, method=Image.MEDIANCUT).convert("RGB")
    out = flat.copy()
    out.putalpha(alpha)
    return out


def remove_tail(im: Image.Image) -> Image.Image:
    arr = np.array(im)
    a = arr[:, :, 3]
    ys, xs = np.where(a > 20)
    if not len(xs):
        return im
    y0, y1 = ys.min(), ys.max()
    x0, x1 = xs.min(), xs.max()
    h = y1 - y0
    # Tail sits low behind body — clear lower rear band
    tail_y = y0 + int(h * 0.82)
    cx = (x0 + x1) // 2
    arr[tail_y:y1 + 1, max(0, cx - int(h * 0.22)):min(im.width, cx + int(h * 0.22)), 3] = 0
    return Image.fromarray(arr)


def draw_small_light_ring(size: int = 44) -> Image.Image:
    w, h = size, int(size * 1.15)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = w // 2, int(h * 0.52)
    outer = int(size * 0.42)
    inner = int(size * 0.22)
    stroke = max(2, size // 14)
    d.ellipse((cx - outer, cy - outer, cx + outer, cy + outer), outline=(0, 0, 0, 255), width=stroke)
    d.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), outline=(0, 0, 0, 255), width=stroke)
    mb = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mb).ellipse((cx - outer, cy - outer, cx + outer, cy + outer), fill=255)
    ImageDraw.Draw(mb).rectangle((0, 0, w, cy), fill=0)
    inner_m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(inner_m).ellipse((cx - inner, cy - inner, cx + inner, cy + inner), fill=255)
    m = np.array(mb)
    m[np.array(inner_m) > 0] = 0
    white = Image.new("RGBA", (w, h), (248, 248, 248, 255))
    img = Image.composite(white, img, Image.fromarray(m))
    d = ImageDraw.Draw(img)
    box = (cx - outer + 3, cy - outer + 3, cx + outer - 3, cy + outer - 3)
    n = len(GLOW_BANDS)
    for i, c in enumerate(GLOW_BANDS):
        s = 180 + i * (180 / n)
        e = 180 + (i + 1) * (180 / n)
        d.pieslice(box, s, e, fill=(*c, 255))
    # ears on top rim
    ear_h = max(4, size // 5)
    top_y = cy - outer
    d.polygon(
        [(cx - outer // 2, top_y), (cx - outer // 4, top_y - ear_h), (cx - outer // 6, top_y)],
        fill=(248, 248, 248, 255),
        outline=(0, 0, 0, 255),
    )
    d.polygon(
        [(cx + outer // 6, top_y), (cx + outer // 4, top_y - ear_h), (cx + outer // 2, top_y)],
        fill=(248, 248, 248, 255),
        outline=(0, 0, 0, 255),
    )
    hole = Image.new("L", (w, h), 0)
    ImageDraw.Draw(hole).ellipse((cx - inner + stroke, cy - inner + stroke, cx + inner - stroke, cy + inner - stroke), fill=255)
    arr = np.array(img)
    arr[np.array(hole) > 0, 3] = 0
    return Image.fromarray(arr)


def add_raised_arms_and_sticks(sprite: Image.Image, stick: Image.Image) -> Image.Image:
    h, w = sprite.size[1], sprite.size[0]
    out = sprite.copy()
    arm_color = sample_body_color(sprite)
    d = ImageDraw.Draw(out)
    stroke = max(4, w // 16)
    shoulder_y = int(h * 0.36)
    lx, rx = int(w * 0.26), int(w * 0.74)
    d.line([(lx, shoulder_y), (lx - int(w * 0.10), int(h * 0.06))], fill=arm_color, width=stroke)
    d.line([(rx, shoulder_y), (rx + int(w * 0.10), int(h * 0.06))], fill=arm_color, width=stroke)
    left_hand = (lx - int(w * 0.10), int(h * 0.06))
    right_hand = (rx + int(w * 0.10), int(h * 0.06))
    ls = stick.copy()
    rs = stick.copy()
    out.paste(ls, (left_hand[0] - ls.width // 2, left_hand[1] - ls.height), ls)
    out.paste(rs, (right_hand[0] - rs.width // 2, right_hand[1] - rs.height), rs)
    return out


def extract_dolls_from_sheet(sheet_path: Path) -> list[Image.Image]:
    """Fig2 layout: 2 dolls top row, 3 bottom row on black background."""
    img = Image.open(sheet_path).convert("RGBA")
    w, h = img.size
    boxes = [
        (int(w * 0.02), int(h * 0.02), int(w * 0.48), int(h * 0.48)),
        (int(w * 0.52), int(h * 0.02), int(w * 0.98), int(h * 0.48)),
        (int(w * 0.02), int(h * 0.50), int(w * 0.34), int(h * 0.98)),
        (int(w * 0.34), int(h * 0.50), int(w * 0.66), int(h * 0.98)),
        (int(w * 0.66), int(h * 0.50), int(w * 0.98), int(h * 0.98)),
    ]
    dolls: list[Image.Image] = []
    for box in boxes:
        cell = img.crop(box)
        arr = np.array(cell)
        dark = (arr[:, :, 0] < 30) & (arr[:, :, 1] < 30) & (arr[:, :, 2] < 30)
        arr[dark, 3] = 0
        dolls.append(trim_alpha(Image.fromarray(arr)))
    return dolls


def prepare_flat_doll(doll: Image.Image, stick: Image.Image, target_h: int = 240) -> Image.Image:
    im = remove_tail(trim_alpha(doll))
    scale = target_h / im.height
    im = im.resize((max(1, int(im.width * scale)), target_h), Image.LANCZOS)
    return add_raised_arms_and_sticks(im, stick)


def build_doll_sprite(photo: Image.Image, stick: Image.Image, target_h: int = 240) -> Image.Image:
    im = trim_alpha(remove_background(photo))
    im = flat_cartoon(im)
    im = remove_tail(im)
    scale = target_h / im.height
    im = im.resize((max(1, int(im.width * scale)), target_h), Image.LANCZOS)
    return add_raised_arms_and_sticks(im, stick)


def jump_offset(frame_in_cycle: int) -> int:
    t = frame_in_cycle / JUMP_FRAMES
    return int(-JUMP_HEIGHT * 0.5 * (1 - math.cos(2 * math.pi * t)))


def red_character_mask(arr: np.ndarray) -> np.ndarray:
    return (
        (arr[:, :, 0] > 200)
        & (arr[:, :, 1] < 80)
        & (arr[:, :, 2] < 80)
        & (arr[:, :, 3] > 80)
    )


def sample_body_color(sprite: Image.Image) -> tuple[int, int, int, int]:
    arr = np.array(sprite)
    h, w = arr.shape[:2]
    region = arr[int(h * 0.25):int(h * 0.55), int(w * 0.25):int(w * 0.75)]
    mask = region[:, :, 3] > 40
    if not mask.any():
        return (180, 180, 180, 255)
    rgb = region[mask][:, :3]
    return tuple(int(v) for v in np.median(rgb, axis=0)) + (255,)


def dilate_mask(mask: np.ndarray, iterations: int = 6) -> np.ndarray:
    m = Image.fromarray(mask.astype(np.uint8) * 255, "L")
    for _ in range(iterations):
        m = m.filter(ImageFilter.MaxFilter(5))
    return np.array(m) > 0


def largest_center_blob(mask: np.ndarray, cx: int, cy: int) -> np.ndarray:
    """Keep only substantial red pixels near canvas center (character, not thin zigzags)."""
    h, w = mask.shape
    labeled = np.zeros_like(mask, dtype=np.int32)
    current = 0
    sizes: dict[int, int] = {}
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or labeled[y, x]:
                continue
            current += 1
            stack = [(y, x)]
            count = 0
            while stack:
                py, px = stack.pop()
                if py < 0 or py >= h or px < 0 or px >= w:
                    continue
                if not mask[py, px] or labeled[py, px]:
                    continue
                labeled[py, px] = current
                count += 1
                stack.extend([(py + 1, px), (py - 1, px), (py, px + 1), (py, px - 1)])
            sizes[current] = count
    if not sizes:
        return mask
    best, best_score = 0, -1
    for lid, cnt in sizes.items():
        if cnt < 400:
            continue
        ys, xs = np.where(labeled == lid)
        dist = abs(xs.mean() - cx) + abs(ys.mean() - cy)
        score = cnt - dist * 2
        if score > best_score:
            best_score, best = score, lid
    if best == 0:
        best = max(sizes, key=sizes.get)
    return labeled == best


def character_removal_mask(arr: np.ndarray, cx: int, cy: int) -> np.ndarray:
    red = red_character_mask(arr)
    core = largest_center_blob(red, cx, cy)
    dilated = dilate_mask(core, 7)
    dark = (arr[:, :, 0] < 70) & (arr[:, :, 1] < 70) & (arr[:, :, 2] < 70) & dilated
    teeth = (arr[:, :, 0] > 210) & (arr[:, :, 1] > 210) & (arr[:, :, 2] > 210) & dilated
    return core | dark | teeth


def process_gif_frame(orig: Image.Image, sprite: Image.Image) -> Image.Image:
    arr = np.array(orig.convert("RGBA"))
    cx, cy = CANVAS_W // 2, CHARACTER_CY
    char = character_removal_mask(arr, cx, cy)
    ys, xs = np.where(char)
    if len(xs):
        hx, hy = int(xs.mean()), int(ys.mean())
    else:
        hx, hy = cx, cy
    x = hx - sprite.width // 2
    y = hy - int(sprite.height * 0.52)
    # Clear entire sprite footprint (covers mouth/teeth + body under doll)
    x0, y0 = max(0, x - 8), max(0, y - 8)
    x1, y1 = min(arr.shape[1], x + sprite.width + 8), min(arr.shape[0], y + sprite.height + 8)
    arr[y0:y1, x0:x1, 3] = 0
    frame = Image.fromarray(arr)
    frame.paste(sprite, (x, y), sprite)
    return frame


def load_gif_cycle_templates(gif_path: Path, cycle_len: int) -> list[Image.Image]:
    gif = Image.open(gif_path)
    templates: list[Image.Image] = []
    for f in range(cycle_len):
        gif.seek(f)
        templates.append(gif.convert("RGBA"))
    return templates


def draw_zigzag_layer(cx: int, cy: int) -> Image.Image:
    layer = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    red = (235, 45, 45, 255)
    w = 4
    specs = [
        (-120, -80, -200, -140),
        (-90, -120, -160, -200),
        (90, -120, 160, -200),
        (120, -80, 200, -140),
        (-120, 60, -200, 120),
        (-90, 100, -160, 180),
        (90, 100, 160, 180),
        (120, 60, 200, 120),
    ]
    for x1, y1, x2, y2 in specs:
        pts = [
            (cx + x1, cy + y1),
            (cx + (x1 + x2) // 2 + 8, cy + (y1 + y2) // 2 - 6),
            (cx + x2, cy + y2),
        ]
        d.line(pts, fill=red, width=w, joint="curve")
    return layer


def synthesize_bg_frames(n_cycles: int) -> list[Image.Image]:
    frames: list[Image.Image] = []
    for _ in range(n_cycles):
        for f in range(JUMP_FRAMES):
            cy = CHARACTER_CY + jump_offset(f)
            base = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
            zig = draw_zigzag_layer(CANVAS_W // 2, cy)
            base = Image.alpha_composite(base, zig)
            frames.append(base)
    return frames


def paste_sprite(frame: Image.Image, sprite: Image.Image, y_offset: int) -> Image.Image:
    cx = CANVAS_W // 2
    cy = CHARACTER_CY + y_offset
    x = cx - sprite.width // 2
    y = cy - sprite.height // 2
    out = frame.copy()
    out.paste(sprite, (x, y), sprite)
    return out


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)

    gif_path = find_first_existing(GIF_CANDIDATES)
    stick = draw_small_light_ring(40)
    sheet_path = find_first_existing(DOLL_SHEET_CANDIDATES)
    sprites: list[Image.Image] = []

    if sheet_path:
        print(f"Using doll sheet: {sheet_path}")
        flat_dolls = extract_dolls_from_sheet(sheet_path)
        for i, char in enumerate(CHARACTERS):
            sp = prepare_flat_doll(flat_dolls[i], stick)
            sp_path = WORK / f"{char['name']}-sprite.png"
            sp.save(sp_path)
            sprites.append(sp)
            print(f"  {char['name']} sprite {sp.size}")
    else:
        for char in CHARACTERS:
            raw_path = WORK / f"{char['name']}.jpg"
            print(f"Download {char['name']}...")
            download(char["url"], raw_path)
            sp = build_doll_sprite(Image.open(raw_path), stick)
            sp_path = WORK / f"{char['name']}-sprite.png"
            sp.save(sp_path)
            sprites.append(sp)
            print(f"  sprite {sp.size}")

    n_dolls = len(sprites)
    if gif_path:
        print(f"Using source GIF: {gif_path}")
        templates = load_gif_cycle_templates(gif_path, JUMP_FRAMES)
        out_frames = [process_gif_frame(templates[f], sprites[d]) for d in range(n_dolls) for f in range(JUMP_FRAMES)]
        durations = [FRAME_MS] * len(out_frames)
    else:
        print("Source GIF not found — synthesizing jump motion + zigzags")
        bg_frames = synthesize_bg_frames(n_dolls)
        out_frames = []
        for doll_i in range(n_dolls):
            for f in range(JUMP_FRAMES):
                off = jump_offset(f)
                bg = bg_frames[doll_i * JUMP_FRAMES + f]
                out_frames.append(paste_sprite(bg, sprites[doll_i], off))
        durations = [FRAME_MS] * len(out_frames)

    out_frames[0].save(
        OUT_GIF,
        save_all=True,
        append_images=out_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=False,
    )
    print(f"Saved {OUT_GIF} ({len(out_frames)} frames)")


if __name__ == "__main__":
    main()
