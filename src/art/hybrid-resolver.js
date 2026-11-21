import {
  renderBackgroundCanvas,
  renderEffectsCanvas,
  renderSubjectAndLineartCanvases,
  renderTextFrameCanvas,
} from './procedural-front.js';
import { renderBackCardCanvas } from './back-card-canvas.js';

/**
 * Hybrid Visual Asset Resolver.
 *
 * Seamlessly unifies AI-painted layered hero beans (7 showcase single-origin cards)
 * with the 5-layer procedural botanical & terroir synthesizer (all 36 cards).
 *
 * Asset lookup priority for `mode === 'hybrid'` + `heroDir`:
 *   1. `globalThis.__INLINE_HERO_ASSETS__?.[heroDir]?.[layer]` (single-file standalone HTML)
 *   2. `./assets/hero-beans/${heroDir}/${layer}.webp` (dev / static web deployment)
 *   3. Automatic graceful fallback to procedural-front.js (zero errors, 100% available)
 *
 * `effectsCanvas`, `textCanvas`, and `backCanvas` (1440x2160) are always rendered
 * procedurally at high DPI so all 36 cards share identical museum typography & radar precision.
 */

const FRONT_W = 1024;
const FRONT_H = 1536;
const THUMB_W = 360;
const THUMB_H = 540;

/** @type {Map<string, Promise<HTMLImageElement | null>>} */
const heroImageCache = new Map();
/** @type {Map<string, string>} */
const thumbDataCache = new Map();
/** @type {Map<string, Promise<string>>} */
const thumbInFlight = new Map();

function loadImageSafe(src, timeoutMs = 5500) {
  if (!src || typeof Image === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';

    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(val);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) finish(img);
      else finish(null);
    };
    img.onerror = () => finish(null);
    img.src = src;
  });
}

function getHeroAssetSource(heroDir, layerName) {
  if (!heroDir) return null;
  const inlineStore = typeof globalThis !== 'undefined' ? globalThis.__INLINE_HERO_ASSETS__ : null;
  const inlineEntry = inlineStore && inlineStore[heroDir];
  if (inlineEntry && typeof inlineEntry[layerName] === 'string' && inlineEntry[layerName].length > 0) {
    return inlineEntry[layerName];
  }
  return `./assets/hero-beans/${heroDir}/${layerName}.webp`;
}

function loadHeroLayer(heroDir, layerName) {
  if (!heroDir) return Promise.resolve(null);
  const src = getHeroAssetSource(heroDir, layerName);
  if (!src) return Promise.resolve(null);

  const cacheKey = `${heroDir}:${layerName}:${src.startsWith('data:') ? 'inline' : src}`;
  if (heroImageCache.has(cacheKey)) {
    return heroImageCache.get(cacheKey);
  }

  const promise = loadImageSafe(src);
  heroImageCache.set(cacheKey, promise);
  return promise;
}

/**
 * Draw an image covering (w, h) cleanly without distortion.
 */
function drawImageCover(ctx, img, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Compute consistent subject/lineart placement rect so co-registered hero assets never drift.
 */
function computeSubjectRect(img, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return { dx: 0, dy: 0, dw: w, dh: h };

  const targetAspect = w / h; // 2/3 = 0.6667
  const imgAspect = iw / ih;

  // Pre-formatted 2:3 layered asset -> direct 1:1 fit
  if (Math.abs(imgAspect - targetAspect) < 0.08) {
    return { dx: 0, dy: 0, dw: w, dh: h };
  }

  // Square / non-2:3 AI cutout -> frame gracefully inside upper hero art showcase zone
  const boxW = w * 0.90;
  const boxH = h * 0.68;
  const scale = Math.min(boxW / iw, boxH / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (w - dw) / 2;
  const dy = h * 0.09 + (boxH - dh) / 2;
  return { dx, dy, dw, dh };
}

function imageToCanvas(img, w, h, { cover = true, whiteBg = false, rect = null } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (whiteBg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }
  if (rect) {
    ctx.drawImage(img, rect.dx, rect.dy, rect.dw, rect.dh);
  } else if (cover) {
    drawImageCover(ctx, img, w, h);
  } else {
    ctx.drawImage(img, 0, 0, w, h);
  }
  return c;
}

/**
 * Draw a rounded rectangle path cleanly.
 */
function roundedRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/**
 * Draw an image cover-fitted inside a target sub-rectangle (rx, ry, rw, rh).
 */
function drawImageCoverInRect(ctx, img, rx, ry, rw, rh) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(rw / iw, rh / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rx + (rw - dw) / 2;
  const dy = ry + (rh - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Render a user-uploaded bean bag / pour-over photo (`customImageDataUrl`) as a
 * museum collector specimen window safely framed between top badge and bottom title.
 */
function renderCustomPhotoSubject(img, card, width, height) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');

  ctx.save();
  ctx.scale(width / FRONT_W, height / FRONT_H);

  const finish = card?.visual?.defaultFinish || 'gold';
  const rimMain = finish === 'silver' ? '#CBD8E4' : '#DAB46E';
  const rimGlow = finish === 'silver' ? 'rgba(220, 234, 248, 0.52)' : 'rgba(255, 232, 184, 0.52)';

  // Safe focal window avoiding top code band (y < 155) and bottom typography zone (y > 1060)
  const winW = 700;
  const winH = 790;
  const winX = (FRONT_W - winW) / 2;
  const winY = 208;
  const winR = 44;

  // 1. Soft dark espresso gallery drop shadow behind the specimen window
  ctx.save();
  ctx.shadowColor = 'rgba(6, 3, 2, 0.62)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#18110D';
  roundedRectPath(ctx, winX, winY, winW, winH, winR);
  ctx.fill();
  ctx.restore();

  // 2. Clipped cover-fitted user photo + warm dark-bronze vignette harmonization
  ctx.save();
  roundedRectPath(ctx, winX, winY, winW, winH, winR);
  ctx.clip();

  drawImageCoverInRect(ctx, img, winX, winY, winW, winH);

  // Subtle dark copper-espresso edge vignette blending photo seamlessly into dark atelier card
  const cx = winX + winW / 2;
  const cy = winY + winH / 2;
  const vig = ctx.createRadialGradient(cx, cy, winW * 0.24, cx, cy, winH * 0.68);
  vig.addColorStop(0.0, 'rgba(20, 14, 10, 0.0)');
  vig.addColorStop(0.68, 'rgba(20, 14, 10, 0.16)');
  vig.addColorStop(1.0, 'rgba(14, 9, 6, 0.58)');
  ctx.fillStyle = vig;
  ctx.fillRect(winX, winY, winW, winH);

  // Delicate warm bronze top/bottom inner shadow for depth
  const rimShade = ctx.createLinearGradient(0, winY, 0, winY + winH);
  rimShade.addColorStop(0.0, 'rgba(18, 12, 8, 0.26)');
  rimShade.addColorStop(0.14, 'rgba(18, 12, 8, 0.0)');
  rimShade.addColorStop(0.84, 'rgba(18, 12, 8, 0.0)');
  rimShade.addColorStop(1.0, 'rgba(18, 12, 8, 0.34)');
  ctx.fillStyle = rimShade;
  ctx.fillRect(winX, winY, winW, winH);
  ctx.restore();

  // 3. Double hairline antique copper-gold museum specimen bezel + 4 cardinal finials
  ctx.strokeStyle = rimMain;
  ctx.lineWidth = 4.2;
  roundedRectPath(ctx, winX, winY, winW, winH, winR);
  ctx.stroke();

  ctx.strokeStyle = rimGlow;
  ctx.lineWidth = 1.5;
  roundedRectPath(ctx, winX + 11, winY + 11, winW - 22, winH - 22, winR - 9);
  ctx.stroke();

  ctx.fillStyle = rimMain;
  const finials = [
    [cx, winY],
    [cx, winY + winH],
    [winX, cy],
    [winX + winW, cy],
  ];
  for (const [fx, fy] of finials) {
    ctx.beginPath();
    ctx.moveTo(fx, fy - 7);
    ctx.lineTo(fx + 7, fy);
    ctx.lineTo(fx, fy + 7);
    ctx.lineTo(fx - 7, fy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
  return c;
}

/**
 * Synthesize a crisp co-registered white-ground dark-line contour map directly from a
 * hero or custom-photo subject canvas when `lineart.webp` is absent.
 */
function synthesizeLineartFromSubject(subjectCanvas, { stampSpecimenFrame = false } = {}) {
  try {
    const sw = 256;
    const sh = 384;
    const tmp = document.createElement('canvas');
    tmp.width = sw;
    tmp.height = sh;
    const tctx = tmp.getContext('2d', { willReadFrequently: true });
    tctx.drawImage(subjectCanvas, 0, 0, sw, sh);
    const src = tctx.getImageData(0, 0, sw, sh).data;
    const out = tctx.createImageData(sw, sh);
    const dst = out.data;

    const lumaAt = (x, y) => {
      const idx = (y * sw + x) * 4;
      const a = src[idx + 3] / 255;
      return (src[idx] * 0.299 + src[idx + 1] * 0.587 + src[idx + 2] * 0.114) * a;
    };

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const idx = (y * sw + x) * 4;
        if (x === 0 || y === 0 || x === sw - 1 || y === sh - 1) {
          dst[idx] = dst[idx + 1] = dst[idx + 2] = 255;
          dst[idx + 3] = 255;
          continue;
        }
        const gx =
          -lumaAt(x - 1, y - 1) + lumaAt(x + 1, y - 1) +
          -2 * lumaAt(x - 1, y) + 2 * lumaAt(x + 1, y) +
          -lumaAt(x - 1, y + 1) + lumaAt(x + 1, y + 1);
        const gy =
          -lumaAt(x - 1, y - 1) - 2 * lumaAt(x, y - 1) - lumaAt(x + 1, y - 1) +
          lumaAt(x - 1, y + 1) + 2 * lumaAt(x, y + 1) + lumaAt(x + 1, y + 1);
        const mag = Math.min(255, Math.hypot(gx, gy) * 1.15);
        const ink = mag > 36 ? Math.max(12, 255 - (mag - 36) * 2.1) : 255;
        dst[idx] = dst[idx + 1] = dst[idx + 2] = ink;
        dst[idx + 3] = 255;
      }
    }
    tctx.putImageData(out, 0, 0);

    const full = document.createElement('canvas');
    full.width = subjectCanvas.width;
    full.height = subjectCanvas.height;
    const fctx = full.getContext('2d');
    fctx.fillStyle = '#FFFFFF';
    fctx.fillRect(0, 0, full.width, full.height);
    fctx.drawImage(tmp, 0, 0, full.width, full.height);

    if (stampSpecimenFrame) {
      // Crisp co-registered specimen bezel contour so holographic sweep glints along the copper rim
      fctx.save();
      fctx.scale(full.width / FRONT_W, full.height / FRONT_H);
      fctx.strokeStyle = '#121212';
      fctx.lineWidth = 3.2;
      roundedRectPath(fctx, (FRONT_W - 700) / 2, 208, 700, 790, 44);
      fctx.stroke();
      fctx.lineWidth = 1.6;
      roundedRectPath(fctx, (FRONT_W - 700) / 2 + 11, 219, 678, 768, 35);
      fctx.stroke();
      fctx.restore();
    }

    return full;
  } catch {
    return null;
  }
}

/**
 * Resolve all 6 layers (5 front + 1 high-DPI back) for the 3D holographic stage.
 */
export async function resolveCardLayers(card, options = {}) {
  const width = options.width || FRONT_W;
  const height = options.height || FRONT_H;

  const layersSpec = card?.visual?.layers || {};
  const customImageDataUrl =
    typeof layersSpec.customImageDataUrl === 'string' && layersSpec.customImageDataUrl.trim()
      ? layersSpec.customImageDataUrl.trim()
      : null;
  const isHybrid = layersSpec.mode === 'hybrid' && Boolean(layersSpec.heroDir);
  const heroDir = isHybrid ? layersSpec.heroDir : null;

  let heroBg = null;
  let heroSubject = null;
  let heroLineart = null;
  let customImg = null;

  if (customImageDataUrl) {
    customImg = await loadImageSafe(customImageDataUrl);
  } else if (heroDir) {
    [heroBg, heroSubject, heroLineart] = await Promise.all([
      loadHeroLayer(heroDir, 'bg'),
      loadHeroLayer(heroDir, 'subject'),
      loadHeroLayer(heroDir, 'lineart'),
    ]);
  }

  // Layer 0: Background
  const background = heroBg
    ? imageToCanvas(heroBg, width, height, { cover: true })
    : renderBackgroundCanvas(card, { width, height });

  // Layer 1 & 3: Subject + Co-Registered Lineart
  let subject;
  let lineart;
  let hasLine = true;

  if (customImg) {
    subject = renderCustomPhotoSubject(customImg, card, width, height);
    lineart = synthesizeLineartFromSubject(subject, { stampSpecimenFrame: true });
    hasLine = Boolean(lineart);
  } else if (heroSubject) {
    const rect = computeSubjectRect(heroSubject, width, height);
    subject = imageToCanvas(heroSubject, width, height, { cover: false, rect });
    if (heroLineart) {
      lineart = imageToCanvas(heroLineart, width, height, { cover: false, whiteBg: true, rect });
    } else {
      lineart = synthesizeLineartFromSubject(subject);
      hasLine = Boolean(lineart);
    }
  } else {
    const proc = renderSubjectAndLineartCanvases(card, { width, height });
    subject = proc.subjectCanvas;
    lineart = proc.lineartCanvas;
    hasLine = true;
  }

  // Layer 2, 4, Back: Always crisp high-DPI procedural for unified collector framing & 6D radar
  const effects = renderEffectsCanvas(card, { width, height });
  const text = renderTextFrameCanvas(card, { width, height });
  const back = renderBackCardCanvas(card);

  const heroLoaded = Boolean(heroBg || heroSubject || customImg);

  return {
    background,
    subject,
    effects,
    lineart,
    text,
    back,
    hasLine,
    hasFx: true,
    sourceMode: customImg ? 'custom' : heroLoaded ? 'hybrid' : 'procedural',
    heroLoaded,
  };
}

function encodeThumbDataURL(canvas) {
  try {
    const webp = canvas.toDataURL('image/webp', 0.86);
    if (webp && webp.startsWith('data:image/webp')) return webp;
  } catch {
    // Fallback below
  }
  return canvas.toDataURL('image/jpeg', 0.86);
}

/**
 * Render and cache a crisp 2:3 (360 x 540) composite gallery thumbnail DataURL.
 * Automatically integrates hero WebP art when present and caches by `card.id`.
 *
 * @param {object} card
 * @param {{ width?: number, height?: number }} [options]
 * @returns {Promise<string>}
 */
export function renderGalleryThumb(card, options = {}) {
  const id = card?.id || 'unknown';
  const width = options.width || THUMB_W;
  const height = options.height || THUMB_H;
  const cacheKey = `${id}:${width}x${height}`;

  if (thumbDataCache.has(cacheKey)) {
    return Promise.resolve(thumbDataCache.get(cacheKey));
  }
  if (thumbInFlight.has(cacheKey)) {
    return thumbInFlight.get(cacheKey);
  }

  const job = (async () => {
    const layersSpec = card?.visual?.layers || {};
    const customImageDataUrl =
      typeof layersSpec.customImageDataUrl === 'string' && layersSpec.customImageDataUrl.trim()
        ? layersSpec.customImageDataUrl.trim()
        : null;
    const heroDir = !customImageDataUrl && layersSpec.mode === 'hybrid' && layersSpec.heroDir
      ? layersSpec.heroDir
      : null;

    let heroBg = null;
    let heroSubject = null;
    let customImg = null;
    if (customImageDataUrl) {
      customImg = await loadImageSafe(customImageDataUrl);
    } else if (heroDir) {
      [heroBg, heroSubject] = await Promise.all([
        loadHeroLayer(heroDir, 'bg'),
        loadHeroLayer(heroDir, 'subject'),
      ]);
    }

    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const ctx = out.getContext('2d');

    // 1. Background (with subtle warm champagne-gold skylight lift so dark art glows radiantly)
    if (heroBg) {
      drawImageCover(ctx, heroBg, width, height);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const sunLift = ctx.createRadialGradient(
        width * 0.5,
        height * 0.36,
        width * 0.04,
        width * 0.5,
        height * 0.42,
        height * 0.62,
      );
      sunLift.addColorStop(0.0, 'rgba(255, 232, 174, 0.34)');
      sunLift.addColorStop(0.45, 'rgba(240, 198, 126, 0.18)');
      sunLift.addColorStop(1.0, 'rgba(196, 152, 92, 0.08)');
      ctx.fillStyle = sunLift;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else {
      const bgCanvas = renderBackgroundCanvas(card, { width, height, fast: true });
      ctx.drawImage(bgCanvas, 0, 0, width, height);
    }

    // 2. Subject
    if (customImg) {
      const customSubj = renderCustomPhotoSubject(customImg, card, width, height);
      ctx.drawImage(customSubj, 0, 0, width, height);
    } else if (heroSubject) {
      const rect = computeSubjectRect(heroSubject, width, height);
      ctx.drawImage(heroSubject, rect.dx, rect.dy, rect.dw, rect.dh);
    } else {
      const { subjectCanvas } = renderSubjectAndLineartCanvases(card, { width, height });
      ctx.drawImage(subjectCanvas, 0, 0, width, height);
    }

    // 3. Effects
    const fxCanvas = renderEffectsCanvas(card, { width, height, fast: true });
    ctx.drawImage(fxCanvas, 0, 0, width, height);

    // 4. Unified collector frame & typography
    const textCanvas = renderTextFrameCanvas(card, { width, height });
    ctx.drawImage(textCanvas, 0, 0, width, height);

    const dataUrl = encodeThumbDataURL(out);
    thumbDataCache.set(cacheKey, dataUrl);
    return dataUrl;
  })().finally(() => {
    thumbInFlight.delete(cacheKey);
  });

  thumbInFlight.set(cacheKey, job);
  return job;
}

/**
 * Invalidate all cached gallery thumbnail resolutions for a specific cardId
 * (e.g., after the user edits a custom bean card in My Bean Studio).
 */
export function invalidateCardThumb(cardId) {
  if (!cardId) return;
  const prefix = `${cardId}:`;
  for (const key of Array.from(thumbDataCache.keys())) {
    if (key === cardId || key.startsWith(prefix)) {
      thumbDataCache.delete(key);
    }
  }
  for (const key of Array.from(thumbInFlight.keys())) {
    if (key === cardId || key.startsWith(prefix)) {
      thumbInFlight.delete(key);
    }
  }
}

export function clearResolverCache() {
  heroImageCache.clear();
  thumbDataCache.clear();
  thumbInFlight.clear();
}
