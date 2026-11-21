import { FLAVOR_FAMILIES, getFlavorColor } from '../../data/flavor-palette.js';

/**
 * Museum Botanical Monograph & Terroir 5-Layer Procedural Front Card Synthesizer.
 *
 * Logical canvas size: 1024 x 1536 (exact 2:3 collector proportion).
 * Scales cleanly to any output dimensions (e.g., 360 x 540 for fast gallery thumbs).
 *
 * Outputs 5 tightly coordinated layers:
 *   L0 backgroundCanvas (opaque atmospheric terroir & elevation contours)
 *   L1 subjectCanvas    (transparent RGBA high-craft botanical/terroir illustration)
 *   L2 effectsCanvas    (transparent RGBA floating petals, sparks, mist, bubbles)
 *   L3 lineartCanvas    (white ground + dark ink strokes co-registered pixel-for-pixel with L1)
 *   L4 textCanvas       (transparent RGBA zero-parallax gilded collector frame & typography)
 */

const BASE_W = 1024;
const BASE_H = 1536;

const SERIF_FONT = `'Songti SC', 'Noto Serif SC', 'STSong', 'Source Han Serif SC', Georgia, serif`;
const SANS_FONT = `'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif`;
const MONO_FONT = `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;

function hashString(str) {
  let h = 2166136261;
  const s = String(str || 'coffee-atlas');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const clean = String(hex || '#D6A25E').replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 214, g: 162, b: 94 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const k = Math.max(0, Math.min(1, t));
  const r = Math.round(a.r + (b.r - a.r) * k);
  const g = Math.round(a.g + (b.g - a.g) * k);
  const bl = Math.round(a.b + (b.b - a.b) * k);
  return `rgb(${r}, ${g}, ${bl})`;
}

function createCanvas(width, height) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

function getPalette(card) {
  const p = card?.visual?.palette || {};
  return {
    primary: p.primary || '#2A4336',
    secondary: p.secondary || '#D6A25E',
    accent: p.accent || '#D4627B',
    bgTop: p.bgTop || '#13100E',
    bgBottom: p.bgBottom || '#281C15',
    paperTint: p.paperTint || '#F6F1E7',
  };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawDiamond(ctx, cx, cy, rx, ry = rx) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy);
  ctx.lineTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy);
  ctx.closePath();
}

function drawFourPointStar(ctx, cx, cy, outerR, innerR = outerR * 0.28) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// ============================================================================
// LAYER 0: ATMOSPHERIC TERROIR & ELEVATION CONTOUR BACKGROUND
// ============================================================================

function drawTerrainContours(ctx, rng, palette, cx, cy, count = 11) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const baseR = 135 + i * 62;
    const alpha = 0.045 + (1 - i / count) * 0.095;
    ctx.strokeStyle = rgba(palette.secondary, alpha);
    ctx.lineWidth = i % 3 === 0 ? 1.8 : 0.9;
    ctx.beginPath();
    const steps = 96;
    const p1 = rng() * 6.28;
    const p2 = rng() * 6.28;
    for (let s = 0; s <= steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      const wobble =
        Math.sin(a * 3 + p1) * (16 + i * 2.2) +
        Math.cos(a * 5 - p2) * (9 + i * 1.1) +
        Math.sin(a * 2 + i * 0.4) * 18;
      const rx = (baseR + wobble) * 0.92;
      const ry = (baseR + wobble) * 1.15;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function drawMountainLayers(ctx, rng, palette, variant = 'highland') {
  const layerConfigs = variant === 'volcano'
    ? [
        { yBase: 860, amp: 155, peak: true, color: rgba(palette.primary, 0.55), mist: 0.16 },
        { yBase: 970, amp: 105, peak: false, color: rgba(palette.bgTop, 0.72), mist: 0.14 },
        { yBase: 1090, amp: 68, peak: false, color: 'rgba(12, 8, 6, 0.85)', mist: 0.08 },
      ]
    : variant === 'yunnan'
      ? [
          { yBase: 820, amp: 165, peak: false, color: rgba(palette.primary, 0.44), mist: 0.24 },
          { yBase: 940, amp: 120, peak: false, color: rgba(palette.bgBottom, 0.65), mist: 0.22 },
          { yBase: 1065, amp: 85, peak: false, color: rgba(palette.bgTop, 0.82), mist: 0.15 },
        ]
      : variant === 'island'
        ? [
            { yBase: 910, amp: 130, peak: true, color: rgba(palette.primary, 0.52), mist: 0.18 },
            { yBase: 1015, amp: 62, peak: false, color: rgba(palette.bgTop, 0.78), mist: 0.14 },
          ]
        : [
            { yBase: 880, amp: 120, peak: false, color: rgba(palette.primary, 0.48), mist: 0.18 },
            { yBase: 990, amp: 90, peak: false, color: rgba(palette.bgTop, 0.72), mist: 0.14 },
            { yBase: 1110, amp: 55, peak: false, color: 'rgba(11, 8, 6, 0.86)', mist: 0.08 },
          ];

  for (let idx = 0; idx < layerConfigs.length; idx++) {
    const cfg = layerConfigs[idx];
    const phaseA = rng() * 6.28;
    const phaseB = rng() * 6.28;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-20, BASE_H + 20);
    for (let x = -20; x <= BASE_W + 20; x += 16) {
      const nx = x / BASE_W;
      let y = cfg.yBase;
      if (cfg.peak) {
        const dist = Math.abs(nx - 0.52);
        const cone = Math.max(0, 1 - dist * 2.15);
        // Subtle volcanic caldera notch at summit
        const caldera = dist < 0.045 ? (0.045 - dist) * 260 : 0;
        y -= Math.pow(cone, 1.45) * cfg.amp * 1.85 - caldera;
        y += Math.sin(nx * 14 + phaseA) * 14;
      } else {
        y -=
          Math.sin(nx * Math.PI * (1.8 + idx * 0.6) + phaseA) * cfg.amp * 0.65 +
          Math.cos(nx * Math.PI * (3.7 + idx) + phaseB) * cfg.amp * 0.35;
      }
      ctx.lineTo(x, y);
    }
    ctx.lineTo(BASE_W + 20, BASE_H + 20);
    ctx.closePath();
    ctx.fillStyle = cfg.color;
    ctx.fill();

    // Rim gold atmospheric highlight along mountain crest
    ctx.strokeStyle = rgba(palette.secondary, 0.22 - idx * 0.05);
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Soft valley mist band
    const mistGrad = ctx.createLinearGradient(0, cfg.yBase - 40, 0, cfg.yBase + 130);
    mistGrad.addColorStop(0, rgba(palette.secondary, 0));
    mistGrad.addColorStop(0.45, rgba(palette.paperTint, cfg.mist));
    mistGrad.addColorStop(1, rgba(palette.bgTop, 0));
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, cfg.yBase - 40, BASE_W, 170);
    ctx.restore();
  }

  // Calm archipelago water reflection bands for island motif
  if (variant === 'island') {
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const y = 1045 + i * 24;
      const w = 160 + rng() * 380;
      const x = BASE_W * 0.5 - w * 0.5 + (rng() - 0.5) * 160;
      ctx.strokeStyle = rgba(palette.secondary, 0.16 * (1 - i / 18));
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawForestCanopy(ctx, rng, palette) {
  ctx.save();
  // Diagonal warm sunbeams through primeval forest
  for (let i = 0; i < 5; i++) {
    const x0 = 120 + i * 210 + (rng() - 0.5) * 60;
    const grad = ctx.createLinearGradient(x0, 0, x0 - 240, 1100);
    grad.addColorStop(0, rgba(palette.secondary, 0.14));
    grad.addColorStop(0.6, rgba(palette.secondary, 0.04));
    grad.addColorStop(1, rgba(palette.secondary, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 + 110, 0);
    ctx.lineTo(x0 - 160, 1150);
    ctx.lineTo(x0 - 300, 1150);
    ctx.closePath();
    ctx.fill();
  }

  // Subtle botanical frond silhouettes framing upper corners
  ctx.strokeStyle = rgba(palette.secondary, 0.14);
  ctx.fillStyle = rgba(palette.bgTop, 0.35);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side < 0 ? 0 : BASE_W, 240);
    ctx.scale(side, 1);
    for (let b = 0; b < 5; b++) {
      const len = 210 + b * 42;
      const ang = -0.35 + b * 0.28;
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -36, len, 0);
      ctx.quadraticCurveTo(len * 0.5, 36, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawBotanicalBlueprintGrid(ctx, palette) {
  ctx.save();
  // Fine archival herbarium grid
  ctx.strokeStyle = rgba(palette.secondary, 0.08);
  ctx.lineWidth = 1;
  for (let x = 64; x < BASE_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, BASE_H - 60);
    ctx.stroke();
  }
  for (let y = 64; y < BASE_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(BASE_W - 60, y);
    ctx.stroke();
  }

  // Architectural concentric specimen compass circles
  const cx = BASE_W * 0.5;
  const cy = 620;
  for (const r of [190, 290, 385, 455]) {
    ctx.strokeStyle = rgba(palette.secondary, r === 385 ? 0.22 : 0.11);
    ctx.lineWidth = r === 385 ? 1.6 : 1;
    ctx.setLineDash(r === 290 ? [6, 10] : []);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Fine radial measurement ticks
  ctx.strokeStyle = rgba(palette.secondary, 0.16);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 372 : 380;
    const r1 = 394;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoffeeBeltGraticule(ctx, palette) {
  ctx.save();
  const cx = BASE_W * 0.5;
  const cy = 620;

  // Tropical Coffee Belt horizontal glowing latitude band (23.5N - 23.5S)
  const beltGrad = ctx.createLinearGradient(0, cy - 165, 0, cy + 165);
  beltGrad.addColorStop(0, rgba(palette.secondary, 0));
  beltGrad.addColorStop(0.25, rgba(palette.secondary, 0.14));
  beltGrad.addColorStop(0.5, rgba(palette.accent, 0.16));
  beltGrad.addColorStop(0.75, rgba(palette.secondary, 0.14));
  beltGrad.addColorStop(1, rgba(palette.secondary, 0));
  ctx.fillStyle = beltGrad;
  ctx.fillRect(40, cy - 165, BASE_W - 80, 330);

  // Dashed tropics lines
  ctx.strokeStyle = rgba(palette.secondary, 0.28);
  ctx.lineWidth = 1.4;
  ctx.setLineDash([10, 8]);
  for (const dy of [-135, 0, 135]) {
    ctx.beginPath();
    ctx.moveTo(64, cy + dy);
    ctx.lineTo(BASE_W - 64, cy + dy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Curved meridian arcs
  ctx.strokeStyle = rgba(palette.secondary, 0.12);
  ctx.lineWidth = 1;
  for (let m = -3; m <= 3; m++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(m) * 115 + 40, 440, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoastCurveBackdrop(ctx, palette) {
  ctx.save();
  drawBotanicalBlueprintGrid(ctx, palette);
  // Sweeping thermal roast S-curve in background
  ctx.strokeStyle = rgba(palette.secondary, 0.25);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(80, 960);
  ctx.bezierCurveTo(280, 940, 440, 740, 620, 520);
  ctx.bezierCurveTo(740, 380, 860, 310, 960, 260);
  ctx.stroke();

  // Warm heat-halo gradient under curve
  const grad = ctx.createRadialGradient(540, 600, 40, 540, 600, 430);
  grad.addColorStop(0, rgba(palette.accent, 0.22));
  grad.addColorStop(0.6, rgba(palette.secondary, 0.08));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, BASE_W, BASE_H);
  ctx.restore();
}

function drawCopperplateHatching(ctx, palette, fast = false) {
  ctx.save();
  // 1. Delicate 19th-century botanical copperplate diagonal engraving lines
  const step = fast ? 28 : 15;
  ctx.lineWidth = 0.85;
  ctx.strokeStyle = rgba(palette.secondary, 0.048);
  ctx.beginPath();
  for (let d = -BASE_H; d < BASE_W + BASE_H; d += step) {
    ctx.moveTo(d, 0);
    ctx.lineTo(d + BASE_H * 0.62, BASE_H);
  }
  ctx.stroke();

  if (!fast) {
    // Subtle counter-hatching around outer vignette corners for archival intaglio depth
    ctx.save();
    ctx.strokeStyle = 'rgba(8, 5, 3, 0.14)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let d = -BASE_H; d < BASE_W + BASE_H; d += 22) {
      ctx.moveTo(d, BASE_H);
      ctx.lineTo(d + BASE_H * 0.52, 0);
    }
    ctx.stroke();
    ctx.restore();

    // Fine horizontal mezzotint tonal lines across lower horizon band
    ctx.strokeStyle = rgba(palette.secondary, 0.036);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let y = 780; y < 1240; y += 9) {
      ctx.moveTo(46, y);
      ctx.lineTo(BASE_W - 46, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawArchivalCelestialArcs(ctx, palette, cx = BASE_W * 0.5, cy = 595) {
  ctx.save();
  // Graceful astronomical meridian arcs framing the specimen window
  ctx.strokeStyle = rgba(palette.secondary, 0.15);
  ctx.lineWidth = 1.2;
  for (const r of [365, 428, 492]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.86, -Math.PI * 0.14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.14, Math.PI * 0.86);
    ctx.stroke();
  }

  // Swept longitude arcs intersecting top & bottom astrolabe poles
  ctx.strokeStyle = rgba(palette.secondary, 0.10);
  ctx.lineWidth = 1.0;
  for (const rx of [165, 320, 460]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, 510, 0, -Math.PI * 0.44, Math.PI * 0.44);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, 510, 0, Math.PI * 0.56, Math.PI * 1.44);
    ctx.stroke();
  }

  // Subtle brass crosshair hairlines + degree ticks along outer collector circle
  ctx.strokeStyle = rgba(palette.secondary, 0.14);
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(64, cy);
  ctx.lineTo(cx - 335, cy);
  ctx.moveTo(cx + 335, cy);
  ctx.lineTo(BASE_W - 64, cy);
  ctx.moveTo(cx, 136);
  ctx.lineTo(cx, cy - 335);
  ctx.moveTo(cx, cy + 335);
  ctx.lineTo(cx, 1020);
  ctx.stroke();

  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const major = i % 6 === 0;
    const r0 = major ? 416 : 422;
    const r1 = 428;
    ctx.strokeStyle = rgba(palette.secondary, major ? 0.24 : 0.10);
    ctx.lineWidth = major ? 1.4 : 0.9;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderBackgroundCanvas(card, options = {}) {
  const width = options.width || BASE_W;
  const height = options.height || BASE_H;
  const fast = Boolean(options.fast || width <= 480);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(width / BASE_W, height / BASE_H);

  const rng = mulberry32(hashString(`${card?.id || 'card'}:bg`));
  const palette = getPalette(card);
  const motif = String(card?.visual?.layers?.bgMotif || '').toLowerCase();
  const group = card?.group || '';

  // 1. Rich twilight atmospheric vertical gradient
  const baseGrad = ctx.createLinearGradient(0, 0, 0, BASE_H);
  baseGrad.addColorStop(0.0, palette.bgTop);
  baseGrad.addColorStop(0.42, mixHex(palette.bgTop, palette.bgBottom, 0.56));
  baseGrad.addColorStop(0.76, palette.bgBottom);
  baseGrad.addColorStop(1.0, '#0F0A08');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  // 2. Layered gallery spotlight + warm secondary accent glow behind focal center
  const halo = ctx.createRadialGradient(BASE_W * 0.5, 595, 22, BASE_W * 0.5, 595, 540);
  halo.addColorStop(0.0, rgba(palette.secondary, 0.42));
  halo.addColorStop(0.32, rgba(palette.primary, 0.30));
  halo.addColorStop(0.66, rgba(palette.accent, 0.14));
  halo.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  // Secondary warm upper-left museum directional key light
  const keyLight = ctx.createRadialGradient(BASE_W * 0.28, 320, 12, BASE_W * 0.34, 420, 480);
  keyLight.addColorStop(0.0, rgba(palette.paperTint, 0.10));
  keyLight.addColorStop(0.55, rgba(palette.secondary, 0.06));
  keyLight.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = keyLight;
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  // 3. Topographic contours (signature tactile terroir depth)
  drawTerrainContours(ctx, rng, palette, BASE_W * 0.5, 595, fast ? 6 : 12);

  // 3.5 Fine botanical copperplate cross-hatching & archival celestial arcs
  drawCopperplateHatching(ctx, palette, fast);
  drawArchivalCelestialArcs(ctx, palette, BASE_W * 0.5, 595);

  // 4. Motif-specific scenic/architectural backdrop
  if (motif.includes('volcano')) {
    drawMountainLayers(ctx, rng, palette, 'volcano');
  } else if (motif.includes('forest')) {
    drawForestCanopy(ctx, rng, palette);
    drawMountainLayers(ctx, rng, palette, 'highland');
  } else if (motif.includes('yunnan') || motif.includes('china')) {
    drawMountainLayers(ctx, rng, palette, 'yunnan');
  } else if (motif.includes('island') || motif.includes('pacific') || motif.includes('asia')) {
    drawMountainLayers(ctx, rng, palette, 'island');
  } else if (motif.includes('belt') || motif.includes('map') || motif.includes('migration') || group === 'origin') {
    drawCoffeeBeltGraticule(ctx, palette);
    drawMountainLayers(ctx, rng, palette, 'highland');
  } else if (motif.includes('roast') || motif.includes('curve') || motif.includes('process') || motif.includes('ferm')) {
    drawRoastCurveBackdrop(ctx, palette);
  } else if (motif.includes('brew') || motif.includes('atelier')) {
    drawBotanicalBlueprintGrid(ctx, palette);
    // Concentric golden pour-over spiral ripple rings
    ctx.save();
    ctx.strokeStyle = rgba(palette.secondary, 0.18);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let t = 0; t < 180; t++) {
      const a = t * 0.22;
      const r = 40 + t * 2.35;
      const x = BASE_W * 0.5 + Math.cos(a) * r;
      const y = 595 + Math.sin(a) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  } else if (motif.includes('botanical') || motif.includes('grid') || motif.includes('wheel') || group === 'species' || group === 'variety' || group === 'craft_tasting') {
    drawBotanicalBlueprintGrid(ctx, palette);
  } else {
    drawMountainLayers(ctx, rng, palette, 'highland');
  }

  // 5. Fine constellation & archival handmade paper speckles
  const starCount = fast ? 38 : 130;
  for (let i = 0; i < starCount; i++) {
    const sx = rng() * BASE_W;
    const sy = rng() * 1020;
    const sr = 0.6 + rng() * 1.9;
    ctx.fillStyle = rgba(palette.paperTint, 0.08 + rng() * 0.24);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!fast) {
    // Organic handmade-paper linen fibers & delicate archival paper grain flecks
    ctx.lineWidth = 0.85;
    for (let i = 0; i < 240; i++) {
      const fx = rng() * BASE_W;
      const fy = rng() * BASE_H;
      const fl = 8 + rng() * 24;
      const fa = rng() * Math.PI * 2;
      ctx.strokeStyle =
        i % 3 === 0
          ? rgba('#0B0705', 0.10 + rng() * 0.08)
          : rgba(palette.paperTint, 0.032 + rng() * 0.038);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(fa) * fl, fy + Math.sin(fa) * fl);
      ctx.stroke();
    }
    for (let i = 0; i < 320; i++) {
      const gx = rng() * BASE_W;
      const gy = rng() * BASE_H;
      ctx.fillStyle =
        i % 2 === 0
          ? rgba(palette.secondary, 0.045 + rng() * 0.04)
          : 'rgba(10, 6, 4, 0.09)';
      ctx.fillRect(gx, gy, 1.8, 1.8);
    }
  }

  // 6. Deep museum vignette framing edges cleanly
  const vig = ctx.createRadialGradient(BASE_W * 0.5, BASE_H * 0.45, 250, BASE_W * 0.5, BASE_H * 0.5, 920);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(0.72, 'rgba(9, 6, 4, 0.28)');
  vig.addColorStop(1, 'rgba(6, 4, 3, 0.72)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  ctx.restore();
  return canvas;
}

// ============================================================================
// LAYER 1 (SUBJECT RGBA) + LAYER 3 (WHITE-GROUND CO-REGISTERED LINEART)
// ============================================================================

function drawGildedMedallion(s, l, cx, cy, r, palette, style = 'astrolabe') {
  s.save();

  // 1. Dual-layer luminous atmospheric aura behind the specimen medallion
  const outerAura = s.createRadialGradient(cx, cy, r * 0.72, cx, cy, r * 1.32);
  outerAura.addColorStop(0.0, rgba(palette.secondary, 0.28));
  outerAura.addColorStop(0.42, rgba(palette.accent, 0.16));
  outerAura.addColorStop(0.75, rgba(palette.primary, 0.08));
  outerAura.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  s.fillStyle = outerAura;
  s.beginPath();
  s.arc(cx, cy, r * 1.32, 0, Math.PI * 2);
  s.fill();

  const innerHalo = s.createRadialGradient(cx, cy - r * 0.16, r * 0.12, cx, cy, r * 1.04);
  innerHalo.addColorStop(0.0, rgba(palette.paperTint, 0.16));
  innerHalo.addColorStop(0.50, rgba(palette.secondary, 0.18));
  innerHalo.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  s.fillStyle = innerHalo;
  s.beginPath();
  s.arc(cx, cy, r * 1.04, 0, Math.PI * 2);
  s.fill();

  // 2. Sculpted dimensional medallion disc with studio key-light & bottom-right occlusion
  s.save();
  s.shadowColor = 'rgba(4, 2, 1, 0.56)';
  s.shadowBlur = 34;
  s.shadowOffsetY = 14;
  const disc = s.createRadialGradient(cx - r * 0.28, cy - r * 0.30, r * 0.06, cx, cy, r * 1.02);
  disc.addColorStop(0.0, rgba(palette.paperTint, 0.26));
  disc.addColorStop(0.28, rgba(palette.secondary, 0.28));
  disc.addColorStop(0.66, rgba(palette.primary, 0.52));
  disc.addColorStop(0.92, rgba(palette.bgTop, 0.68));
  disc.addColorStop(1.0, rgba('#080504', 0.74));
  s.fillStyle = disc;
  s.beginPath();
  s.arc(cx, cy, r, 0, Math.PI * 2);
  s.fill();
  s.restore();

  // 3. Clipped copperplate fine inner shading arcs & upper-left micro-3D specular crescent
  s.save();
  s.beginPath();
  s.arc(cx, cy, r - 4, 0, Math.PI * 2);
  s.clip();

  // Fine copperplate shadow hatching along lower-right rim inside medallion
  s.strokeStyle = 'rgba(8, 5, 3, 0.20)';
  s.lineWidth = 1.1;
  for (let i = -r; i <= r; i += 14) {
    s.beginPath();
    s.moveTo(cx + i - 24, cy + r * 0.15);
    s.lineTo(cx + i + 120, cy + r * 1.15);
    s.stroke();
  }

  // Luminous upper-left studio sheen inside medallion
  const domeSheen = s.createRadialGradient(
    cx - r * 0.34,
    cy - r * 0.36,
    r * 0.04,
    cx - r * 0.24,
    cy - r * 0.26,
    r * 0.72,
  );
  domeSheen.addColorStop(0.0, 'rgba(255, 248, 232, 0.22)');
  domeSheen.addColorStop(0.45, rgba(palette.secondary, 0.10));
  domeSheen.addColorStop(1.0, 'rgba(255, 248, 232, 0)');
  s.fillStyle = domeSheen;
  s.fillRect(cx - r, cy - r, r * 2, r * 2);
  s.restore();

  // 4. Concentric embossed brass rings (triple museum rim)
  const rimGrad = s.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  rimGrad.addColorStop(0.0, '#FFF1CC');
  rimGrad.addColorStop(0.32, palette.secondary);
  rimGrad.addColorStop(0.68, mixHex(palette.secondary, '#5E3B16', 0.48));
  rimGrad.addColorStop(1.0, '#F6DA9A');

  s.strokeStyle = rimGrad;
  s.lineWidth = 4.2;
  s.beginPath();
  s.arc(cx, cy, r, 0, Math.PI * 2);
  s.stroke();

  s.strokeStyle = rgba(palette.secondary, 0.56);
  s.lineWidth = 1.5;
  s.beginPath();
  s.arc(cx, cy, r - 16, 0, Math.PI * 2);
  s.stroke();

  s.strokeStyle = rgba(palette.secondary, 0.28);
  s.lineWidth = 1.0;
  s.beginPath();
  s.arc(cx, cy, r + 14, 0, Math.PI * 2);
  s.stroke();

  // Co-registered engraving lines in lineart canvas
  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 3.6;
  l.beginPath();
  l.arc(cx, cy, r, 0, Math.PI * 2);
  l.stroke();
  l.lineWidth = 1.6;
  l.beginPath();
  l.arc(cx, cy, r - 16, 0, Math.PI * 2);
  l.stroke();
  l.lineWidth = 1.2;
  l.beginPath();
  l.arc(cx, cy, r + 14, 0, Math.PI * 2);
  l.stroke();

  if (style === 'astrolabe' || style === 'crest') {
    const tickCount = 48;
    for (let i = 0; i < tickCount; i++) {
      const a = (i / tickCount) * Math.PI * 2;
      const major = i % 6 === 0;
      const r0 = major ? r - 16 : r - 8;
      const x0 = cx + Math.cos(a) * r0;
      const y0 = cy + Math.sin(a) * r0;
      const x1 = cx + Math.cos(a) * r;
      const y1 = cy + Math.sin(a) * r;

      s.strokeStyle = rgba(palette.secondary, major ? 0.90 : 0.46);
      s.lineWidth = major ? 2.4 : 1.1;
      s.beginPath();
      s.moveTo(x0, y0);
      s.lineTo(x1, y1);
      s.stroke();

      if (major) {
        l.lineWidth = 2.1;
        l.beginPath();
        l.moveTo(x0, y0);
        l.lineTo(x1, y1);
        l.stroke();
      }
    }

    // 4 cardinal diamond finials + 4 intercardinal brass beads
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const dx = cx + Math.cos(a) * (r + 14);
      const dy = cy + Math.sin(a) * (r + 14);
      if (i % 2 === 0) {
        s.fillStyle = '#FFE8AE';
        drawDiamond(s, dx, dy, 9, 9);
        s.fill();
        s.strokeStyle = rgba('#5C3A16', 0.65);
        s.lineWidth = 1.2;
        s.stroke();
        l.fillStyle = '#121212';
        drawDiamond(l, dx, dy, 9, 9);
        l.fill();
      } else {
        s.fillStyle = rgba(palette.secondary, 0.85);
        s.beginPath();
        s.arc(dx, dy, 4.2, 0, Math.PI * 2);
        s.fill();
        l.fillStyle = '#121212';
        l.beginPath();
        l.arc(dx, dy, 4.2, 0, Math.PI * 2);
        l.fill();
      }
    }
  }

  if (style === 'diamond_crest') {
    s.strokeStyle = rgba(palette.secondary, 0.78);
    s.lineWidth = 2.8;
    drawDiamond(s, cx, cy, r * 1.08, r * 1.16);
    s.stroke();
    l.lineWidth = 2.6;
    drawDiamond(l, cx, cy, r * 1.08, r * 1.16);
    l.stroke();
  }

  l.restore();
  s.restore();
}

function drawCoffeeLeaf(s, l, x, y, len, wid, angle, darkCol, lightCol, veinCol) {
  const traceLeaf = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.28, -wid, len * 0.76, -wid * 0.82, len, 0);
    ctx.bezierCurveTo(len * 0.76, wid * 0.82, len * 0.28, wid, 0, 0);
    ctx.closePath();
  };

  s.save();
  s.translate(x, y);
  s.rotate(angle);
  s.shadowColor = 'rgba(4, 2, 1, 0.44)';
  s.shadowBlur = 16;
  s.shadowOffsetY = 8;
  const grad = s.createLinearGradient(0, -wid, len, wid);
  grad.addColorStop(0, darkCol);
  grad.addColorStop(0.50, lightCol);
  grad.addColorStop(1, darkCol);
  s.fillStyle = grad;
  traceLeaf(s);
  s.fill();
  s.shadowColor = 'transparent';

  // Upper half glossy botanical sheen + lower lobe copperplate shadow shading
  s.save();
  traceLeaf(s);
  s.clip();
  s.fillStyle = 'rgba(255, 248, 232, 0.19)';
  s.beginPath();
  s.moveTo(0, 0);
  s.bezierCurveTo(len * 0.28, -wid, len * 0.76, -wid * 0.82, len, 0);
  s.closePath();
  s.fill();

  s.fillStyle = 'rgba(8, 5, 3, 0.22)';
  s.beginPath();
  s.moveTo(0, 0);
  s.bezierCurveTo(len * 0.28, wid, len * 0.76, wid * 0.82, len, 0);
  s.closePath();
  s.fill();
  s.restore();

  s.strokeStyle = rgba(veinCol, 0.75);
  s.lineWidth = 2.0;
  traceLeaf(s);
  s.stroke();

  // Midrib & lateral veins
  const drawVeins = (ctx, lw) => {
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(len * 0.52, -wid * 0.05, len * 0.94, 0);
    ctx.stroke();

    ctx.lineWidth = lw * 0.72;
    for (let i = 1; i <= 5; i++) {
      const t = i / 6.2;
      const vx = len * t;
      const spread = Math.sin(t * Math.PI) * wid * 0.72;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + len * 0.09, -spread * 0.65, vx + len * 0.14, -spread);
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + len * 0.09, spread * 0.65, vx + len * 0.14, spread);
      ctx.stroke();
    }
  };

  s.strokeStyle = rgba(veinCol, 0.65);
  drawVeins(s, 2.0);
  s.restore();

  // Exact co-registered engraving on lineart canvas
  l.save();
  l.translate(x, y);
  l.rotate(angle);
  l.strokeStyle = '#121212';
  l.lineWidth = 2.4;
  traceLeaf(l);
  l.stroke();
  drawVeins(l, 2.0);
  l.restore();
}

function drawCoffeeCherry(s, l, x, y, r, baseColor, rimColor = '#FFD49B') {
  s.save();
  s.shadowColor = 'rgba(0, 0, 0, 0.45)';
  s.shadowBlur = 14;
  s.shadowOffsetY = 6;

  const grad = s.createRadialGradient(x - r * 0.34, y - r * 0.34, r * 0.1, x, y, r * 1.05);
  grad.addColorStop(0, mixHex(baseColor, '#FFF4E0', 0.48));
  grad.addColorStop(0.42, baseColor);
  grad.addColorStop(0.85, mixHex(baseColor, '#1A080C', 0.52));
  grad.addColorStop(1, mixHex(baseColor, rimColor, 0.25));

  s.fillStyle = grad;
  s.beginPath();
  s.ellipse(x, y, r, r * 1.06, 0.12, 0, Math.PI * 2);
  s.fill();
  s.shadowColor = 'transparent';

  // Glossy specular crescent
  s.fillStyle = 'rgba(255, 250, 240, 0.56)';
  s.beginPath();
  s.ellipse(x - r * 0.32, y - r * 0.34, r * 0.26, r * 0.14, -0.55, 0, Math.PI * 2);
  s.fill();

  // Calyx dimple crown
  s.fillStyle = 'rgba(40, 14, 10, 0.55)';
  s.beginPath();
  s.arc(x + r * 0.16, y + r * 0.72, r * 0.13, 0, Math.PI * 2);
  s.fill();

  s.strokeStyle = rgba(rimColor, 0.58);
  s.lineWidth = 1.8;
  s.beginPath();
  s.ellipse(x, y, r, r * 1.06, 0.12, 0, Math.PI * 2);
  s.stroke();
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 2.4;
  l.beginPath();
  l.ellipse(x, y, r, r * 1.06, 0.12, 0, Math.PI * 2);
  l.stroke();
  l.beginPath();
  l.arc(x - r * 0.25, y - r * 0.25, r * 0.28, -2.6, -1.2);
  l.stroke();
  l.restore();
}

function drawCoffeeBlossom(s, l, x, y, r, rot = 0, petalColor = '#FBF6EE', goldColor = '#E6B85C') {
  const drawPetals = (ctx, isLine) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.28, -r * 0.32, -r * 0.22, -r * 0.88, 0, -r);
      ctx.bezierCurveTo(r * 0.22, -r * 0.88, r * 0.28, -r * 0.32, 0, 0);
      ctx.closePath();
      if (!isLine) {
        const g = ctx.createLinearGradient(0, 0, 0, -r);
        g.addColorStop(0, mixHex(petalColor, goldColor, 0.25));
        g.addColorStop(0.5, petalColor);
        g.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = rgba(goldColor, 0.55);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#121212';
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Golden stamen cluster
    if (!isLine) {
      ctx.fillStyle = goldColor;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 + 0.3;
        ctx.strokeStyle = rgba(goldColor, 0.85);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.34, Math.sin(a) * r * 0.34);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawPetals(s, false);
  drawPetals(l, true);
}

function drawSculptedCoffeeBean(s, l, cx, cy, rx, ry, angle, opts = {}) {
  const roastHex = opts.roastHex || '#6B3E24';
  const rimGold = opts.rimGold || '#E2BA74';
  const creaseStyle = opts.creaseStyle || 'S'; // 'S' | 'straight' | 'asymmetric' | 'pointed'

  const traceOutline = (ctx) => {
    ctx.beginPath();
    if (creaseStyle === 'pointed') {
      // Laurina / pointed Bourbon silhouette
      ctx.moveTo(0, -ry * 1.12);
      ctx.bezierCurveTo(rx * 1.05, -ry * 0.55, rx * 1.05, ry * 0.55, 0, ry * 1.12);
      ctx.bezierCurveTo(-rx * 1.05, ry * 0.55, -rx * 1.05, -ry * 0.55, 0, -ry * 1.12);
    } else if (creaseStyle === 'asymmetric') {
      // Liberica / Excelsa asymmetric almond hook
      ctx.moveTo(0, -ry * 1.08);
      ctx.bezierCurveTo(rx * 1.18, -ry * 0.65, rx * 1.04, ry * 0.72, rx * 0.12, ry * 1.06);
      ctx.bezierCurveTo(-rx * 0.96, ry * 0.85, -rx * 1.12, -ry * 0.32, 0, -ry * 1.08);
    } else {
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    }
    ctx.closePath();
  };

  const traceCrease = (ctx) => {
    ctx.beginPath();
    if (creaseStyle === 'straight') {
      // Robusta characteristic straight center cut
      ctx.moveTo(0, -ry * 0.84);
      ctx.lineTo(0, ry * 0.84);
    } else if (creaseStyle === 'asymmetric') {
      ctx.moveTo(-rx * 0.08, -ry * 0.86);
      ctx.bezierCurveTo(rx * 0.28, -ry * 0.30, -rx * 0.22, ry * 0.34, rx * 0.08, ry * 0.86);
    } else {
      // Classic Arabica graceful S-shaped center cut
      ctx.moveTo(-rx * 0.06, -ry * 0.86);
      ctx.bezierCurveTo(rx * 0.34, -ry * 0.32, -rx * 0.34, ry * 0.32, rx * 0.06, ry * 0.86);
    }
  };

  s.save();
  s.translate(cx, cy);
  s.rotate(angle);
  s.shadowColor = 'rgba(0, 0, 0, 0.52)';
  s.shadowBlur = 24;
  s.shadowOffsetY = 12;

  const grad = s.createRadialGradient(-rx * 0.32, -ry * 0.28, rx * 0.08, 0, 0, Math.max(rx, ry) * 1.15);
  grad.addColorStop(0.0, mixHex(roastHex, '#FFE4BE', 0.34));
  grad.addColorStop(0.45, roastHex);
  grad.addColorStop(0.86, mixHex(roastHex, '#120906', 0.62));
  grad.addColorStop(1.0, mixHex(roastHex, rimGold, 0.28));

  s.fillStyle = grad;
  traceOutline(s);
  s.fill();
  s.shadowColor = 'transparent';

  // Center cleft shadow + golden chaff gleam
  s.strokeStyle = 'rgba(12, 6, 4, 0.84)';
  s.lineWidth = Math.max(4, rx * 0.11);
  s.lineCap = 'round';
  traceCrease(s);
  s.stroke();

  s.strokeStyle = rgba(rimGold, 0.62);
  s.lineWidth = Math.max(1.5, rx * 0.032);
  traceCrease(s);
  s.stroke();

  // Outer metallic bevel outline
  s.strokeStyle = rgba(rimGold, 0.72);
  s.lineWidth = 2.6;
  traceOutline(s);
  s.stroke();

  // Soft dome specular highlight + fine copperplate botanical hatching along lower shade
  s.save();
  traceOutline(s);
  s.clip();
  s.fillStyle = 'rgba(255, 244, 224, 0.21)';
  s.beginPath();
  s.ellipse(-rx * 0.36, -ry * 0.20, rx * 0.24, ry * 0.44, -0.15, 0, Math.PI * 2);
  s.fill();

  s.strokeStyle = 'rgba(14, 6, 3, 0.24)';
  s.lineWidth = 1.4;
  for (let i = -3; i <= 5; i++) {
    s.beginPath();
    s.moveTo(rx * 0.16, -ry * 0.65 + i * ry * 0.22);
    s.quadraticCurveTo(rx * 0.65, -ry * 0.55 + i * ry * 0.22, rx * 0.96, -ry * 0.35 + i * ry * 0.22);
    s.stroke();
  }
  s.restore();

  // Warm metallic bounce rim along lower-right curve
  s.strokeStyle = rgba('#FFE7B8', 0.48);
  s.lineWidth = 1.8;
  s.beginPath();
  s.arc(0, 0, Math.min(rx, ry) * 0.92, 0.25, 1.35);
  s.stroke();
  s.restore();

  // Co-registered engraving lines
  l.save();
  l.translate(cx, cy);
  l.rotate(angle);
  l.strokeStyle = '#121212';
  l.lineWidth = 3.2;
  traceOutline(l);
  l.stroke();
  l.lineWidth = 3.6;
  l.lineCap = 'round';
  traceCrease(l);
  l.stroke();
  l.restore();
}

function drawBotanicalBranchBase(s, l, palette, cherryColor, leafDark, leafLight, { blossomCount = 4, cherryCount = 7, rng }) {
  const cx = BASE_W * 0.5;
  const cy = 600;

  // Main arched woody coffee bough
  const traceStem = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 260, cy + 250);
    ctx.bezierCurveTo(cx - 120, cy + 80, cx + 20, cy - 80, cx + 220, cy - 235);
  };
  const traceSubStem = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 85, cy + 55);
    ctx.bezierCurveTo(cx - 165, cy - 25, cx - 210, cy - 115, cx - 235, cy - 195);
  };

  s.save();
  s.strokeStyle = mixHex('#5A3822', palette.secondary, 0.32);
  s.lineWidth = 10;
  s.lineCap = 'round';
  traceStem(s);
  s.stroke();
  s.lineWidth = 6.5;
  traceSubStem(s);
  s.stroke();
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 4.5;
  l.lineCap = 'round';
  traceStem(l);
  l.stroke();
  l.lineWidth = 3.2;
  traceSubStem(l);
  l.stroke();
  l.restore();

  // Sculpted veined coffee leaves alternating along branches
  const leaves = [
    { x: cx - 195, y: cy + 170, len: 185, wid: 54, a: -2.55 },
    { x: cx - 150, y: cy + 125, len: 175, wid: 50, a: 0.35 },
    { x: cx - 95, y: cy + 55, len: 210, wid: 60, a: -2.85 },
    { x: cx - 15, y: cy - 30, len: 215, wid: 62, a: 0.25 },
    { x: cx + 65, y: cy - 105, len: 195, wid: 56, a: -2.25 },
    { x: cx + 130, y: cy - 165, len: 175, wid: 50, a: 0.12 },
    { x: cx - 170, y: cy - 65, len: 165, wid: 48, a: -1.95 },
    { x: cx - 195, y: cy - 135, len: 155, wid: 44, a: -2.95 },
  ];
  for (const lf of leaves) {
    drawCoffeeLeaf(s, l, lf.x, lf.y, lf.len, lf.wid, lf.a, leafDark, leafLight, palette.secondary);
  }

  // Plump clustered coffee cherries along the nodes
  const cherrySlots = [
    { x: cx - 110, y: cy + 95, r: 28 },
    { x: cx - 68, y: cy + 112, r: 25 },
    { x: cx - 35, y: cy + 15, r: 30 },
    { x: cx + 12, y: cy + 32, r: 27 },
    { x: cx + 48, y: cy - 42, r: 29 },
    { x: cx + 92, y: cy - 28, r: 24 },
    { x: cx - 132, y: cy - 15, r: 25 },
    { x: cx + 145, y: cy - 115, r: 23 },
  ];
  for (let i = 0; i < Math.min(cherryCount, cherrySlots.length); i++) {
    const ch = cherrySlots[i];
    drawCoffeeCherry(s, l, ch.x, ch.y, ch.r, cherryColor, palette.secondary);
  }

  // White star coffee blossoms
  const blossomSlots = [
    { x: cx + 195, y: cy - 210, r: 52, rot: 0.2 },
    { x: cx - 220, y: cy - 175, r: 44, rot: 0.8 },
    { x: cx + 22, y: cy - 150, r: 46, rot: 0.45 },
    { x: cx - 165, y: cy + 45, r: 38, rot: 1.1 },
    { x: cx + 125, y: cy + 62, r: 40, rot: -0.3 },
  ];
  for (let i = 0; i < Math.min(blossomCount, blossomSlots.length); i++) {
    const bl = blossomSlots[i];
    drawCoffeeBlossom(s, l, bl.x, bl.y, bl.r, bl.rot + (rng ? rng() * 0.2 : 0), '#FBF6EE', palette.secondary);
  }
}

// --- Specific Bespoke Hero & Knowledge Subjects ---

function drawEsmeraldaCrestSubject(s, l, palette, rng) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  drawGildedMedallion(s, l, cx, cy, 310, palette, 'diamond_crest');

  // Sculpted Emerald Barú Volcano emblem inside medallion
  s.save();
  const vGrad = s.createLinearGradient(cx, cy - 190, cx, cy + 160);
  vGrad.addColorStop(0, '#249872');
  vGrad.addColorStop(0.55, '#0F5C42');
  vGrad.addColorStop(1, '#072C20');
  s.fillStyle = vGrad;
  s.beginPath();
  s.moveTo(cx - 215, cy + 145);
  s.lineTo(cx - 42, cy - 135);
  s.lineTo(cx, cy - 115);
  s.lineTo(cx + 42, cy - 138);
  s.lineTo(cx + 215, cy + 145);
  s.closePath();
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3;
  s.stroke();

  // Golden cloud ribbons drifting over summit
  for (const [yOff, span] of [[-48, 170], [18, 220]]) {
    s.strokeStyle = rgba(palette.secondary, 0.72);
    s.lineWidth = 2.4;
    s.beginPath();
    s.moveTo(cx - span, cy + yOff);
    s.bezierCurveTo(cx - span * 0.4, cy + yOff - 28, cx + span * 0.4, cy + yOff + 28, cx + span, cy + yOff);
    s.stroke();
  }
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 3;
  l.beginPath();
  l.moveTo(cx - 215, cy + 145);
  l.lineTo(cx - 42, cy - 135);
  l.lineTo(cx, cy - 115);
  l.lineTo(cx + 42, cy - 138);
  l.lineTo(cx + 215, cy + 145);
  l.closePath();
  l.stroke();
  l.restore();

  // Geisha botanical bough with roses/blossoms & ruby cherries arching across the crest
  drawBotanicalBranchBase(s, l, palette, '#C93855', '#0E4C37', '#278765', {
    blossomCount: 5,
    cherryCount: 6,
    rng,
  });

  // Emerald crown diamond at top apex
  s.save();
  const emGrad = s.createLinearGradient(cx - 32, cy - 355, cx + 32, cy - 270);
  emGrad.addColorStop(0, '#7CF0C2');
  emGrad.addColorStop(0.5, '#198E66');
  emGrad.addColorStop(1, '#0A4431');
  s.fillStyle = emGrad;
  drawDiamond(s, cx, cy - 312, 34, 46);
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3;
  s.stroke();
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 2.8;
  drawDiamond(l, cx, cy - 312, 34, 46);
  l.stroke();
  l.restore();
}

function drawRumOakBarrelSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 605;
  drawGildedMedallion(s, l, cx, cy, 315, palette, 'astrolabe');

  const bw = 205;
  const bh = 250;

  const traceBarrel = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - bw * 0.72, cy - bh);
    ctx.quadraticCurveTo(cx, cy - bh - 26, cx + bw * 0.72, cy - bh);
    ctx.bezierCurveTo(cx + bw * 1.12, cy - bh * 0.42, cx + bw * 1.12, cy + bh * 0.42, cx + bw * 0.72, cy + bh);
    ctx.quadraticCurveTo(cx, cy + bh + 28, cx - bw * 0.72, cy + bh);
    ctx.bezierCurveTo(cx - bw * 1.12, cy + bh * 0.42, cx - bw * 1.12, cy - bh * 0.42, cx - bw * 0.72, cy - bh);
    ctx.closePath();
  };

  s.save();
  s.shadowColor = 'rgba(0, 0, 0, 0.58)';
  s.shadowBlur = 32;
  s.shadowOffsetY = 18;
  const oakGrad = s.createLinearGradient(cx - bw, cy, cx + bw, cy);
  oakGrad.addColorStop(0.0, '#2B140C');
  oakGrad.addColorStop(0.24, '#6A361B');
  oakGrad.addColorStop(0.48, '#96562C');
  oakGrad.addColorStop(0.76, '#582B14');
  oakGrad.addColorStop(1.0, '#241009');
  s.fillStyle = oakGrad;
  traceBarrel(s);
  s.fill();
  s.shadowColor = 'transparent';

  // Vertical curved oak staves
  s.save();
  traceBarrel(s);
  s.clip();
  for (let i = -4; i <= 4; i++) {
    const xTop = cx + i * 36;
    const xMid = cx + i * 48;
    s.strokeStyle = 'rgba(26, 10, 5, 0.55)';
    s.lineWidth = 2.6;
    s.beginPath();
    ctxCurveStave(s, xTop, xMid, cy, bh);
    s.stroke();
    s.strokeStyle = 'rgba(230, 172, 104, 0.14)';
    s.lineWidth = 1.2;
    s.beginPath();
    ctxCurveStave(s, xTop + 3, xMid + 3, cy, bh);
    s.stroke();
  }
  s.restore();

  // Four riveted champagne-gold iron hoops
  const hoopYs = [-175, -72, 72, 175];
  for (const hy of hoopYs) {
    const bulge = 1 - Math.abs(hy / bh) * 0.23;
    const hw = bw * 0.99 * bulge;
    const hoopGrad = s.createLinearGradient(cx - hw, cy + hy, cx + hw, cy + hy);
    hoopGrad.addColorStop(0, '#6B491F');
    hoopGrad.addColorStop(0.32, '#E8C276');
    hoopGrad.addColorStop(0.55, '#FFF0C2');
    hoopGrad.addColorStop(0.8, '#B8843B');
    hoopGrad.addColorStop(1, '#5A3B17');
    s.strokeStyle = hoopGrad;
    s.lineWidth = 22;
    s.beginPath();
    s.moveTo(cx - hw, cy + hy);
    s.quadraticCurveTo(cx, cy + hy + 26, cx + hw, cy + hy);
    s.stroke();

    // Brass rivets along each hoop
    for (let r = -3; r <= 3; r++) {
      const t = (r + 3.5) / 7;
      const rx = cx - hw + hw * 2 * t;
      const ry = cy + hy + Math.sin(t * Math.PI) * 13;
      s.fillStyle = '#FFF2C8';
      s.beginPath();
      s.arc(rx, ry, 4.2, 0, Math.PI * 2);
      s.fill();
    }
  }

  // Barrel outer gilded bevel
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3;
  traceBarrel(s);
  s.stroke();

  // Amber bung seal & glowing rum drop medallion in center
  const bung = s.createRadialGradient(cx, cy - 6, 4, cx, cy, 38);
  bung.addColorStop(0, '#FFE4A0');
  bung.addColorStop(0.5, '#D48A32');
  bung.addColorStop(1, '#6C2228');
  s.fillStyle = bung;
  s.beginPath();
  s.arc(cx, cy, 38, 0, Math.PI * 2);
  s.fill();
  s.strokeStyle = '#F7D794';
  s.lineWidth = 3;
  s.stroke();
  s.restore();

  // Co-registered lineart for barrel, staves & hoops
  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 3.4;
  traceBarrel(l);
  l.stroke();
  for (let i = -3; i <= 3; i++) {
    l.lineWidth = 1.6;
    l.beginPath();
    ctxCurveStave(l, cx + i * 36, cx + i * 48, cy, bh);
    l.stroke();
  }
  for (const hy of hoopYs) {
    const bulge = 1 - Math.abs(hy / bh) * 0.23;
    const hw = bw * 0.99 * bulge;
    l.lineWidth = 3;
    l.beginPath();
    l.moveTo(cx - hw, cy + hy - 10);
    l.quadraticCurveTo(cx, cy + hy + 16, cx + hw, cy + hy - 10);
    l.moveTo(cx - hw, cy + hy + 10);
    l.quadraticCurveTo(cx, cy + hy + 36, cx + hw, cy + hy + 10);
    l.stroke();
  }
  l.beginPath();
  l.arc(cx, cy, 38, 0, Math.PI * 2);
  l.stroke();
  l.restore();

  // Orbiting ruby red cherries & roasted beans around base
  drawCoffeeCherry(s, l, cx - 220, cy + 165, 32, '#C0394D', palette.secondary);
  drawCoffeeCherry(s, l, cx - 170, cy + 205, 27, '#A6283C', palette.secondary);
  drawSculptedCoffeeBean(s, l, cx + 205, cy + 175, 44, 62, 0.42, { roastHex: '#59331E', rimGold: palette.secondary });
  drawSculptedCoffeeBean(s, l, cx + 150, cy + 225, 34, 48, -0.35, { roastHex: '#6E4025', rimGold: palette.secondary });
}

function ctxCurveStave(ctx, xTop, xMid, cy, bh) {
  ctx.moveTo(xTop, cy - bh - 12);
  ctx.quadraticCurveTo(xMid, cy, xTop, cy + bh + 12);
}

function drawBaishanColdSpringSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  drawGildedMedallion(s, l, cx, cy, 308, palette, 'astrolabe');

  // Faceted crystalline glacial peak diamond
  const drawFacet = (pts, fill) => {
    s.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
    s.closePath();
    s.fillStyle = fill;
    s.fill();
    s.strokeStyle = 'rgba(220, 240, 250, 0.65)';
    s.lineWidth = 2;
    s.stroke();

    l.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? l.moveTo(x, y) : l.lineTo(x, y)));
    l.closePath();
    l.strokeStyle = '#121212';
    l.lineWidth = 2.6;
    l.stroke();
  };

  s.save();
  l.save();
  drawFacet([[cx, cy - 235], [cx - 175, cy + 45], [cx, cy + 10]], '#3E7C94');
  drawFacet([[cx, cy - 235], [cx + 175, cy + 45], [cx, cy + 10]], '#89C4D8');
  drawFacet([[cx, cy + 10], [cx - 175, cy + 45], [cx, cy + 215]], '#1C4457');
  drawFacet([[cx, cy + 10], [cx + 175, cy + 45], [cx, cy + 215]], '#2D6178');
  drawFacet([[cx, cy - 235], [cx - 72, cy - 30], [cx, cy + 10]], '#B8E4F2');
  drawFacet([[cx, cy - 235], [cx + 72, cy - 30], [cx, cy + 10]], '#E8F7FC');

  // Concentric cold-spring water ripples beneath crystal
  for (let i = 0; i < 4; i++) {
    const rx = 120 + i * 52;
    const ry = 28 + i * 12;
    s.strokeStyle = rgba('#BFE8F7', 0.55 - i * 0.11);
    s.lineWidth = 2.2;
    s.beginPath();
    s.ellipse(cx, cy + 175, rx, ry, 0, 0, Math.PI * 2);
    s.stroke();

    l.strokeStyle = '#121212';
    l.lineWidth = 1.8;
    l.beginPath();
    l.ellipse(cx, cy + 175, rx, ry, 0, 0, Math.PI * 2);
    l.stroke();
  }
  l.restore();
  s.restore();

  // Chamomile blossoms & crisp cyan-silver leaves
  drawCoffeeLeaf(s, l, cx - 220, cy + 65, 165, 44, -2.5, '#1D4B5C', '#5CA0B5', '#D6EEF7');
  drawCoffeeLeaf(s, l, cx + 220, cy + 65, 165, 44, -0.65, '#1D4B5C', '#5CA0B5', '#D6EEF7');
  drawCoffeeBlossom(s, l, cx - 155, cy - 120, 48, 0.25, '#FFFFFF', '#F2CA50');
  drawCoffeeBlossom(s, l, cx + 160, cy - 95, 44, 0.9, '#FFFFFF', '#F2CA50');
  drawCoffeeBlossom(s, l, cx, cy + 115, 52, 0.5, '#FFFDF5', '#F2CA50');
}

function drawDessertCofermSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 605;
  drawGildedMedallion(s, l, cx, cy, 310, palette, 'astrolabe');

  // Artisanal fluted tasting goblet / coupe silhouette
  const traceCoupe = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 175, cy - 75);
    ctx.bezierCurveTo(cx - 170, cy + 65, cx - 65, cy + 95, cx - 14, cy + 108);
    ctx.lineTo(cx - 12, cy + 210);
    ctx.lineTo(cx - 92, cy + 235);
    ctx.lineTo(cx + 92, cy + 235);
    ctx.lineTo(cx + 12, cy + 210);
    ctx.lineTo(cx + 14, cy + 108);
    ctx.bezierCurveTo(cx + 65, cy + 95, cx + 170, cy + 65, cx + 175, cy - 75);
    ctx.closePath();
  };

  s.save();
  const bowlGrad = s.createLinearGradient(cx - 175, cy - 75, cx + 175, cy + 105);
  bowlGrad.addColorStop(0, '#D96482');
  bowlGrad.addColorStop(0.45, '#F6C2C9');
  bowlGrad.addColorStop(0.75, '#C84768');
  bowlGrad.addColorStop(1, '#6E1E36');
  s.fillStyle = bowlGrad;
  traceCoupe(s);
  s.fill();

  // Golden rim ellipse + swirled rose-vanilla crema
  const rimGrad = s.createRadialGradient(cx, cy - 75, 10, cx, cy - 75, 175);
  rimGrad.addColorStop(0, '#FFF5E4');
  rimGrad.addColorStop(0.55, '#F4C6A0');
  rimGrad.addColorStop(1, '#C96D7C');
  s.fillStyle = rimGrad;
  s.beginPath();
  s.ellipse(cx, cy - 75, 175, 42, 0, 0, Math.PI * 2);
  s.fill();

  s.strokeStyle = palette.secondary;
  s.lineWidth = 3.2;
  traceCoupe(s);
  s.stroke();
  s.beginPath();
  s.ellipse(cx, cy - 75, 175, 42, 0, 0, Math.PI * 2);
  s.stroke();
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 3.2;
  traceCoupe(l);
  l.stroke();
  l.beginPath();
  l.ellipse(cx, cy - 75, 175, 42, 0, 0, Math.PI * 2);
  l.stroke();
  l.restore();

  // Floating strawberries, rose blossoms & coffee cherries crowning the rim
  drawCoffeeCherry(s, l, cx - 90, cy - 145, 36, '#E24C6B', palette.secondary);
  drawCoffeeCherry(s, l, cx + 92, cy - 135, 32, '#C83E6B', palette.secondary);
  drawCoffeeBlossom(s, l, cx, cy - 185, 58, 0.15, '#FFEBF0', palette.secondary);
  drawCoffeeLeaf(s, l, cx - 180, cy - 105, 145, 42, -2.5, '#325A40', '#6DA37D', palette.secondary);
  drawCoffeeLeaf(s, l, cx + 180, cy - 105, 145, 42, -0.65, '#325A40', '#6DA37D', palette.secondary);
}

function drawBerryFigSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 600;
  drawGildedMedallion(s, l, cx, cy, 308, palette, 'astrolabe');

  // Halved luminous Mediterranean fig in center
  const traceFig = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 190);
    ctx.bezierCurveTo(cx + 42, cy - 140, cx + 150, cy - 45, cx + 145, cy + 55);
    ctx.bezierCurveTo(cx + 140, cy + 165, cx + 65, cy + 210, cx, cy + 210);
    ctx.bezierCurveTo(cx - 65, cy + 210, cx - 140, cy + 165, cx - 145, cy + 55);
    ctx.bezierCurveTo(cx - 150, cy - 45, cx - 42, cy - 140, cx, cy - 190);
    ctx.closePath();
  };

  s.save();
  const figOuter = s.createRadialGradient(cx, cy + 20, 18, cx, cy + 20, 195);
  figOuter.addColorStop(0, '#E36B7E');
  figOuter.addColorStop(0.55, '#9F3252');
  figOuter.addColorStop(0.82, '#F4E4CE');
  figOuter.addColorStop(0.92, '#4A2B5E');
  figOuter.addColorStop(1, '#2B183D');
  s.fillStyle = figOuter;
  traceFig(s);
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3.2;
  s.stroke();

  // Golden seed stars inside the ruby fig heart
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rad = 36 + (i % 3) * 26;
    const sx = cx + Math.cos(a) * rad * 0.85;
    const sy = cy + 48 + Math.sin(a) * rad * 0.9;
    s.fillStyle = '#FFE4A8';
    s.beginPath();
    s.arc(sx, sy, 4.2, 0, Math.PI * 2);
    s.fill();
  }
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 3.2;
  traceFig(l);
  l.stroke();
  l.restore();

  // Flanking blueberry clusters & coffee leaves
  drawCoffeeLeaf(s, l, cx - 170, cy + 60, 185, 52, -2.55, '#2A234E', '#5F4E8F', palette.secondary);
  drawCoffeeLeaf(s, l, cx + 170, cy + 60, 185, 52, -0.58, '#2A234E', '#5F4E8F', palette.secondary);
  drawCoffeeCherry(s, l, cx - 165, cy - 70, 32, '#5B4B9E', '#E2C59B');
  drawCoffeeCherry(s, l, cx - 122, cy - 115, 26, '#483882', '#E2C59B');
  drawCoffeeCherry(s, l, cx + 165, cy - 65, 31, '#6E324C', '#E2C59B');
  drawCoffeeCherry(s, l, cx + 125, cy - 115, 25, '#5B4B9E', '#E2C59B');
  drawCoffeeBlossom(s, l, cx, cy - 220, 46, 0.3, '#FAF4EE', palette.secondary);
}

function drawSpeciesSpecimenSubject(s, l, card, palette) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  const id = String(card?.id || '').toLowerCase();
  drawGildedMedallion(s, l, cx, cy, 315, palette, 'astrolabe');

  // Determine exact botanical bean anatomy by species
  let creaseStyle = 'S';
  let rx = 108;
  let ry = 166;
  let roastHex = '#754728';

  if (id.includes('robusta')) {
    creaseStyle = 'straight';
    rx = 128;
    ry = 148;
    roastHex = '#5B341E';
  } else if (id.includes('liberica')) {
    creaseStyle = 'asymmetric';
    rx = 122;
    ry = 192;
    roastHex = '#6A3E24';
  } else if (id.includes('excelsa')) {
    creaseStyle = 'asymmetric';
    rx = 104;
    ry = 162;
    roastHex = '#7C3E32';
  } else if (id.includes('eugenioides')) {
    creaseStyle = 'S';
    rx = 82;
    ry = 126;
    roastHex = '#9E6E3B';
  }

  // Botanical double leaves framing the anatomical bean specimen
  drawCoffeeLeaf(s, l, cx - 105, cy + 40, 235, 68, -2.42, '#1A4634', '#3B8463', palette.secondary);
  drawCoffeeLeaf(s, l, cx + 105, cy + 40, 235, 68, -0.72, '#1A4634', '#3B8463', palette.secondary);

  // Twin specimen: Roasted bean foreground + green parchment bean offset behind
  drawSculptedCoffeeBean(s, l, cx + 92, cy - 52, rx * 0.78, ry * 0.78, 0.32, {
    roastHex: '#6F8B69',
    rimGold: palette.secondary,
    creaseStyle,
  });
  drawSculptedCoffeeBean(s, l, cx - 32, cy + 16, rx, ry, -0.18, {
    roastHex,
    rimGold: palette.secondary,
    creaseStyle,
  });

  // Subtle botanical chromosome / DNA filigree arc below
  s.save();
  l.save();
  s.strokeStyle = rgba(palette.secondary, 0.72);
  l.strokeStyle = '#121212';
  s.lineWidth = 2.2;
  l.lineWidth = 2.2;
  for (const sign of [-1, 1]) {
    const drawWave = (ctx) => {
      ctx.beginPath();
      for (let t = -150; t <= 150; t += 10) {
        const y = cy + 245 + Math.sin(t * 0.045) * 18 * sign;
        if (t === -150) ctx.moveTo(cx + t, y);
        else ctx.lineTo(cx + t, y);
      }
      ctx.stroke();
    };
    drawWave(s);
    drawWave(l);
  }
  l.restore();
  s.restore();
}

function drawVarietySpecimenSubject(s, l, card, palette, rng) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  const id = String(card?.id || '').toLowerCase();
  drawGildedMedallion(s, l, cx, cy, 310, palette, 'diamond_crest');

  if (id.includes('bourbon') && !id.includes('pink') && !id.includes('laurina')) {
    // Red / Yellow / Orange Bourbon jewel cherry triad
    drawCoffeeLeaf(s, l, cx - 120, cy + 30, 225, 64, -2.4, '#1F4B35', '#448D67', palette.secondary);
    drawCoffeeLeaf(s, l, cx + 120, cy + 30, 225, 64, -0.74, '#1F4B35', '#448D67', palette.secondary);
    drawCoffeeCherry(s, l, cx - 88, cy + 15, 64, '#C83546', palette.secondary);
    drawCoffeeCherry(s, l, cx + 88, cy + 15, 64, '#E8A830', palette.secondary);
    drawCoffeeCherry(s, l, cx, cy - 92, 68, '#E46A2E', palette.secondary);
    drawCoffeeBlossom(s, l, cx, cy + 130, 52, 0.2, '#FFF9F0', palette.secondary);
  } else if (id.includes('pink-bourbon')) {
    drawBotanicalBranchBase(s, l, palette, '#EA6F92', '#1F4F3E', '#499878', { blossomCount: 5, cherryCount: 7, rng });
  } else if (id.includes('pacamara') || id.includes('maragogipe')) {
    // Giant Elephant bean vs standard scale comparison
    drawCoffeeLeaf(s, l, cx - 135, cy + 60, 210, 62, -2.5, '#1D4432', '#448766', palette.secondary);
    drawSculptedCoffeeBean(s, l, cx - 35, cy - 10, 128, 198, -0.16, {
      roastHex: '#683D22',
      rimGold: palette.secondary,
      creaseStyle: 'S',
    });
    drawSculptedCoffeeBean(s, l, cx + 135, cy + 75, 58, 86, 0.24, {
      roastHex: '#8C5B36',
      rimGold: palette.secondary,
      creaseStyle: 'S',
    });
  } else if (id.includes('laurina') || id.includes('sidra')) {
    drawCoffeeLeaf(s, l, cx - 120, cy + 50, 215, 58, -2.45, '#1C4838', '#428A6D', palette.secondary);
    drawCoffeeLeaf(s, l, cx + 120, cy + 50, 215, 58, -0.68, '#1C4838', '#428A6D', palette.secondary);
    drawSculptedCoffeeBean(s, l, cx, cy - 10, 92, 186, 0.08, {
      roastHex: '#7A4C2C',
      rimGold: palette.secondary,
      creaseStyle: 'pointed',
    });
    drawCoffeeBlossom(s, l, cx - 145, cy - 135, 48, 0.4, '#FFF8F2', palette.secondary);
    drawCoffeeBlossom(s, l, cx + 145, cy - 120, 44, 0.9, '#FFF8F2', palette.secondary);
  } else if (id.includes('sl28') || id.includes('kenya')) {
    drawBotanicalBranchBase(s, l, palette, '#6B224A', '#3D261E', '#7C4832', { blossomCount: 4, cherryCount: 8, rng });
  } else {
    // Geisha / Typica / Heirloom graceful botanical bough
    drawBotanicalBranchBase(s, l, palette, '#C93A4C', '#164A37', '#388766', { blossomCount: 5, cherryCount: 7, rng });
  }
}

function drawCoffeeBeltGlobeSubject(s, l, card, palette) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  const r = 248;
  const isMigration = String(card?.id || '').includes('migration');

  drawGildedMedallion(s, l, cx, cy, 318, palette, 'astrolabe');

  // Sculpted dark obsidian-emerald globe sphere
  s.save();
  const sphere = s.createRadialGradient(cx - 80, cy - 80, 24, cx, cy, r);
  sphere.addColorStop(0, mixHex(palette.primary, '#8BB8A2', 0.25));
  sphere.addColorStop(0.58, palette.primary);
  sphere.addColorStop(1, '#0C1210');
  s.fillStyle = sphere;
  s.beginPath();
  s.arc(cx, cy, r, 0, Math.PI * 2);
  s.fill();

  // Clip interior globe latitude/longitude & glowing Coffee Belt
  s.save();
  s.beginPath();
  s.arc(cx, cy, r, 0, Math.PI * 2);
  s.clip();

  // Glowing 23.5N - 23.5S Coffee Belt ribbon
  const belt = s.createLinearGradient(cx, cy - 92, cx, cy + 92);
  belt.addColorStop(0, rgba(palette.secondary, 0.08));
  belt.addColorStop(0.5, rgba(palette.secondary, 0.34));
  belt.addColorStop(1, rgba(palette.secondary, 0.08));
  s.fillStyle = belt;
  s.fillRect(cx - r, cy - 88, r * 2, 176);

  // Meridians & parallels
  s.strokeStyle = rgba(palette.secondary, 0.42);
  s.lineWidth = 1.6;
  for (const w of [55, 130, 200]) {
    s.beginPath();
    s.ellipse(cx, cy, w, r, 0, 0, Math.PI * 2);
    s.stroke();
  }
  for (const dy of [-155, -88, 0, 88, 155]) {
    s.beginPath();
    s.moveTo(cx - r, cy + dy);
    s.lineTo(cx + r, cy + dy);
    s.stroke();
  }

  // Stylized trans-continental migration arc or coffee-belt stars
  if (isMigration) {
    // Ethiopia -> Kenya -> Costa Rica -> Panama golden arc
    const nodes = [
      { x: cx + 125, y: cy + 12 },
      { x: cx + 82, y: cy + 52 },
      { x: cx - 78, y: cy - 16 },
      { x: cx - 135, y: cy + 8 },
    ];
    s.strokeStyle = '#FFE49E';
    s.lineWidth = 4.2;
    s.beginPath();
    s.moveTo(nodes[0].x, nodes[0].y);
    s.bezierCurveTo(cx + 45, cy - 95, cx - 25, cy - 105, nodes[3].x, nodes[3].y);
    s.stroke();
    for (const nd of nodes) {
      s.fillStyle = '#FFF0BE';
      drawFourPointStar(s, nd.x, nd.y, 16, 5);
      s.fill();
    }
  } else {
    const origins = [
      { x: cx - 110, y: cy + 18 },
      { x: cx - 55, y: cy + 58 },
      { x: cx + 52, y: cy - 8 },
      { x: cx + 135, y: cy + 28 },
      { x: cx + 102, y: cy - 58 },
    ];
    for (const pt of origins) {
      s.fillStyle = '#FFE49E';
      drawFourPointStar(s, pt.x, pt.y, 14, 4.5);
      s.fill();
    }
  }
  s.restore();

  // Outer brass meridian ring
  s.strokeStyle = palette.secondary;
  s.lineWidth = 4;
  s.beginPath();
  s.arc(cx, cy, r, 0, Math.PI * 2);
  s.stroke();
  s.restore();

  // Co-registered globe engraving on lineart
  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 3.2;
  l.beginPath();
  l.arc(cx, cy, r, 0, Math.PI * 2);
  l.stroke();
  l.lineWidth = 1.8;
  for (const w of [55, 130, 200]) {
    l.beginPath();
    l.ellipse(cx, cy, w, r, 0, 0, Math.PI * 2);
    l.stroke();
  }
  for (const dy of [-88, 0, 88]) {
    l.beginPath();
    l.moveTo(cx - r, cy + dy);
    l.lineTo(cx + r, cy + dy);
    l.stroke();
  }
  l.restore();

  // Subtle flanking botanical coffee leaves embracing the globe
  drawCoffeeLeaf(s, l, cx - 190, cy + 205, 170, 44, -2.55, '#194634', '#408A68', palette.secondary);
  drawCoffeeLeaf(s, l, cx + 190, cy + 205, 170, 44, -0.58, '#194634', '#408A68', palette.secondary);
}

function drawRoastSpectrumSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  drawGildedMedallion(s, l, cx, cy, 322, palette, 'astrolabe');

  // 8-stage roast ring from green bean to dark Italian roast
  const stages = [
    '#799A6E', // Green
    '#C49664', // Cinnamon / Light
    '#A87444', // Medium-Light
    '#8B582E', // High
    '#6D4122', // City
    '#522F18', // Full City
    '#391E11', // French
    '#22120B', // Italian
  ];

  const ringR = 205;
  for (let i = 0; i < stages.length; i++) {
    const a = -Math.PI / 2 + (i / stages.length) * Math.PI * 2;
    const bx = cx + Math.cos(a) * ringR;
    const by = cy + Math.sin(a) * ringR;
    drawSculptedCoffeeBean(s, l, bx, by, 38, 56, a + Math.PI / 2, {
      roastHex: stages[i],
      rimGold: palette.secondary,
      creaseStyle: 'S',
    });
  }

  // Central brass Agtron dial indicator
  s.save();
  const dial = s.createRadialGradient(cx, cy, 10, cx, cy, 92);
  dial.addColorStop(0, '#36241B');
  dial.addColorStop(1, '#150E0B');
  s.fillStyle = dial;
  s.beginPath();
  s.arc(cx, cy, 88, 0, Math.PI * 2);
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3.2;
  s.stroke();

  s.fillStyle = palette.secondary;
  s.font = `600 22px ${MONO_FONT}`;
  s.textAlign = 'center';
  s.textBaseline = 'middle';
  s.fillText('AGTRON', cx, cy - 18);
  s.font = `700 38px ${SERIF_FONT}`;
  s.fillStyle = '#F6ECDC';
  s.fillText('95→25', cx, cy + 20);
  s.restore();

  l.save();
  l.strokeStyle = '#121212';
  l.lineWidth = 2.8;
  l.beginPath();
  l.arc(cx, cy, 88, 0, Math.PI * 2);
  l.stroke();
  l.restore();
}

function drawFlavorWheelSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  drawGildedMedallion(s, l, cx, cy, 326, palette, 'astrolabe');

  const families = Object.values(FLAVOR_FAMILIES);
  const count = families.length;
  const slice = (Math.PI * 2) / count;

  s.save();
  l.save();
  for (let i = 0; i < count; i++) {
    const fam = families[i];
    const a0 = -Math.PI / 2 + i * slice;
    const a1 = a0 + slice - 0.025;

    // Outer petal tier
    s.beginPath();
    s.arc(cx, cy, 275, a0, a1);
    s.arc(cx, cy, 155, a1, a0, true);
    s.closePath();
    s.fillStyle = fam.primary;
    s.fill();
    s.strokeStyle = rgba('#F8E5C0', 0.72);
    s.lineWidth = 2.2;
    s.stroke();

    // Inner deep tier
    s.beginPath();
    s.arc(cx, cy, 150, a0, a1);
    s.arc(cx, cy, 72, a1, a0, true);
    s.closePath();
    s.fillStyle = fam.deep;
    s.fill();
    s.strokeStyle = rgba('#F8E5C0', 0.55);
    s.lineWidth = 1.6;
    s.stroke();

    // Co-registered wheel lineart
    l.strokeStyle = '#121212';
    l.lineWidth = 2.4;
    l.beginPath();
    l.arc(cx, cy, 275, a0, a1);
    l.arc(cx, cy, 155, a1, a0, true);
    l.closePath();
    l.stroke();
  }

  // Center golden cupping emblem
  s.fillStyle = '#1A120E';
  s.beginPath();
  s.arc(cx, cy, 68, 0, Math.PI * 2);
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3.2;
  s.stroke();
  s.fillStyle = '#F4E5C8';
  s.font = `700 26px ${MONO_FONT}`;
  s.textAlign = 'center';
  s.textBaseline = 'middle';
  s.fillText('SCA', cx, cy - 10);
  s.font = `500 18px ${MONO_FONT}`;
  s.fillStyle = palette.secondary;
  s.fillText('CVA', cx, cy + 18);

  l.lineWidth = 2.8;
  l.beginPath();
  l.arc(cx, cy, 68, 0, Math.PI * 2);
  l.stroke();
  l.restore();
  s.restore();
}

function drawV60PourOverSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 625;
  drawGildedMedallion(s, l, cx, cy - 25, 315, palette, 'astrolabe');

  s.save();
  l.save();

  // Rising aromatic steam ribbons
  for (const dx of [-55, 0, 58]) {
    const traceSteam = (ctx) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy - 125);
      ctx.bezierCurveTo(cx + dx - 32, cy - 185, cx + dx + 34, cy - 235, cx + dx - 12, cy - 295);
    };
    s.strokeStyle = rgba('#FFF2DC', 0.42);
    s.lineWidth = 5;
    s.lineCap = 'round';
    traceSteam(s);
    s.stroke();
    l.strokeStyle = '#121212';
    l.lineWidth = 2.2;
    traceSteam(l);
    l.stroke();
  }

  // Golden laminar pour stream entering V60
  s.strokeStyle = '#F7CA74';
  s.lineWidth = 6.5;
  s.beginPath();
  s.moveTo(cx + 150, cy - 245);
  s.quadraticCurveTo(cx + 35, cy - 210, cx + 4, cy - 95);
  s.stroke();
  l.strokeStyle = '#121212';
  l.lineWidth = 2.8;
  l.beginPath();
  l.moveTo(cx + 150, cy - 245);
  l.quadraticCurveTo(cx + 35, cy - 210, cx + 4, cy - 95);
  l.stroke();

  // Copper fluted V60 cone dripper
  const traceCone = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 148, cy - 112);
    ctx.lineTo(cx + 148, cy - 112);
    ctx.lineTo(cx + 42, cy + 38);
    ctx.lineTo(cx - 42, cy + 38);
    ctx.closePath();
  };
  const coneGrad = s.createLinearGradient(cx - 148, cy, cx + 148, cy);
  coneGrad.addColorStop(0, '#6B3D1B');
  coneGrad.addColorStop(0.32, '#DF9D57');
  coneGrad.addColorStop(0.58, '#F6CA86');
  coneGrad.addColorStop(0.85, '#9F622D');
  coneGrad.addColorStop(1, '#512B11');
  s.fillStyle = coneGrad;
  traceCone(s);
  s.fill();
  s.strokeStyle = '#FFE3AC';
  s.lineWidth = 2.8;
  s.stroke();

  // Fluted spiral ribs inside V60
  for (let i = -3; i <= 3; i++) {
    s.strokeStyle = 'rgba(60, 26, 8, 0.38)';
    s.lineWidth = 2;
    s.beginPath();
    s.moveTo(cx + i * 38, cy - 108);
    s.quadraticCurveTo(cx + i * 24, cy - 35, cx + i * 10, cy + 34);
    s.stroke();

    l.strokeStyle = '#121212';
    l.lineWidth = 1.6;
    l.beginPath();
    l.moveTo(cx + i * 38, cy - 108);
    l.quadraticCurveTo(cx + i * 24, cy - 35, cx + i * 10, cy + 34);
    l.stroke();
  }

  // Glass range server carafe with glowing ruby-amber brewed coffee
  const traceServer = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 88, cy + 44);
    ctx.lineTo(cx + 88, cy + 44);
    ctx.bezierCurveTo(cx + 135, cy + 105, cx + 146, cy + 178, cx + 112, cy + 216);
    ctx.lineTo(cx - 112, cy + 216);
    ctx.bezierCurveTo(cx - 146, cy + 178, cx - 135, cy + 105, cx - 88, cy + 44);
    ctx.closePath();
  };
  s.fillStyle = 'rgba(220, 232, 236, 0.14)';
  traceServer(s);
  s.fill();

  // Amber coffee liquid inside lower half of server
  s.save();
  traceServer(s);
  s.clip();
  const liqGrad = s.createLinearGradient(cx, cy + 115, cx, cy + 220);
  liqGrad.addColorStop(0, '#B55B24');
  liqGrad.addColorStop(0.4, '#6A2712');
  liqGrad.addColorStop(1, '#270D06');
  s.fillStyle = liqGrad;
  s.fillRect(cx - 160, cy + 118, 320, 120);
  s.restore();

  s.strokeStyle = rgba('#F4DFC0', 0.72);
  s.lineWidth = 3;
  traceServer(s);
  s.stroke();

  l.strokeStyle = '#121212';
  l.lineWidth = 3;
  traceCone(l);
  l.stroke();
  traceServer(l);
  l.stroke();

  l.restore();
  s.restore();
}

function drawExperimentalFermSubject(s, l, palette) {
  const cx = BASE_W * 0.5;
  const cy = 605;
  drawGildedMedallion(s, l, cx, cy - 8, 315, palette, 'astrolabe');

  // Sculpted anaerobic stainless/copper fermentation bioreactor tank
  const traceTank = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 128, cy - 115);
    ctx.quadraticCurveTo(cx, cy - 188, cx + 128, cy - 115);
    ctx.lineTo(cx + 128, cy + 110);
    ctx.lineTo(cx + 38, cy + 205);
    ctx.lineTo(cx - 38, cy + 205);
    ctx.lineTo(cx - 128, cy + 110);
    ctx.closePath();
  };

  s.save();
  l.save();
  const tankGrad = s.createLinearGradient(cx - 128, cy, cx + 128, cy);
  tankGrad.addColorStop(0.0, '#2C1B28');
  tankGrad.addColorStop(0.28, '#8E5A4C');
  tankGrad.addColorStop(0.54, '#E7B983');
  tankGrad.addColorStop(0.82, '#6A3A48');
  tankGrad.addColorStop(1.0, '#22131F');
  s.fillStyle = tankGrad;
  traceTank(s);
  s.fill();

  s.strokeStyle = palette.secondary;
  s.lineWidth = 3.2;
  s.stroke();

  // Horizontal brushed copper pressure bands
  for (const by of [-85, 95]) {
    s.strokeStyle = rgba('#FFE5B4', 0.72);
    s.lineWidth = 8;
    s.beginPath();
    s.moveTo(cx - 128, cy + by);
    s.lineTo(cx + 128, cy + by);
    s.stroke();
  }

  // Brass pressure & CO2 dial in center of vessel
  s.fillStyle = '#181116';
  s.beginPath();
  s.arc(cx, cy + 4, 52, 0, Math.PI * 2);
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 3.5;
  s.stroke();

  // Gauge needle & ticks
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * 1.15 + (i / 8) * Math.PI * 1.3;
    s.strokeStyle = rgba('#F4DFB4', 0.7);
    s.lineWidth = 2;
    s.beginPath();
    s.moveTo(cx + Math.cos(a) * 34, cy + 4 + Math.sin(a) * 34);
    s.lineTo(cx + Math.cos(a) * 44, cy + 4 + Math.sin(a) * 44);
    s.stroke();
  }
  s.strokeStyle = palette.accent || '#E06C9F';
  s.lineWidth = 3.5;
  s.beginPath();
  s.moveTo(cx, cy + 4);
  s.lineTo(cx + 28, cy - 18);
  s.stroke();

  // Top airlock valve + rising twin aroma helices
  s.strokeStyle = palette.secondary;
  s.lineWidth = 4;
  s.beginPath();
  s.moveTo(cx, cy - 152);
  s.lineTo(cx, cy - 210);
  s.stroke();
  for (const sign of [-1, 1]) {
    const traceHelix = (ctx) => {
      ctx.beginPath();
      for (let t = 0; t <= 120; t += 8) {
        const hx = cx + Math.sin(t * 0.085) * 44 * sign;
        const hy = cy - 170 - t;
        if (t === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();
    };
    s.strokeStyle = rgba(palette.accent || '#E06C9F', 0.65);
    s.lineWidth = 3.2;
    traceHelix(s);
    l.strokeStyle = '#121212';
    l.lineWidth = 2.2;
    traceHelix(l);
  }

  l.strokeStyle = '#121212';
  l.lineWidth = 3.2;
  traceTank(l);
  l.stroke();
  l.beginPath();
  l.arc(cx, cy + 4, 52, 0, Math.PI * 2);
  l.stroke();

  l.restore();
  s.restore();

  // Orbiting fruit & coffee cherry specimens around the bioreactor
  drawCoffeeCherry(s, l, cx - 185, cy + 68, 30, '#D44A74', palette.secondary);
  drawCoffeeCherry(s, l, cx + 185, cy + 54, 28, '#E69B38', palette.secondary);
  drawCoffeeBlossom(s, l, cx - 165, cy - 110, 42, 0.3, '#FFEFF5', palette.secondary);
  drawCoffeeBlossom(s, l, cx + 168, cy - 95, 38, 0.9, '#FFF6E8', palette.secondary);
}

function drawYunnanTerroirSubject(s, l, palette, rng) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  drawGildedMedallion(s, l, cx, cy, 312, palette, 'diamond_crest');

  // Layered Gaoligong mountain mist peaks inside medallion
  s.save();
  l.save();
  const tracePeaks = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(cx - 220, cy + 125);
    ctx.lineTo(cx - 110, cy - 65);
    ctx.lineTo(cx - 35, cy + 12);
    ctx.lineTo(cx + 42, cy - 118);
    ctx.lineTo(cx + 128, cy - 12);
    ctx.lineTo(cx + 220, cy + 125);
    ctx.closePath();
  };
  const mGrad = s.createLinearGradient(cx, cy - 120, cx, cy + 130);
  mGrad.addColorStop(0, '#4B7A67');
  mGrad.addColorStop(0.55, '#254438');
  mGrad.addColorStop(1, '#12221B');
  s.fillStyle = mGrad;
  tracePeaks(s);
  s.fill();
  s.strokeStyle = palette.secondary;
  s.lineWidth = 2.8;
  s.stroke();

  // Flowing golden cloud scrolls across mountain waist
  for (const [yy, span] of [[38, 210], [82, 175]]) {
    s.strokeStyle = rgba('#F4D9A6', 0.65);
    s.lineWidth = 2.6;
    s.beginPath();
    s.moveTo(cx - span, cy + yy);
    s.bezierCurveTo(cx - span * 0.35, cy + yy - 24, cx + span * 0.35, cy + yy + 24, cx + span, cy + yy);
    s.stroke();
  }

  l.strokeStyle = '#121212';
  l.lineWidth = 2.8;
  tracePeaks(l);
  l.stroke();
  l.restore();
  s.restore();

  // Classical bronze-tipped Yunnan heirloom Typica coffee branch
  drawBotanicalBranchBase(s, l, palette, '#B83A4E', '#1D4437', '#4B826E', {
    blossomCount: 4,
    cherryCount: 7,
    rng,
  });
}

function drawProcessOrPhysicsSubject(s, l, card, palette) {
  const cx = BASE_W * 0.5;
  const cy = 595;
  const id = String(card?.id || '').toLowerCase();
  drawGildedMedallion(s, l, cx, cy, 315, palette, 'astrolabe');

  if (id.includes('physics') || id.includes('grading')) {
    // Precision sieve screen & high-altitude bean caliper
    s.save();
    l.save();
    const r = 195;
    s.strokeStyle = palette.secondary;
    s.lineWidth = 6;
    s.beginPath();
    s.arc(cx, cy, r, 0, Math.PI * 2);
    s.stroke();

    // Screen aperture dots grid
    for (let gx = -120; gx <= 120; gx += 48) {
      for (let gy = -120; gy <= 120; gy += 48) {
        if (Math.hypot(gx, gy) > r - 38) continue;
        s.strokeStyle = rgba(palette.secondary, 0.32);
        s.lineWidth = 1.6;
        s.beginPath();
        s.arc(cx + gx, cy + gy, 14, 0, Math.PI * 2);
        s.stroke();
      }
    }
    l.strokeStyle = '#121212';
    l.lineWidth = 3.2;
    l.beginPath();
    l.arc(cx, cy, r, 0, Math.PI * 2);
    l.stroke();
    l.restore();
    s.restore();

    drawSculptedCoffeeBean(s, l, cx, cy, 94, 145, -0.2, {
      roastHex: '#638060',
      rimGold: palette.secondary,
      creaseStyle: 'S',
    });
  } else {
    // Coffee cherry anatomical cross-section (skin -> mucilage -> parchment -> twin beans)
    const layers = [
      { r: 205, fill: '#B63245', stroke: palette.secondary }, // Exocarp skin
      { r: 178, fill: '#F0AE5A', stroke: '#FFE5B4' },         // Sweet mucilage
      { r: 146, fill: '#E8D8BE', stroke: '#C8A878' },         // Parchment
      { r: 126, fill: '#3A2318', stroke: palette.secondary }, // Inner cavity
    ];
    s.save();
    l.save();
    for (const ly of layers) {
      s.fillStyle = ly.fill;
      s.beginPath();
      s.arc(cx, cy, ly.r, 0, Math.PI * 2);
      s.fill();
      s.strokeStyle = ly.stroke;
      s.lineWidth = 2.6;
      s.stroke();

      l.strokeStyle = '#121212';
      l.lineWidth = 2.4;
      l.beginPath();
      l.arc(cx, cy, ly.r, 0, Math.PI * 2);
      l.stroke();
    }
    l.restore();
    s.restore();

    // Twin facing green beans inside the cherry cross-section
    drawSculptedCoffeeBean(s, l, cx - 44, cy, 44, 86, 0.04, {
      roastHex: '#6D8C68',
      rimGold: '#F4DFB4',
      creaseStyle: 'S',
    });
    drawSculptedCoffeeBean(s, l, cx + 44, cy, 44, 86, -0.04, {
      roastHex: '#6D8C68',
      rimGold: '#F4DFB4',
      creaseStyle: 'S',
    });
  }
}

export function renderSubjectAndLineartCanvases(card, options = {}) {
  const width = options.width || BASE_W;
  const height = options.height || BASE_H;

  const subjectCanvas = createCanvas(width, height);
  const lineartCanvas = createCanvas(width, height);
  const s = subjectCanvas.getContext('2d');
  const l = lineartCanvas.getContext('2d');

  // Lineart canvas MUST have pure white ground (#FFFFFF) with dark strokes (#121212)
  l.fillStyle = '#FFFFFF';
  l.fillRect(0, 0, width, height);

  s.save();
  l.save();
  s.scale(width / BASE_W, height / BASE_H);
  l.scale(width / BASE_W, height / BASE_H);

  const rng = mulberry32(hashString(`${card?.id || 'card'}:subj`));
  const palette = getPalette(card);
  const motif = String(card?.visual?.layers?.subjectMotif || '').toLowerCase();
  const id = String(card?.id || '').toLowerCase();
  const group = card?.group || '';

  if (motif.includes('esmeralda') || id.includes('esmeralda')) {
    drawEsmeraldaCrestSubject(s, l, palette, rng);
  } else if (motif.includes('barrel') || motif.includes('rum') || id.includes('macarena')) {
    drawRumOakBarrelSubject(s, l, palette);
  } else if (motif.includes('cold_spring') || motif.includes('baishan') || id.includes('baishan')) {
    drawBaishanColdSpringSubject(s, l, palette);
  } else if (motif.includes('dessert') || motif.includes('gelana') || id.includes('gelana')) {
    drawDessertCofermSubject(s, l, palette);
  } else if (motif.includes('berry_fig') || id.includes('kaffa-natural')) {
    drawBerryFigSubject(s, l, palette);
  } else if (motif.includes('wheel') || id.includes('flavor-wheel') || id.includes('sca')) {
    drawFlavorWheelSubject(s, l, palette);
  } else if (motif.includes('roast') || id.includes('roast-agtron')) {
    drawRoastSpectrumSubject(s, l, palette);
  } else if (motif.includes('v60') || motif.includes('brew') || motif.includes('pour') || id.includes('golden-cup')) {
    drawV60PourOverSubject(s, l, palette);
  } else if (motif.includes('experimental') || id.includes('pr-02')) {
    drawExperimentalFermSubject(s, l, palette);
  } else if (motif.includes('process') || motif.includes('ferm') || motif.includes('physics') || motif.includes('grading') || id.includes('pr-') || id.includes('ta-02')) {
    drawProcessOrPhysicsSubject(s, l, card, palette);
  } else if (group === 'species' || id.startsWith('sp-')) {
    drawSpeciesSpecimenSubject(s, l, card, palette);
  } else if (group === 'variety' || id.startsWith('vr-')) {
    drawVarietySpecimenSubject(s, l, card, palette, rng);
  } else if (motif.includes('yunnan') || id.includes('yunnan')) {
    drawYunnanTerroirSubject(s, l, palette, rng);
  } else if (group === 'origin' || id.startsWith('rg-')) {
    drawCoffeeBeltGlobeSubject(s, l, card, palette);
  } else if (motif.includes('brazil') || motif.includes('yellow_bourbon')) {
    drawGildedMedallion(s, l, BASE_W * 0.5, 595, 308, palette, 'astrolabe');
    drawBotanicalBranchBase(s, l, palette, '#E6A634', '#2A4F36', '#569362', { blossomCount: 4, cherryCount: 8, rng });
  } else if (motif.includes('sumatra') || motif.includes('cedar')) {
    drawGildedMedallion(s, l, BASE_W * 0.5, 595, 308, palette, 'astrolabe');
    drawCoffeeLeaf(s, l, BASE_W * 0.5 - 125, 625, 225, 64, -2.4, '#14382A', '#347459', palette.secondary);
    drawCoffeeLeaf(s, l, BASE_W * 0.5 + 125, 625, 225, 64, -0.74, '#14382A', '#347459', palette.secondary);
    drawSculptedCoffeeBean(s, l, BASE_W * 0.5 - 65, 575, 92, 142, -0.24, { roastHex: '#4E7D6E', rimGold: palette.secondary });
    drawSculptedCoffeeBean(s, l, BASE_W * 0.5 + 78, 625, 86, 134, 0.28, { roastHex: '#412416', rimGold: palette.secondary });
  } else if (motif.includes('kenya') || motif.includes('blackcurrant')) {
    drawGildedMedallion(s, l, BASE_W * 0.5, 595, 308, palette, 'diamond_crest');
    drawBotanicalBranchBase(s, l, palette, '#6B245C', '#3A1E2A', '#793B52', { blossomCount: 4, cherryCount: 8, rng });
  } else if (motif.includes('kaffa_tea')) {
    drawGildedMedallion(s, l, BASE_W * 0.5, 595, 308, palette, 'astrolabe');
    drawBotanicalBranchBase(s, l, palette, '#D9A443', '#234C39', '#5A9B74', { blossomCount: 5, cherryCount: 5, rng });
  } else {
    // Gori Forest, Yunnan Typica, or custom user-added bean cards
    drawGildedMedallion(s, l, BASE_W * 0.5, 595, 308, palette, 'astrolabe');
    drawBotanicalBranchBase(s, l, palette, palette.accent || '#C9384D', '#174836', '#3B8968', {
      blossomCount: 5,
      cherryCount: 7,
      rng,
    });
  }

  // Subtle post-subject volumetric studio rim-glint unifying all procedural plates with AI hero depth
  s.save();
  const studioGlint = s.createRadialGradient(BASE_W * 0.36, 405, 8, BASE_W * 0.42, 465, 290);
  studioGlint.addColorStop(0.0, 'rgba(255, 248, 232, 0.14)');
  studioGlint.addColorStop(0.55, rgba(palette.secondary, 0.05));
  studioGlint.addColorStop(1.0, 'rgba(255, 248, 232, 0)');
  s.globalCompositeOperation = 'source-atop';
  s.fillStyle = studioGlint;
  s.fillRect(140, 210, 744, 780);
  s.restore();

  s.restore();
  l.restore();

  return { subjectCanvas, lineartCanvas };
}

// ============================================================================
// LAYER 2: FLOATING BOTANICAL & AROMATIC EFFECTS (RGBA)
// ============================================================================

export function renderEffectsCanvas(card, options = {}) {
  const width = options.width || BASE_W;
  const height = options.height || BASE_H;
  const fast = Boolean(options.fast || width <= 480);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(width / BASE_W, height / BASE_H);

  const rng = mulberry32(hashString(`${card?.id || 'card'}:fx`));
  const palette = getPalette(card);
  const flavors = Array.isArray(card?.sensory?.flavors) ? card.sensory.flavors : [];
  const particles = Array.isArray(card?.visual?.layers?.effectParticles)
    ? card.visual.layers.effectParticles
    : [];

  // Derive luminous particle palette directly from SCA flavor-palette.js
  const accentColors = flavors.map((f) => getFlavorColor(typeof f === 'string' ? f : f?.name));
  if (accentColors.length === 0) {
    accentColors.push(palette.secondary, palette.accent, '#F4D8A8');
  }

  const isCold = particles.some((p) => /nitrogen|silver|frost|dew/.test(String(p)));
  const isPetal = particles.some((p) => /petal|flower|rose|chamomile/.test(String(p))) || card?.group === 'variety';
  const isMist = particles.some((p) => /mist|tea|steam/.test(String(p)));

  const cx = BASE_W * 0.5;
  const cy = 595;

  // 1. Soft atmospheric aroma bokeh orbiting the subject perimeter (never obscuring bottom text)
  const bokehCount = fast ? 10 : 20;
  for (let i = 0; i < bokehCount; i++) {
    const a = (i / bokehCount) * Math.PI * 2 + rng() * 0.4;
    const dist = 240 + rng() * 195;
    const x = cx + Math.cos(a) * dist * 0.92;
    const y = cy + Math.sin(a) * dist * 0.96;
    if (y > 1030 || y < 140) continue;

    const r = 14 + rng() * 34;
    const col = accentColors[i % accentColors.length];
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, rgba(col, isMist ? 0.34 : 0.46));
    g.addColorStop(0.55, rgba(col, 0.14));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Floating delicate botanical petals or crystalline cold-spring bubbles
  if (isCold) {
    const bubbleCount = fast ? 12 : 24;
    for (let i = 0; i < bubbleCount; i++) {
      const a = rng() * Math.PI * 2;
      const dist = 190 + rng() * 235;
      const x = cx + Math.cos(a) * dist * 0.95;
      const y = cy + Math.sin(a) * dist;
      if (y > 1020 || y < 140) continue;
      const r = 5 + rng() * 13;
      ctx.strokeStyle = rgba('#D4F0FC', 0.58);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (isPetal) {
    const petalCount = fast ? 8 : 16;
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2 + rng() * 0.5;
      const dist = 235 + rng() * 185;
      const x = cx + Math.cos(a) * dist * 0.94;
      const y = cy + Math.sin(a) * dist * 0.92;
      if (y > 1010 || y < 150) continue;

      const len = 16 + rng() * 20;
      const wid = len * 0.46;
      const col = accentColors[i % accentColors.length];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rng() * Math.PI * 2);
      const pg = ctx.createLinearGradient(0, -wid, len, wid);
      pg.addColorStop(0, rgba('#FFF8F0', 0.85));
      pg.addColorStop(0.55, rgba(col, 0.72));
      pg.addColorStop(1, rgba(col, 0.22));
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(len * 0.35, -wid, len * 0.8, -wid * 0.65, len, 0);
      ctx.bezierCurveTo(len * 0.8, wid * 0.65, len * 0.35, wid, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // 3. Champagne-gold micron stardust & delicate 4-point specular sparkles
  const starCount = fast ? 14 : 34;
  for (let i = 0; i < starCount; i++) {
    const x = 96 + rng() * (BASE_W - 192);
    const y = 165 + rng() * 840;
    const distCenter = Math.hypot(x - cx, y - cy);
    if (distCenter < 130) continue; // Keep center focal artwork crisp and uncluttered

    const col = i % 3 === 0 ? '#FFF1CE' : i % 3 === 1 ? palette.secondary : accentColors[i % accentColors.length];
    if (i % 4 === 0) {
      const r = 7 + rng() * 11;
      ctx.fillStyle = rgba(col, 0.78);
      drawFourPointStar(ctx, x, y, r, r * 0.24);
      ctx.fill();
    } else {
      const r = 1.6 + rng() * 3.4;
      ctx.fillStyle = rgba(col, 0.55 + rng() * 0.35);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  return canvas;
}

// ============================================================================
// LAYER 4: LOCKED ZERO-PARALLAX GILDED COLLECTOR FRAME & TYPOGRAPHY
// ============================================================================

function fitTextSingleLine(ctx, text, maxWidth, fontWeight, startPx, minPx, fontFamily) {
  let size = startPx;
  while (size > minPx) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) return { size, text };
    size -= 2;
  }
  ctx.font = `${fontWeight} ${minPx}px ${fontFamily}`;
  let trimmed = text;
  while (trimmed.length > 2 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return { size: minPx, text: trimmed === text ? text : `${trimmed}…` };
}

function getHeaderRightStamp(card) {
  if (card?.cardType === 'bean_card') {
    const country = card?.origin?.country || '';
    const alt = card?.origin?.altitude || card?.origin?.grade || '';
    return [country, alt].filter(Boolean).join(' · ');
  }
  const groupLabels = {
    species: '核心豆种 · SPECIES',
    variety: '细分品种 · VARIETY',
    origin: '世界风土 · TERROIR',
    craft_tasting: '工艺品鉴 · CRAFT',
  };
  return card?.topic || groupLabels[card?.group] || '咖啡图鉴 · ATLAS';
}

export function renderTextFrameCanvas(card, options = {}) {
  const width = options.width || BASE_W;
  const height = options.height || BASE_H;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(width / BASE_W, height / BASE_H);

  const palette = getPalette(card);
  const finish = card?.visual?.defaultFinish || 'gold';
  const frameColor = finish === 'silver' ? '#CBD8E4' : '#DAB46E';
  const frameSoft = finish === 'silver' ? 'rgba(203, 216, 228, 0.42)' : 'rgba(218, 180, 110, 0.42)';

  // 1. Subtle top & bottom dark scrims guaranteeing museum legibility over BOTH AI & procedural art
  const topScrim = ctx.createLinearGradient(0, 0, 0, 232);
  topScrim.addColorStop(0, 'rgba(10, 7, 5, 0.78)');
  topScrim.addColorStop(0.55, 'rgba(10, 7, 5, 0.28)');
  topScrim.addColorStop(1, 'rgba(10, 7, 5, 0)');
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, BASE_W, 232);

  const bottomScrim = ctx.createLinearGradient(0, 916, 0, BASE_H);
  bottomScrim.addColorStop(0.0, 'rgba(11, 8, 6, 0)');
  bottomScrim.addColorStop(0.24, 'rgba(12, 8, 6, 0.72)');
  bottomScrim.addColorStop(0.50, 'rgba(12, 8, 6, 0.92)');
  bottomScrim.addColorStop(1.0, 'rgba(10, 7, 5, 0.98)');
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, 916, BASE_W, BASE_H - 916);

  // 2. Unified museum double-hairline rounded gilded border
  ctx.strokeStyle = rgba(frameColor, 0.84);
  ctx.lineWidth = 2.8;
  roundRectPath(ctx, 32, 32, BASE_W - 64, BASE_H - 64, 42);
  ctx.stroke();

  ctx.strokeStyle = frameSoft;
  ctx.lineWidth = 1.4;
  roundRectPath(ctx, 44, 44, BASE_W - 88, BASE_H - 88, 34);
  ctx.stroke();

  // Subtle top/bottom center ornamental diamonds on inner frame
  ctx.fillStyle = frameColor;
  drawDiamond(ctx, BASE_W * 0.5, 44, 7.5, 7.5);
  ctx.fill();
  drawDiamond(ctx, BASE_W * 0.5, BASE_H - 44, 7.5, 7.5);
  ctx.fill();

  // 3. Top Header Band: enlarged left code badge (26px) + crisp right origin/altitude stamp (24px)
  const code = String(card?.code || 'CA-00');
  ctx.font = `700 26px ${MONO_FONT}`;
  const codeW = Math.max(114, ctx.measureText(code).width + 42);

  roundRectPath(ctx, 70, 72, codeW, 54, 27);
  ctx.fillStyle = 'rgba(14, 10, 8, 0.86)';
  ctx.fill();
  ctx.strokeStyle = rgba(frameColor, 0.82);
  ctx.lineWidth = 1.9;
  ctx.stroke();

  ctx.fillStyle = frameColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, 70 + codeW / 2, 100);

  // Right stamp (24px bold high-contrast with subtle dark drop shadow)
  const rightStamp = getHeaderRightStamp(card);
  if (rightStamp) {
    const fitted = fitTextSingleLine(ctx, rightStamp, 570, '600', 25, 21, SANS_FONT);
    ctx.save();
    ctx.font = `600 ${fitted.size}px ${SANS_FONT}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(6, 3, 2, 0.78)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(248, 241, 231, 0.94)';
    ctx.fillText(fitted.text, BASE_W - 72, 100);
    ctx.restore();
  }

  // 4. Lower Typography Showcase (commanding museum large-type hierarchy with generous breathing room)
  // Ornamental brass divider line above title
  ctx.strokeStyle = rgba(frameColor, 0.52);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 1072);
  ctx.lineTo(BASE_W * 0.5 - 24, 1072);
  ctx.moveTo(BASE_W * 0.5 + 24, 1072);
  ctx.lineTo(BASE_W - 80, 1072);
  ctx.stroke();
  ctx.fillStyle = frameColor;
  drawDiamond(ctx, BASE_W * 0.5, 1072, 7.5, 7.5);
  ctx.fill();

  // Main Card Title (enlarged 56–64px commanding serif with warm dark drop shadow)
  const titleText = String(card?.title || '未命名典藏卡');
  const titleFit = fitTextSingleLine(ctx, titleText, BASE_W - 136, '700', 64, 44, SERIF_FONT);
  ctx.save();
  ctx.font = `700 ${titleFit.size}px ${SERIF_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(6, 3, 2, 0.85)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FAF4EB';
  ctx.fillText(titleFit.text, BASE_W * 0.5, 1140);
  ctx.restore();

  // Subtitle (English / Botanical name)
  const subText = String(card?.subtitle || '');
  if (subText) {
    const subFit = fitTextSingleLine(ctx, subText, BASE_W - 148, '500', 26, 20, SANS_FONT);
    ctx.save();
    ctx.font = `500 ${subFit.size}px ${SANS_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(6, 3, 2, 0.72)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(232, 220, 204, 0.90)';
    ctx.fillText(subFit.text, BASE_W * 0.5, 1204);
    ctx.restore();
  }

  // Middle Spec / Tagline Line (enlarged 25–27px crisp readability)
  if (card?.cardType === 'bean_card') {
    const roastLabel = card?.roast?.label ? `${card.roast.label}烘焙` : '';
    const roastColor = card?.roast?.colorHex || '#8C582F';
    const procName = String(card?.processing?.name || '').split('(')[0].trim();
    const variety = card?.botany?.variety || '';
    const metaStr = [variety, procName, roastLabel].filter(Boolean).join('  ·  ');

    const metaFit = fitTextSingleLine(ctx, metaStr, BASE_W - 196, '600', 27, 22, SANS_FONT);
    ctx.font = `600 ${metaFit.size}px ${SANS_FONT}`;
    const metaW = ctx.measureText(metaFit.text).width;

    // Roast dot beside metadata strip
    const dotX = BASE_W * 0.5 - metaW / 2 - 20;
    ctx.fillStyle = roastColor;
    ctx.beginPath();
    ctx.arc(dotX, 1266, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(frameColor, 0.88);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = 'rgba(6, 3, 2, 0.75)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(244, 234, 220, 0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(metaFit.text, BASE_W * 0.5 + 8, 1266);
    ctx.restore();

    // Top 3-4 Enlarged Colored Flavor Capsules (25px)
    const flavors = (card?.sensory?.flavors || [])
      .slice(0, 4)
      .map((f) => (typeof f === 'string' ? f : f?.name))
      .filter(Boolean);

    if (flavors.length > 0) {
      drawFrontCapsules(ctx, flavors, 1350, true, frameColor);
    }
  } else {
    // Knowledge card: enlarged concise key tagline (25–27px) + crisp 25px capsules
    const rawTagline = String(card?.tagline || card?.summary || '').trim();
    if (rawTagline) {
      let displayTagline = rawTagline;
      if (rawTagline.includes('——')) {
        const head = rawTagline.split('——')[0].trim();
        if (head.length >= 8) displayTagline = head;
      }
      const tagFit = fitTextSingleLine(ctx, displayTagline, BASE_W - 140, '500', 27, 25, SERIF_FONT);
      ctx.save();
      ctx.font = `500 ${tagFit.size}px ${SERIF_FONT}`;
      ctx.shadowColor = 'rgba(6, 3, 2, 0.75)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = 'rgba(242, 228, 206, 0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagFit.text, BASE_W * 0.5, 1266);
      ctx.restore();
    }

    const metrics = Array.isArray(card?.metrics) ? card.metrics : [];
    const compactMetricPills = metrics
      .map((m) => {
        const compactVal = String(m.value || '').split('（')[0].split('(')[0].trim();
        const combined = `${m.label} ${compactVal || m.value}`.trim();
        return combined.length <= 13 ? combined : null;
      })
      .filter(Boolean)
      .slice(0, 3);

    const rawTags = Array.isArray(card?.tags) ? card.tags : [];
    const focusedTags = (rawTags.length >= 4 ? rawTags.slice(1, 5) : rawTags.slice(0, 4)).filter(Boolean);
    const pills = compactMetricPills.length >= 2 ? compactMetricPills : focusedTags;
    if (pills.length > 0) {
      drawFrontCapsules(ctx, pills, 1350, false, frameColor);
    }
  }

  // 5. Collector Footer Micro-Seal
  const rarityCount =
    card?.visual?.rarity === 'legendary' ? 3 : card?.visual?.rarity === 'rare' ? 2 : 1;
  const stars = Array(rarityCount).fill('◆').join(' ');

  ctx.font = `600 18px ${MONO_FONT}`;
  ctx.fillStyle = rgba(frameColor, 0.78);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ROAST & TERROIR ATLAS', 78, 1448);

  ctx.textAlign = 'right';
  ctx.fillText(stars, BASE_W - 78, 1448);

  ctx.restore();
  return canvas;
}

function drawFrontCapsules(ctx, labels, centerY, useFlavorColors, frameColor) {
  ctx.save();
  const gap = 14;
  const pillH = 54;
  const maxRowW = BASE_W - 132;

  const measureWithSize = (fontSize) => {
    ctx.font = `600 ${fontSize}px ${SANS_FONT}`;
    return labels.map((text) => {
      const color = useFlavorColors ? getFlavorColor(text) : frameColor;
      const textW = ctx.measureText(text).width;
      const padLeft = useFlavorColors ? 44 : 26;
      const padRight = 26;
      return { text, color, w: textW + padLeft + padRight };
    });
  };

  let fontSize = 25;
  let items = measureWithSize(fontSize);

  // If 3+ items exist and first 2 already overflow at 25px, step slightly to 23px so capsules stay legible & unclipped
  const firstTwoW = items.slice(0, 2).reduce((acc, it, idx) => acc + it.w + (idx > 0 ? gap : 0), 0);
  if (items.length >= 2 && firstTwoW > maxRowW) {
    fontSize = 23;
    items = measureWithSize(fontSize);
  }

  // Fit as many capsules cleanly onto one centered row without clipping
  const chosen = [];
  let totalW = 0;
  for (const item of items) {
    const nextW = totalW + (chosen.length > 0 ? gap : 0) + item.w;
    if (nextW > maxRowW && chosen.length >= 1) break;
    chosen.push(item);
    totalW = nextW;
  }

  ctx.font = `600 ${fontSize}px ${SANS_FONT}`;
  let curX = (BASE_W - totalW) / 2;
  for (const item of chosen) {
    roundRectPath(ctx, curX, centerY - pillH / 2, item.w, pillH, pillH / 2);
    ctx.fillStyle = 'rgba(18, 13, 10, 0.92)';
    ctx.fill();
    ctx.strokeStyle = rgba(item.color, 0.82);
    ctx.lineWidth = 2.0;
    ctx.stroke();

    if (useFlavorColors) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(curX + 23, centerY, 8.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#FAF4EA';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.text, curX + (useFlavorColors ? 40 : 26), centerY + 1);
    curX += item.w + gap;
  }
  ctx.restore();
}

/**
 * Render all 5 procedural front layers in one call.
 */
export function renderProceduralFront(card, options = {}) {
  const backgroundCanvas = renderBackgroundCanvas(card, options);
  const { subjectCanvas, lineartCanvas } = renderSubjectAndLineartCanvases(card, options);
  const effectsCanvas = renderEffectsCanvas(card, options);
  const textCanvas = renderTextFrameCanvas(card, options);

  return {
    backgroundCanvas,
    subjectCanvas,
    effectsCanvas,
    lineartCanvas,
    textCanvas,
  };
}
