"""
Generate 3D ITZY GLB: readable front glyph + plump rounded rims.
1. Image SDF outline, mild uniform inflate (does not merge letters).
2. Front cap stays close to the hand-drawn shape.
3. Convex quarter-ellipse fillet + thicker extrusion for a puffy look.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path
from typing import List, Optional, Tuple

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.interpolate import splprep, splev
from shapely.geometry import GeometryCollection, MultiPolygon, Point, Polygon
from shapely.validation import make_valid
import mapbox_earcut as earcut
import trimesh

# Measured from unseen-dc1.glb front profile:
#   extents Z=11.996, cap |Nz|>0.95 ≈ 31%, bevel ≈ 55%, side ≈ 14%
#   front inset ≈ 3.44, bevel depth ≈ 4.14, side band ≈ 1.86
REF_WIDTH = 168.266
REF_THICKNESS = 11.996
FRONT_INSET = 3.4407
FILLET_Z = 4.1400
FILLET_STEPS = 40


def build_soft_mask(rgb: np.ndarray) -> np.ndarray:
    """Extract soft mask of white text from image."""
    r = rgb[:, :, 0].astype(np.float64)
    g = rgb[:, :, 1].astype(np.float64)
    b = rgb[:, :, 2].astype(np.float64)
    lum = (r + g + b) / 3.0
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)

    lum_score = np.clip((lum - 215.0) / 35.0, 0.0, 1.0)
    r_score = np.clip((r - 200.0) / 45.0, 0.0, 1.0)
    chroma_score = np.clip(1.0 - chroma / 30.0, 0.0, 1.0)
    soft = lum_score * r_score * chroma_score
    return soft


def extract_smooth_contours(
    soft_mask: np.ndarray,
    upscale: int = 4,
    spline_samples: int = 360,
    smooth_factor: float = 12.0,
    inflate_ratio: float = 0.16,
) -> List[np.ndarray]:
    """Upscale mask, mildly inflate via SDF, then resample with a cubic B-spline."""
    h0, w0 = soft_mask.shape
    if upscale > 1:
        resample = getattr(Image, "Resampling", Image).BICUBIC
        soft_img = Image.fromarray((np.clip(soft_mask, 0, 1) * 255).astype(np.uint8), mode="L")
        soft_img = soft_img.resize((w0 * upscale, h0 * upscale), resample)
        soft = np.asarray(soft_img, dtype=np.float64) / 255.0
    else:
        soft = soft_mask

    binary = soft > 0.40
    inside = ndimage.distance_transform_edt(binary)
    outside = ndimage.distance_transform_edt(~binary)
    sdf = inside - outside
    stroke_px = float(2.0 * inside[binary].mean()) if binary.any() else 12.0
    # Uniform outward grow — small enough to keep Z/Y gaps and terminals.
    inflate_px = max(3.5, min(stroke_px * inflate_ratio, stroke_px * 0.22))
    sdf = sdf + inflate_px
    sigma = max(1.2, inflate_px * 0.16)
    sdf = ndimage.gaussian_filter(sdf, sigma=sigma, mode="nearest")
    print(f"SDF inflate {inflate_px:.1f}px (stroke≈{stroke_px:.1f})")

    h, w = sdf.shape
    from skimage import measure

    contours = measure.find_contours(sdf, 0.0)

    smooth_rings: List[np.ndarray] = []
    for contour in contours:
        # skimage: (row, col) -> (x, y), Y pointing UP
        pts = np.column_stack([contour[:, 1], h - contour[:, 0]])
        if len(pts) < 20:
            continue

        # Close loop if needed
        if not np.allclose(pts[0], pts[-1]):
            pts = np.vstack([pts, pts[0]])

        # Remove duplicate consecutive points
        dists = np.linalg.norm(np.diff(pts, axis=0), axis=1)
        valid = np.concatenate([[True], dists > 1e-4])
        pts = pts[valid]

        if len(pts) < 12:
            continue

        # Spline fit
        x = pts[:-1, 0]
        y = pts[:-1, 1]
        try:
            tck, _ = splprep([x, y], s=smooth_factor, per=True, k=3)
            u = np.linspace(0.0, 1.0, spline_samples, endpoint=False)
            sx, sy = splev(u, tck)
            ring = np.column_stack([sx, sy])

            # Ensure polygon area is non-trivial
            poly = Polygon(ring)
            if poly.is_valid and poly.area > 1200 * (upscale ** 2):
                smooth_rings.append(ring)
        except Exception as e:
            print(f"Spline fit warning: {e}")
            continue

    return smooth_rings


def normalize_contours_to_world(
    rings: List[np.ndarray], target_w: float = REF_WIDTH
) -> Tuple[List[np.ndarray], float, float]:
    """Center and scale 2D rings so total width matches target_w, maintaining aspect ratio."""
    all_pts = np.vstack(rings)
    min_x, min_y = all_pts.min(axis=0)
    max_x, max_y = all_pts.max(axis=0)
    cx = 0.5 * (min_x + max_x)
    cy = 0.5 * (min_y + max_y)

    curr_w = max_x - min_x
    scale = target_w / max(curr_w, 1e-6)
    target_h = (max_y - min_y) * scale

    world_rings = []
    for ring in rings:
        w_ring = (ring - np.array([cx, cy])) * scale
        world_rings.append(w_ring)

    return world_rings, target_w, target_h


def ring_quad_faces(bottom_idx: np.ndarray, top_idx: np.ndarray) -> List[List[int]]:
    """Build quad faces (as two triangles) between two parallel ring indices."""
    faces = []
    n = len(bottom_idx)
    for i in range(n):
        j = (i + 1) % n
        b_i, b_j = int(bottom_idx[i]), int(bottom_idx[j])
        t_i, t_j = int(top_idx[i]), int(top_idx[j])
        # Opposite winding to the front cap on edge (b_i, b_j) so the rim is manifold, not 180° folded.
        faces.append([b_i, t_i, t_j])
        faces.append([b_i, t_j, b_j])
    return faces


def largest_polygon(geom) -> Optional[Polygon]:
    if geom is None or geom.is_empty:
        return None
    if isinstance(geom, Polygon) and geom.exterior is not None:
        return geom
    polys: List[Polygon] = []
    if isinstance(geom, (MultiPolygon, GeometryCollection)):
        for g in geom.geoms:
            if isinstance(g, Polygon) and not g.is_empty:
                polys.append(g)
    return max(polys, key=lambda p: p.area) if polys else None


def compute_inward_normals(pts: np.ndarray) -> np.ndarray:
    prev_p = np.roll(pts, 1, axis=0)
    next_p = np.roll(pts, -1, axis=0)
    tangent = next_p - prev_p
    normal = np.column_stack([-tangent[:, 1], tangent[:, 0]])
    normal /= np.clip(np.linalg.norm(normal, axis=1, keepdims=True), 1e-9, None)
    inward = pts.mean(axis=0) - pts
    if float(np.mean(np.sum(normal * inward, axis=1))) < 0:
        normal = -normal
    smooth = normal + 0.65 * (np.roll(normal, 1, axis=0) + np.roll(normal, -1, axis=0))
    smooth /= np.clip(np.linalg.norm(smooth, axis=1, keepdims=True), 1e-9, None)
    return smooth


def local_balloon_insets(ring: np.ndarray, poly: Polygon, target: float) -> np.ndarray:
    """Per-vertex inward travel that stays inside the letter, for a plump but safe rim."""
    normals = compute_inward_normals(ring)
    insets = np.zeros(len(ring), dtype=np.float64)
    for i, (p, n) in enumerate(zip(ring, normals)):
        lo, hi = 0.0, float(target)
        for _ in range(14):
            mid = 0.5 * (lo + hi)
            q = Point(float(p[0] + n[0] * mid), float(p[1] + n[1] * mid))
            if poly.contains(q):
                lo = mid
            else:
                hi = mid
        insets[i] = min(target, max(lo * 0.97, 0.16))
    return insets, normals


def _ellipse_samples(steps: int) -> np.ndarray:
    """Quarter-ellipse samples with a guaranteed 3D chord so the cap join is never a sliver."""
    raw = np.linspace(0.0, 0.5 * math.pi, steps + 1)
    kept = [raw[0]]
    prev = raw[0]
    min_dtheta = 0.5 * math.pi / max(steps, 8)
    for theta in raw[1:]:
        # Skip tiny first steps that sit on the cap plane (those become 180° folds).
        if theta < min_dtheta * 0.75:
            continue
        if theta - prev >= min_dtheta * 0.85 or abs(theta - 0.5 * math.pi) < 1e-9:
            kept.append(theta)
            prev = theta
    if kept[-1] < 0.5 * math.pi - 1e-9:
        kept.append(0.5 * math.pi)
    return np.asarray(kept, dtype=np.float64)


def extrude_plump_rounded(
    ring_2d: np.ndarray,
    thickness: float = REF_THICKNESS,
    front_inset: float = FRONT_INSET,
    fillet_z: float = FILLET_Z,
    fillet_steps: int = FILLET_STEPS,
) -> trimesh.Trimesh:
    """
    Smooth C1 quarter-ellipse bevel (no linear chamfer / crease).

    Center of the fillet sits at the sharp box corner (full outline, side z):
      n(θ) = inset * (1 - sin θ)   # 0 at front plane, 1 at side
      z(θ) = side_half + fillet_z * cos θ
    θ=0 is tangent to the flat front; θ=π/2 is tangent to the vertical side.
    """
    half_t = thickness * 0.5
    fillet_z = min(fillet_z, half_t * 0.72)
    side_half = max(0.25, half_t - fillet_z)
    actual_fillet = half_t - side_half

    base_poly = Polygon(ring_2d)
    if not base_poly.is_valid:
        base_poly = largest_polygon(make_valid(base_poly)) or Polygon(ring_2d)

    insets, normals = local_balloon_insets(ring_2d, base_poly, front_inset)
    print(f"  front inset min/mean/max={insets.min():.2f}/{insets.mean():.2f}/{insets.max():.2f}")

    n_verts = len(ring_2d)
    equator = ring_2d
    cap = equator + normals * insets[:, None]

    def ring_at(blend: float, z: float) -> np.ndarray:
        xy = equator + (cap - equator) * blend
        return np.column_stack([xy[:, 0], xy[:, 1], np.full(n_verts, z)])

    thetas = _ellipse_samples(fillet_steps)
    rings_3d: List[np.ndarray] = []

    for theta in thetas:
        rings_3d.append(ring_at(1.0 - math.sin(theta), side_half + actual_fillet * math.cos(theta)))

    if side_half > 0.2:
        side_zs = np.linspace(side_half, -side_half, 7)[1:]
        for z in side_zs:
            rings_3d.append(ring_at(0.0, float(z)))
    for theta in thetas[-2::-1]:
        rings_3d.append(ring_at(1.0 - math.sin(theta), -side_half - actual_fillet * math.cos(theta)))

    vertices = np.vstack(rings_3d)
    ring_indices = [np.arange(i * n_verts, (i + 1) * n_verts) for i in range(len(rings_3d))]

    faces: List[List[int]] = []
    for r1, r2 in zip(ring_indices[:-1], ring_indices[1:]):
        faces.extend(ring_quad_faces(r1, r2))

    # Cap uses the SAME ring vertices as the first/last fillet ring — no T-junction sheet.
    cap_xy = rings_3d[0][:, :2]
    cap_idx = earcut.triangulate_float64(np.ascontiguousarray(cap_xy, dtype=np.float64), [n_verts])
    cap_faces = np.asarray(cap_idx, dtype=np.int64).reshape((-1, 3))
    if len(cap_faces) == 0:
        raise RuntimeError("earcut produced no cap faces")
    faces.extend(ring_indices[0][cap_faces].tolist())
    faces.extend(ring_indices[-1][cap_faces][:, ::-1].tolist())

    mesh = trimesh.Trimesh(
        vertices=vertices,
        faces=np.asarray(faces, dtype=np.int64),
        process=False,
        validate=False,
    )
    mesh.merge_vertices()
    mesh.update_faces(mesh.nondegenerate_faces())
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    return mesh


def sdf_rounded_extrude_mesh(
    rings: List[np.ndarray],
    thickness: float = REF_THICKNESS,
    front_inset: float = FRONT_INSET,
    fillet_z: float = FILLET_Z,
    pixel: float = 0.30,
    pad: float = 5.5,
) -> trimesh.Trimesh:
    """
    Implicit rounded extrusion: 2D letter SDF + unseen quarter-ellipse profile,
    then marching cubes. No loft rings, so no 180° cap-plane crease.
    """
    from skimage import measure

    pts = np.vstack(rings)
    minxy = pts.min(axis=0) - pad
    maxxy = pts.max(axis=0) + pad
    width = int(math.ceil((maxxy[0] - minxy[0]) / pixel)) + 1
    height = int(math.ceil((maxxy[1] - minxy[1]) / pixel)) + 1
    img = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(img)
    for ring in rings:
        pix = [
            (
                float((p[0] - minxy[0]) / pixel),
                float((maxxy[1] - p[1]) / pixel),
            )
            for p in ring
        ]
        draw.polygon(pix, fill=255)
    binary = np.asarray(img) > 127
    inside = ndimage.distance_transform_edt(binary) * pixel
    outside = ndimage.distance_transform_edt(~binary) * pixel
    sdf2 = (inside - outside).astype(np.float32)

    half = thickness * 0.5
    fillet_z = min(float(fillet_z), half * 0.72)
    side = max(0.25, half - fillet_z)
    z_pad = 2.4
    z_min = -half - z_pad
    z_max = half + z_pad
    nz = int(math.ceil((z_max - z_min) / pixel)) + 1
    zs = z_min + np.arange(nz, dtype=np.float32) * pixel
    az = np.abs(zs)

    inset_z = np.zeros(nz, dtype=np.float32)
    in_fillet = (az > side) & (az <= half)
    t = np.clip((az - side) / max(fillet_z, 1e-6), 0.0, 1.0)
    inset_z[in_fillet] = front_inset * (1.0 - np.sqrt(np.clip(1.0 - t[in_fillet] ** 2, 0.0, 1.0)))
    inset_z[az > half] = front_inset

    vol = sdf2[None, :, :] + inset_z[:, None, None]
    vol = np.maximum(vol, (az - half)[:, None, None])
    # Slight 3D blur removes the last G1 highlight ring without eating the glyph.
    vol = ndimage.gaussian_filter(vol, sigma=1.15, mode="nearest")

    verts, faces, _normals, _ = measure.marching_cubes(
        vol,
        level=0.0,
        spacing=(pixel, pixel, pixel),
        allow_degenerate=False,
    )
    # skimage verts are (z, row, col) in spaced units from origin.
    x = minxy[0] + verts[:, 2]
    y = maxxy[1] - verts[:, 1]
    z = z_min + verts[:, 0]
    mesh = trimesh.Trimesh(
        vertices=np.column_stack([x, y, z]),
        faces=np.asarray(faces, dtype=np.int64),
        process=True,
    )
    mesh.update_faces(mesh.nondegenerate_faces())
    mesh.remove_unreferenced_vertices()
    if hasattr(trimesh.smoothing, "filter_taubin"):
        trimesh.smoothing.filter_taubin(mesh, lamb=0.36, nu=-0.37, iterations=12)
    # Restore the unseen target width; keep designed thickness on Z.
    mesh.vertices -= mesh.centroid
    xy_span = float(mesh.vertices[:, 0].max() - mesh.vertices[:, 0].min())
    z_span = float(mesh.vertices[:, 2].max() - mesh.vertices[:, 2].min())
    if xy_span > 1e-6:
        mesh.vertices[:, :2] *= REF_WIDTH / xy_span
    if z_span > 1e-6:
        mesh.vertices[:, 2] *= thickness / z_span
    mesh.vertices -= mesh.centroid
    mesh.fix_normals()
    print(f"SDF volume {vol.shape} voxel={pixel:.2f}  mesh {len(mesh.vertices)}v/{len(mesh.faces)}f")
    return mesh


def process_image_to_glb(
    input_image_path: Path,
    output_glb_path: Path,
    target_w: float = REF_WIDTH,
    thickness: float = REF_THICKNESS,
) -> None:
    img = Image.open(input_image_path).convert("RGB")
    rgb0 = np.array(img)

    soft_mask = build_soft_mask(rgb0)
    smooth_rings = extract_smooth_contours(
        soft_mask,
        upscale=4,
        spline_samples=300,
        smooth_factor=5.0,
        inflate_ratio=0.10,
    )

    if not smooth_rings:
        raise RuntimeError("Failed to extract valid contours from image.")

    world_rings, w_width, w_height = normalize_contours_to_world(smooth_rings, target_w=target_w)
    world_rings = sorted(world_rings, key=lambda r: Polygon(r).area, reverse=True)
    # Keep the main letter bodies; drop speckles from silhouette extraction.
    keep = []
    for ring in world_rings:
        area = Polygon(ring).area
        if not keep or area > keep[0][0] * 0.18:
            keep.append((area, ring))
    world_rings = [r for _, r in keep]
    print(f"Using {len(world_rings)} contour(s); areas={[round(a,1) for a,_ in keep]}")

    mesh = sdf_rounded_extrude_mesh(
        world_rings,
        thickness=thickness,
        front_inset=FRONT_INSET,
        fillet_z=FILLET_Z,
    )
    ang = np.degrees(mesh.face_adjacency_angles)
    print(
        f"smooth<5deg {100.0 * float((ang < 5).mean()):.1f}%  "
        f"p90={float(np.percentile(ang, 90)):.2f}  max={float(ang.max()):.2f}"
    )

    # Calculate UVs (X, Y mapped to 0..1)
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
    # Match reusable naming convention from unseen-dc1.glb (node "unseen-object" / mesh "unseen-text-mesh-1")
    mesh.metadata["name"] = "itzy-text-mesh-1"

    output_glb_path.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(str(output_glb_path))
    print(f"Exported uncompressed GLB to {output_glb_path}")
    print(f"Vertices: {len(mesh.vertices)}, Faces: {len(mesh.faces)}, Extents: {mesh.extents.round(3).tolist()}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_unseen_style_glb.py <input-image> <output.glb>")
        sys.exit(1)

    in_img = Path(sys.argv[1]).resolve()
    out_glb = Path(sys.argv[2]).resolve()
    process_image_to_glb(in_img, out_glb)
