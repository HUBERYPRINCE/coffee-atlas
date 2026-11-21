#!/usr/bin/env python3
"""
Prepare AI-generated 2-layer hero bean illustrations (bg.png + subject.png)
into WebGL-ready, compact, pixel-registered 3-layer WebP assets:
  - bg.webp      (opaque 768x1152 portrait, atmospheric depth background)
  - subject.webp (true RGBA 768x1152 portrait, flood-filled clean cutout + soft anti-aliased edge + white halo despill)
  - lineart.webp (grayscale 768x1152 black-on-white contours derived directly from subject so registration is 100% exact!)

Run: python3 scripts/prepare_hero_layers.py
"""
from __future__ import annotations

import collections
import math
import os
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
HERO_DIR = ROOT / "assets" / "hero-beans"
TARGET_SIZE = (768, 1152)  # Crisp 2:3 ratio, lightweight for standalone HTML embedding


def fit_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(img, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def fit_contain_white(img: Image.Image, size: tuple[int, int], pad_ratio: float = 0.04) -> Image.Image:
    tw, th = size
    inner_w = int(tw * (1.0 - pad_ratio * 2))
    inner_h = int(th * (1.0 - pad_ratio * 2))
    ratio = min(inner_w / img.width, inner_h / img.height)
    nw = max(1, int(round(img.width * ratio)))
    nh = max(1, int(round(img.height * ratio)))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (255, 255, 255))
    ox = (tw - nw) // 2
    oy = (th - nh) // 2
    canvas.paste(resized, (ox, oy))
    return canvas


def remove_white_bg_floodfill(rgb_img: Image.Image) -> Image.Image:
    """
    Flood-fill from all four borders to remove solid/near-white studio backdrop
    WITHOUT punching holes in white petals/cream inside the subject!
    Then feather edges softly and despill white edge fringes.
    """
    w, h = rgb_img.size
    pix = rgb_img.load()

    # Estimate border background color (usually ~255,255,255, tolerate off-white like 248)
    border_samples = []
    for x in range(0, w, max(1, w // 32)):
        border_samples.append(pix[x, 0])
        border_samples.append(pix[x, h - 1])
    for y in range(0, h, max(1, h // 32)):
        border_samples.append(pix[0, y])
        border_samples.append(pix[w - 1, y])
    br = sum(c[0] for c in border_samples) / len(border_samples)
    bg_g = sum(c[1] for c in border_samples) / len(border_samples)
    bb = sum(c[2] for c in border_samples) / len(border_samples)

    def dist_bg(r: int, g: int, b: int) -> float:
        # Euclidean RGB distance + saturation penalty (protect pastel colored edges)
        dr = r - br
        dg = g - bg_g
        db = b - bb
        sat = max(r, g, b) - min(r, g, b)
        return math.sqrt(dr * dr + dg * dg + db * db) + sat * 0.55

    visited = bytearray(w * h)
    is_bg = bytearray(w * h)
    q = collections.deque()

    # Seed from 4 outer edges where pixel is close to backdrop
    seed_thresh = 52.0
    grow_thresh = 42.0

    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            if not visited[idx] and dist_bg(*pix[x, y]) < seed_thresh:
                visited[idx] = 1
                is_bg[idx] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            if not visited[idx] and dist_bg(*pix[x, y]) < seed_thresh:
                visited[idx] = 1
                is_bg[idx] = 1
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                idx = ny * w + nx
                if not visited[idx]:
                    visited[idx] = 1
                    if dist_bg(*pix[nx, ny]) < grow_thresh:
                        is_bg[idx] = 1
                        q.append((nx, ny))

    # Second pass: detect enclosed interior pure-white backdrop pockets trapped
    # between stems, leaves, or handles (uniform flat neutral white >= 250),
    # while preserving shaded cream/ivory flower petals & glass highlights.
    hole_vis = bytearray(w * h)
    for y in range(1, h - 1):
        row_off = y * w
        for x in range(1, w - 1):
            idx = row_off + x
            if is_bg[idx] or hole_vis[idx]:
                continue
            r, g, b = pix[x, y]
            if r >= 250 and g >= 250 and b >= 250 and (max(r, g, b) - min(r, g, b)) <= 5:
                # BFS this flat neutral-white core
                comp = []
                hq = collections.deque([(x, y)])
                hole_vis[idx] = 1
                pure_cnt = 0
                while hq:
                    cx, cy = hq.popleft()
                    comp.append((cx, cy))
                    cr, cg, cb = pix[cx, cy]
                    if cr >= 252 and cg >= 252 and cb >= 252 and (max(cr, cg, cb) - min(cr, cg, cb)) <= 4:
                        pure_cnt += 1
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                        if 0 <= nx < w and 0 <= ny < h:
                            nidx = ny * w + nx
                            if not is_bg[nidx] and not hole_vis[nidx]:
                                nr, ng, nb = pix[nx, ny]
                                if min(nr, ng, nb) >= 244 and (max(nr, ng, nb) - min(nr, ng, nb)) <= 7:
                                    hole_vis[nidx] = 1
                                    hq.append((nx, ny))
                # Only treat as enclosed backdrop hole if substantial flat pure-white studio area
                if len(comp) >= 28 and (pure_cnt / len(comp)) >= 0.45:
                    grow_q = collections.deque()
                    for px_x, px_y in comp:
                        is_bg[px_y * w + px_x] = 1
                        grow_q.append((px_x, px_y))
                    # Gently absorb 2px of light anti-aliased fringe inside the hole
                    for _ in range(2):
                        for _ in range(len(grow_q)):
                            cx, cy = grow_q.popleft()
                            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                                if 0 <= nx < w and 0 <= ny < h:
                                    nidx = ny * w + nx
                                    if not is_bg[nidx] and dist_bg(*pix[nx, ny]) < 36.0:
                                        is_bg[nidx] = 1
                                        grow_q.append((nx, ny))

    # Build raw binary mask (255 = foreground, 0 = background)
    mask = Image.new("L", (w, h), 255)
    mpix = mask.load()
    for y in range(h):
        row_off = y * w
        for x in range(w):
            if is_bg[row_off + x]:
                mpix[x, y] = 0

    # Slightly erode 1px then smooth-feather to eliminate bright white halo fringes
    mask_eroded = mask.filter(ImageFilter.MinFilter(3))
    mask_soft = mask_eroded.filter(ImageFilter.GaussianBlur(radius=1.1))

    # Soft semi-transparent transition for near-white pixels touching the border
    rgba = rgb_img.convert("RGBA")
    rpix = rgba.load()
    spix = mask_soft.load()
    for y in range(h):
        row_off = y * w
        for x in range(w):
            a = spix[x, y]
            if is_bg[row_off + x]:
                rpix[x, y] = (0, 0, 0, 0)
            elif a < 250:
                r, g, b, _ = rpix[x, y]
                d = dist_bg(r, g, b)
                # Attenuate white fringe cleanly
                if d < 68.0:
                    factor = max(0.0, min(1.0, (d - 18.0) / 50.0))
                    a = int(a * factor)
                # Subtle un-premultiply despill against white backdrop
                if 8 < a < 245:
                    af = a / 255.0
                    nr = max(0, min(255, int((r - br * (1.0 - af) * 0.45) / max(0.35, af + 0.35))))
                    ng = max(0, min(255, int((g - bg_g * (1.0 - af) * 0.45) / max(0.35, af + 0.35))))
                    nb = max(0, min(255, int((b - bb * (1.0 - af) * 0.45) / max(0.35, af + 0.35))))
                    rpix[x, y] = (nr, ng, nb, a)
                else:
                    rpix[x, y] = (r, g, b, a)
            else:
                r, g, b, _ = rpix[x, y]
                rpix[x, y] = (r, g, b, 255)
    return rgba


def extract_registered_lineart(subject_rgba: Image.Image) -> Image.Image:
    """
    Derive sparse, razor-sharp black-on-white contours directly from the cutout subject
    so the holographic line-glint shader aligns with 0px drift.
    """
    w, h = subject_rgba.size
    # Composite onto white for clean luminance gradient
    white_bg = Image.new("RGB", (w, h), (255, 255, 255))
    white_bg.paste(subject_rgba, mask=subject_rgba.split()[3])
    gray = white_bg.convert("L").filter(ImageFilter.GaussianBlur(radius=0.8))
    edges = gray.filter(ImageFilter.FIND_EDGES)

    # Invert so edges are dark on pure white, boost contrast & mask outside alpha
    alpha = subject_rgba.split()[3]
    epix = edges.load()
    apix = alpha.load()
    out = Image.new("L", (w, h), 255)
    opix = out.load()

    for y in range(h):
        for x in range(w):
            if apix[x, y] < 32:
                opix[x, y] = 255
                continue
            val = epix[x, y]
            # Keep only crisp structural lines (sparse mask per RuiC-card-skill invariant!)
            if val > 34:
                strength = min(255, int((val - 34) * 3.1))
                opix[x, y] = max(0, 255 - strength)
            else:
                opix[x, y] = 255
    return out


def find_layer_file(bean_dir: Path, stem: str) -> Path | None:
    for ext in (".png", ".jpg", ".jpeg"):
        p = bean_dir / f"{stem}{ext}"
        if p.exists():
            return p
    return None


def process_bean(bean_dir: Path) -> bool:
    bg_src = find_layer_file(bean_dir, "bg")
    subj_src = find_layer_file(bean_dir, "subject")
    if not bg_src or not subj_src:
        print(f"[skip] {bean_dir.name}: waiting for bg & subject")
        return False

    print(f"[proc] {bean_dir.name} ...")
    bg_img = fit_cover(Image.open(bg_src).convert("RGB"), TARGET_SIZE)
    bg_img.save(bean_dir / "bg.webp", "WEBP", quality=84, method=6)

    subj_raw = Image.open(subj_src)
    if subj_raw.mode == "RGBA":
        # Check if it already has real transparency on corners
        a_ch = subj_raw.split()[3]
        corners = [a_ch.getpixel((2, 2)), a_ch.getpixel((subj_raw.width - 3, 2)),
                   a_ch.getpixel((2, subj_raw.height - 3)), a_ch.getpixel((subj_raw.width - 3, subj_raw.height - 3))]
        if max(corners) < 20:
            subj_rgba = ImageOps.contain(subj_raw, (int(TARGET_SIZE[0] * 0.92), int(TARGET_SIZE[1] * 0.92)), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
            canvas.paste(subj_rgba, ((TARGET_SIZE[0] - subj_rgba.width) // 2, (TARGET_SIZE[1] - subj_rgba.height) // 2))
            subj_rgba = canvas
        else:
            subj_rgb = fit_contain_white(subj_raw.convert("RGB"), TARGET_SIZE)
            subj_rgba = remove_white_bg_floodfill(subj_rgb)
    else:
        subj_rgb = fit_contain_white(subj_raw.convert("RGB"), TARGET_SIZE)
        subj_rgba = remove_white_bg_floodfill(subj_rgb)

    subj_rgba.save(bean_dir / "subject.webp", "WEBP", quality=86, method=6)

    line_img = extract_registered_lineart(subj_rgba)
    line_img.save(bean_dir / "lineart.webp", "WEBP", quality=82, method=6)

    bg_kb = (bean_dir / "bg.webp").stat().st_size / 1024
    su_kb = (bean_dir / "subject.webp").stat().st_size / 1024
    ln_kb = (bean_dir / "lineart.webp").stat().st_size / 1024
    print(f"  -> OK: bg={bg_kb:.1f}KB, subject={su_kb:.1f}KB, lineart={ln_kb:.1f}KB")
    return True


def main() -> None:
    if not HERO_DIR.exists():
        print(f"Hero dir not found: {HERO_DIR}")
        return
    processed = 0
    for child in sorted(HERO_DIR.iterdir()):
        if child.is_dir():
            if process_bean(child):
                processed += 1
    print(f"\nDone! Prepared {processed} hero bean layer sets.")


if __name__ == "__main__":
    main()
