/**
 * 双豆对比实验室 (Compare Lab)
 * 暗房手冲吧台双豆品鉴台：5 组黄金对局、11 款单品豆自由选配、Retina 双叠加 6 维感官雷达、差值洞察与风土冲煮差异表
 */

import { getFlavorColor, RADAR_AXES } from '../../data/flavor-palette.js';
import { renderGalleryThumb } from '../art/hybrid-resolver.js';

const RADAR_THEMES = {
  dark: {
    colorA: '#D6A25E',
    colorABright: '#F0CB90',
    colorAFill: 'rgba(214, 162, 94, 0.24)',
    colorB: '#58B89A',
    colorBBright: '#8AE2C5',
    colorBFill: 'rgba(88, 184, 154, 0.22)',
    haloInner: 'rgba(214, 162, 94, 0.1)',
    haloMid: 'rgba(88, 184, 154, 0.035)',
    haloOuter: 'rgba(22, 17, 14, 0)',
    gridOuter: 'rgba(214, 162, 94, 0.36)',
    gridInner: 'rgba(247, 241, 231, 0.13)',
    spoke: 'rgba(214, 162, 94, 0.18)',
    tickInk: 'rgba(203, 187, 169, 0.72)',
    dotStroke: '#16110E',
    labelInk: '#F7F1E7',
    sepInk: 'rgba(203, 187, 169, 0.65)',
  },
  light: {
    colorA: '#A8742D',
    colorABright: '#8B5C1F',
    colorAFill: 'rgba(168, 116, 45, 0.2)',
    colorB: '#2E856A',
    colorBBright: '#1F6851',
    colorBFill: 'rgba(46, 133, 106, 0.18)',
    haloInner: 'rgba(168, 116, 45, 0.08)',
    haloMid: 'rgba(46, 133, 106, 0.03)',
    haloOuter: 'rgba(250, 247, 241, 0)',
    gridOuter: 'rgba(140, 102, 54, 0.44)',
    gridInner: 'rgba(117, 104, 93, 0.22)',
    spoke: 'rgba(140, 102, 54, 0.24)',
    tickInk: 'rgba(83, 71, 62, 0.78)',
    dotStroke: '#FAF7F1',
    labelInk: '#1E1814',
    sepInk: 'rgba(117, 104, 93, 0.75)',
  },
};

function getRadarPalette() {
  const isLight = document.documentElement.dataset.theme === 'light';
  return isLight ? RADAR_THEMES.light : RADAR_THEMES.dark;
}

export const COMPARE_PRESETS = [
  {
    id: 'same-origin-process',
    label: '同源不同艺',
    desc: '卡法瑰夏 · 水洗 vs 日晒',
    beanA: 'af-05-kaffa-washed',
    beanB: 'af-06-kaffa-natural',
  },
  {
    id: 'geisha-evolution',
    label: '瑰夏百年演化',
    desc: '埃塞原生森林 vs 巴拿马名庄',
    beanA: 'af-04-gori-natural',
    beanB: 'ca-01-esmeralda-green',
  },
  {
    id: 'experimental-peaks',
    label: '实验处理双峰',
    desc: '朗姆酒桶 vs 冷泉氮气洗',
    beanA: 'sa-01-macarena-rum',
    beanB: 'sa-02-baishan-n2',
  },
  {
    id: 'dessert-vs-spring',
    label: '甜品 vs 清泉',
    desc: '格拉纳共发酵 vs 白山氮气洗',
    beanA: 'af-03-gelana-coferm',
    beanB: 'sa-02-baishan-n2',
  },
  {
    id: 'east-west-terroir',
    label: '东西风土基准',
    desc: '肯尼亚涅里 vs 中国云南保山',
    beanA: 'af-01-kenya-nyeri-aa',
    beanB: 'cn-01-yunnan-baoshan',
  },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shortBeanTitle(card) {
  if (!card?.title) return '';
  return card.title.replace(
    /^(巴拿马|哥伦比亚|埃塞俄比亚|肯尼亚|巴西|印度尼西亚|印尼|中国云南)\s+/,
    '',
  );
}

function computeSensoryInsight(beanA, beanB) {
  if (!beanA || !beanB) return '';
  if (beanA.id === beanB.id) {
    return '当前左右两侧选择了同一款单品豆；可更换任意一侧豆款，或点击上方 5 组黄金品鉴对局快速对比。';
  }

  const rA = beanA.sensory?.radar6D || {};
  const rB = beanB.sensory?.radar6D || {};
  const diffs = RADAR_AXES.map((axis) => {
    const a = typeof rA[axis.key] === 'number' ? rA[axis.key] : 0;
    const b = typeof rB[axis.key] === 'number' ? rB[axis.key] : 0;
    return { axis, a, b, diff: Number((a - b).toFixed(2)), abs: Math.abs(a - b) };
  });

  const byAbs = [...diffs].sort((x, y) => y.abs - x.abs);
  const top = byAbs[0];
  const leadA = [...diffs].filter((d) => d.diff > 0.05).sort((x, y) => y.diff - x.diff)[0];
  const leadB = [...diffs].filter((d) => d.diff < -0.05).sort((x, y) => x.diff - y.diff)[0];

  const nameA = `${beanA.code} ${shortBeanTitle(beanA)}`;
  const nameB = `${beanB.code} ${shortBeanTitle(beanB)}`;
  const flA = (beanA.sensory?.flavors || []).slice(0, 2).join('、');
  const flB = (beanB.sensory?.flavors || []).slice(0, 2).join('、');

  const parts = [];
  if (top && top.abs >= 0.1) {
    const winner = top.diff > 0 ? '豆 A' : '豆 B';
    parts.push(`两豆最大感官落差在「${top.axis.label}」（${winner} 领先 +${top.abs.toFixed(1)}）`);
  } else {
    parts.push('两豆在六维感官结构上整体接近，差异更体现在微观风味轮廓');
  }

  if (leadA && leadB) {
    parts.push(
      `豆 A（${nameA}）突出「${leadA.axis.label}」${flA ? `与${flA}调性` : ''}，豆 B（${nameB}）则在「${leadB.axis.label}」${flB ? `与${flB}表现上更胜一筹` : '上更具优势'}`,
    );
  } else if (leadA) {
    parts.push(`豆 A 在「${leadA.axis.label}」维度优势明显${flA ? `，呈现${flA}主轴` : ''}`);
  } else if (leadB) {
    parts.push(`豆 B 在「${leadB.axis.label}」维度优势明显${flB ? `，呈现${flB}主轴` : ''}`);
  }

  return `${parts.join('；')}。`;
}

function drawDualRadar(canvas, beanA, beanB) {
  if (!canvas || !beanA || !beanB) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pal = getRadarPalette();
  const rect = canvas.getBoundingClientRect();
  const cssSize = Math.max(260, Math.min(436, Math.round(rect.width || 376)));
  const dpr = Math.max(2, Math.min(window.devicePixelRatio || 2, 3));

  canvas.width = Math.round(cssSize * dpr);
  canvas.height = Math.round(cssSize * dpr);
  canvas.style.height = `${cssSize}px`;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssSize, cssSize);

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const isCompact = cssSize < 370;
  const labelGap = isCompact ? 15 : 22;
  const sideLabelReserve = isCompact ? 72 : 84;
  const maxSafeRadius = Math.max(54, (cssSize / 2 - sideLabelReserve - labelGap) / 0.866);
  const radius = Math.min(cssSize * 0.295, maxSafeRadius);
  const count = RADAR_AXES.length;
  const startAngle = -Math.PI / 2;

  const pointAt = (index, ratio) => {
    const angle = startAngle + (index * Math.PI * 2) / count;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
      angle,
    };
  };

  // 1. Subtle radial ambient backdrop
  const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius * 1.18);
  halo.addColorStop(0, pal.haloInner);
  halo.addColorStop(0.65, pal.haloMid);
  halo.addColorStop(1, pal.haloOuter);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
  ctx.fill();

  // 2. Concentric hexagon grid (1..5)
  for (let level = 1; level <= 5; level++) {
    const ratio = level / 5;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const pt = pointAt(i, ratio);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.strokeStyle = level === 5 ? pal.gridOuter : pal.gridInner;
    ctx.lineWidth = level === 5 ? 1.25 : 0.9;
    ctx.stroke();

    if (level === 2 || level === 4 || level === 5) {
      ctx.font = '600 10.5px ui-monospace, "SF Mono", monospace';
      ctx.fillStyle = pal.tickInk;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(level), cx + 11, cy - radius * ratio + 2);
    }
  }

  // 3. Radial spokes
  for (let i = 0; i < count; i++) {
    const outer = pointAt(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(outer.x, outer.y);
    ctx.strokeStyle = pal.spoke;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }

  const rA = beanA.sensory?.radar6D || {};
  const rB = beanB.sensory?.radar6D || {};

  // Helper to paint one polygon + vertices
  const drawPolygon = (radarData, fillStyle, strokeStyle, dotFill) => {
    const pts = RADAR_AXES.map((axis, i) => {
      const val = Math.max(0, Math.min(5, Number(radarData[axis.key] || 0)));
      return pointAt(i, val / 5);
    });

    ctx.beginPath();
    pts.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    pts.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = dotFill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = pal.dotStroke;
      ctx.stroke();
    });
  };

  drawPolygon(rB, pal.colorBFill, pal.colorB, pal.colorBBright);
  drawPolygon(rA, pal.colorAFill, pal.colorA, pal.colorABright);

  // 4. Crisp Axis Labels + Dual Scores
  const labelDist = radius + labelGap;
  const titleFontSize = isCompact ? 12.5 : 13.5;
  const scoreFontSize = isCompact ? 11.5 : 12.5;

  RADAR_AXES.forEach((axis, i) => {
    const angle = startAngle + (i * Math.PI * 2) / count;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let lx = cx + cos * labelDist;
    const ly = cy + sin * labelDist;

    let align = 'center';
    if (cos > 0.25) align = 'left';
    else if (cos < -0.25) align = 'right';

    const yAdjust = sin < -0.7 ? -10 : sin > 0.7 ? 7 : -2;
    const scoreA = Number(rA[axis.key] || 0).toFixed(1);
    const scoreB = Number(rB[axis.key] || 0).toFixed(1);

    ctx.font = `600 ${titleFontSize}px "PingFang SC", "Hiragino Sans GB", sans-serif`;
    const labelW = ctx.measureText(axis.label).width;
    const edgePad = 6;
    if (align === 'left' && lx + labelW > cssSize - edgePad) {
      lx = cssSize - edgePad - labelW;
    } else if (align === 'right' && lx - labelW < edgePad) {
      lx = edgePad + labelW;
    }

    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = pal.labelInk;
    ctx.fillText(axis.label, lx, ly + yAdjust);

    // Draw dual colored numeric scores right under label
    const scoreY = ly + yAdjust + 16;
    ctx.font = `600 ${scoreFontSize}px ui-monospace, "SF Mono", monospace`;
    const sep = ' / ';
    const wA = ctx.measureText(scoreA).width;
    const wSep = ctx.measureText(sep).width;
    const wB = ctx.measureText(scoreB).width;
    const totalW = wA + wSep + wB;

    let startX = lx - totalW / 2;
    if (align === 'left') startX = Math.min(lx, cssSize - edgePad - totalW);
    else if (align === 'right') startX = Math.max(edgePad, lx - totalW);

    ctx.textAlign = 'left';
    ctx.fillStyle = pal.colorABright;
    ctx.fillText(scoreA, startX, scoreY);

    ctx.fillStyle = pal.sepInk;
    ctx.fillText(sep, startX + wA, scoreY);

    ctx.fillStyle = pal.colorBBright;
    ctx.fillText(scoreB, startX + wA + wSep, scoreY);
  });

  ctx.restore();
}

function renderFlavorPillsHtml(flavors) {
  if (!Array.isArray(flavors) || flavors.length === 0) {
    return '<span class="cmp-muted">未注明</span>';
  }
  return `
    <div class="flavor-pills">
      ${flavors
        .map((fl) => {
          const color = getFlavorColor(fl);
          return `
            <span class="flavor-pill" style="--flavor-color:${escapeHtml(color)}">
              <span class="flavor-dot" aria-hidden="true"></span>
              <span>${escapeHtml(fl)}</span>
            </span>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderPhysicsCell(bean) {
  const ph = bean.physics;
  if (!ph) {
    return '<span class="cmp-muted">该批次未公开实测物理数据</span>';
  }
  const tags = [];
  if (ph.moisturePct != null) tags.push(`含水率 ${ph.moisturePct}%`);
  if (ph.densityGl != null) tags.push(`堆积密度 ${ph.densityGl} g/L`);
  if (ph.waterActivity != null) tags.push(`水活度 ${ph.waterActivity} Aw`);
  return `
    <div class="cmp-physics-list">
      ${tags.map((t) => `<span class="cmp-mono-chip">${escapeHtml(t)}</span>`).join('')}
    </div>
    ${ph.note ? `<p class="cmp-cell-sub">${escapeHtml(ph.note)}</p>` : ''}
  `;
}

function renderBrewCell(bean) {
  const b = bean.brewing || {};
  const chips = [
    b.waterTempC != null ? `${b.waterTempC}℃` : null,
    b.ratio || null,
    b.grindSize || null,
    b.totalTime || null,
  ].filter(Boolean);

  return `
    <div class="cmp-brew-chips">
      ${chips.map((c) => `<span class="cmp-mono-chip">${escapeHtml(c)}</span>`).join('')}
    </div>
    ${b.summary ? `<p class="cmp-cell-sub">${escapeHtml(b.summary)}</p>` : ''}
  `;
}

export function createCompareView(mountEl, options = {}) {
  const { cards: initialCards = [], onInspectCard, onPairChange } = options;

  let beanCards = initialCards.filter((c) => c.cardType === 'bean_card');
  let beanMap = Object.fromEntries(beanCards.map((c) => [c.id, c]));
  const thumbCache = new Map();

  let beanAId = beanMap['af-05-kaffa-washed'] ? 'af-05-kaffa-washed' : beanCards[0]?.id || '';
  let beanBId = beanMap['af-06-kaffa-natural']
    ? 'af-06-kaffa-natural'
    : beanCards[1]?.id || beanAId;

  let radarResizeObserver = null;

  mountEl.innerHTML = `
    <div class="compare-inner">
      <header class="compare-header">
        <div>
          <h1 class="compare-heading">双豆对比实验室</h1>
          <p class="compare-lead">同轴叠加六维感官雷达与烘焙色标，一清一浓对照产区风土、发酵处理与手冲参数差异。</p>
        </div>
      </header>

      <div class="compare-presets" id="compare-presets" role="group" aria-label="黄金品鉴对局预设"></div>

      <section class="compare-stage-grid" aria-label="双豆对比主视图">
        <article class="compare-bean-panel is-side-a" id="compare-panel-a"></article>

        <div class="compare-radar-panel">
          <div class="compare-radar-top">
            <div class="compare-legend" id="compare-legend"></div>
            <button
              type="button"
              class="compare-swap-btn"
              id="compare-swap-btn"
              title="互换左右对比豆款"
              aria-label="互换对比的两款咖啡豆"
            >
              <span aria-hidden="true">⇄</span>
              <span>互换</span>
            </button>
          </div>
          <div class="compare-radar-canvas-wrap">
            <canvas class="compare-radar-canvas" id="compare-radar-canvas" aria-label="双豆六维感官叠加雷达图"></canvas>
          </div>
          <div class="compare-delta-row" id="compare-delta-row" aria-label="六维感官差值"></div>
          <p class="compare-insight" id="compare-insight"></p>
        </div>

        <article class="compare-bean-panel is-side-b" id="compare-panel-b"></article>
      </section>

      <section class="compare-diff-section" aria-label="风土与冲煮差异对照表">
        <div class="compare-diff-head">
          <h2 class="compare-section-title">风土、工艺与冲煮对照</h2>
          <span class="compare-diff-hint">左侧香槟铜金为豆 A，右侧翡翠青为豆 B</span>
        </div>
        <div class="compare-diff-table" id="compare-diff-table"></div>
      </section>
    </div>
  `;

  const elPresets = mountEl.querySelector('#compare-presets');
  const elPanelA = mountEl.querySelector('#compare-panel-a');
  const elPanelB = mountEl.querySelector('#compare-panel-b');
  const elLegend = mountEl.querySelector('#compare-legend');
  const elSwapBtn = mountEl.querySelector('#compare-swap-btn');
  const elRadarCanvas = mountEl.querySelector('#compare-radar-canvas');
  const elDeltaRow = mountEl.querySelector('#compare-delta-row');
  const elInsight = mountEl.querySelector('#compare-insight');
  const elDiffTable = mountEl.querySelector('#compare-diff-table');

  function loadThumbInto(card, imgEl, placeholderEl) {
    if (!card || !imgEl) return;
    const cached = thumbCache.get(card.id);
    if (cached) {
      imgEl.src = cached;
      imgEl.classList.add('is-loaded');
      placeholderEl?.classList.add('is-hidden');
      return;
    }
    Promise.resolve()
      .then(() => renderGalleryThumb(card))
      .then((dataUrl) => {
        if (!dataUrl) return;
        thumbCache.set(card.id, dataUrl);
        if (!imgEl.isConnected || imgEl.dataset.cardId !== card.id) return;
        imgEl.src = dataUrl;
        imgEl.classList.add('is-loaded');
        placeholderEl?.classList.add('is-hidden');
      })
      .catch(() => {});
  }

  function renderPresets() {
    elPresets.innerHTML = COMPARE_PRESETS.map((preset) => {
      const active =
        (beanAId === preset.beanA && beanBId === preset.beanB) ||
        (beanAId === preset.beanB && beanBId === preset.beanA);
      return `
        <button
          type="button"
          class="preset-pill ${active ? 'is-active' : ''}"
          data-preset-id="${escapeHtml(preset.id)}"
          aria-pressed="${active}"
        >
          <span class="preset-pill-name">${escapeHtml(preset.label)}</span>
          <span class="preset-pill-desc">${escapeHtml(preset.desc)}</span>
        </button>
      `;
    }).join('');

    elPresets.querySelectorAll('.preset-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = COMPARE_PRESETS.find((p) => p.id === btn.dataset.presetId);
        if (preset) {
          setPair(preset.beanA, preset.beanB, true);
        }
      });
    });
  }

  function renderBeanSide(panelEl, side, card) {
    if (!panelEl || !card) return;
    const isA = side === 'A';
    const palette = card.visual?.palette || {};
    const cachedSrc = thumbCache.get(card.id) || '';
    const selectId = isA ? 'compare-select-a' : 'compare-select-b';

    const optionsHtml = beanCards
      .map(
        (b) =>
          `<option value="${escapeHtml(b.id)}" ${b.id === card.id ? 'selected' : ''}>${escapeHtml(b.code)} · ${escapeHtml(b.title)}</option>`,
      )
      .join('');

    panelEl.innerHTML = `
      <div class="cmp-side-head">
        <span class="cmp-side-badge ${isA ? 'is-a' : 'is-b'}">豆 ${side}</span>
        <label class="cmp-select-wrap" for="${selectId}">
          <select id="${selectId}" class="cmp-select" aria-label="选择对比豆 ${side}">
            ${optionsHtml}
          </select>
        </label>
      </div>

      <button
        type="button"
        class="cmp-thumb-btn"
        data-inspect-card="${escapeHtml(card.id)}"
        title="点击进入 3D 全息展台赏析 ${escapeHtml(card.title)}"
      >
        <div
          class="cmp-thumb-frame"
          style="--card-bg-top:${escapeHtml(palette.bgTop || '#241B16')};--card-bg-bottom:${escapeHtml(palette.bgBottom || '#120D0B')}"
        >
          <div class="specimen-placeholder ${cachedSrc ? 'is-hidden' : ''}" aria-hidden="true">
            <span class="specimen-placeholder-frame"></span>
          </div>
          <img
            class="specimen-thumb ${cachedSrc ? 'is-loaded' : ''}"
            data-card-id="${escapeHtml(card.id)}"
            ${cachedSrc ? `src="${cachedSrc}"` : ''}
            alt="${escapeHtml(card.title)}"
            decoding="async"
          />
        </div>
        <span class="cmp-thumb-caption">点击卡面进入 3D 展台</span>
      </button>

      <div class="cmp-side-summary">
        <div class="cmp-side-code-row">
          <span class="cmp-side-code">${escapeHtml(card.code)}</span>
          <span class="cmp-side-process">${escapeHtml(card.processing?.name || '')}</span>
        </div>
        <h2 class="cmp-side-title">${escapeHtml(card.title)}</h2>
        <p class="cmp-side-meta">${escapeHtml([card.origin?.country, card.origin?.altitude, card.roast?.label].filter(Boolean).join(' / '))}</p>
      </div>
    `;

    const selectEl = panelEl.querySelector(`#${selectId}`);
    selectEl?.addEventListener('change', () => {
      const nextId = selectEl.value;
      if (isA) setPair(nextId, beanBId, true);
      else setPair(beanAId, nextId, true);
    });

    const inspectBtn = panelEl.querySelector('[data-inspect-card]');
    inspectBtn?.addEventListener('click', () => {
      onInspectCard?.(card.id);
    });

    const imgEl = panelEl.querySelector('.specimen-thumb');
    const phEl = panelEl.querySelector('.specimen-placeholder');
    loadThumbInto(card, imgEl, phEl);
  }

  function renderRadarMeta(beanA, beanB) {
    elLegend.innerHTML = `
      <span class="cmp-legend-item is-a">
        <span class="cmp-legend-dot" aria-hidden="true"></span>
        <span>A · ${escapeHtml(beanA.code)} ${escapeHtml(shortBeanTitle(beanA))}</span>
      </span>
      <span class="cmp-legend-item is-b">
        <span class="cmp-legend-dot" aria-hidden="true"></span>
        <span>B · ${escapeHtml(beanB.code)} ${escapeHtml(shortBeanTitle(beanB))}</span>
      </span>
    `;

    const rA = beanA.sensory?.radar6D || {};
    const rB = beanB.sensory?.radar6D || {};
    elDeltaRow.innerHTML = RADAR_AXES.map((axis) => {
      const a = Number(rA[axis.key] || 0);
      const b = Number(rB[axis.key] || 0);
      const diff = Number((a - b).toFixed(1));
      if (Math.abs(diff) < 0.05) {
        return `<span class="cmp-delta-pill is-even">${escapeHtml(axis.label)} 持平</span>`;
      }
      const cls = diff > 0 ? 'is-a' : 'is-b';
      const side = diff > 0 ? 'A' : 'B';
      return `<span class="cmp-delta-pill ${cls}">${escapeHtml(axis.label)} ${side} +${Math.abs(diff).toFixed(1)}</span>`;
    }).join('');

    elInsight.textContent = computeSensoryInsight(beanA, beanB);
  }

  function renderDiffTable(beanA, beanB) {
    const posA =
      typeof beanA.roast?.position01 === 'number'
        ? Math.max(4, Math.min(96, beanA.roast.position01 * 100))
        : 34;
    const posB =
      typeof beanB.roast?.position01 === 'number'
        ? Math.max(4, Math.min(96, beanB.roast.position01 * 100))
        : 45;
    const pinsOverlap = Math.abs(posA - posB) < 7;

    const showPhysics = Boolean(beanA.physics || beanB.physics);

    const rows = [
      {
        label: '产区与海拔',
        a: `
          <div class="cmp-cell-main">${escapeHtml([beanA.origin?.country, beanA.origin?.region].filter(Boolean).join(' · '))}</div>
          <div class="cmp-cell-sub">${escapeHtml(beanA.origin?.estate || '')}${beanA.origin?.altitude ? ` · <span class="cmp-mono">${escapeHtml(beanA.origin.altitude)}</span>` : ''}</div>
        `,
        b: `
          <div class="cmp-cell-main">${escapeHtml([beanB.origin?.country, beanB.origin?.region].filter(Boolean).join(' · '))}</div>
          <div class="cmp-cell-sub">${escapeHtml(beanB.origin?.estate || '')}${beanB.origin?.altitude ? ` · <span class="cmp-mono">${escapeHtml(beanB.origin.altitude)}</span>` : ''}</div>
        `,
      },
      {
        label: '豆种与等级',
        a: `
          <div class="cmp-cell-main">${escapeHtml([beanA.botany?.variety, beanA.botany?.species].filter(Boolean).join(' / '))}</div>
          <div class="cmp-cell-sub">${escapeHtml([beanA.origin?.grade, beanA.origin?.harvestSeason ? `${beanA.origin.harvestSeason} 产季` : ''].filter(Boolean).join(' · '))}</div>
        `,
        b: `
          <div class="cmp-cell-main">${escapeHtml([beanB.botany?.variety, beanB.botany?.species].filter(Boolean).join(' / '))}</div>
          <div class="cmp-cell-sub">${escapeHtml([beanB.origin?.grade, beanB.origin?.harvestSeason ? `${beanB.origin.harvestSeason} 产季` : ''].filter(Boolean).join(' · '))}</div>
        `,
      },
      {
        label: '处理方式',
        a: `
          <div class="cmp-cell-main">${escapeHtml(beanA.processing?.name || '未注明')}</div>
          ${beanA.processing?.detail ? `<p class="cmp-cell-sub">${escapeHtml(beanA.processing.detail)}</p>` : ''}
        `,
        b: `
          <div class="cmp-cell-main">${escapeHtml(beanB.processing?.name || '未注明')}</div>
          ${beanB.processing?.detail ? `<p class="cmp-cell-sub">${escapeHtml(beanB.processing.detail)}</p>` : ''}
        `,
      },
      {
        label: '烘焙度与 Agtron',
        fullExtra: `
          <div class="cmp-roast-axis ${pinsOverlap ? 'is-stacked' : ''}" aria-label="双豆烘焙深浅同轴对照">
            <span class="cmp-roast-end">浅烘 Light</span>
            <div class="cmp-roast-track">
              <span class="cmp-roast-pin is-a" style="left:${posA}%" title="豆 A：${escapeHtml(beanA.roast?.label || '')}">A</span>
              <span class="cmp-roast-pin is-b" style="left:${posB}%" title="豆 B：${escapeHtml(beanB.roast?.label || '')}">B</span>
            </div>
            <span class="cmp-roast-end">深烘 Dark</span>
          </div>
        `,
        a: `
          <div class="roast-swatch-wrap">
            <span class="roast-dot" style="background:${escapeHtml(beanA.roast?.colorHex || '#8C582F')}" aria-hidden="true"></span>
            <span class="cmp-cell-main">${escapeHtml(beanA.roast?.label || '')}${beanA.roast?.scale ? ` (${escapeHtml(beanA.roast.scale)})` : ''}</span>
          </div>
          ${beanA.roast?.agtron ? `<div class="cmp-cell-sub cmp-mono">Agtron ${escapeHtml(beanA.roast.agtron)}</div>` : ''}
        `,
        b: `
          <div class="roast-swatch-wrap">
            <span class="roast-dot" style="background:${escapeHtml(beanB.roast?.colorHex || '#8C582F')}" aria-hidden="true"></span>
            <span class="cmp-cell-main">${escapeHtml(beanB.roast?.label || '')}${beanB.roast?.scale ? ` (${escapeHtml(beanB.roast.scale)})` : ''}</span>
          </div>
          ${beanB.roast?.agtron ? `<div class="cmp-cell-sub cmp-mono">Agtron ${escapeHtml(beanB.roast.agtron)}</div>` : ''}
        `,
      },
    ];

    if (showPhysics) {
      rows.push({
        label: '生豆物理指标',
        a: renderPhysicsCell(beanA),
        b: renderPhysicsCell(beanB),
      });
    }

    rows.push(
      {
        label: '核心风味',
        a: renderFlavorPillsHtml(beanA.sensory?.flavors),
        b: renderFlavorPillsHtml(beanB.sensory?.flavors),
      },
      {
        label: '风味笔记',
        a: `<p class="cmp-prose">${escapeHtml(beanA.sensory?.tastingNotes || '')}</p>`,
        b: `<p class="cmp-prose">${escapeHtml(beanB.sensory?.tastingNotes || '')}</p>`,
      },
      {
        label: '推荐饮用场景',
        a: `<p class="cmp-prose">${escapeHtml(beanA.narrative?.recommendedScenarios || '')}</p>`,
        b: `<p class="cmp-prose">${escapeHtml(beanB.narrative?.recommendedScenarios || '')}</p>`,
      },
      {
        label: '手冲萃取参考',
        a: renderBrewCell(beanA),
        b: renderBrewCell(beanB),
      },
    );

    elDiffTable.innerHTML = `
      <div class="cmp-table-head-row" aria-hidden="true">
        <div class="cmp-th-metric">对照维度</div>
        <div class="cmp-th-a">豆 A · ${escapeHtml(beanA.code)} ${escapeHtml(shortBeanTitle(beanA))}</div>
        <div class="cmp-th-b">豆 B · ${escapeHtml(beanB.code)} ${escapeHtml(shortBeanTitle(beanB))}</div>
      </div>
      ${rows
        .map(
          (row) => `
            <div class="cmp-row">
              <div class="cmp-row-label">${escapeHtml(row.label)}</div>
              <div class="cmp-row-cells">
                ${row.fullExtra ? `<div class="cmp-row-extra">${row.fullExtra}</div>` : ''}
                <div class="cmp-cell is-a" data-side-label="豆 A · ${escapeHtml(beanA.code)}">${row.a}</div>
                <div class="cmp-cell is-b" data-side-label="豆 B · ${escapeHtml(beanB.code)}">${row.b}</div>
              </div>
            </div>
          `,
        )
        .join('')}
    `;
  }

  function redrawRadar() {
    const beanA = beanMap[beanAId];
    const beanB = beanMap[beanBId];
    if (!beanA || !beanB || mountEl.hidden) return;
    drawDualRadar(elRadarCanvas, beanA, beanB);
  }

  function renderAll() {
    const beanA = beanMap[beanAId] || beanCards[0];
    const beanB = beanMap[beanBId] || beanCards[1] || beanA;
    if (!beanA || !beanB) return;

    beanAId = beanA.id;
    beanBId = beanB.id;

    renderPresets();
    renderBeanSide(elPanelA, 'A', beanA);
    renderBeanSide(elPanelB, 'B', beanB);
    renderRadarMeta(beanA, beanB);
    renderDiffTable(beanA, beanB);

    if (!mountEl.hidden) {
      requestAnimationFrame(redrawRadar);
    }
  }

  function setPair(nextA, nextB, notify = false) {
    const validA = beanMap[nextA]?.id || beanAId;
    const validB = beanMap[nextB]?.id || beanBId;
    beanAId = validA;
    beanBId = validB;
    renderAll();
    if (notify) {
      onPairChange?.(beanAId, beanBId);
    }
  }

  elSwapBtn.addEventListener('click', () => {
    setPair(beanBId, beanAId, true);
  });

  let radarResizeRaf = 0;
  if (typeof ResizeObserver !== 'undefined') {
    radarResizeObserver = new ResizeObserver(() => {
      if (mountEl.hidden) return;
      if (radarResizeRaf) cancelAnimationFrame(radarResizeRaf);
      radarResizeRaf = requestAnimationFrame(() => {
        radarResizeRaf = 0;
        if (!mountEl.hidden) redrawRadar();
      });
    });
    radarResizeObserver.observe(elRadarCanvas.parentElement || elRadarCanvas);
  }

  renderAll();

  return {
    setCards(nextCards, invalidateIds = []) {
      beanCards = (nextCards || []).filter((c) => c.cardType === 'bean_card');
      beanMap = Object.fromEntries(beanCards.map((c) => [c.id, c]));
      for (const id of invalidateIds) {
        thumbCache.delete(id);
      }
      if (!beanMap[beanAId]) beanAId = beanCards[0]?.id || '';
      if (!beanMap[beanBId]) beanBId = beanCards[1]?.id || beanAId;
      renderAll();
    },
    setPair,
    getPair: () => ({ beanAId, beanBId }),
    redraw() {
      redrawRadar();
    },
    onShow() {
      requestAnimationFrame(redrawRadar);
    },
    destroy() {
      if (radarResizeRaf) cancelAnimationFrame(radarResizeRaf);
      radarResizeObserver?.disconnect();
    },
  };
}
