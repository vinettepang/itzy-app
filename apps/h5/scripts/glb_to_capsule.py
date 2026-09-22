"""
把现有 GLB 立体字做成胶囊/气球圆边（形态学闭运算 + marching cubes）。

用法:
  python scripts/glb_to_capsule.py <input.glb> <output.glb> [radius_ratio=0.92]
radius_ratio: 相对半厚度，1.0 为完全胶囊截面。
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from scipy import ndimage
from skimage.measure import marching_cubes
import trimesh


def ball_kernel(radius: int) -> np.ndarray:
    r = int(max(1, radius))
    x, y, z = np.ogrid[-r : r + 1, -r : r + 1, -r : r + 1]
    return (x * x + y * y + z * z) <= (r * r + 0.25)


def mesh_to_capsule(mesh: trimesh.Trimesh, radius_ratio: float = 0.92, pitch: float = 0.55) -> trimesh.Trimesh:
    mesh = mesh.copy()
    mesh.remove_unreferenced_vertices()
    mesh.update_faces(mesh.nondegenerate_faces())
    thick = float(mesh.extents.min())
    radius = max(0.8, 0.5 * thick * radius_ratio)
    pad_vox = int(np.ceil(radius / pitch)) + 3

    voxel = mesh.voxelized(pitch)
    mat = np.pad(np.asarray(voxel.matrix, dtype=bool), pad_vox, mode="constant", constant_values=False)
    mat = ndimage.binary_fill_holes(mat)

    r_vox = max(2.0, radius / pitch)
    print(f"pitch={pitch:.3f} thick={thick:.3f} radius={radius:.3f} r_vox={r_vox:.1f} grid={mat.shape}")
    # 闭运算 = 膨胀再腐蚀，用 EDT 避免巨大球形核
    dilated = ndimage.distance_transform_edt(~mat) <= r_vox
    closed = ndimage.distance_transform_edt(dilated) > r_vox
    closed = ndimage.binary_fill_holes(closed)
    field = ndimage.gaussian_filter(closed.astype(np.float64), sigma=1.25, mode="nearest")

    verts, faces, normals, _ = marching_cubes(field, level=0.45, spacing=(pitch, pitch, pitch), allow_degenerate=False)
    # marching_cubes 坐标在 padded voxel 空间，搬回原 mesh
    origin = np.asarray(voxel.transform[:3, 3], dtype=np.float64) - pad_vox * pitch
    verts = verts + origin

    out = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals, process=True)
    out.update_faces(out.nondegenerate_faces())
    out.update_faces(out.unique_faces())
    out.merge_vertices()
    if hasattr(trimesh.smoothing, "filter_taubin"):
        trimesh.smoothing.filter_taubin(out, lamb=0.5, nu=-0.53, iterations=18)
    out.fix_normals()
    return out


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python glb_to_capsule.py <input.glb> <output.glb> [radius_ratio]")
        sys.exit(1)
    src = Path(sys.argv[1]).resolve()
    dst = Path(sys.argv[2]).resolve()
    ratio = float(sys.argv[3]) if len(sys.argv) > 3 else 0.92

    loaded = trimesh.load(str(src), force="mesh")
    mesh = (
        trimesh.util.concatenate(tuple(loaded.geometry.values()))
        if isinstance(loaded, trimesh.Scene)
        else loaded
    )
    src_extents = np.asarray(mesh.extents, dtype=np.float64)
    src_centroid = np.asarray(mesh.centroid, dtype=np.float64)

    capsule = mesh_to_capsule(mesh, radius_ratio=ratio)
    capsule.vertices -= capsule.centroid
    capsule.vertices += src_centroid
    # 保持原包围盒，方便替换场景
    scale = src_extents / np.clip(np.asarray(capsule.extents, dtype=np.float64), 1e-6, None)
    capsule.vertices = (capsule.vertices - src_centroid) * scale + src_centroid
    capsule.fix_normals()
    _ = capsule.vertex_normals
    capsule.visual.material = trimesh.visual.material.PBRMaterial(
        name="itzy-capsule-mat",
        baseColorFactor=np.array([1.0, 1.0, 1.0, 1.0], dtype=np.float64),
        metallicFactor=1.0,
        roughnessFactor=0.12,
    )

    dst.parent.mkdir(parents=True, exist_ok=True)
    capsule.export(str(dst))
    print(
        f"Wrote {dst} verts={len(capsule.vertices)} faces={len(capsule.faces)} "
        f"extents={np.round(capsule.extents, 3)} watertight={capsule.is_watertight}"
    )


if __name__ == "__main__":
    main()
