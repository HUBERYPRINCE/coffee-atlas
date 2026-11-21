import { getFlavorColor, RADAR_AXES } from '../../data/flavor-palette.js';

/**
 * High-DPI (1440 x 2160) V2.0 Large-Type Collector Back-Card Canvas Renderer.
 *
 * Designed as an instant-glance physical estate tasting card ("少字大字号典藏品鉴卡"):
 * - Tactile warm archival cotton paper (#F6F1E7) + bronze double-hairline frame
 * - Zero microscopic uppercase English dust labels — pure bold Chinese museum hierarchy
 * - Bean cards: 56-62px title, clean 2x2 core spec grid (with prominent green-bean physics
 *   like 10.8% 含水 · 880g/L 密度), giant 274px 6D sensory radar (36px labels / 38px scores),
 *   smooth roast gradient bar, 28px flavor capsules, 31px tasting quote, and 4 giant 40px brew tiles
 * - Knowledge cards: 54-60px title, adaptive 36-40px KPI cards, 31px core takeaway, crisp 28px
 *   high-contrast comparison table / 30px highlights, and dark-bronze 29px myth-buster summary
 */

const BACK_W = 1440;
const BACK_H = 2160;
const PAD_X = 88;
const CONTENT_W = BACK_W - PAD_X * 2; // 1264px

const SERIF_FONT = `'Songti SC', 'Noto Serif SC', 'STSong', 'Source Han Serif SC', Georgia, serif`;
const SANS_FONT = `'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif`;
const MONO_FONT = `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;

const ROAST_GRADIENT_STOPS = [
  { pos: 0.00, color: '#C69764' },
  { pos: 0.16, color: '#B07D4C' },
  { pos: 0.32, color: '#996639' },
  { pos: 0.48, color: '#83512B' },
  { pos: 0.64, color: '#6B3E20' },
  { pos: 0.80, color: '#4E2A15' },
  { pos: 1.00, color: '#24130B' },
];

const ROAST_ANCHORS = [
  { pos: 0.05, label: '极浅烘' },
  { pos: 0.32, label: '中浅烘' },
  { pos: 0.62, label: '中度烘' },
  { pos: 0.93, label: '深度烘' },
];

function hashString(str) {
  let h = 2166136261;
  const s = String(str || 'back');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
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

function fitSingleLine(ctx, text, maxW, weight, startPx, minPx, font) {
  const raw = String(text || '');
  let size = startPx;
  while (size > minPx) {
    ctx.font = `${weight} ${size}px ${font}`;
    if (ctx.measureText(raw).width <= maxW) return { size, text: raw };
    size -= 2;
  }
  ctx.font = `${weight} ${minPx}px ${font}`;
  let out = raw;
  while (out.length > 2 && ctx.measureText(`${out}…`).width > maxW) {
    out = out.slice(0, -1);
  }
  return { size: minPx, text: out === raw ? raw : `${out}…` };
}

/**
 * CJK-aware multi-line wrapper that respects spaces/punctuation and clamps to `maxLines`.
 */
function wrapTextLines(ctx, text, maxWidth, maxLines = 4) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return [];

  const lines = [];
  let current = '';

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      const lastSpace = current.lastIndexOf(' ');
      if (lastSpace > current.length * 0.55 && /[A-Za-z0-9]/.test(ch)) {
        lines.push(current.slice(0, lastSpace).trim());
        current = current.slice(lastSpace + 1) + ch;
      } else {
        lines.push(current.trim());
        current = ch === ' ' ? '' : ch;
      }
      if (lines.length === maxLines - 1) {
        let rest = (current + raw.slice(i + 1)).trim();
        if (ctx.measureText(rest).width > maxWidth) {
          while (rest.length > 1 && ctx.measureText(`${rest}…`).width > maxWidth) {
            rest = rest.slice(0, -1);
          }
          rest = `${rest}…`;
        }
        lines.push(rest);
        return lines;
      }
    } else {
      current = test;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

/**
 * Strip verbose parenthetical notes for crisp big-type display on card back
 * (full verbose text remains accessible in the right reading drawer).
 */
function stripParenthetical(str) {
  return String(str || '')
    .replace(/\s*（[^）]*）/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactRegionForBack(origin) {
  const rawRegion = String(origin?.region || origin?.country || '').trim();
  // Keep Chinese name when format is "Banchi Maji（班奇马吉 · 戈里森林）" or "Kaffa Forest（卡法森林）"
  const cnInside = rawRegion.match(/^([A-Za-z\s-]+)[（(]([^）)]+)[）)]$/);
  if (cnInside && /[\u4e00-\u9fa5]/.test(cnInside[2])) {
    return cnInside[2].split('·')[0].trim();
  }
  const stripped = stripParenthetical(rawRegion);
  if (stripped.length > 12 && stripped.includes('·')) {
    return stripped.split('·')[0].trim();
  }
  return stripped || origin?.country || '—';
}

function compactAltitudeForBack(origin) {
  const raw = String(origin?.altitude || origin?.altitudeLabel || '').trim();
  return stripParenthetical(raw);
}

function compactAgtron(agtron) {
  const raw = String(agtron || '').trim();
  if (!raw) return '';
  const head = stripParenthetical(raw);
  return head ? `Agtron ${head}` : '';
}

function drawCottonPaperBase(ctx, card) {
  const rng = mulberry32(hashString(`${card?.id || 'card'}:backpaper`));
  const paperTint = card?.visual?.palette?.paperTint || '#F6F1E7';

  // Warm archival cotton gradient
  const grad = ctx.createLinearGradient(0, 0, BACK_W, BACK_H);
  grad.addColorStop(0.0, '#FAF6EE');
  grad.addColorStop(0.45, paperTint);
  grad.addColorStop(1.0, '#EFE6D7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, BACK_W, BACK_H);

  // Subtle tactile cotton fibers
  ctx.save();
  for (let i = 0; i < 300; i++) {
    const x = rng() * BACK_W;
    const y = rng() * BACK_H;
    const len = 10 + rng() * 28;
    const ang = rng() * Math.PI * 2;
    ctx.strokeStyle = i % 2 === 0
      ? `rgba(142, 114, 82, ${(0.03 + rng() * 0.035).toFixed(3)})`
      : `rgba(255, 252, 245, ${(0.12 + rng() * 0.14).toFixed(3)})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  ctx.restore();

  // Gentle warm edge aging vignette
  const vig = ctx.createRadialGradient(BACK_W * 0.5, BACK_H * 0.48, 420, BACK_W * 0.5, BACK_H * 0.5, 1340);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(116, 86, 54, 0.10)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, BACK_W, BACK_H);

  // Double hairline bronze collector frame
  const bronze = '#A27640';
  ctx.strokeStyle = rgba(bronze, 0.76);
  ctx.lineWidth = 2.8;
  roundRectPath(ctx, 40, 40, BACK_W - 80, BACK_H - 80, 48);
  ctx.stroke();

  ctx.strokeStyle = rgba(bronze, 0.36);
  ctx.lineWidth = 1.4;
  roundRectPath(ctx, 54, 54, BACK_W - 108, BACK_H - 108, 38);
  ctx.stroke();

  // Top & bottom center ornamental diamonds
  ctx.fillStyle = bronze;
  for (const [dx, dy] of [[BACK_W * 0.5, 54], [BACK_W * 0.5, BACK_H - 54]]) {
    ctx.beginPath();
    ctx.moveTo(dx, dy - 7);
    ctx.lineTo(dx + 7, dy);
    ctx.lineTo(dx, dy + 7);
    ctx.lineTo(dx - 7, dy);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBackHeader(ctx, card, rightLabel, titleMaxPx = 62) {
  const leftX = PAD_X;
  const rightX = BACK_W - PAD_X;
  const maxW = CONTENT_W;

  // Big Code Pill (28px bold mono)
  const code = String(card?.code || 'CA-00');
  ctx.font = `700 28px ${MONO_FONT}`;
  const badgeW = Math.max(126, ctx.measureText(code).width + 46);
  roundRectPath(ctx, leftX, 92, badgeW, 56, 28);
  ctx.fillStyle = '#231A15';
  ctx.fill();
  ctx.fillStyle = '#EBC886';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, leftX + badgeW / 2, 121);

  // Left secondary origin/topic label beside badge
  const leftSub = card?.cardType === 'bean_card'
    ? [card?.origin?.continent, card?.origin?.country].filter(Boolean).join(' · ')
    : (card?.topic || '咖啡百科图鉴');
  if (leftSub) {
    ctx.font = `600 26px ${SANS_FONT}`;
    ctx.fillStyle = '#6D5846';
    ctx.textAlign = 'left';
    ctx.fillText(leftSub, leftX + badgeW + 22, 121);
  }

  // Right seal label
  if (rightLabel) {
    const rFit = fitSingleLine(ctx, rightLabel, 480, '600', 25, 20, SANS_FONT);
    ctx.font = `600 ${rFit.size}px ${SANS_FONT}`;
    ctx.fillStyle = '#8C6232';
    ctx.textAlign = 'right';
    ctx.fillText(rFit.text, rightX, 121);
  }

  // Large Commanding Serif Main Title (56-62px for beans, 54-60px for knowledge)
  const tFit = fitSingleLine(ctx, card?.title || '', maxW, '700', titleMaxPx, 44, SERIF_FONT);
  ctx.font = `700 ${tFit.size}px ${SERIF_FONT}`;
  ctx.fillStyle = '#1B1410';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tFit.text, leftX, 198);

  // Concise Subtitle (26px)
  if (card?.subtitle) {
    const sFit = fitSingleLine(ctx, card.subtitle, maxW, '500', 26, 21, SANS_FONT);
    ctx.font = `500 ${sFit.size}px ${SANS_FONT}`;
    ctx.fillStyle = '#6F5E50';
    ctx.fillText(sFit.text, leftX, 250);
  }
}

function drawFooter(ctx, message) {
  ctx.strokeStyle = 'rgba(162, 118, 64, 0.36)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(PAD_X, 2004);
  ctx.lineTo(BACK_W - PAD_X, 2004);
  ctx.stroke();

  ctx.font = `500 24px ${SANS_FONT}`;
  ctx.fillStyle = '#6E5B4B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, BACK_W * 0.5, 2046);
}

// ============================================================================
// BEAN CARD BACK LAYOUT (2x2 Big Specs + Giant 6D Radar + Roast + 40px Brew)
// ============================================================================

function drawBeanSpecGrid2x2(ctx, card, startY) {
  const leftX = PAD_X;
  const totalW = CONTENT_W;
  const colW = totalW / 2;
  const rowH = 118;
  const totalH = rowH * 2;

  const origin = card?.origin || {};
  const regionShort = compactRegionForBack(origin);
  const altShort = compactAltitudeForBack(origin);
  const cell1Val = [regionShort, altShort].filter(Boolean).join(' · ') || '—';

  const varietyShort = stripParenthetical(card?.botany?.variety || card?.botany?.species || '');
  const procShort = stripParenthetical(card?.processing?.name || '');
  const cell2Val = [varietyShort, procShort].filter(Boolean).join(' · ') || '—';

  const roastLabel = card?.roast?.label ? `${card.roast.label}烘焙` : '';
  const agtronShort = compactAgtron(card?.roast?.agtron);
  const cell3Val = [roastLabel, agtronShort].filter(Boolean).join(' · ') || '—';

  const physics = card?.physics;
  const hasPhysics = Boolean(physics && (physics.moisturePct != null || physics.densityGl != null));
  let cell4Label = '等级与产季';
  let cell4Val = [stripParenthetical(origin.grade), origin.harvestSeason].filter(Boolean).join(' · ') || '—';

  if (hasPhysics) {
    cell4Label = '生豆实测物理指标';
    const physParts = [];
    if (physics.moisturePct != null) physParts.push(`${physics.moisturePct}% 含水`);
    if (physics.densityGl != null) physParts.push(`${physics.densityGl}g/L 密度`);
    if (physParts.length < 2 && physics.waterActivity != null) {
      physParts.push(`${physics.waterActivity} Aw`);
    }
    cell4Val = physParts.join(' · ');
  }

  const cells = [
    { label: '产区与海拔', value: cell1Val, highlight: false },
    { label: '豆种与处理', value: cell2Val, highlight: false },
    { label: '烘焙度与色值', value: cell3Val, highlight: false },
    { label: cell4Label, value: cell4Val, highlight: hasPhysics },
  ];

  // Highlight warm champagne plate behind the measured-physics cell when present
  if (hasPhysics) {
    roundRectPath(ctx, leftX + colW + 10, startY + rowH + 8, colW - 14, rowH - 16, 14);
    ctx.fillStyle = 'rgba(214, 162, 94, 0.17)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(176, 122, 52, 0.42)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // Top & bottom crisp bronze rules
  ctx.strokeStyle = 'rgba(146, 108, 62, 0.48)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(leftX, startY);
  ctx.lineTo(leftX + totalW, startY);
  ctx.moveTo(leftX, startY + totalH);
  ctx.lineTo(leftX + totalW, startY + totalH);
  ctx.stroke();

  // Inner cross hairlines
  ctx.strokeStyle = 'rgba(146, 108, 62, 0.24)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(leftX, startY + rowH);
  ctx.lineTo(leftX + totalW, startY + rowH);
  ctx.moveTo(leftX + colW, startY + 12);
  ctx.lineTo(leftX + colW, startY + totalH - 12);
  ctx.stroke();

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cell = cells[i];
    const padL = col === 0 ? 6 : 28;
    const cx = leftX + col * colW + padL;
    const cy = startY + row * rowH;
    const cellMaxW = colW - padL - 22;

    ctx.font = `600 24px ${SANS_FONT}`;
    ctx.fillStyle = cell.highlight ? '#9A5F1F' : '#856A4E';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(cell.label, cx, cy + 16);

    const vFit = fitSingleLine(ctx, cell.value, cellMaxW, '700', 36, 30, SANS_FONT);
    ctx.font = `700 ${vFit.size}px ${SANS_FONT}`;
    ctx.fillStyle = cell.highlight ? '#1B120C' : '#201813';
    ctx.textBaseline = 'middle';
    ctx.fillText(vFit.text, cx, cy + 79);
  }

  return startY + totalH;
}

function drawHeroRadar6D(ctx, card, cx, cy, radius) {
  const radar = card?.sensory?.radar6D || {};
  const palette = card?.visual?.palette || {};
  const primary = palette.primary || '#7A4A28';
  const accent = palette.secondary || '#C88D44';
  const axes = RADAR_AXES;
  const n = axes.length;

  const getPoint = (i, ratio) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return {
      x: cx + Math.cos(a) * radius * ratio,
      y: cy + Math.sin(a) * radius * ratio,
      angle: a,
    };
  };

  // Concentric hexagonal guide rings (levels 1..5)
  for (let level = 5; level >= 1; level--) {
    const ratio = level / 5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const pt = getPoint(i, ratio);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();

    if (level % 2 === 1) {
      ctx.fillStyle = level === 5 ? 'rgba(182, 146, 102, 0.095)' : 'rgba(182, 146, 102, 0.065)';
      ctx.fill();
    }
    ctx.strokeStyle = level === 5 ? 'rgba(130, 96, 58, 0.56)' : 'rgba(130, 96, 58, 0.26)';
    ctx.lineWidth = level === 5 ? 2.8 : 1.5;
    ctx.stroke();
  }

  // Radial spokes
  ctx.strokeStyle = 'rgba(130, 96, 58, 0.30)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < n; i++) {
    const pt = getPoint(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  // Clean subtle numeric guide on top spoke (3, 5)
  ctx.font = `600 20px ${MONO_FONT}`;
  ctx.fillStyle = 'rgba(126, 100, 74, 0.66)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (const lv of [2, 4]) {
    ctx.fillText(String(lv), cx + 10, cy - (radius * lv) / 5);
  }

  // Data polygon vertices
  const points = axes.map((axis, i) => {
    const rawVal = Number(radar[axis.key] ?? 3.5);
    const val = Math.max(0.4, Math.min(5.0, Number.isNaN(rawVal) ? 3.5 : rawVal));
    return { ...getPoint(i, val / 5), val, axis };
  });

  // Rich soft radial polygon fill
  const polyGrad = ctx.createRadialGradient(cx, cy, 18, cx, cy, radius);
  polyGrad.addColorStop(0, rgba(accent, 0.38));
  polyGrad.addColorStop(0.65, rgba(primary, 0.32));
  polyGrad.addColorStop(1, rgba(primary, 0.48));

  ctx.beginPath();
  points.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.closePath();
  ctx.fillStyle = polyGrad;
  ctx.fill();
  ctx.strokeStyle = primary;
  ctx.lineWidth = 5.4;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Inner luminous gold trace
  ctx.strokeStyle = rgba(accent, 0.78);
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Oversized vertex dots + instant-read 36px Chinese axis labels & 38px bold mono scores
  for (let i = 0; i < n; i++) {
    const pt = points[i];
    const outer = getPoint(i, 1);
    const axisColor = pt.axis.color || primary;

    ctx.fillStyle = '#FAF6EE';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 13.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 4.8;
    ctx.stroke();

    ctx.fillStyle = axisColor;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5.2, 0, Math.PI * 2);
    ctx.fill();

    const cos = Math.cos(outer.angle);
    const sin = Math.sin(outer.angle);
    const scoreStr = pt.val.toFixed(1);

    let lx = outer.x;
    let ly = outer.y;
    let align = 'center';

    if (Math.abs(cos) < 0.2) {
      align = 'center';
      ly = sin < 0 ? outer.y - 54 : outer.y + 44;
    } else if (cos > 0) {
      align = 'left';
      lx = outer.x + 34;
      ly = outer.y + (sin < 0 ? -4 : 6);
    } else {
      align = 'right';
      lx = outer.x - 34;
      ly = outer.y + (sin < 0 ? -4 : 6);
    }

    ctx.textAlign = align;
    ctx.textBaseline = 'middle';

    if (sin < -0.5) {
      // Top axis ("花果香" + score stacked cleanly above top vertex)
      ctx.font = `700 36px ${SANS_FONT}`;
      ctx.fillStyle = '#1E1612';
      ctx.fillText(pt.axis.label, lx, ly - 22);
      ctx.font = `700 38px ${MONO_FONT}`;
      ctx.fillStyle = axisColor;
      ctx.fillText(scoreStr, lx, ly + 20);
    } else if (sin > 0.5) {
      // Bottom axis ("醇厚度" + score cleanly below bottom vertex)
      ctx.font = `700 36px ${SANS_FONT}`;
      ctx.fillStyle = '#1E1612';
      ctx.fillText(pt.axis.label, lx, ly - 4);
      ctx.font = `700 38px ${MONO_FONT}`;
      ctx.fillStyle = axisColor;
      ctx.fillText(scoreStr, lx, ly + 40);
    } else {
      // Side axes
      ctx.font = `700 36px ${SANS_FONT}`;
      ctx.fillStyle = '#1E1612';
      ctx.fillText(pt.axis.label, lx, ly - 21);
      ctx.font = `700 38px ${MONO_FONT}`;
      ctx.fillStyle = axisColor;
      ctx.fillText(scoreStr, lx, ly + 24);
    }
  }
}

function drawRoastGradientBar(ctx, roast, startY) {
  const leftX = PAD_X;
  const totalW = CONTENT_W;
  const barY = startY + 50;
  const barH = 24;

  // Left section title (clean Chinese, zero dust English)
  ctx.font = `600 24px ${SANS_FONT}`;
  ctx.fillStyle = '#7F6246';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('烘焙度色阶', leftX, startY + 18);

  // Highlighted active roast pill on right (26px bold)
  const roastLabel = roast?.label ? `${roast.label}烘焙` : '中浅度烘焙';
  const agtronShort = compactAgtron(roast?.agtron);
  const badgeText = [roastLabel, agtronShort].filter(Boolean).join(' · ');
  ctx.font = `700 26px ${SANS_FONT}`;
  const badgeW = Math.min(totalW - 200, ctx.measureText(badgeText).width + 40);
  const badgeX = leftX + totalW - badgeW;
  roundRectPath(ctx, badgeX, startY - 4, badgeW, 42, 21);
  ctx.fillStyle = '#231A15';
  ctx.fill();
  ctx.strokeStyle = 'rgba(214, 162, 94, 0.58)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const bFit = fitSingleLine(ctx, badgeText, badgeW - 28, '700', 26, 21, SANS_FONT);
  ctx.font = `700 ${bFit.size}px ${SANS_FONT}`;
  ctx.fillStyle = '#F2D399';
  ctx.textAlign = 'center';
  ctx.fillText(bFit.text, badgeX + badgeW / 2, startY + 18);

  // Smooth continuous 24px coffee-roast gradient bar
  const grad = ctx.createLinearGradient(leftX, barY, leftX + totalW, barY);
  for (const stop of ROAST_GRADIENT_STOPS) {
    grad.addColorStop(stop.pos, stop.color);
  }
  roundRectPath(ctx, leftX, barY, totalW, barH, 12);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(92, 62, 34, 0.34)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Subtle internal graduation ticks
  ctx.strokeStyle = 'rgba(255, 245, 228, 0.24)';
  ctx.lineWidth = 1.4;
  for (let i = 1; i < 8; i++) {
    const tx = leftX + (totalW * i) / 8;
    ctx.beginPath();
    ctx.moveTo(tx, barY + 4);
    ctx.lineTo(tx, barY + barH - 4);
    ctx.stroke();
  }

  // Large high-contrast brass diamond cursor at roast.position01
  const pos01 = Math.max(0.04, Math.min(0.96, Number(roast?.position01 ?? 0.35)));
  const cursorX = leftX + pos01 * totalW;
  ctx.save();
  ctx.fillStyle = '#1E1510';
  ctx.strokeStyle = '#ECC47D';
  ctx.lineWidth = 4.0;
  ctx.beginPath();
  ctx.moveTo(cursorX, barY - 11);
  ctx.lineTo(cursorX + 15, barY + barH / 2);
  ctx.lineTo(cursorX, barY + barH + 11);
  ctx.lineTo(cursorX - 15, barY + barH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4 clean readable roast anchor captions below bar
  ctx.font = `500 22px ${SANS_FONT}`;
  ctx.fillStyle = '#756252';
  ctx.textBaseline = 'top';
  for (let i = 0; i < ROAST_ANCHORS.length; i++) {
    const anc = ROAST_ANCHORS[i];
    ctx.textAlign = i === 0 ? 'left' : i === ROAST_ANCHORS.length - 1 ? 'right' : 'center';
    const ax = i === 0 ? leftX : i === ROAST_ANCHORS.length - 1 ? leftX + totalW : leftX + anc.pos * totalW;
    ctx.fillText(anc.label, ax, barY + barH + 12);
  }

  return barY + barH + 44;
}

function drawBigFlavorCapsules(ctx, flavors, startY) {
  const leftX = PAD_X;
  const maxW = CONTENT_W;
  const pillH = 56;
  const gapX = 16;
  ctx.font = `700 28px ${SANS_FONT}`;

  let curX = leftX;
  let drawn = 0;

  for (const raw of flavors.slice(0, 6)) {
    const name = typeof raw === 'string' ? raw : raw?.name;
    if (!name) continue;
    const col = getFlavorColor(name);
    const w = ctx.measureText(name).width + 74;

    if (curX + w > leftX + maxW && drawn > 0) break;

    roundRectPath(ctx, curX, startY, w, pillH, pillH / 2);
    ctx.fillStyle = rgba(col, 0.14);
    ctx.fill();
    ctx.strokeStyle = rgba(col, 0.56);
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(curX + 28, startY + pillH / 2, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#201712';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, curX + 48, startY + pillH / 2 + 1);

    curX += w + gapX;
    drawn++;
  }

  return drawn > 0 ? startY + pillH : startY;
}

function drawGiantBrewCapsules(ctx, brewing, startY) {
  const leftX = PAD_X;
  const totalW = CONTENT_W;
  const gap = 18;
  const cardW = (totalW - gap * 3) / 4;
  const cardH = 144;

  ctx.font = `600 24px ${SANS_FONT}`;
  ctx.fillStyle = '#7F6246';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('手冲萃取参考', leftX, startY + 12);

  if (brewing?.doseWater) {
    ctx.font = `600 24px ${SANS_FONT}`;
    ctx.fillStyle = '#5B4636';
    ctx.textAlign = 'right';
    ctx.fillText(brewing.doseWater, leftX + totalW, startY + 12);
  }

  const boxY = startY + 38;
  const items = [
    { label: '水温', value: brewing?.waterTempC ? `${brewing.waterTempC}℃` : '92℃', mono: true },
    { label: '粉水比', value: brewing?.ratio || '1:15', mono: true },
    { label: '研磨度', value: brewing?.grindSize || '中细研磨', mono: false },
    { label: '总时长', value: brewing?.totalTime || '约 2:00', mono: false },
  ];

  for (let i = 0; i < 4; i++) {
    const bx = leftX + i * (cardW + gap);
    const it = items[i];

    roundRectPath(ctx, bx, boxY, cardW, cardH, 20);
    ctx.fillStyle = '#221914';
    ctx.fill();
    ctx.strokeStyle = 'rgba(214, 162, 94, 0.54)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    ctx.font = `600 23px ${SANS_FONT}`;
    ctx.fillStyle = '#D9B170';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(it.label, bx + cardW / 2, boxY + 22);

    const fontFam = it.mono ? MONO_FONT : SANS_FONT;
    const vFit = fitSingleLine(ctx, it.value, cardW - 26, '700', 40, 32, fontFam);
    ctx.font = `700 ${vFit.size}px ${fontFam}`;
    ctx.fillStyle = '#FAF4EA';
    ctx.textBaseline = 'middle';
    ctx.fillText(vFit.text, bx + cardW / 2, boxY + 95);
  }
}

function renderBeanBack(ctx, card) {
  const rightStamp = [stripParenthetical(card?.origin?.grade), card?.origin?.harvestSeason]
    .filter(Boolean)
    .join(' · ');
  drawBackHeader(ctx, card, rightStamp, 62);

  // 1. Clean 2x2 Big Core Spec Grid (y: 282 .. 518)
  drawBeanSpecGrid2x2(ctx, card, 282);

  // 2. Giant Centerpiece 6D Sensory Radar (r = 274px, labels span 540 .. 1284)
  drawHeroRadar6D(ctx, card, BACK_W * 0.5, 910, 274);

  // 3. Large Roast Spectrum Gradient Bar (y: 1312 .. 1424)
  const afterRoastY = drawRoastGradientBar(ctx, card?.roast, 1312);

  // 4. Flavor Capsules (28px) + Refined Tasting Note Quote (31px, 48px line-height, max 3 lines)
  const brewStartY = 1782;
  const zoneTop = afterRoastY + 14;
  const zoneBottom = brewStartY - 18;
  const zoneH = Math.max(180, zoneBottom - zoneTop);

  const flavors = Array.isArray(card?.sensory?.flavors) ? card.sensory.flavors : [];
  const pillsH = flavors.length > 0 ? 56 : 0;

  const notes = String(card?.sensory?.tastingNotes || card?.tagline || '').trim();
  ctx.font = `600 31px ${SERIF_FONT}`;
  const noteLines = notes ? wrapTextLines(ctx, notes, CONTENT_W - 34, 3) : [];
  const lineH = 48;
  const notesH = noteLines.length > 0 ? noteLines.length * lineH : 0;

  const midGap = pillsH > 0 && notesH > 0 ? 30 : 0;
  const totalBlockH = pillsH + midGap + notesH;
  let curY = zoneTop + Math.max(8, (zoneH - totalBlockH) * 0.48);

  if (pillsH > 0) {
    curY = drawBigFlavorCapsules(ctx, flavors, curY) + midGap;
  }

  if (noteLines.length > 0) {
    ctx.fillStyle = '#C48D45';
    roundRectPath(ctx, PAD_X, curY + 5, 8, Math.max(40, notesH - 12), 4);
    ctx.fill();

    ctx.font = `600 31px ${SERIF_FONT}`;
    ctx.fillStyle = '#251C16';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    noteLines.forEach((line, idx) => {
      ctx.fillText(line, PAD_X + 30, curY + idx * lineH);
    });
  }

  // 5. Bottom 4 Giant Brew Parameter Capsules (40px bold numbers)
  drawGiantBrewCapsules(ctx, card?.brewing, brewStartY);

  // 6. Clean Footer Hint (24px)
  drawFooter(ctx, '按 I 或点击「精读档案」查看完整产地故事与手冲计时器');
}

// ============================================================================
// KNOWLEDGE CARD BACK LAYOUT (Big-Type Adaptive KPI + 31px Quote + 28px Table)
// ============================================================================

function parseCompactKpi(metric) {
  const rawLabel = String(metric?.label || '').trim();
  const rawVal = String(metric?.value || '—').trim();
  const match = rawVal.match(/^([^（(]+)[（(]([^）)]+)[）)]$/);
  if (match) {
    const mainVal = match[1].trim();
    const note = match[2].trim();
    const compactLabel = note.length <= 6 && rawLabel.length <= 6 ? `${rawLabel} · ${note}` : rawLabel;
    return { label: compactLabel, value: mainVal || rawVal };
  }
  return { label: rawLabel, value: rawVal };
}

function measureKnowledgeKpis(ctx, metrics) {
  if (!Array.isArray(metrics) || metrics.length === 0) return null;
  const list = metrics.slice(0, 4).map(parseCompactKpi);
  const gap = 16;
  const singleColW = (CONTENT_W - gap * (list.length - 1)) / list.length;

  // Decide between sleek 1xN row vs generous 2x2 grid so values ALWAYS shine at 34-40px bold
  ctx.font = `700 34px ${SANS_FONT}`;
  const needsTwoByTwo =
    list.length === 4 &&
    list.some((m) => ctx.measureText(m.value).width > singleColW - 32);

  if (needsTwoByTwo) {
    return {
      mode: 'grid2x2',
      list,
      baseH: 118 * 2 + 16, // 252px
    };
  }
  return {
    mode: 'row',
    list,
    baseH: 146,
  };
}

function drawKnowledgeKpis(ctx, kpiSpec, startY, extraH = 0) {
  if (!kpiSpec) return startY;
  const { mode, list } = kpiSpec;
  const leftX = PAD_X;
  const gap = 16;

  if (mode === 'grid2x2') {
    const cardW = (CONTENT_W - gap) / 2;
    const cardH = 118 + Math.floor(extraH / 2);

    for (let i = 0; i < list.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = leftX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      roundRectPath(ctx, x, y, cardW, cardH, 16);
      ctx.fillStyle = '#EFE6D7';
      ctx.fill();
      ctx.strokeStyle = 'rgba(162, 118, 64, 0.44)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const lblFit = fitSingleLine(ctx, list[i].label, cardW - 44, '600', 24, 21, SANS_FONT);
      ctx.font = `600 ${lblFit.size}px ${SANS_FONT}`;
      ctx.fillStyle = '#79624E';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(lblFit.text, x + 24, y + 18);

      const isNumeric = /^[\d.<>≥≤%~–\-/\s+A-Za-z℃:·]+$/.test(list[i].value);
      const valFont = isNumeric ? MONO_FONT : SANS_FONT;
      const valFit = fitSingleLine(ctx, list[i].value, cardW - 44, '700', 38, 28, valFont);
      ctx.font = `700 ${valFit.size}px ${valFont}`;
      ctx.fillStyle = '#1E1612';
      ctx.textBaseline = 'middle';
      ctx.fillText(valFit.text, x + 24, y + cardH * 0.67);
    }

    return startY + cardH * 2 + gap;
  }

  // 1xN horizontal row
  const cardW = (CONTENT_W - gap * (list.length - 1)) / list.length;
  const cardH = 146 + extraH;

  for (let i = 0; i < list.length; i++) {
    const x = leftX + i * (cardW + gap);
    roundRectPath(ctx, x, startY, cardW, cardH, 18);
    ctx.fillStyle = '#EFE6D7';
    ctx.fill();
    ctx.strokeStyle = 'rgba(162, 118, 64, 0.44)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const isNumeric = /^[\d.<>≥≤%~–\-/\s+A-Za-z℃:·]+$/.test(list[i].value);
    const valFont = isNumeric ? MONO_FONT : SANS_FONT;
    const valFit = fitSingleLine(ctx, list[i].value, cardW - 28, '700', 40, 30, valFont);
    ctx.font = `700 ${valFit.size}px ${valFont}`;
    ctx.fillStyle = '#1E1612';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(valFit.text, x + cardW / 2, startY + cardH * 0.40);

    const lblFit = fitSingleLine(ctx, list[i].label, cardW - 24, '600', 24, 20, SANS_FONT);
    ctx.font = `600 ${lblFit.size}px ${SANS_FONT}`;
    ctx.fillStyle = '#755F4B';
    ctx.fillText(lblFit.text, x + cardW / 2, startY + cardH * 0.76);
  }

  return startY + cardH;
}

function measureCoreConclusion(ctx, text) {
  ctx.font = `600 31px ${SERIF_FONT}`;
  const lines = wrapTextLines(ctx, text, CONTENT_W - 76, 3);
  const lineH = 48;
  const baseH = 78 + lines.length * lineH;
  return { lines, lineH, baseH };
}

function drawCoreConclusionBox(ctx, measured, startY, extraPad = 0) {
  const leftX = PAD_X;
  const { lines, lineH, baseH } = measured;
  const boxH = baseH + extraPad;
  const shift = extraPad * 0.45;

  roundRectPath(ctx, leftX, startY, CONTENT_W, boxH, 18);
  ctx.fillStyle = 'rgba(214, 162, 94, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 126, 62, 0.46)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Left solid bronze accent ribbon
  ctx.fillStyle = '#B47B34';
  roundRectPath(ctx, leftX, startY, 10, boxH, 5);
  ctx.fill();

  ctx.font = `700 24px ${SANS_FONT}`;
  ctx.fillStyle = '#8F5C24';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('核心结论', leftX + 34, startY + 20 + shift * 0.5);

  ctx.font = `600 31px ${SERIF_FONT}`;
  ctx.fillStyle = '#1F1612';
  lines.forEach((line, i) => {
    ctx.fillText(line, leftX + 34, startY + 58 + shift + i * lineH);
  });

  return startY + boxH;
}

function measureBigComparisonTable(ctx, card, maxTableH) {
  const rows = Array.isArray(card?.comparisonTable) ? card.comparisonTable.slice(0, 5) : [];
  if (rows.length === 0) return null;

  const leftX = PAD_X;
  const totalW = CONTENT_W;
  const hasColC = rows.some((r) => r.colC != null && r.colC !== '');
  const colCount = hasColC ? 4 : 3;

  const headers = Array.isArray(card.tableHeaders) && card.tableHeaders.length >= colCount
    ? card.tableHeaders.slice(0, colCount).map((h) => stripParenthetical(h) || h)
    : hasColC
      ? ['维度', '特征 A', '特征 B', '特征 C']
      : ['核心维度', '代表特征', '对比说明'];

  const colWidths = colCount === 4
    ? [totalW * 0.20, totalW * 0.2667, totalW * 0.2667, totalW * 0.2666]
    : [totalW * 0.22, totalW * 0.39, totalW * 0.39];

  const colXs = [];
  let acc = leftX;
  for (const cw of colWidths) {
    colXs.push(acc);
    acc += cw;
  }

  const headerH = 64;
  const cellFontPx = colCount === 4 ? 27 : 28;
  const cellLineH = 36;
  const preparedRows = [];
  let bodyH = 0;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const vals = hasColC
      ? [row.metric || '', row.colA || '', row.colB || '', row.colC || '']
      : [row.metric || '', row.colA || '', row.colB || ''];

    ctx.font = `500 ${cellFontPx}px ${SANS_FONT}`;
    const wrapped = vals.map((v, c) => wrapTextLines(ctx, v, colWidths[c] - 32, 2));
    const maxLineCnt = Math.max(1, ...wrapped.map((w) => w.length));
    const baseRowH = maxLineCnt === 1 ? 68 : 102;

    if (headerH + bodyH + baseRowH > maxTableH && preparedRows.length >= 3) break;
    preparedRows.push({ wrapped, baseRowH });
    bodyH += baseRowH;
  }

  if (preparedRows.length === 0) return null;

  return {
    leftX,
    totalW,
    colCount,
    headers,
    colWidths,
    colXs,
    headerH,
    cellFontPx,
    cellLineH,
    rows: preparedRows,
    baseH: headerH + bodyH,
  };
}

function drawBigComparisonTable(ctx, tableSpec, startY, rowExtraH = 0) {
  if (!tableSpec) return startY;
  const { leftX, totalW, colCount, headers, colWidths, colXs, headerH, cellFontPx, cellLineH, rows } = tableSpec;

  // High-contrast dark espresso header bar
  roundRectPath(ctx, leftX, startY, totalW, headerH, 14);
  ctx.fillStyle = '#231A15';
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let c = 0; c < colCount; c++) {
    const hFit = fitSingleLine(ctx, headers[c], colWidths[c] - 28, '700', 26, 21, SANS_FONT);
    ctx.font = `700 ${hFit.size}px ${SANS_FONT}`;
    ctx.fillStyle = c === 0 ? '#EBC886' : '#FAF3E8';
    ctx.fillText(hFit.text, colXs[c] + 18, startY + headerH / 2 + 1);
  }

  let curY = startY + headerH;

  for (let r = 0; r < rows.length; r++) {
    const { wrapped, baseRowH } = rows[r];
    const rowH = baseRowH + rowExtraH;

    // High-contrast striped rows
    ctx.fillStyle = r % 2 === 0 ? '#FCF9F2' : '#EFE5D6';
    ctx.fillRect(leftX, curY, totalW, rowH);

    // Row divider
    ctx.strokeStyle = 'rgba(150, 114, 70, 0.28)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(leftX, curY + rowH);
    ctx.lineTo(leftX + totalW, curY + rowH);
    ctx.stroke();

    // Vertical column dividers
    for (let c = 1; c < colCount; c++) {
      ctx.beginPath();
      ctx.moveTo(colXs[c], curY);
      ctx.lineTo(colXs[c], curY + rowH);
      ctx.stroke();
    }

    for (let c = 0; c < colCount; c++) {
      const cellLines = wrapped[c];
      const blockH = (cellLines.length - 1) * cellLineH + cellFontPx;
      const textStartY = curY + (rowH - blockH) / 2;
      ctx.font = c === 0 ? `700 ${cellFontPx}px ${SANS_FONT}` : `500 ${cellFontPx}px ${SANS_FONT}`;
      ctx.fillStyle = c === 0 ? '#5C3A1A' : '#211813';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      cellLines.forEach((ln, li) => {
        ctx.fillText(ln, colXs[c] + 18, textStartY + li * cellLineH);
      });
    }

    curY += rowH;
  }

  // Outer frame stroke around table
  ctx.strokeStyle = 'rgba(150, 114, 70, 0.48)';
  ctx.lineWidth = 1.8;
  roundRectPath(ctx, leftX, startY, totalW, curY - startY, 14);
  ctx.stroke();

  return curY;
}

function measureBigHighlights(ctx, items, maxBudgetH, maxItems = 4) {
  if (!items || items.length === 0 || maxBudgetH < 130) return null;
  const headerH = 44;
  const baseItemGap = 16;
  const lineH = 44;

  const prepared = [];
  let cardsTotalH = 0;

  for (let i = 0; i < Math.min(items.length, maxItems); i++) {
    ctx.font = `500 30px ${SANS_FONT}`;
    const lines = wrapTextLines(ctx, items[i], CONTENT_W - 116, 2);
    const baseCardH = Math.max(94, 34 + lines.length * lineH);
    const projected = headerH + cardsTotalH + prepared.length * baseItemGap + baseCardH;
    if (projected > maxBudgetH) break;
    prepared.push({ index: i, lines, baseCardH });
    cardsTotalH += baseCardH;
  }

  if (prepared.length === 0) return null;

  return {
    headerH,
    baseItemGap,
    lineH,
    items: prepared,
    baseH: headerH + cardsTotalH + Math.max(0, prepared.length - 1) * baseItemGap,
  };
}

function drawBigHighlights(ctx, spec, startY, { cardExtraH = 0, itemGap = 16 } = {}) {
  if (!spec) return startY;
  const leftX = PAD_X;

  let curY = startY;
  ctx.font = `700 24px ${SANS_FONT}`;
  ctx.fillStyle = '#846444';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('核心要点', leftX, curY + 2);
  curY += spec.headerH;

  const effLineH = spec.lineH + Math.min(4, cardExtraH * 0.15);

  for (let idx = 0; idx < spec.items.length; idx++) {
    const item = spec.items[idx];
    const cardH = item.baseCardH + cardExtraH;

    roundRectPath(ctx, leftX, curY, CONTENT_W, cardH, 16);
    ctx.fillStyle = idx % 2 === 0 ? '#F3ECDF' : '#F9F4EA';
    ctx.fill();
    ctx.strokeStyle = 'rgba(154, 118, 72, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Numbered espresso-gold badge
    ctx.fillStyle = '#231A15';
    ctx.beginPath();
    ctx.arc(leftX + 46, curY + cardH / 2, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `700 22px ${MONO_FONT}`;
    ctx.fillStyle = '#EBC886';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${item.index + 1}`, leftX + 46, curY + cardH / 2 + 1);

    ctx.font = `500 30px ${SANS_FONT}`;
    ctx.fillStyle = '#211813';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const textBlockH = (item.lines.length - 1) * effLineH + 30;
    const textTop = curY + (cardH - textBlockH) / 2;
    item.lines.forEach((ln, li) => {
      ctx.fillText(ln, leftX + 90, textTop + li * effLineH);
    });

    curY += cardH + (idx < spec.items.length - 1 ? itemGap : 0);
  }

  return curY;
}

function measureMythSummaryBox(ctx, mythText, maxLines = 4) {
  ctx.font = `500 29px ${SANS_FONT}`;
  const lines = wrapTextLines(ctx, mythText, CONTENT_W - 68, maxLines);
  const lineH = 44;
  const baseH = 88 + lines.length * lineH;
  return { lines, lineH, baseH };
}

function drawMythSummaryBox(ctx, measured, startY, extraPad = 0) {
  if (!measured) return startY;
  const leftX = PAD_X;
  const { lines, lineH, baseH } = measured;
  const boxH = baseH + extraPad;
  const shift = extraPad * 0.45;
  const effLineH = lineH + Math.min(3, extraPad * 0.1);

  roundRectPath(ctx, leftX, startY, CONTENT_W, boxH, 18);
  ctx.fillStyle = '#231A15';
  ctx.fill();
  ctx.strokeStyle = '#C68548';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.font = `700 24px ${SANS_FONT}`;
  ctx.fillStyle = '#E8A864';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('反常识 · 关键亮点', leftX + 34, startY + 24 + shift * 0.5);

  ctx.font = `500 29px ${SANS_FONT}`;
  ctx.fillStyle = '#F6EFE5';
  lines.forEach((ln, idx) => {
    ctx.fillText(ln, leftX + 34, startY + 66 + shift + idx * effLineH);
  });

  return startY + boxH;
}

function renderKnowledgeBack(ctx, card) {
  const groupNames = {
    species: '核心豆种百科',
    variety: '精品品种谱系',
    origin: '世界产区风土',
    craft_tasting: '工艺与品鉴',
  };
  drawBackHeader(ctx, card, groupNames[card?.group] || '咖啡图鉴百科', 60);

  // ---- Pass 1: Measure all large-type modules ----
  const zoneTop = 282;
  const zoneBottom = 1974;
  const totalBudget = zoneBottom - zoneTop; // 1692px
  const minSectionGap = 28;

  const kpiSpec = measureKnowledgeKpis(ctx, card?.metrics);
  const takeawayText = card?.keyTakeaway || card?.summary || card?.tagline || '';
  const takeawaySpec = takeawayText ? measureCoreConclusion(ctx, takeawayText) : null;
  const mythSpec = card?.mythBuster ? measureMythSummaryBox(ctx, card.mythBuster, 4) : null;

  const fixedCoreH =
    (kpiSpec ? kpiSpec.baseH : 0) +
    (takeawaySpec ? takeawaySpec.baseH : 0) +
    (mythSpec ? mythSpec.baseH : 0);

  const maxTableH = Math.max(320, totalBudget - fixedCoreH - 120);
  const tableSpec = measureBigComparisonTable(ctx, card, maxTableH);

  const highlightsRaw = Array.isArray(card?.highlights) && card.highlights.length > 0
    ? card.highlights
    : (Array.isArray(card?.sections) ? card.sections.map((sec) => `${sec.heading}：${sec.body}`) : []);

  const sectionsBeforeHighlights =
    (kpiSpec ? 1 : 0) + (takeawaySpec ? 1 : 0) + (tableSpec ? 1 : 0) + (mythSpec ? 1 : 0);
  const usedBeforeHighlights =
    fixedCoreH +
    (tableSpec ? tableSpec.baseH : 0) +
    minSectionGap * sectionsBeforeHighlights;

  // Include big-type 30px Highlights cards when table is absent OR generous room remains
  const maxHighlightItems = tableSpec ? 3 : 5;
  const highlightsSpec = measureBigHighlights(
    ctx,
    highlightsRaw,
    totalBudget - usedBeforeHighlights,
    maxHighlightItems,
  );

  // ---- Pass 2: Evenly distribute vertical slack for museum rhythm with zero dead voids ----
  const activeCount =
    (kpiSpec ? 1 : 0) +
    (takeawaySpec ? 1 : 0) +
    (tableSpec ? 1 : 0) +
    (highlightsSpec ? 1 : 0) +
    (mythSpec ? 1 : 0);
  const gapSlots = Math.max(1, activeCount - 1);

  const totalBaseContentH =
    (kpiSpec ? kpiSpec.baseH : 0) +
    (takeawaySpec ? takeawaySpec.baseH : 0) +
    (tableSpec ? tableSpec.baseH : 0) +
    (highlightsSpec ? highlightsSpec.baseH : 0) +
    (mythSpec ? mythSpec.baseH : 0);

  let slack = Math.max(0, totalBudget - totalBaseContentH - gapSlots * minSectionGap);

  // 1) Give comparison table rows generous vertical breath
  let tableRowExtraH = 0;
  if (tableSpec && slack > 0) {
    const nRows = tableSpec.rows.length;
    tableRowExtraH = Math.floor(Math.min(20, (slack * 0.34) / Math.max(1, nRows)));
    slack -= tableRowExtraH * nRows;
  }

  // 2) Give highlights cards comfortable padding if displayed
  let highlightCardExtraH = 0;
  let highlightItemGap = highlightsSpec ? highlightsSpec.baseItemGap : 16;
  if (highlightsSpec && slack > 0) {
    const nCards = highlightsSpec.items.length;
    highlightCardExtraH = Math.floor(Math.min(22, (slack * 0.32) / Math.max(1, nCards)));
    slack -= highlightCardExtraH * nCards;
    if (nCards > 1 && slack > 0) {
      const addGap = Math.floor(Math.min(12, (slack * 0.16) / (nCards - 1)));
      highlightItemGap += addGap;
      slack -= addGap * (nCards - 1);
    }
  }

  // 3) Gently relax KPI, Core Conclusion & Myth Buster card padding
  let kpiExtraH = 0;
  let takeawayExtraPad = 0;
  let mythExtraPad = 0;
  if (slack > 0) {
    if (kpiSpec) {
      kpiExtraH = Math.floor(Math.min(16, slack * 0.12));
      slack -= kpiExtraH;
    }
    if (takeawaySpec) {
      takeawayExtraPad = Math.floor(Math.min(22, slack * 0.18));
      slack -= takeawayExtraPad;
    }
    if (mythSpec) {
      mythExtraPad = Math.floor(Math.min(26, slack * 0.22));
      slack -= mythExtraPad;
    }
  }

  // 4) Split remaining slack cleanly across section gaps
  const extraPerGap = slack > 0 ? Math.min(48, slack / gapSlots) : 0;
  const sectionGap = minSectionGap + extraPerGap;
  const leftover = Math.max(0, slack - extraPerGap * gapSlots);

  // ---- Pass 3: Render with balanced coordinates ----
  let y = zoneTop + Math.min(24, leftover * 0.40);

  if (kpiSpec) {
    y = drawKnowledgeKpis(ctx, kpiSpec, y, kpiExtraH) + sectionGap;
  }

  if (takeawaySpec) {
    y = drawCoreConclusionBox(ctx, takeawaySpec, y, takeawayExtraPad) + sectionGap;
  }

  if (tableSpec) {
    y = drawBigComparisonTable(ctx, tableSpec, y, tableRowExtraH) + sectionGap;
  }

  if (highlightsSpec) {
    y = drawBigHighlights(ctx, highlightsSpec, y, {
      cardExtraH: highlightCardExtraH,
      itemGap: highlightItemGap,
    }) + sectionGap;
  }

  if (mythSpec) {
    drawMythSummaryBox(ctx, mythSpec, y, mythExtraPad);
  }

  drawFooter(ctx, '按 I 或点击「精读档案」查看完整百科长文、对照图表与关联单品豆');
}

/**
 * Render the high-DPI 1440 x 2160 back card canvas for either bean_card or knowledge_card.
 */
export function renderBackCardCanvas(card, options = {}) {
  const width = options.width || BACK_W;
  const height = options.height || BACK_H;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(width / BACK_W, height / BACK_H);

  drawCottonPaperBase(ctx, card);

  if (card?.cardType === 'bean_card') {
    renderBeanBack(ctx, card);
  } else {
    renderKnowledgeBack(ctx, card);
  }

  ctx.restore();
  return canvas;
}
