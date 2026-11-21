/**
 * 右侧双层精读科普抽屉 (Reading Drawer)
 * 桌面端右侧滑出并配合 3D 卡片左移；移动端自动转为底部抽屉
 * 完整支持 bean_card（规格/物理体检/风味谱/叙事/手冲配方复制/关联卡直达）与 knowledge_card（摘要/金句/指标/对比表/分节/误区/关联豆卡）
 */

import { getFlavorColor, RADAR_AXES } from '../../data/flavor-palette.js';

const GROUP_LABELS = {
  bean_card: '珍藏单品豆',
  species: '核心豆种基因',
  variety: '精品细分品种',
  origin: '世界风土产区',
  craft_tasting: '工艺与专业品鉴',
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isOriginSiblingPair(cardA, cardB) {
  if (!cardA || !cardB) return false;
  const pairSet = new Set([cardA.id, cardB.id]);
  if (pairSet.has('af-05-kaffa-washed') && pairSet.has('af-06-kaffa-natural')) {
    return true;
  }
  return (
    cardA.cardType === 'bean_card' &&
    cardB.cardType === 'bean_card' &&
    cardA.origin?.country === cardB.origin?.country &&
    cardA.botany?.variety === cardB.botany?.variety &&
    cardA.processing?.category !== cardB.processing?.category
  );
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function parseTotalSecondsHint(brewing) {
  const raw = String(brewing?.totalTime || '');
  const mmss = raw.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);
  const secOnly = raw.match(/(\d{2,3})\s*(?:s|秒)/i);
  if (secOnly) return Number(secOnly[1]);
  return 120;
}

export function parseBrewPlan(brewing) {
  const rawSteps = Array.isArray(brewing?.steps) ? brewing.steps : [];
  if (rawSteps.length === 0) return null;

  const fallbackTotal = parseTotalSecondsHint(brewing);
  const defaultWeights = rawSteps.length === 3 ? [0.25, 0.35, 0.4] : null;
  let cursor = 0;

  const steps = rawSteps.map((step, idx) => {
    const targetText = String(step?.target || '');
    const rangeMatch = targetText.match(/(\d{1,2}):(\d{2})\s*[–—\-~至]\s*(\d{1,2}):(\d{2})/);
    let startSec;
    let endSec;

    if (rangeMatch) {
      startSec = Number(rangeMatch[1]) * 60 + Number(rangeMatch[2]);
      endSec = Number(rangeMatch[3]) * 60 + Number(rangeMatch[4]);
      if (endSec <= startSec) endSec = startSec + 30;
    } else {
      const share = defaultWeights ? defaultWeights[idx] : 1 / rawSteps.length;
      startSec = cursor;
      endSec = idx === rawSteps.length - 1 ? Math.max(cursor + 20, fallbackTotal) : Math.round(cursor + fallbackTotal * share);
    }
    cursor = endSec;

    const weightMatch = targetText.match(/(\d+(?:\.\d+)?)\s*g/i);
    const targetWeight = weightMatch ? `${weightMatch[1]}g` : '';

    return {
      index: idx,
      stage: step?.stage || `第 ${idx + 1} 段`,
      targetWeight,
      startSec,
      endSec,
      durationSec: Math.max(1, endSec - startSec),
    };
  });

  const totalSec = Math.max(
    1,
    ...steps.map((s) => s.endSec),
  );

  return { totalSec, steps };
}

function createWoodChime() {
  let audioCtx = null;

  function ensureContext() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch {
      audioCtx = null;
    }
    return audioCtx;
  }

  function playNote(freq, delaySec = 0, durationSec = 0.28, peakGain = 0.085) {
    const ctx = ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime + delaySec;
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();
      const harmonicGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(freq * 2, now);
      harmonicGain.gain.setValueAtTime(0.18, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      harmonic.connect(harmonicGain);
      harmonicGain.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + durationSec + 0.02);
      harmonic.stop(now + durationSec + 0.02);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }

  return {
    unlock() {
      ensureContext();
    },
    playStage() {
      playNote(392, 0, 0.24, 0.08);
    },
    playComplete() {
      playNote(392, 0, 0.26, 0.08);
      playNote(523.25, 0.16, 0.36, 0.09);
    },
  };
}

function renderBrewTimerHtml(brewing) {
  const plan = parseBrewPlan(brewing);
  if (!plan) return '';

  const segsHtml = plan.steps
    .map(
      (step) => `
        <div class="brew-seg" style="flex-grow:${step.durationSec}" data-seg-index="${step.index}" title="${escapeHtml(step.stage)} (${formatClock(step.startSec)}–${formatClock(step.endSec)})">
          <div class="brew-seg-fill" style="width:0%"></div>
        </div>
      `,
    )
    .join('');

  return `
    <div class="brew-timer" id="drawer-brew-timer" data-status="idle">
      <div class="brew-timer-top">
        <div class="brew-clock" aria-live="off">
          <span class="brew-clock-now" id="brew-clock-now">00:00</span>
          <span class="brew-clock-sep">/</span>
          <span class="brew-clock-total">${formatClock(plan.totalSec)}</span>
        </div>
        <span class="brew-stage-pill" id="brew-stage-pill">准备就绪 · ${plan.steps.length} 段引导</span>
      </div>

      <div class="brew-progress" id="brew-progress" aria-hidden="true">
        ${segsHtml}
      </div>

      <div class="brew-timer-actions">
        <button type="button" class="brew-timer-primary" id="brew-timer-toggle">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="7 5 19 12 7 19 7 5"></polygon>
          </svg>
          <span>开始冲煮</span>
        </button>
        <button type="button" class="brew-timer-secondary" id="brew-timer-reset" disabled>重置</button>
        <button
          type="button"
          class="brew-timer-sound is-on"
          id="brew-timer-sound"
          aria-pressed="true"
          title="阶段切换与完成柔和木质提示音"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.5 8.5a5 5 0 0 1 0 7"></path>
          </svg>
          <span>提示音</span>
        </button>
      </div>
    </div>
  `;
}

function formatRecipeText(card) {
  const b = card.brewing || {};
  const lines = [
    `【${card.code} ${card.title} · 手冲萃取参考】`,
    b.method ? `方式：${b.method}` : null,
    b.waterTempC ? `水温：${b.waterTempC}℃` : null,
    b.ratio ? `粉水比：${b.ratio}` : null,
    b.doseWater ? `粉液量：${b.doseWater}` : null,
    b.grindSize ? `研磨度：${b.grindSize}` : null,
    b.totalTime ? `总时长：${b.totalTime}` : null,
    b.summary ? `要点：${b.summary}` : null,
  ].filter(Boolean);

  if (Array.isArray(b.steps) && b.steps.length > 0) {
    lines.push('', '分段注水步骤：');
    b.steps.forEach((step, idx) => {
      const target = step.target ? `（${step.target}）` : '';
      const note = step.note ? ` — ${step.note}` : '';
      lines.push(`${idx + 1}. ${step.stage || `第 ${idx + 1} 段`}${target}${note}`);
    });
  }

  return lines.join('\n');
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for file:// or restricted permission contexts
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    textarea.remove();
  }
  return ok;
}

function renderPhysicsSection(physics) {
  if (!physics) return '';
  const items = [];
  if (physics.moisturePct != null) {
    items.push({ value: `${physics.moisturePct}%`, label: '生豆含水率' });
  }
  if (physics.densityGl != null) {
    items.push({ value: `${physics.densityGl} g/L`, label: '堆积密度' });
  }
  if (physics.waterActivity != null) {
    items.push({ value: `${physics.waterActivity} Aw`, label: '水活度' });
  }
  if (items.length === 0 && !physics.note) return '';

  const scienceHints = [];
  if (physics.moisturePct != null) {
    scienceHints.push('含水率落于 10.5%–12.0% 黄金区间时，生豆在储存中既不易霉变，烘焙热传导也最稳定。');
  }
  if (physics.densityGl != null) {
    scienceHints.push('堆积密度 ≥ 800 g/L 属于高海拔慢熟紧实硬豆，通常蕴含更致密的前驱糖分与锐利花果酸质。');
  }

  return `
    <section class="drawer-section" aria-label="生豆物理体检">
      <div class="physics-card">
        <div class="physics-head">
          <h3 class="drawer-section-title">生豆物理体检</h3>
          <span class="physics-badge">实测数据</span>
        </div>
        <div class="physics-metrics">
          ${items
            .map(
              (item) => `
                <div class="physics-metric">
                  <div class="physics-metric-val">${escapeHtml(item.value)}</div>
                  <div class="physics-metric-label">${escapeHtml(item.label)}</div>
                </div>
              `,
            )
            .join('')}
        </div>
        ${physics.note ? `<p class="physics-note">${escapeHtml(physics.note)}</p>` : ''}
        ${
          scienceHints.length > 0
            ? `<p class="physics-note">${escapeHtml(scienceHints.join(' '))}</p>`
            : ''
        }
      </div>
    </section>
  `;
}

function shortBeanName(card) {
  if (!card?.title) return '';
  return card.title.replace(
    /^(巴拿马|哥伦比亚|埃塞俄比亚|肯尼亚|巴西|印度尼西亚|印尼|中国云南)\s+/,
    '',
  );
}

function renderCompareShortcut(card, cardMap) {
  if (card?.cardType !== 'bean_card') return '';
  const ids = Array.isArray(card.relatedCardIds) ? card.relatedCardIds : [];
  const relatedBean = ids
    .map((id) => cardMap?.[id])
    .find((c) => c && c.cardType === 'bean_card' && c.id !== card.id);

  let partner = relatedBean;
  let label = '';
  if (partner) {
    label = `与 ${partner.code} ${shortBeanName(partner)} 双豆对比`;
  } else {
    const fallbackId =
      card.id === 'ca-01-esmeralda-green' ? 'af-06-kaffa-natural' : 'ca-01-esmeralda-green';
    partner = cardMap?.[fallbackId] || null;
    label = '加入双豆对比';
  }

  const targetId = partner?.id || '';
  return `
    <section class="drawer-section" aria-label="双豆对比快捷入口">
      <button
        type="button"
        class="drawer-compare-cta"
        data-compare-a="${escapeHtml(card.id)}"
        data-compare-b="${escapeHtml(targetId)}"
      >
        <span class="drawer-compare-dots" aria-hidden="true">
          <span class="dot-a"></span>
          <span class="dot-b"></span>
        </span>
        <span class="drawer-compare-label">${escapeHtml(label)}</span>
        <span class="drawer-compare-meta">对比实验室</span>
      </button>
    </section>
  `;
}

function renderRelatedCards(card, cardMap) {
  const ids = Array.isArray(card.relatedCardIds) ? card.relatedCardIds : [];
  const targets = ids.map((id) => cardMap?.[id]).filter(Boolean);
  if (targets.length === 0) return '';

  return `
    <section class="drawer-section" aria-label="关联卡片直达">
      <h3 class="drawer-section-title">关联卡片直达</h3>
      <div class="related-list">
        ${targets
          .map((target) => {
            const isPair = isOriginSiblingPair(card, target);
            const sub =
              target.cardType === 'bean_card'
                ? [target.origin?.country, target.processing?.name, target.roast?.label]
                    .filter(Boolean)
                    .join(' / ')
                : target.topic || GROUP_LABELS[target.group] || target.subtitle || '';
            return `
              <button type="button" class="related-card-btn" data-jump-card="${escapeHtml(target.id)}">
                <div class="related-card-main">
                  <div class="related-card-top">
                    <span class="related-code">${escapeHtml(target.code)}</span>
                    ${isPair ? '<span class="related-pair-badge">同源对比</span>' : ''}
                    <span class="related-title">${escapeHtml(target.title)}</span>
                  </div>
                  ${sub ? `<span class="related-sub">${escapeHtml(sub)}</span>` : ''}
                </div>
                <span class="related-action">切换查看</span>
              </button>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderBeanCardBody(card, cardMap) {
  const origin = card.origin || {};
  const botany = card.botany || {};
  const processing = card.processing || {};
  const roast = card.roast || {};
  const sensory = card.sensory || {};
  const narrative = card.narrative || {};
  const brewing = card.brewing || {};

  const regionText = [origin.country, origin.region].filter(Boolean).join(' ');
  const varietyText = [botany.variety, botany.species].filter(Boolean).join(' / ');
  const roastPos =
    typeof roast.position01 === 'number'
      ? Math.max(4, Math.min(96, roast.position01 * 100))
      : 35;

  const flavorsHtml = (sensory.flavors || [])
    .map((flavor) => {
      const color = getFlavorColor(flavor);
      return `
        <span class="flavor-pill" style="--flavor-color:${escapeHtml(color)}">
          <span class="flavor-dot" aria-hidden="true"></span>
          <span>${escapeHtml(flavor)}</span>
        </span>
      `;
    })
    .join('');

  const radar6D = sensory.radar6D || {};
  const radarBarsHtml = RADAR_AXES.map((axis) => {
    const score = typeof radar6D[axis.key] === 'number' ? radar6D[axis.key] : 0;
    const widthPct = Math.max(0, Math.min(100, (score / 5) * 100));
    return `
      <div class="radar-bar-item">
        <div class="radar-bar-head">
          <span class="radar-bar-name">${escapeHtml(axis.label)}</span>
          <span class="radar-bar-score">${score.toFixed(1)}</span>
        </div>
        <div class="radar-bar-track">
          <div class="radar-bar-fill" style="width:${widthPct}%;--axis-color:${escapeHtml(axis.color)}"></div>
        </div>
      </div>
    `;
  }).join('');

  const brewParams = [
    { label: '建议水温', value: brewing.waterTempC ? `${brewing.waterTempC}℃` : '92℃' },
    { label: '粉水比', value: brewing.ratio || '1:15' },
    { label: '研磨度', value: brewing.grindSize || '中细研磨' },
    { label: '参考时长', value: brewing.totalTime || '约 2:00' },
  ];

  const stepsHtml = Array.isArray(brewing.steps)
    ? brewing.steps
        .map(
          (step, idx) => `
            <li class="brew-step" data-step-index="${idx}">
              <span class="brew-step-num">${idx + 1}</span>
              <div>
                <div class="brew-step-head">
                  <span class="brew-step-stage">${escapeHtml(step.stage || `阶段 ${idx + 1}`)}</span>
                  ${step.target ? `<span class="brew-step-target">${escapeHtml(step.target)}</span>` : ''}
                </div>
                ${step.note ? `<p class="brew-step-note">${escapeHtml(step.note)}</p>` : ''}
              </div>
            </li>
          `,
        )
        .join('')
    : '';

  return `
    ${card.tagline ? `<p class="drawer-tagline">${escapeHtml(card.tagline)}</p>` : ''}

    <section class="drawer-section" aria-label="单品基础规格">
      <h3 class="drawer-section-title">单品规格档案</h3>
      <div class="spec-ledger">
        <div class="spec-cell is-wide">
          <span class="spec-label">产区</span>
          <span class="spec-value">${escapeHtml(regionText || '未注明')}</span>
        </div>
        <div class="spec-cell is-wide">
          <span class="spec-label">庄园 / 地块</span>
          <span class="spec-value">${escapeHtml(origin.estate || '未注明')}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">海拔</span>
          <span class="spec-value is-mono">${escapeHtml(origin.altitude || '未注明')}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">等级</span>
          <span class="spec-value">${escapeHtml(origin.grade || '精品批次')}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">豆种与品种</span>
          <span class="spec-value">${escapeHtml(varietyText || 'Arabica')}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">处理方式</span>
          <span class="spec-value">${escapeHtml(processing.name || '未注明')}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">产季</span>
          <span class="spec-value is-mono">${escapeHtml(origin.harvestSeason || '当季新产')}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">大洲风土带</span>
          <span class="spec-value">${escapeHtml(origin.continent || '精品产区')}</span>
        </div>
        <div class="spec-cell is-wide">
          <span class="spec-label">烘焙度与色标</span>
          <div class="roast-inline">
            <span class="roast-swatch-wrap">
              <span class="roast-dot" style="background:${escapeHtml(roast.colorHex || '#8C582F')}" aria-hidden="true"></span>
              <span class="spec-value">${escapeHtml(roast.label || '浅中度')}${roast.scale ? ` (${escapeHtml(roast.scale)})` : ''}</span>
            </span>
            ${roast.agtron ? `<span class="roast-agtron">Agtron ${escapeHtml(roast.agtron)}</span>` : ''}
          </div>
          <div class="roast-scale-bar" aria-hidden="true">
            <span class="roast-scale-pin" style="left:${roastPos}%"></span>
          </div>
        </div>
      </div>
    </section>

    ${renderPhysicsSection(card.physics)}

    <section class="drawer-section" aria-label="风味谱与品鉴笔记">
      <h3 class="drawer-section-title">风味谱与品鉴笔记</h3>
      ${flavorsHtml ? `<div class="flavor-pills">${flavorsHtml}</div>` : ''}
      ${sensory.tastingNotes ? `<p class="drawer-prose">${escapeHtml(sensory.tastingNotes)}</p>` : ''}
      <div class="radar-bars" aria-label="六维感官评分">${radarBarsHtml}</div>
    </section>

    ${
      narrative.originStory
        ? `
          <section class="drawer-section" aria-label="产地故事">
            <h3 class="drawer-section-title">产地故事</h3>
            <p class="drawer-prose">${escapeHtml(narrative.originStory)}</p>
          </section>
        `
        : ''
    }

    ${
      narrative.cultivationHarvest
        ? `
          <section class="drawer-section" aria-label="种植与采摘">
            <h3 class="drawer-section-title">种植与采摘</h3>
            <p class="drawer-prose">${escapeHtml(narrative.cultivationHarvest)}</p>
          </section>
        `
        : ''
    }

    ${
      processing.detail
        ? `
          <section class="drawer-section" aria-label="处理法工艺详解">
            <h3 class="drawer-section-title">处理法工艺详解</h3>
            <p class="drawer-prose">${escapeHtml(processing.detail)}</p>
          </section>
        `
        : ''
    }

    ${
      narrative.recommendedScenarios
        ? `
          <section class="drawer-section" aria-label="推荐饮用场景">
            <h3 class="drawer-section-title">推荐饮用场景</h3>
            <p class="drawer-prose">${escapeHtml(narrative.recommendedScenarios)}</p>
          </section>
        `
        : ''
    }

    <section class="drawer-section" aria-label="手冲萃取参考">
      <h3 class="drawer-section-title">手冲萃取参考</h3>
      <div class="brew-card">
        <div class="brew-head">
          <span class="brew-method">${escapeHtml(brewing.method || '手冲热饮')}${brewing.doseWater ? ` · ${escapeHtml(brewing.doseWater)}` : ''}</span>
          <button type="button" class="brew-copy-btn" id="drawer-copy-recipe" title="一键复制手冲冲煮配方">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>复制配方</span>
          </button>
        </div>

        <div class="brew-params">
          ${brewParams
            .map(
              (p) => `
                <div class="brew-param">
                  <div class="brew-param-label">${escapeHtml(p.label)}</div>
                  <div class="brew-param-val">${escapeHtml(p.value)}</div>
                </div>
              `,
            )
            .join('')}
        </div>

        ${brewing.summary ? `<p class="physics-note">${escapeHtml(brewing.summary)}</p>` : ''}

        ${renderBrewTimerHtml(brewing)}

        ${stepsHtml ? `<ol class="brew-steps" id="drawer-brew-steps">${stepsHtml}</ol>` : ''}
      </div>
    </section>

    ${renderCompareShortcut(card, cardMap)}

    ${renderRelatedCards(card, cardMap)}
  `;
}

function renderComparisonTable(card) {
  const rows = Array.isArray(card.comparisonTable) ? card.comparisonTable : [];
  if (rows.length === 0) return '';

  const headers = Array.isArray(card.tableHeaders) && card.tableHeaders.length > 0
    ? card.tableHeaders
    : (() => {
        const first = rows[0];
        if (Array.isArray(first)) return first.map((_, i) => (i === 0 ? '维度' : `列 ${i}`));
        const keys = Object.keys(first);
        return keys.map((k, i) => (i === 0 ? '维度' : k));
      })();

  const extractCells = (row) => {
    if (Array.isArray(row)) return row;
    const ordered = [];
    if ('metric' in row) ordered.push(row.metric);
    if ('colA' in row) ordered.push(row.colA);
    if ('colB' in row) ordered.push(row.colB);
    if ('colC' in row && row.colC !== undefined) ordered.push(row.colC);
    if ('colD' in row && row.colD !== undefined) ordered.push(row.colD);
    if (ordered.length > 0) return ordered;
    return Object.values(row);
  };

  return `
    <section class="drawer-section" aria-label="核心对比表">
      <h3 class="drawer-section-title">关键参数对照</h3>
      <div class="table-scroll">
        <table class="comparison-table">
          <thead>
            <tr>
              ${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => {
                const cells = extractCells(row);
                return `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderKnowledgeCardBody(card, cardMap) {
  const metrics = Array.isArray(card.metrics) ? card.metrics : [];
  const highlights = Array.isArray(card.highlights) ? card.highlights : [];
  const sections = Array.isArray(card.sections) ? card.sections : [];

  return `
    ${
      card.summary
        ? `
          <section class="drawer-section" aria-label="核心导语">
            <p class="drawer-prose">${escapeHtml(card.summary)}</p>
          </section>
        `
        : ''
    }

    ${
      card.keyTakeaway
        ? `
          <section class="drawer-section" aria-label="核心结论">
            <h3 class="drawer-section-title">核心结论</h3>
            <blockquote class="takeaway-quote">${escapeHtml(card.keyTakeaway)}</blockquote>
          </section>
        `
        : ''
    }

    ${
      metrics.length > 0
        ? `
          <section class="drawer-section" aria-label="关键指标">
            <h3 class="drawer-section-title">关键指标速览</h3>
            <div class="knowledge-metrics">
              ${metrics
                .map(
                  (m) => `
                    <div class="knowledge-metric">
                      <div class="knowledge-metric-val">${escapeHtml(m.value)}</div>
                      <div class="knowledge-metric-label">${escapeHtml(m.label)}</div>
                    </div>
                  `,
                )
                .join('')}
            </div>
          </section>
        `
        : ''
    }

    ${
      highlights.length > 0
        ? `
          <section class="drawer-section" aria-label="知识要点">
            <h3 class="drawer-section-title">速记要点</h3>
            <ul class="highlight-list">
              ${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </section>
        `
        : ''
    }

    ${renderComparisonTable(card)}

    ${
      sections.length > 0
        ? `
          <section class="drawer-section" aria-label="分节精讲">
            <h3 class="drawer-section-title">深入精讲</h3>
            <div class="knowledge-chapters">
              ${sections
                .map(
                  (sec) => `
                    <article class="knowledge-chapter">
                      <h4>${escapeHtml(sec.heading)}</h4>
                      <p>${escapeHtml(sec.body)}</p>
                    </article>
                  `,
                )
                .join('')}
            </div>
          </section>
        `
        : ''
    }

    ${
      card.mythBuster
        ? `
          <section class="drawer-section" aria-label="常见误区澄清">
            <div class="myth-box">
              <div class="myth-label">常见误区澄清</div>
              <p class="myth-text">${escapeHtml(card.mythBuster)}</p>
            </div>
          </section>
        `
        : ''
    }

    ${renderRelatedCards(card, cardMap)}
  `;
}

export function createReadingDrawer(drawerEl, scrimEl, options = {}) {
  const {
    cardMap: initialCardMap = {},
    onClose,
    onSelectCard,
    onComparePair,
    onEditCustomBean,
    onDeleteCustomBean,
    onCopySuccess,
  } = options;
  let cardMap = initialCardMap;
  let open = false;
  let currentCard = null;
  let copyResetTimer = null;
  let activeBrewTimerCleanup = null;
  const chime = createWoodChime();

  function stopActiveBrewTimer() {
    if (typeof activeBrewTimerCleanup === 'function') {
      activeBrewTimerCleanup();
      activeBrewTimerCleanup = null;
    }
  }

  function bindBrewTimer(card) {
    stopActiveBrewTimer();
    if (card?.cardType !== 'bean_card') return;

    const timerEl = drawerEl.querySelector('#drawer-brew-timer');
    const plan = parseBrewPlan(card.brewing);
    if (!timerEl || !plan) return;

    const clockNowEl = timerEl.querySelector('#brew-clock-now');
    const stagePillEl = timerEl.querySelector('#brew-stage-pill');
    const toggleBtn = timerEl.querySelector('#brew-timer-toggle');
    const resetBtn = timerEl.querySelector('#brew-timer-reset');
    const soundBtn = timerEl.querySelector('#brew-timer-sound');
    const segFills = Array.from(timerEl.querySelectorAll('.brew-seg-fill'));
    const segEls = Array.from(timerEl.querySelectorAll('.brew-seg'));
    const stepItems = Array.from(drawerEl.querySelectorAll('#drawer-brew-steps .brew-step'));

    let status = 'idle'; // 'idle' | 'running' | 'paused' | 'done'
    let elapsedMs = 0;
    let lastTickAt = 0;
    let intervalId = null;
    let soundEnabled = true;
    let lastStageIdx = -1;

    function getStageIndexAt(sec) {
      for (let i = 0; i < plan.steps.length; i++) {
        if (sec < plan.steps[i].endSec) return i;
      }
      return plan.steps.length - 1;
    }

    function updateToggleVisual() {
      if (!toggleBtn) return;
      const labelSpan = toggleBtn.querySelector('span');
      const iconSvg = toggleBtn.querySelector('svg');
      if (status === 'running') {
        if (labelSpan) labelSpan.textContent = '暂停';
        if (iconSvg) {
          iconSvg.innerHTML =
            '<rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect>';
        }
      } else {
        if (labelSpan) {
          labelSpan.textContent =
            status === 'paused' ? '继续冲煮' : status === 'done' ? '再次冲煮' : '开始冲煮';
        }
        if (iconSvg) {
          iconSvg.innerHTML = '<polygon points="7 5 19 12 7 19 7 5"></polygon>';
        }
      }
      if (resetBtn) {
        resetBtn.disabled = status === 'idle' && elapsedMs === 0;
      }
    }

    function paintProgress() {
      const elapsedSec = Math.min(plan.totalSec, elapsedMs / 1000);
      timerEl.dataset.status = status;

      if (clockNowEl) {
        clockNowEl.textContent = formatClock(elapsedSec);
      }

      const currIdx = status === 'idle' ? -1 : getStageIndexAt(elapsedSec);

      if (stagePillEl) {
        if (status === 'idle') {
          stagePillEl.textContent = `准备就绪 · ${plan.steps.length} 段引导`;
        } else if (status === 'done') {
          stagePillEl.textContent = '萃取完成 · 欢迎慢享';
        } else {
          const st = plan.steps[currIdx];
          const wt = st.targetWeight ? ` · 目标 ${st.targetWeight}` : '';
          stagePillEl.textContent = `${st.stage}${wt}`;
        }
      }

      plan.steps.forEach((step, idx) => {
        const fill = segFills[idx];
        const seg = segEls[idx];
        const stepEl = stepItems[idx];

        let pct = 0;
        if (status === 'done' || elapsedSec >= step.endSec) {
          pct = 100;
        } else if (elapsedSec > step.startSec) {
          pct = ((elapsedSec - step.startSec) / step.durationSec) * 100;
        }

        if (fill) fill.style.width = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
        if (seg) {
          seg.classList.toggle('is-active', status !== 'idle' && status !== 'done' && idx === currIdx);
          seg.classList.toggle('is-done', status === 'done' || elapsedSec >= step.endSec);
        }
        if (stepEl) {
          stepEl.classList.toggle('is-active-step', status !== 'idle' && status !== 'done' && idx === currIdx);
          stepEl.classList.toggle('is-done-step', status === 'done' || (status !== 'idle' && elapsedSec >= step.endSec));
        }
      });

      updateToggleVisual();
    }

    function clearLoop() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function tick() {
      if (status !== 'running') return;
      const now = performance.now();
      elapsedMs += Math.max(0, now - lastTickAt);
      lastTickAt = now;

      const elapsedSec = elapsedMs / 1000;
      if (elapsedSec >= plan.totalSec) {
        elapsedMs = plan.totalSec * 1000;
        status = 'done';
        clearLoop();
        paintProgress();
        if (soundEnabled) chime.playComplete();
        return;
      }

      const currIdx = getStageIndexAt(elapsedSec);
      if (lastStageIdx !== -1 && currIdx > lastStageIdx && soundEnabled) {
        chime.playStage();
      }
      lastStageIdx = currIdx;
      paintProgress();
    }

    function startOrResume() {
      if (status === 'done') {
        elapsedMs = 0;
        lastStageIdx = -1;
      }
      if (soundEnabled) chime.unlock();
      status = 'running';
      lastTickAt = performance.now();
      const currIdx = getStageIndexAt(elapsedMs / 1000);
      if (lastStageIdx === -1) {
        lastStageIdx = currIdx;
      }
      clearLoop();
      intervalId = setInterval(tick, 100);
      paintProgress();
    }

    function pause() {
      if (status !== 'running') return;
      tick();
      if (status === 'running') {
        status = 'paused';
        clearLoop();
        paintProgress();
      }
    }

    function reset() {
      clearLoop();
      status = 'idle';
      elapsedMs = 0;
      lastStageIdx = -1;
      paintProgress();
    }

    toggleBtn?.addEventListener('click', () => {
      if (status === 'running') pause();
      else startOrResume();
    });

    resetBtn?.addEventListener('click', reset);

    soundBtn?.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.classList.toggle('is-on', soundEnabled);
      soundBtn.setAttribute('aria-pressed', String(soundEnabled));
      if (soundEnabled) {
        chime.unlock();
        chime.playStage();
      }
    });

    paintProgress();

    activeBrewTimerCleanup = () => {
      clearLoop();
      status = 'idle';
    };
  }

  function render(card) {
    stopActiveBrewTimer();
    currentCard = card;
    if (!card) return;

    const kindLabel =
      card.cardType === 'bean_card'
        ? GROUP_LABELS.bean_card
        : card.topic || GROUP_LABELS[card.group] || '咖啡百科';

    const bodyHtml =
      card.cardType === 'bean_card'
        ? renderBeanCardBody(card, cardMap)
        : renderKnowledgeCardBody(card, cardMap);

    const customActionsHtml = card.isCustomBean
      ? `
        <div class="drawer-custom-bar" id="drawer-custom-bar">
          <button type="button" class="drawer-custom-btn" id="drawer-edit-custom">编辑此卡</button>
          <button type="button" class="drawer-custom-btn is-danger" id="drawer-delete-custom">删除此卡</button>
          <div class="drawer-delete-confirm" id="drawer-delete-confirm" hidden>
            <span>确认删除此自定义豆卡？</span>
            <button type="button" class="drawer-custom-btn is-danger-solid" id="drawer-delete-yes">确认删除</button>
            <button type="button" class="drawer-custom-btn" id="drawer-delete-no">取消</button>
          </div>
        </div>
      `
      : '';

    drawerEl.innerHTML = `
      <div class="drawer-handle" aria-hidden="true"></div>
      <header class="drawer-header">
        <div class="drawer-header-meta">
          <div class="drawer-kicker-row">
            <span class="drawer-code">${escapeHtml(card.code)}</span>
            <span class="drawer-kind-tag">${escapeHtml(kindLabel)}</span>
            ${card.isHeroBean ? '<span class="drawer-hero-tag">高定插画典藏</span>' : ''}
            ${card.isCustomBean ? '<span class="drawer-custom-tag">我的豆单</span>' : ''}
          </div>
          <h2 class="drawer-title">${escapeHtml(card.title)}</h2>
          ${card.subtitle ? `<p class="drawer-subtitle">${escapeHtml(card.subtitle)}</p>` : ''}
          ${customActionsHtml}
        </div>
        <button type="button" class="drawer-icon-btn" id="drawer-close-btn" aria-label="关闭精读档案" title="收起档案 (Esc / I)">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>
      <div class="drawer-body" id="drawer-scroll-body">
        ${bodyHtml}
      </div>
    `;

    const closeBtn = drawerEl.querySelector('#drawer-close-btn');
    closeBtn?.addEventListener('click', () => onClose?.());

    if (card.isCustomBean) {
      const editBtn = drawerEl.querySelector('#drawer-edit-custom');
      const delBtn = drawerEl.querySelector('#drawer-delete-custom');
      const confirmBox = drawerEl.querySelector('#drawer-delete-confirm');
      const delYes = drawerEl.querySelector('#drawer-delete-yes');
      const delNo = drawerEl.querySelector('#drawer-delete-no');

      editBtn?.addEventListener('click', () => onEditCustomBean?.(card));
      delBtn?.addEventListener('click', () => {
        if (editBtn) editBtn.hidden = true;
        if (delBtn) delBtn.hidden = true;
        if (confirmBox) confirmBox.hidden = false;
      });
      delNo?.addEventListener('click', () => {
        if (editBtn) editBtn.hidden = false;
        if (delBtn) delBtn.hidden = false;
        if (confirmBox) confirmBox.hidden = true;
      });
      delYes?.addEventListener('click', () => onDeleteCustomBean?.(card.id));
    }

    const copyBtn = drawerEl.querySelector('#drawer-copy-recipe');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const text = formatRecipeText(card);
        const copied = await copyTextToClipboard(text);
        if (copied) {
          clearTimeout(copyResetTimer);
          copyBtn.classList.add('is-copied');
          const span = copyBtn.querySelector('span');
          if (span) span.textContent = '已复制';
          onCopySuccess?.(`已复制「${card.title}」手冲配方`);
          copyResetTimer = setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            if (span) span.textContent = '复制配方';
          }, 2200);
        } else {
          onCopySuccess?.('当前环境禁止自动剪贴板写入，请手动选中配方复制');
        }
      });
    }

    drawerEl.querySelectorAll('[data-jump-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-jump-card');
        if (targetId && cardMap[targetId]) {
          onSelectCard?.(targetId);
        }
      });
    });

    const compareCta = drawerEl.querySelector('[data-compare-a]');
    if (compareCta) {
      compareCta.addEventListener('click', () => {
        const idA = compareCta.getAttribute('data-compare-a');
        const idB = compareCta.getAttribute('data-compare-b');
        if (idA) onComparePair?.(idA, idB || undefined);
      });
    }

    bindBrewTimer(card);

    const scrollBody = drawerEl.querySelector('#drawer-scroll-body');
    if (scrollBody) scrollBody.scrollTop = 0;
  }

  function setOpen(nextOpen) {
    open = Boolean(nextOpen);
    if (!open) {
      stopActiveBrewTimer();
    }
    drawerEl.classList.toggle('is-open', open);
    drawerEl.setAttribute('aria-hidden', String(!open));

    const isMobile = window.matchMedia('(max-width: 960px)').matches;
    if (scrimEl) {
      const showScrim = open && isMobile;
      scrimEl.hidden = !showScrim;
      scrimEl.classList.toggle('is-visible', showScrim);
    }
  }

  scrimEl?.addEventListener('click', () => onClose?.());

  return {
    setCard: render,
    setCardMap(nextMap) {
      cardMap = nextMap || {};
      if (currentCard && cardMap[currentCard.id]) {
        render(cardMap[currentCard.id]);
      }
    },
    setOpen,
    isOpen: () => open,
    getCurrentCard: () => currentCard,
    destroy: () => {
      clearTimeout(copyResetTimer);
      stopActiveBrewTimer();
    },
  };
}
