"""
从位图文字轮廓挤出 3D 并导出 GLB。

依赖: pip install pillow numpy scipy scikit-image shapely trimesh mapbox_earcut

用法:
  python scripts/image_outline_to_glb.py <input-image> <output.glb> [extrude_height] [upscale]

默认按 unseen-dc1.glb 实测参数：XY 字母面、Z 厚度 12、斜角内收 3.44 / 深度 4.39。
字宽对齐 168.27，字高按 ITZY 原图比例。
"""
from __future__ import annotations

import math
import sys
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.interpolate import splprep, splev
from shapely.geometry import GeometryCollection, MultiPolygon, Polygon
from shapely.ops import unary_union
from shapely.validation import make_valid
from skimage import measure
import mapbox_earcut as earcut
import trimesh


# 从 unseen-dc1.glb 实测（Blender 斜角立体字）
REF_WIDTH = 168.26617432
REF_THICK = 11.996270179748535
REF_BEVEL_IN = 3.44071579
REF_BEVEL_Z = 4.392714023590088
ITZY_ASPECT = 120.0 / 200.0  # 原图字高/字宽

JOIN_ROUND = 1
CAP_ROUND = 1



def build_soft_mask(rgb: np.ndarray) -> np.ndarray:
    """白字概率图（0~1）。薄荷底 R 偏低，白字三通道都高。"""
    r = rgb[:, :, 0].astype(np.float64)
    g = rgb[:, :, 1].astype(np.float64)
    b = rgb[:, :, 2].astype(np.float64)
    lum = (r + g + b) / 3.0
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)

    # 白墨：高亮 + 低彩度 + 高 R（与薄荷绿分离）
    lum_score = np.clip((lum - 218.0) / 32.0, 0.0, 1.0)
    r_score = np.clip((r - 205.0) / 40.0, 0.0, 1.0)
    chroma_score = np.clip(1.0 - chroma / 28.0, 0.0, 1.0)
    soft = lum_score * r_score * chroma_score
    return soft


def chaikin_closed(pts: np.ndarray, iterations: int) -> np.ndarray:
    out = np.asarray(pts, dtype=np.float64)
    if len(out) < 4 or iterations <= 0:
        return out
    for _ in range(iterations):
        n = len(out)
        q = 0.75 * out + 0.25 * np.roll(out, -1, axis=0)
        r = 0.25 * out + 0.75 * np.roll(out, -1, axis=0)
        out = np.empty((n * 2, 2), dtype=np.float64)
        out[0::2] = q
        out[1::2] = r
    return out


def spline_resample_closed(pts: np.ndarray, num: int, smooth: float) -> np.ndarray:
    if len(pts) < 8:
        return pts
    x = pts[:, 0]
    y = pts[:, 1]
    # 去掉闭合重复点，避免 splprep per=True 报错
    if np.allclose(pts[0], pts[-1]):
        x = x[:-1]
        y = y[:-1]
    if len(x) < 8:
        return pts
    try:
        tck, _ = splprep([x, y], s=smooth, per=True, k=3)
        u = np.linspace(0.0, 1.0, num, endpoint=False)
        sx, sy = splev(u, tck)
        return np.column_stack([sx, sy])
    except Exception:
        return pts


def iter_polygons(geom) -> Iterable[Polygon]:
    if geom is None or geom.is_empty:
        return
    geom = make_valid(geom) if not geom.is_valid else geom
    if isinstance(geom, Polygon):
        if not geom.is_empty and geom.area > 0:
            yield geom
        return
    if isinstance(geom, (MultiPolygon, GeometryCollection)):
        for part in geom.geoms:
            yield from iter_polygons(part)


def round_polygon(poly: Polygon, radius: float) -> List[Polygon]:
    if radius <= 0:
        return [poly]
    # 先轻微膨胀再收缩，用圆角连接抹掉台阶
    grown = poly.buffer(radius, join_style=JOIN_ROUND, cap_style=CAP_ROUND, resolution=24)
    shrunk = grown.buffer(-radius, join_style=JOIN_ROUND, cap_style=CAP_ROUND, resolution=24)
    return list(iter_polygons(shrunk))


def contour_to_polygons(
    contour: np.ndarray,
    height: int,
    *,
    spline_points: int,
    spline_smooth: float,
    chaikin_iters: int,
    corner_radius: float,
    min_area: float,
) -> List[Polygon]:
    pts = np.column_stack([contour[:, 1], height - contour[:, 0]])
    if len(pts) < 16:
        return []

    # 均匀抽稀，避免噪声点把样条拉出折线
    step = max(1, len(pts) // 360)
    pts = pts[::step]
    pts = spline_resample_closed(pts, spline_points, spline_smooth)
    pts = chaikin_closed(pts, chaikin_iters)

    poly = Polygon(pts)
    if not poly.is_valid:
        poly = make_valid(poly)
    out: List[Polygon] = []
    for part in iter_polygons(poly):
        if part.area < min_area:
            continue
        for rounded in round_polygon(part, corner_radius):
            if rounded.area >= min_area:
                out.append(rounded)
    return out


def fillet_offsets(fillet: float, steps: int) -> List[Tuple[float, float]]:
    """底部/顶部 1/4 圆弧：返回 (inset, z_from_end)。"""
    pairs: List[Tuple[float, float]] = []
    for i in range(steps + 1):
        t = i / float(steps)
        angle = t * (math.pi / 2.0)
        inset = fillet * (1.0 - math.sin(angle))
        z = fillet * (1.0 - math.cos(angle))
        pairs.append((inset, z))
    return pairs


def ring_faces(bottom_i: np.ndarray, top_i: np.ndarray) -> List[List[int]]:
    faces: List[List[int]] = []
    n = len(bottom_i)
    for i in range(n):
        j = (i + 1) % n
        faces.append([int(bottom_i[i]), int(bottom_i[j]), int(top_i[j])])
        faces.append([int(bottom_i[i]), int(top_i[j]), int(top_i[i])])
    return faces


def sample_ring(poly: Polygon, n: int) -> np.ndarray:
    peri = float(poly.exterior.length)
    if peri <= 0:
        raise RuntimeError("empty perimeter")
    dists = np.linspace(0.0, peri, n, endpoint=False)
    pts = np.array([poly.exterior.interpolate(d).coords[0] for d in dists], dtype=np.float64)
    return pts


def inward_normals(pts: np.ndarray) -> np.ndarray:
    prev_p = np.roll(pts, 1, axis=0)
    next_p = np.roll(pts, -1, axis=0)
    tangent = next_p - prev_p
    normal = np.column_stack([-tangent[:, 1], tangent[:, 0]])
    length = np.linalg.norm(normal, axis=1, keepdims=True)
    normal = normal / np.clip(length, 1e-9, None)
    centroid = pts.mean(axis=0)
    inward = centroid - pts
    if float(np.mean(np.sum(normal * inward, axis=1))) < 0:
        normal = -normal
    return normal


def offset_ring(pts: np.ndarray, normals: np.ndarray, inset: float) -> np.ndarray:
    return pts + normals * inset


def stroke_width(poly: Polygon) -> float:
    peri = float(poly.length) or 1.0
    return 2.0 * float(poly.area) / peri


def inflate_polygons(polygons: List[Polygon], ratio: float = 0.30) -> List[Polygon]:
    """外扩笔画，让字更粗，同时尽量保住字形。"""
    if not polygons:
        return polygons
    widths = [stroke_width(p) for p in polygons]
    delta = max(1.2, float(np.median(widths)) * ratio)
    grown: List[Polygon] = []
    for poly in polygons:
        fat = poly.buffer(delta, join_style=JOIN_ROUND, cap_style=CAP_ROUND, resolution=24)
        grown.extend(iter_polygons(fat))
    if not grown:
        return polygons
    merged = unary_union(grown)
    out: List[Polygon] = []
    for part in iter_polygons(merged):
        out.extend(round_polygon(part, max(0.8, delta * 0.22)))
    return out or polygons


def smooth_closed_ring(pts: np.ndarray, n: int) -> np.ndarray:
    """再做一轮周期样条，去掉挤出前残留的折角。"""
    smoothed = spline_resample_closed(pts, max(n, 32), smooth=max(8.0, n * 1.15))
    smoothed = chaikin_closed(smoothed, 2)
    if len(smoothed) != n:
        smoothed = spline_resample_closed(smoothed, n, smooth=max(2.0, n * 0.08))
    return smoothed


def polygons_to_world(polygons: List[Polygon], width: float, height: float) -> List[Polygon]:
    """把像素轮廓放到字宽×字高的平面上，圆角才能按米计算。"""
    minx = min(p.bounds[0] for p in polygons)
    miny = min(p.bounds[1] for p in polygons)
    maxx = max(p.bounds[2] for p in polygons)
    maxy = max(p.bounds[3] for p in polygons)
    cx = 0.5 * (minx + maxx)
    cy = 0.5 * (miny + maxy)
    sx = width / max(maxx - minx, 1e-6)
    sy = height / max(maxy - miny, 1e-6)
    out: List[Polygon] = []
    for poly in polygons:
        coords = [((x - cx) * sx, (y - cy) * sy) for x, y in poly.exterior.coords]
        holes = [[((x - cx) * sx, (y - cy) * sy) for x, y in ring.coords] for ring in poly.interiors]
        world = Polygon(coords, holes)
        if not world.is_valid:
            world = make_valid(world)
        out.extend(iter_polygons(world))
    return out


def bevel_params(poly: Polygon, thickness: float) -> Tuple[float, float]:
    """unseen-dc1 实测：斜角内收 3.44、深度 4.39；细笔画再夹紧以免掏空。"""
    sw = max(stroke_width(poly), 1e-3)
    scale = thickness / REF_THICK
    bevel_in = REF_BEVEL_IN * scale
    bevel_z = REF_BEVEL_Z * scale
    bevel_in = min(bevel_in, sw * 0.22)
    for _ in range(8):
        if next(iter_polygons(poly.buffer(-bevel_in * 1.08)), None) is not None:
            return max(bevel_in, 0.2), max(bevel_z, 0.25)
        bevel_in *= 0.82
    return max(bevel_in, 0.18), max(bevel_z, 0.25)


def signed_area(pts: np.ndarray) -> float:
    nxt = np.roll(pts, -1, axis=0)
    return float(np.sum(pts[:, 0] * nxt[:, 1] - nxt[:, 0] * pts[:, 1]))


def align_ring(pts: np.ndarray, ref: np.ndarray) -> np.ndarray:
    idx = int(np.argmin(np.sum((pts - ref[0]) ** 2, axis=1)))
    pts = np.roll(pts, -idx, axis=0)
    if signed_area(pts) * signed_area(ref) < 0:
        pts = pts[::-1]
        pts = np.roll(pts, 1, axis=0)
    return pts


def inset_ring(poly: Polygon, inset: float, n: int, ref: np.ndarray) -> np.ndarray:
    if inset <= 1e-6:
        return ref
    inner = poly.buffer(-inset, join_style=JOIN_ROUND, cap_style=CAP_ROUND, resolution=24)
    part = max(iter_polygons(inner), key=lambda p: p.area, default=None)
    if part is None:
        center = np.asarray(poly.centroid.coords[0], dtype=np.float64)
        return np.repeat(center[None, :], n, axis=0)
    pts = sample_ring(part, n)
    return align_ring(pts, ref)


def rounded_extrude(poly: Polygon, height: float, ring_n: int = 320) -> trimesh.Trimesh:
    """unseen-dc1：XY 字母面、Z 厚度、正面大平面、四分之一椭圆斜角、中间直壁。"""
    bevel_in, bevel_z = bevel_params(poly, height)
    base = smooth_closed_ring(sample_ring(poly, ring_n), ring_n)
    steps = 12
    half = height * 0.5
    rings: List[np.ndarray] = []
    zs: List[float] = []

    def add_ring(inset: float, z: float) -> None:
        rings.append(inset_ring(poly, inset, ring_n, base) if inset > 1e-6 else base)
        zs.append(z)

    add_ring(bevel_in, -half)
    for i in range(1, steps + 1):
        angle = (i / float(steps)) * (math.pi / 2.0)
        add_ring(bevel_in * math.cos(angle), -half + bevel_z * math.sin(angle))
    side_hi = half - bevel_z
    if side_hi > (-half + bevel_z) + 0.05:
        add_ring(0.0, side_hi)
    for i in range(steps - 1, -1, -1):
        angle = (i / float(steps)) * (math.pi / 2.0)
        add_ring(bevel_in * math.cos(angle), half - bevel_z * math.sin(angle))

    vertices: List[np.ndarray] = []
    ring_idx: List[np.ndarray] = []
    for ring, z in zip(rings, zs):
        start = sum(map(len, vertices))
        xyz = np.column_stack([ring[:, 0], ring[:, 1], np.full(len(ring), z)])
        vertices.append(xyz)
        ring_idx.append(np.arange(start, start + len(ring)))

    faces: List[List[int]] = []
    for a, b in zip(ring_idx[:-1], ring_idx[1:]):
        faces.extend(ring_faces(a, b))

    # 用首/末圈同一组顶点封顶底，避免盖子和侧面裂开
    cap_xy = rings[0]
    cap_idx = earcut.triangulate_float64(np.ascontiguousarray(cap_xy, dtype=np.float64), [len(cap_xy)])
    cap_faces = np.asarray(cap_idx, dtype=np.int64).reshape((-1, 3))
    if len(cap_faces) == 0:
        raise RuntimeError("earcut produced no cap faces")
    bot = ring_idx[0]
    top = ring_idx[-1]
    faces.extend(bot[cap_faces][:, ::-1].tolist())
    faces.extend(top[cap_faces].tolist())

    mesh = trimesh.Trimesh(
        vertices=np.vstack(vertices),
        faces=np.asarray(faces, dtype=np.int64),
        process=True,
    )
    mesh.remove_unreferenced_vertices()
    mesh.update_faces(mesh.nondegenerate_faces())
    mesh.merge_vertices()
    mesh.fix_normals()
    return mesh


def save_preview(bg: np.ndarray, polygons: List[Polygon], path: Path) -> None:
    if bg.ndim == 2:
        vis = np.stack([bg, bg, bg], axis=2)
        vis = (np.clip(vis, 0, 1) * 255).astype(np.uint8)
    else:
        vis = bg
    img = Image.fromarray(vis, mode="RGB")
    draw = ImageDraw.Draw(img)
    h = vis.shape[0]
    for poly in polygons:
        coords = [(float(x), float(h - y)) for x, y in poly.exterior.coords]
        if len(coords) >= 3:
            draw.line(coords + [coords[0]], fill=(20, 190, 90), width=3)
    img.save(path)


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python image_outline_to_glb.py <input-image> <output.glb> [height] [upscale]")
        sys.exit(1)

    input_path = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()
    thickness = float(sys.argv[3]) if len(sys.argv) > 3 else REF_THICK
    upscale = int(sys.argv[4]) if len(sys.argv) > 4 else 4

    img = Image.open(input_path).convert("RGB")
    rgb0 = np.array(img)
    soft = build_soft_mask(rgb0)

    rgb_hi = rgb0
    if upscale > 1:
        h0, w0 = soft.shape
        resample = getattr(Image, "Resampling", Image).BICUBIC
        soft_img = Image.fromarray((np.clip(soft, 0, 1) * 255).astype(np.uint8), mode="L")
        soft_img = soft_img.resize((w0 * upscale, h0 * upscale), resample)
        soft = np.asarray(soft_img, dtype=np.float64) / 255.0
        rgb_hi = np.asarray(
            Image.fromarray(rgb0).resize((w0 * upscale, h0 * upscale), resample),
            dtype=np.uint8,
        )

    # 距离场加粗：均匀外扩，ZY 连接处是光滑圆角，不是多边形折痕
    binary = soft > 0.38
    inside = ndimage.distance_transform_edt(binary)
    outside = ndimage.distance_transform_edt(~binary)
    sdf = inside - outside
    stroke_px = float(2.0 * inside[binary].mean()) if binary.any() else 12.0
    inflate_px = max(8.0, stroke_px * 0.28)
    sdf = sdf + inflate_px
    sigma = max(2.2, inflate_px * 0.22)
    sdf = ndimage.gaussian_filter(sdf, sigma=sigma, mode="nearest")

    h, w = sdf.shape
    chaikin_iters = 3
    spline_points = 240
    spline_smooth = max(14.0, (h + w) * 0.022)
    corner_radius = max(3.0, inflate_px * 0.18)
    min_area = 80.0 * (upscale ** 2)

    contours = measure.find_contours(sdf, 0.0)
    polygons: List[Polygon] = []
    for contour in contours:
        polygons.extend(
            contour_to_polygons(
                contour,
                h,
                spline_points=spline_points,
                spline_smooth=spline_smooth,
                chaikin_iters=chaikin_iters,
                corner_radius=corner_radius,
                min_area=min_area,
            )
        )

    if not polygons:
        raise SystemExit("No valid geometry from image contours.")

    preview_path = output_path.with_suffix(".preview.png")
    save_preview(rgb_hi, polygons, preview_path)

    world_w = REF_WIDTH
    world_h = REF_WIDTH * ITZY_ASPECT
    world_polys = polygons_to_world(polygons, world_w, world_h)
    meshes: List[trimesh.Trimesh] = []
    for poly in world_polys:
        try:
            piece = rounded_extrude(poly, height=thickness, ring_n=320)
            meshes.append(piece)
        except Exception as exc:
            print("rounded extrude failed, fallback prism:", exc)
            try:
                meshes.append(trimesh.creation.extrude_polygon(poly, height=thickness))
            except Exception as exc2:
                print("skip contour:", exc2)

    if not meshes:
        raise SystemExit("No valid geometry from image contours.")

    mesh = trimesh.util.concatenate(meshes)
    # 与 unseen-dc1 同轴向：X 字宽、Y 字高、Z 厚度（相机看 XY 正面）
    mesh.merge_vertices()
    mesh.vertices -= mesh.centroid
    target = np.array([world_w, world_h, thickness], dtype=np.float64)
    extents = np.clip(np.asarray(mesh.extents, dtype=np.float64), 1e-6, None)
    mesh.vertices *= target / extents
    mesh.fix_normals()
    _ = mesh.vertex_normals
    vv = np.asarray(mesh.vertices)
    span = np.clip(mesh.extents, 1e-6, None)
    uv = np.column_stack([
        (vv[:, 0] - vv[:, 0].min()) / span[0],
        (vv[:, 1] - vv[:, 1].min()) / span[1],
    ])
    mesh.visual = trimesh.visual.TextureVisuals(
        uv=uv,
        material=trimesh.visual.material.PBRMaterial(
            name="itzy-text-mat",
            baseColorFactor=np.array([1.0, 1.0, 1.0, 1.0], dtype=np.float64),
            metallicFactor=1.0,
            roughnessFactor=0.15,
        ),
    )
    mesh.metadata["name"] = "itzy-text-mesh-1"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(str(output_path))
    print(
        f"Wrote {output_path} ({len(mesh.vertices)} verts, {len(mesh.faces)} faces, "
        f"extents={np.round(mesh.extents, 3)}); preview {preview_path}"
    )


if __name__ == "__main__":
    main()
