import { invalidateCardThumb, resolveCardLayers } from '../art/hybrid-resolver.js';

/**
 * Pure CSS preserve-3d 5-layer depth fallback engine (V2.0).
 * Activates seamlessly if WebGL is unavailable, disabled, or fails shader compilation.
 * Exposes the exact same API surface as holo-stage.js (including setTheme & hover parallax)
 * so all UI controls remain 100% functional.
 */

const STYLE_TAG_ID = 'coffee-atlas-css3d-fallback-styles';

function ensureFallbackStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    .css3d-stage {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1200px;
      overflow: hidden;
      user-select: none;
      touch-action: none;
      cursor: grab;
    }
    .css3d-stage.dragging { cursor: grabbing; }
    .css3d-pivot {
      position: relative;
      transform-style: preserve-3d;
      will-change: transform;
      transition: margin-right 0.36s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .css3d-card {
      position: relative;
      width: min(80vw, 460px, calc(76vh * 0.6667));
      aspect-ratio: 2 / 3;
      transform-style: preserve-3d;
      will-change: transform;
    }
    .css3d-shadow {
      position: absolute;
      left: 10%;
      right: 10%;
      bottom: -8%;
      height: 14%;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(6, 4, 3, 0.72) 0%, rgba(214, 154, 78, 0.14) 55%, transparent 78%);
      filter: blur(14px);
      pointer-events: none;
      transform: translateZ(-44px);
      transition: background 0.35s ease;
    }
    .css3d-stage.theme-light .css3d-shadow {
      background: radial-gradient(ellipse at center, rgba(42, 34, 28, 0.26) 0%, rgba(64, 52, 42, 0.10) 55%, transparent 78%);
    }
    .css3d-face {
      position: absolute;
      inset: 0;
      border-radius: 18px;
      overflow: hidden;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transform-style: preserve-3d;
      box-shadow:
        0 26px 60px rgba(0, 0, 0, 0.62),
        0 0 0 2px rgba(214, 162, 94, 0.42),
        inset 0 0 0 1px rgba(255, 232, 194, 0.25);
    }
    .css3d-stage.theme-light .css3d-face {
      box-shadow:
        0 22px 48px rgba(42, 32, 22, 0.18),
        0 0 0 1.5px rgba(150, 108, 52, 0.46),
        inset 0 0 0 1px rgba(255, 240, 212, 0.25);
    }
    .css3d-front {
      background: #140f0c;
    }
    .css3d-back {
      transform: rotateY(180deg);
      background: #f6f1e7;
    }
    .css3d-stage.theme-light .css3d-back {
      box-shadow:
        0 22px 46px rgba(42, 32, 22, 0.16),
        0 0 0 2px rgba(128, 90, 44, 0.54),
        inset 0 0 0 1px rgba(138, 98, 48, 0.32);
    }
    .css3d-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      will-change: transform;
    }
    .css3d-layer img,
    .css3d-layer canvas {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
    .css3d-layer[data-role="lineart"] {
      mix-blend-mode: multiply;
      opacity: 0.75;
    }
    .css3d-foil {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      mix-blend-mode: screen;
      opacity: calc(var(--foil-amount, 0.62) * 0.62);
      background:
        repeating-linear-gradient(124deg, rgba(255, 238, 190, 0.08) 0px, rgba(255, 238, 190, 0.08) 1px, transparent 1px, transparent 5px),
        radial-gradient(circle at var(--mx, 50%) var(--my, 38%), rgba(255, 235, 178, 0.58), transparent 56%),
        linear-gradient(125deg, transparent 18%, rgba(214, 162, 94, 0.38) 46%, rgba(255, 240, 200, 0.52) 52%, transparent 78%);
      transition: opacity 0.2s ease;
    }
    .css3d-front.finish-pearl .css3d-foil {
      background:
        repeating-linear-gradient(124deg, rgba(255, 255, 255, 0.07) 0px, rgba(255, 255, 255, 0.07) 1px, transparent 1px, transparent 5px),
        radial-gradient(circle at var(--mx, 50%) var(--my, 38%), rgba(255, 244, 248, 0.48), transparent 54%),
        linear-gradient(122deg, rgba(255, 128, 196, 0.36), rgba(112, 224, 255, 0.38) 42%, rgba(255, 224, 132, 0.40) 70%, rgba(182, 136, 255, 0.34));
    }
    .css3d-front.finish-silver .css3d-foil {
      background:
        repeating-linear-gradient(128deg, rgba(235, 246, 255, 0.11) 0px, rgba(235, 246, 255, 0.11) 1px, transparent 1px, transparent 4px),
        radial-gradient(circle at var(--mx, 50%) var(--my, 38%), rgba(235, 246, 255, 0.56), transparent 54%),
        linear-gradient(128deg, transparent 14%, rgba(186, 206, 228, 0.48) 47%, rgba(246, 251, 255, 0.58) 53%, transparent 80%);
    }
    .css3d-front.finish-original .css3d-foil {
      opacity: 0;
    }
    .css3d-front.finish-gold .css3d-foil {
      background:
        repeating-linear-gradient(124deg, rgba(255, 228, 152, 0.10) 0px, rgba(255, 228, 152, 0.10) 1px, transparent 1px, transparent 5px),
        radial-gradient(circle at var(--mx, 50%) var(--my, 38%), rgba(255, 232, 164, 0.62), transparent 55%),
        linear-gradient(124deg, transparent 14%, rgba(196, 132, 44, 0.44) 44%, rgba(255, 236, 174, 0.60) 52%, rgba(192, 128, 42, 0.28) 64%, transparent 82%);
    }
    .css3d-back-foil {
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: soft-light;
      opacity: calc(var(--foil-amount, 0.62) * 0.24);
      background: radial-gradient(circle at var(--mx, 50%) var(--my, 38%), rgba(255, 244, 222, 0.6), transparent 62%);
    }
  `;
  document.head.appendChild(style);
}

function sourceToDataURL(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) {
    return source.toDataURL('image/png');
  }
  if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) {
    return source.currentSrc || source.src || '';
  }
  return '';
}

const FALLBACK_SERIF_FONT = `'Songti SC', 'Noto Serif SC', 'STSong', Georgia, serif`;
const FALLBACK_SANS_FONT = `'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', -apple-system, sans-serif`;
const FALLBACK_MONO_FONT = `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;

const FALLBACK_FINISH_LABELS = {
  gold: 'GOLD FOIL · 烫金',
  pearl: 'PEARL · 珠光',
  silver: 'SILVER FOIL · 银箔',
  original: 'COTTON · 原画棉纸',
};

function drawRoundedPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function createCSS3DFallbackStage(containerEl, callbacks = {}, fallbackError = null) {
  ensureFallbackStyles();

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false, addEventListener() {}, removeEventListener() {} };

  let theme =
    typeof document !== 'undefined' && document.documentElement?.dataset?.theme === 'light'
      ? 'light'
      : 'dark';

  const rootEl = document.createElement('div');
  rootEl.className = `css3d-stage${theme === 'light' ? ' theme-light' : ''}`;
  rootEl.setAttribute('role', 'region');
  rootEl.setAttribute('aria-label', '3D 全息咖啡闪卡（轻量 3D 模式）');

  const pivotEl = document.createElement('div');
  pivotEl.className = 'css3d-pivot';

  const cardEl = document.createElement('div');
  cardEl.className = 'css3d-card';

  const shadowEl = document.createElement('div');
  shadowEl.className = 'css3d-shadow';

  const frontEl = document.createElement('div');
  frontEl.className = 'css3d-face css3d-front finish-gold';

  const backEl = document.createElement('div');
  backEl.className = 'css3d-face css3d-back';

  const layerRoles = ['background', 'subject', 'lineart', 'effects', 'text'];
  const layerMap = new Map();
  for (const role of layerRoles) {
    const wrap = document.createElement('div');
    wrap.className = 'css3d-layer';
    wrap.dataset.role = role;
    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    wrap.appendChild(img);
    frontEl.appendChild(wrap);
    layerMap.set(role, { wrap, img });
  }

  const foilEl = document.createElement('div');
  foilEl.className = 'css3d-foil';
  frontEl.appendChild(foilEl);

  const backImg = document.createElement('img');
  backImg.alt = '卡片背面品鉴档案';
  backImg.draggable = false;
  backImg.style.width = '100%';
  backImg.style.height = '100%';
  backImg.style.display = 'block';
  backImg.style.objectFit = 'cover';
  backEl.appendChild(backImg);

  const backFoilEl = document.createElement('div');
  backFoilEl.className = 'css3d-back-foil';
  backEl.appendChild(backFoilEl);

  cardEl.append(shadowEl, frontEl, backEl);
  pivotEl.appendChild(cardEl);
  rootEl.appendChild(pivotEl);
  containerEl.replaceChildren(rootEl);

  let currentCard = null;
  let currentLayers = null;
  let loadToken = 0;
  let disposed = false;
  let rafId = 0;
  let lastTime = performance.now();
  let elapsed = 0;

  let flipped = false;
  let finish = 'gold';
  let foil = 0.62;
  let relief = false;
  let auto = !reducedMotion.matches;
  let zoom = 1.0;
  let drawerShift = false;

  const params = {
    subjectScale: 1.0,
    subjectDepth: 0.32,
    effectsDepth: 0.44,
    backgroundDepth: -0.22,
  };

  let targetX = -0.04;
  let targetY = -0.14;
  let curX = targetX;
  let curY = targetY;

  let hoverTargetX = 0;
  let hoverTargetY = 0;
  let hoverRotX = 0;
  let hoverRotY = 0;
  let isPointerHovering = false;
  let hoverBlend = 0;

  let curFlip = 0;
  let flipTarget = 0;
  let dragging = false;
  let dragDistance = 0;
  let lastPointer = { x: 0, y: 0 };

  function emitState() {
    callbacks.onStateChange?.(api.getState());
  }

  function applyLayerDepths() {
    const scaleBoost = relief ? 1.85 : 1.0;
    const zMap = {
      background: params.backgroundDepth * 42 * scaleBoost,
      subject: params.subjectDepth * 48 * scaleBoost,
      lineart: (params.subjectDepth * 48 + 2) * scaleBoost,
      effects: params.effectsDepth * 52 * scaleBoost,
      text: relief ? 32 : 4,
    };
    for (const [role, { wrap }] of layerMap) {
      const z = zMap[role] || 0;
      const s = role === 'subject' || role === 'lineart' ? params.subjectScale : 1;
      wrap.style.transform = `translateZ(${z.toFixed(1)}px) scale(${s.toFixed(3)})`;
    }
  }

  function applyFinishVisuals() {
    frontEl.classList.remove('finish-pearl', 'finish-silver', 'finish-original', 'finish-gold');
    frontEl.classList.add(`finish-${finish}`);
    const effFoil = finish === 'original' ? 0 : foil;
    frontEl.style.setProperty('--foil-amount', String(effFoil));
    backEl.style.setProperty('--foil-amount', String(effFoil));
  }

  function applyDrawerShift() {
    const desktop = typeof window !== 'undefined' && window.innerWidth >= 960;
    pivotEl.style.marginRight = drawerShift && desktop ? 'min(36vw, 400px)' : '0px';
  }

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true;
    dragDistance = 0;
    auto = false;
    isPointerHovering = false;
    hoverTargetX = 0;
    hoverTargetY = 0;
    lastPointer = { x: e.clientX, y: e.clientY };
    rootEl.classList.add('dragging');
    try {
      rootEl.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events
    }
    emitState();
  };

  const onPointerMove = (e) => {
    const rect = cardEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const mx = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const my = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
      frontEl.style.setProperty('--mx', `${mx.toFixed(1)}%`);
      frontEl.style.setProperty('--my', `${my.toFixed(1)}%`);
      backEl.style.setProperty('--mx', `${mx.toFixed(1)}%`);
      backEl.style.setProperty('--my', `${my.toFixed(1)}%`);
    }

    if (!dragging) {
      if (e.pointerType !== 'touch' && !reducedMotion.matches) {
        const stageRect = rootEl.getBoundingClientRect();
        if (stageRect.width > 0 && stageRect.height > 0) {
          const nx = clamp(((e.clientX - stageRect.left) / stageRect.width) * 2 - 1, -1, 1);
          const ny = clamp(((e.clientY - stageRect.top) / stageRect.height) * 2 - 1, -1, 1);
          // In CSS 3D (+Y down), -ny * 0.11 tilts face upward toward top cursor, matching drag feel
          hoverTargetY = nx * 0.175;
          hoverTargetX = -ny * 0.11;
          isPointerHovering = true;
        }
      }
      return;
    }

    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    dragDistance += Math.hypot(dx, dy);
    targetY = clamp(targetY + dx * 0.0065, -0.68, 0.68);
    targetX = clamp(targetX - dy * 0.0045, -0.38, 0.38);
    lastPointer = { x: e.clientX, y: e.clientY };
  };

  const onPointerLeave = () => {
    isPointerHovering = false;
    hoverTargetX = 0;
    hoverTargetY = 0;
  };

  const onPointerUp = () => {
    dragging = false;
    rootEl.classList.remove('dragging');
  };

  const onDblClick = () => {
    if (dragDistance > 8) return;
    api.toggleFlip();
  };

  const onWheel = (e) => {
    e.preventDefault();
    zoom = clamp(zoom - e.deltaY * 0.001, 0.78, 1.35);
    emitState();
  };

  const onWindowResize = () => applyDrawerShift();

  const onReducedMotionChange = () => {
    if (reducedMotion.matches) {
      auto = false;
      isPointerHovering = false;
      hoverTargetX = 0;
      hoverTargetY = 0;
      hoverRotX = 0;
      hoverRotY = 0;
      hoverBlend = 0;
      emitState();
    }
  };

  rootEl.addEventListener('pointerdown', onPointerDown);
  rootEl.addEventListener('pointermove', onPointerMove);
  rootEl.addEventListener('pointerleave', onPointerLeave);
  rootEl.addEventListener('pointerup', onPointerUp);
  rootEl.addEventListener('pointercancel', onPointerUp);
  rootEl.addEventListener('dblclick', onDblClick);
  rootEl.addEventListener('wheel', onWheel, { passive: false });
  reducedMotion.addEventListener?.('change', onReducedMotionChange);
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onWindowResize);
  }

  function tick(now) {
    if (disposed) return;
    const dt = Math.min((now - lastTime) / 1000, 0.06) || 0;
    lastTime = now;

    if (!document.hidden) {
      if (!reducedMotion.matches || auto) elapsed += dt;

      const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 9);
      const hoverEase = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 8.5);

      if (reducedMotion.matches) {
        hoverTargetX = 0;
        hoverTargetY = 0;
        hoverRotX = 0;
        hoverRotY = 0;
        hoverBlend = 0;
      } else {
        hoverRotX += (hoverTargetX - hoverRotX) * hoverEase;
        hoverRotY += (hoverTargetY - hoverRotY) * hoverEase;
        const desiredBlend = isPointerHovering && !dragging ? 1 : 0;
        hoverBlend += (desiredBlend - hoverBlend) * hoverEase;
      }

      if (auto && !dragging) {
        const swayScale = 1 - hoverBlend * 0.72;
        targetY = (Math.sin(elapsed * 0.45) * 0.24 - 0.05) * swayScale;
        targetX = (Math.sin(elapsed * 0.56) * 0.06 - 0.02) * swayScale;
        if (!isPointerHovering) {
          const mx = 50 + Math.sin(elapsed * 0.45) * 32;
          const my = 42 + Math.cos(elapsed * 0.56) * 20;
          frontEl.style.setProperty('--mx', `${mx.toFixed(1)}%`);
          frontEl.style.setProperty('--my', `${my.toFixed(1)}%`);
        }
      }

      curX += (targetX - curX) * ease;
      curY += (targetY - curY) * ease;
      curFlip += (flipTarget - curFlip) * ease;

      const combinedX = clamp(curX + hoverRotX, -0.44, 0.44);
      const combinedY = clamp(curY + hoverRotY, -0.74, 0.74);

      const floatY = reducedMotion.matches ? 0 : Math.sin(elapsed * 1.15) * 5;
      pivotEl.style.transform = `translateY(${floatY.toFixed(2)}px) scale(${zoom.toFixed(4)}) rotateX(${combinedX.toFixed(4)}rad) rotateY(${combinedY.toFixed(4)}rad)`;
      cardEl.style.transform = `rotateY(${curFlip.toFixed(4)}rad)`;

      const shadowScale = 1 - Math.abs(Math.sin(curFlip + combinedY)) * 0.24;
      shadowEl.style.transform = `translateZ(-44px) scaleX(${shadowScale.toFixed(3)})`;
    }

    rafId = requestAnimationFrame(tick);
  }

  applyLayerDepths();
  applyFinishVisuals();
  applyDrawerShift();
  rafId = requestAnimationFrame(tick);

  const api = {
    async loadCard(card) {
      if (!card) return;
      const token = ++loadToken;
      currentCard = card;
      callbacks.onLoadStart?.(card);
      try {
        const layers = await resolveCardLayers(card);
        if (disposed || token !== loadToken) return;
        currentLayers = layers;

        layerMap.get('background').img.src = sourceToDataURL(layers.background);
        layerMap.get('subject').img.src = sourceToDataURL(layers.subject);
        layerMap.get('lineart').img.src = sourceToDataURL(layers.lineart);
        layerMap.get('lineart').wrap.style.display = layers.hasLine ? '' : 'none';
        layerMap.get('effects').img.src = sourceToDataURL(layers.effects);
        layerMap.get('effects').wrap.style.display = layers.hasFx ? '' : 'none';
        layerMap.get('text').img.src = sourceToDataURL(layers.text);
        backImg.src = sourceToDataURL(layers.back);

        const vis = card.visual || {};
        finish = vis.defaultFinish || 'gold';
        foil = vis.foilStrength ?? 0.62;
        if (vis.depths) {
          params.subjectScale = vis.depths.subjectScale ?? 1.0;
          params.subjectDepth = vis.depths.subjectDepth ?? 0.32;
          params.effectsDepth = vis.depths.effectsDepth ?? 0.44;
          params.backgroundDepth = vis.depths.backgroundDepth ?? -0.22;
        }
        applyFinishVisuals();
        applyLayerDepths();
        if (typeof window !== 'undefined' && window.__holo) {
          window.__holo.cardId = card.id;
        }
        callbacks.onLoadComplete?.(card);
        emitState();
      } catch (err) {
        callbacks.onError?.(err);
      }
    },

    setTheme(nextTheme) {
      const normalized = nextTheme === 'light' ? 'light' : 'dark';
      const changed = theme !== normalized;
      theme = normalized;
      rootEl.classList.toggle('theme-light', theme === 'light');
      if (changed) emitState();
    },

    setFinish(value) {
      if (!['pearl', 'silver', 'original', 'gold'].includes(value)) return;
      finish = value;
      applyFinishVisuals();
      emitState();
    },

    setFoil(value) {
      foil = clamp(Number(value) || 0, 0, 1);
      applyFinishVisuals();
      emitState();
    },

    setParam(key, value) {
      const v = Number(value);
      if (Number.isNaN(v)) return;
      if (key === 'scale' || key === 'subjectScale' || key === 'uScale') {
        params.subjectScale = clamp(v, 0.75, 1.35);
      } else if (key === 'depth' || key === 'subjectDepth' || key === 'uDepth') {
        params.subjectDepth = clamp(v, -0.2, 0.9);
      } else if (key === 'fxDepth' || key === 'fx-depth' || key === 'effectsDepth' || key === 'uFxDepth') {
        params.effectsDepth = clamp(v, -0.2, 0.9);
      } else if (key === 'bgDepth' || key === 'bg-depth' || key === 'backgroundDepth' || key === 'uBgDepth') {
        params.backgroundDepth = clamp(v, -0.6, 0.2);
      } else if (key === 'foil' || key === 'foilStrength' || key === 'uFoil') {
        api.setFoil(v);
        return;
      } else if (key === 'relief' || key === 'uRelief') {
        api.setRelief(Boolean(v));
        return;
      }
      applyLayerDepths();
      emitState();
    },

    setRelief(enabled) {
      relief = Boolean(enabled);
      applyLayerDepths();
      emitState();
    },

    setFlipped(value) {
      const next = Boolean(value);
      if (flipped !== next) {
        flipped = next;
        callbacks.onFlipChange?.(flipped);
      }
      auto = false;
      flipTarget = flipped ? Math.PI : 0;
      targetX = 0;
      targetY = 0;
      emitState();
    },

    toggleFlip() {
      api.setFlipped(!flipped);
    },

    flip(val) {
      api.setFlipped(val === undefined ? !flipped : Boolean(val));
    },

    setAutoPlay(enabled) {
      auto = Boolean(enabled);
      emitState();
    },

    setAuto(enabled) {
      api.setAutoPlay(enabled);
    },

    setDrawerShift(open) {
      drawerShift = Boolean(open);
      applyDrawerShift();
      emitState();
    },

    resetView() {
      targetX = -0.04;
      targetY = -0.14;
      hoverTargetX = 0;
      hoverTargetY = 0;
      hoverRotX = 0;
      hoverRotY = 0;
      isPointerHovering = false;
      hoverBlend = 0;
      zoom = 1.0;
      flipped = false;
      flipTarget = 0;
      auto = !reducedMotion.matches;
      relief = false;
      if (currentCard?.visual) {
        finish = currentCard.visual.defaultFinish || 'gold';
        foil = currentCard.visual.foilStrength ?? 0.62;
        const d = currentCard.visual.depths || {};
        params.subjectScale = d.subjectScale ?? 1.0;
        params.subjectDepth = d.subjectDepth ?? 0.32;
        params.effectsDepth = d.effectsDepth ?? 0.44;
        params.backgroundDepth = d.backgroundDepth ?? -0.22;
      }
      applyFinishVisuals();
      applyLayerDepths();
      callbacks.onFlipChange?.(false);
      emitState();
    },

    reset() {
      api.resetView();
    },

    getState() {
      return {
        ready: true,
        fallback: true,
        cardId: currentCard?.id || null,
        theme,
        flipped,
        finish,
        foil,
        relief,
        auto,
        zoom,
        drawerShift,
        params: { ...params },
        ...params,
      };
    },

    invalidateCard(cardId) {
      const targetId = cardId || currentCard?.id;
      if (!targetId) return false;
      invalidateCardThumb(targetId);
      if (currentCard?.id === targetId) {
        currentLayers = null;
      }
      return true;
    },

    resize() {
      applyDrawerShift();
    },

    exportPoster(options = {}) {
      if (disposed || !currentLayers) return null;
      const download = options.download !== false;
      const W = Math.max(700, Number(options.width) || 1400);
      const H = Math.max(900, Number(options.height) || 1800);
      const posterTheme = options.theme === 'light' || options.theme === 'dark' ? options.theme : theme;
      const isLight = posterTheme === 'light';

      try {
        const poster = document.createElement('canvas');
        poster.width = W;
        poster.height = H;
        const ctx = poster.getContext('2d');

        // 1. Dual-theme backdrop (BaiXiang Light Gallery vs Darkroom Walnut)
        if (isLight) {
          ctx.fillStyle = '#F4F0E8';
          ctx.fillRect(0, 0, W, H);

          const spot = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.05, W * 0.5, H * 0.46, H * 0.72);
          spot.addColorStop(0.0, '#FBF9F3');
          spot.addColorStop(0.45, '#F4F0E8');
          spot.addColorStop(0.82, '#EDE6D9');
          spot.addColorStop(1.0, '#E5DDD0');
          ctx.fillStyle = spot;
          ctx.fillRect(0, 0, W, H);

          ctx.strokeStyle = 'rgba(92, 66, 40, 0.28)';
          ctx.lineWidth = 1.6;
          ctx.strokeRect(42, 42, W - 84, H - 84);
          ctx.strokeStyle = 'rgba(139, 92, 31, 0.16)';
          ctx.lineWidth = 1.0;
          ctx.strokeRect(52, 52, W - 104, H - 104);
        } else {
          ctx.fillStyle = '#100C0A';
          ctx.fillRect(0, 0, W, H);

          const spot = ctx.createRadialGradient(W * 0.5, H * 0.44, W * 0.04, W * 0.5, H * 0.46, H * 0.68);
          spot.addColorStop(0.0, '#261C17');
          spot.addColorStop(0.38, '#231A15');
          spot.addColorStop(0.74, '#16100D');
          spot.addColorStop(1.0, '#100C0A');
          ctx.fillStyle = spot;
          ctx.fillRect(0, 0, W, H);

          ctx.strokeStyle = 'rgba(214, 162, 94, 0.16)';
          ctx.lineWidth = 1.4;
          ctx.strokeRect(42, 42, W - 84, H - 84);
        }

        // 2. Centered 2:3 card with theme-adapted physical shadow
        const cardH = Math.round(H * 0.735);
        const cardW = Math.round(cardH * (2 / 3));
        const cardX = Math.round((W - cardW) / 2);
        const cardY = Math.round(H * 0.456 - cardH / 2);
        const cardR = Math.round(cardW * 0.058);

        ctx.save();
        const sh = ctx.createRadialGradient(
          W * 0.5 + 16,
          cardY + cardH * 0.54,
          40,
          W * 0.5 + 16,
          cardY + cardH * 0.54,
          cardH * 0.56,
        );
        if (isLight) {
          sh.addColorStop(0, 'rgba(38, 30, 24, 0.24)');
          sh.addColorStop(0.58, 'rgba(56, 46, 38, 0.10)');
          sh.addColorStop(1, 'rgba(56, 46, 38, 0)');
        } else {
          sh.addColorStop(0, 'rgba(5, 3, 2, 0.72)');
          sh.addColorStop(0.62, 'rgba(12, 7, 5, 0.28)');
          sh.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = sh;
        ctx.fillRect(cardX - 120, cardY - 60, cardW + 240, cardH + 180);
        ctx.restore();

        ctx.save();
        drawRoundedPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.clip();

        if (flipped) {
          if (currentLayers.back) ctx.drawImage(currentLayers.back, cardX, cardY, cardW, cardH);
        } else {
          if (currentLayers.background) ctx.drawImage(currentLayers.background, cardX, cardY, cardW, cardH);
          if (currentLayers.subject) ctx.drawImage(currentLayers.subject, cardX, cardY, cardW, cardH);
          if (currentLayers.hasLine && currentLayers.lineart) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = 0.72;
            ctx.drawImage(currentLayers.lineart, cardX, cardY, cardW, cardH);
            ctx.restore();
          }
          if (currentLayers.hasFx && currentLayers.effects) {
            ctx.drawImage(currentLayers.effects, cardX, cardY, cardW, cardH);
          }
          if (finish !== 'original' && foil > 0.01) {
            const sheen = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
            if (finish === 'silver') {
              sheen.addColorStop(0.18, 'rgba(210, 228, 245, 0)');
              sheen.addColorStop(0.48, `rgba(232, 242, 255, ${(foil * 0.26).toFixed(3)})`);
              sheen.addColorStop(0.76, 'rgba(210, 228, 245, 0)');
            } else if (finish === 'pearl') {
              sheen.addColorStop(0.15, `rgba(255, 140, 204, ${(foil * 0.18).toFixed(3)})`);
              sheen.addColorStop(0.50, `rgba(145, 228, 255, ${(foil * 0.22).toFixed(3)})`);
              sheen.addColorStop(0.84, `rgba(255, 226, 148, ${(foil * 0.19).toFixed(3)})`);
            } else {
              sheen.addColorStop(0.16, 'rgba(214, 162, 94, 0)');
              sheen.addColorStop(0.49, `rgba(255, 230, 166, ${(foil * 0.28).toFixed(3)})`);
              sheen.addColorStop(0.80, 'rgba(214, 162, 94, 0)');
            }
            ctx.fillStyle = sheen;
            ctx.fillRect(cardX, cardY, cardW, cardH);
          }
          if (currentLayers.text) ctx.drawImage(currentLayers.text, cardX, cardY, cardW, cardH);
        }
        ctx.restore();

        // Metallic chamfered rim around card (crisp antique bronze on light mode back)
        ctx.strokeStyle = isLight && flipped
          ? 'rgba(122, 86, 44, 0.72)'
          : finish === 'silver'
            ? 'rgba(208, 222, 236, 0.62)'
            : 'rgba(214, 162, 94, 0.62)';
        ctx.lineWidth = 3;
        drawRoundedPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.stroke();

        // 3. Bottom collector colophon matching WebGL dual-theme export
        const marginX = 84;
        const ruleY = H - 154;
        const centerX = W * 0.5;
        const accentColor = isLight ? '#9A6826' : '#D6A25E';

        ctx.strokeStyle = isLight ? 'rgba(139, 92, 31, 0.42)' : 'rgba(214, 162, 94, 0.36)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(marginX, ruleY);
        ctx.lineTo(centerX - 18, ruleY);
        ctx.moveTo(centerX + 18, ruleY);
        ctx.lineTo(W - marginX, ruleY);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(centerX, ruleY - 6);
        ctx.lineTo(centerX + 6, ruleY);
        ctx.lineTo(centerX, ruleY + 6);
        ctx.lineTo(centerX - 6, ruleY);
        ctx.closePath();
        ctx.fill();

        const rowY = ruleY + 52;
        ctx.beginPath();
        ctx.arc(marginX + 6, rowY, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `700 28px ${FALLBACK_SERIF_FONT}`;
        ctx.fillStyle = isLight ? '#1E1814' : '#F4EDE2';
        ctx.fillText('焙境图鉴', marginX + 24, rowY);
        const brandW = ctx.measureText('焙境图鉴').width;
        ctx.font = `500 17px ${FALLBACK_MONO_FONT}`;
        ctx.fillStyle = isLight ? 'rgba(139, 92, 31, 0.90)' : 'rgba(214, 162, 94, 0.86)';
        ctx.fillText('·  ROAST & TERROIR ATLAS', marginX + 24 + brandW + 14, rowY + 1);

        const code = currentCard?.code || 'CA-01';
        const title = currentCard?.title || '世界咖啡豆图鉴';
        const rightMain = `${code} · ${title} · ${flipped ? '02 BACK' : '01 FRONT'}`;
        const maxRightW = W - marginX * 2 - (brandW + 310);
        let fSize = 23;
        ctx.font = `600 ${fSize}px ${FALLBACK_SANS_FONT}`;
        while (fSize > 16 && ctx.measureText(rightMain).width > maxRightW) {
          fSize -= 1;
          ctx.font = `600 ${fSize}px ${FALLBACK_SANS_FONT}`;
        }
        ctx.textAlign = 'right';
        ctx.fillStyle = isLight ? '#231A15' : '#F2E9DC';
        ctx.fillText(rightMain, W - marginX, rowY);

        const finishDesc = FALLBACK_FINISH_LABELS[finish] || FALLBACK_FINISH_LABELS.gold;
        ctx.font = `500 15px ${FALLBACK_MONO_FONT}`;
        ctx.fillStyle = isLight ? 'rgba(92, 76, 62, 0.78)' : 'rgba(184, 168, 152, 0.74)';
        ctx.fillText(`${finishDesc}  ·  CSS 3D`, W - marginX, rowY + 34);
        ctx.textAlign = 'left';
        ctx.fillStyle = isLight ? 'rgba(104, 88, 74, 0.70)' : 'rgba(184, 168, 152, 0.62)';
        ctx.fillText(
          isLight ? '白相 · 暖白美术馆典藏版  ·  BAIXIANG GALLERY' : 'SPECIALTY COFFEE COLLECTOR EDITION',
          marginX + 24,
          rowY + 34,
        );

        const dataUrl = poster.toDataURL('image/png');
        const safeCode = String(code).replace(/[^A-Za-z0-9_-]+/g, '-');
        const filename = `${safeCode}-${flipped ? 'back' : 'front'}.png`;

        if (download && typeof document !== 'undefined') {
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.rel = 'noopener';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return { dataUrl, filename, width: W, height: H };
      } catch (err) {
        console.error('[css3d-fallback] exportPoster failed:', err);
        callbacks.onNotice?.('海报导出失败，请重试');
        return null;
      }
    },

    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      rootEl.removeEventListener('pointerdown', onPointerDown);
      rootEl.removeEventListener('pointermove', onPointerMove);
      rootEl.removeEventListener('pointerleave', onPointerLeave);
      rootEl.removeEventListener('pointerup', onPointerUp);
      rootEl.removeEventListener('pointercancel', onPointerUp);
      rootEl.removeEventListener('dblclick', onDblClick);
      rootEl.removeEventListener('wheel', onWheel);
      reducedMotion.removeEventListener?.('change', onReducedMotionChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onWindowResize);
      }
      rootEl.remove();
    },
  };

  if (typeof window !== 'undefined') {
    window.__holo = {
      ready: true,
      fallback: true,
      fallback3d: true,
      error: fallbackError ? String(fallbackError) : null,
      cardId: null,
      getState: () => api.getState(),
      flip: (v) => api.flip(v),
      toggleFlip: () => api.toggleFlip(),
      setFlipped: (v) => api.setFlipped(v),
      reset: () => api.resetView(),
      resetView: () => api.resetView(),
      setTheme: (t) => api.setTheme(t),
      setFinish: (f) => api.setFinish(f),
      setRelief: (b) => api.setRelief(b),
      setFoil: (v) => api.setFoil(v),
      setParam: (k, v) => api.setParam(k, v),
      setAutoPlay: (b) => api.setAutoPlay(b),
      setDrawerShift: (b) => api.setDrawerShift(b),
      loadCard: (c) => api.loadCard(c),
      invalidateCard: (id) => api.invalidateCard(id),
      exportPoster: (o) => api.exportPoster(o),
      renderer: null,
      root: cardEl,
      uniforms: null,
    };
  }

  callbacks.onFallback?.(fallbackError);
  callbacks.onNotice?.('当前环境未开启 WebGL：已自动切换轻量 CSS 3D 景深模式');
  return api;
}
