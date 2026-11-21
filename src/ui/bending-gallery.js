/**
 * 弯曲画廊 (Inspira UI Bending Gallery · Three.js WebGL Curved Arc + Click-to-Maximize Toggle)
 *
 * 视觉与物理交互参考 Inspira UI Bending Gallery：
 * - 32×32 细分平面 + 自定义 GLSL 顶点波动与圆弧弯曲映射（R = (H² + B²) / 2B）
 * - 丝滑拖拽、滚轮/触控板滑动、惯性阻尼、磁吸居中与无限循环
 * - 点击任意弯曲卡片 -> 丝滑最大化全屏典藏预览（支持 900×1350 视网膜高清升级与悬停微倾）
 * - 再次点击最大化卡片（或背景 / Esc） -> 丝滑切换回弯曲画廊模式
 */

import * as THREE from 'three';
import { getFlavorColor } from '../../data/flavor-palette.js';
import { renderGalleryThumb } from '../art/hybrid-resolver.js';

const BENDING_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uBendFactor;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Inspira UI signature organic wave ripple proportional to scroll speed
    float speedAmp = 0.018 + min(abs(uSpeed), 2.2) * 0.24;
    p.z += (sin(p.x * 3.8 + uTime * 1.4) * 0.55 + cos(p.y * 2.4 + uTime * 1.1) * 0.45) * speedAmp;
    // Gentle cylindrical micro-curve across each card surface
    p.z -= (p.x * p.x) * uBendFactor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const BENDING_FRAG = /* glsl */ `
  uniform sampler2D tMap;
  uniform float uLoaded;
  uniform float uBorderRadius;
  uniform float uFocus;
  uniform vec3 uPlaceholderTop;
  uniform vec3 uPlaceholderBottom;
  varying vec2 vUv;

  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    // Aspect-aware rounded corner mask (2:3 card ratio)
    vec2 centered = vUv - 0.5;
    vec2 scaled = vec2(centered.x * 0.6667, centered.y);
    float d = roundedBoxSDF(scaled, vec2(0.3333, 0.5), uBorderRadius);
    float alpha = 1.0 - smoothstep(-0.004, 0.004, d);
    if (alpha < 0.01) discard;

    vec3 fallbackCol = mix(uPlaceholderBottom, uPlaceholderTop, vUv.y);
    vec4 texCol = texture2D(tMap, vUv);
    vec3 col = mix(fallbackCol, texCol.rgb, uLoaded);

    // Subtle iOS glass specular top-left rim + gentle center spotlight lift
    float rim = smoothstep(-0.018, -0.002, d) * (0.45 + 0.55 * vUv.y);
    col += vec3(1.0, 0.985, 0.96) * rim * 0.11;

    // Slight dim on far-away side cards so the centered card commands focus
    float focusLift = mix(0.84, 1.03, uFocus);
    col *= focusLift;

    gl_FragColor = vec4(col, alpha);
  }
`;

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hexToColor(hex, fallback) {
  try {
    return new THREE.Color(hex || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

function tryCreateRenderer() {
  const attempts = [
    { antialias: true, alpha: true, powerPreference: 'high-performance' },
    { antialias: true, alpha: true, powerPreference: 'default' },
  ];
  for (const opts of attempts) {
    try {
      const r = new THREE.WebGLRenderer(opts);
      if (r.getContext()) return r;
      r.dispose();
    } catch {
      // Try next option
    }
  }
  return null;
}

function createPlaceholderTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 4;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#241B16';
  ctx.fillRect(0, 0, 4, 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildCardSubtitle(card) {
  if (!card) return '';
  if (card.cardType === 'bean_card') {
    const o = card.origin || {};
    const parts = [o.country, o.region || o.estate, card.processing?.name].filter(Boolean);
    return parts.join(' · ');
  }
  return card.tagline || card.subtitle || '';
}

function buildCardChips(card) {
  if (!card) return [];
  const palette = card.visual?.palette || {};
  if (card.cardType === 'bean_card') {
    return (card.sensory?.flavors || []).slice(0, 4).map((fl) => ({
      label: fl,
      color: getFlavorColor(fl),
    }));
  }
  return (card.tags || []).slice(0, 4).map((tag) => ({
    label: tag,
    color: palette.secondary || '#A66E29',
  }));
}

export function createBendingGallery(mountEl, options = {}) {
  const { onOpenInStage } = options;

  mountEl.innerHTML = `
    <div class="bending-stage" id="bending-stage">
      <div class="bending-canvas-host" id="bending-canvas-host" aria-label="弯曲画廊交互区，左右拖拽或滚轮浏览，点击卡片最大化显示"></div>

      <button type="button" class="bending-nav is-prev" id="bending-prev" aria-label="上一张弯曲画廊卡片">
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" class="bending-nav is-next" id="bending-next" aria-label="下一张弯曲画廊卡片">
        <span aria-hidden="true">›</span>
      </button>

      <div class="bending-caption-bar" id="bending-caption-bar">
        <button type="button" class="bending-caption-pill" id="bending-caption-trigger" title="点击最大化显示当前居中卡片">
          <span class="bending-cap-index" id="bending-cap-index">1 / 36</span>
          <span class="bending-cap-code" id="bending-cap-code">CA-01</span>
          <span class="bending-cap-title" id="bending-cap-title">巴拿马 翡翠庄园 绿标瑰夏</span>
          <span class="bending-cap-cta">点击最大化</span>
        </button>
        <div class="bending-cap-sub" id="bending-cap-sub">拖拽或滚轮浏览弯曲弧线 · 点击任意卡片最大化，再点返回画廊</div>
      </div>
    </div>

    <!-- 点击卡片最大化典藏层（再次点击卡片或背景返回弯曲画廊） -->
    <div
      class="bending-lightbox"
      id="bending-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="弯曲画廊卡片最大化预览"
      hidden
    >
      <div class="bending-lightbox-backdrop" id="bending-lightbox-backdrop"></div>

      <button type="button" class="bending-lb-nav is-prev" id="bending-lb-prev" aria-label="上一张卡片">
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" class="bending-lb-nav is-next" id="bending-lb-next" aria-label="下一张卡片">
        <span aria-hidden="true">›</span>
      </button>

      <div class="bending-lb-stage" id="bending-lb-stage">
        <button
          type="button"
          class="bending-lb-card"
          id="bending-lb-card"
          title="再次点击返回弯曲画廊模式"
          aria-label="再次点击返回弯曲画廊模式"
        >
          <img class="bending-lb-img" id="bending-lb-img" alt="" />
          <span class="bending-lb-sheen" aria-hidden="true"></span>
        </button>

        <div class="bending-lb-dock" id="bending-lb-dock">
          <div class="bending-lb-meta">
            <div class="bending-lb-head">
              <span class="bending-cap-code" id="bending-lb-code">CA-01</span>
              <h2 class="bending-lb-title" id="bending-lb-title"></h2>
            </div>
            <p class="bending-lb-sub" id="bending-lb-sub"></p>
            <div class="bending-lb-chips" id="bending-lb-chips"></div>
          </div>

          <div class="bending-lb-actions">
            <button type="button" class="bending-lb-stage-btn" id="bending-lb-open-stage">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                <path d="M12 12l8-4.5" />
                <path d="M12 12v9" />
                <path d="M12 12L4 7.5" />
              </svg>
              <span>3D 全息翻面</span>
            </button>
            <span class="bending-lb-hint">轻点卡片返回画廊</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const elStage = mountEl.querySelector('#bending-stage');
  const elCanvasHost = mountEl.querySelector('#bending-canvas-host');
  const elPrev = mountEl.querySelector('#bending-prev');
  const elNext = mountEl.querySelector('#bending-next');
  const elCaptionTrigger = mountEl.querySelector('#bending-caption-trigger');
  const elCapIndex = mountEl.querySelector('#bending-cap-index');
  const elCapCode = mountEl.querySelector('#bending-cap-code');
  const elCapTitle = mountEl.querySelector('#bending-cap-title');
  const elCapSub = mountEl.querySelector('#bending-cap-sub');

  const elLightbox = mountEl.querySelector('#bending-lightbox');
  const elLbBackdrop = mountEl.querySelector('#bending-lightbox-backdrop');
  const elLbPrev = mountEl.querySelector('#bending-lb-prev');
  const elLbNext = mountEl.querySelector('#bending-lb-next');
  const elLbCard = mountEl.querySelector('#bending-lb-card');
  const elLbImg = mountEl.querySelector('#bending-lb-img');
  const elLbCode = mountEl.querySelector('#bending-lb-code');
  const elLbTitle = mountEl.querySelector('#bending-lb-title');
  const elLbSub = mountEl.querySelector('#bending-lb-sub');
  const elLbChips = mountEl.querySelector('#bending-lb-chips');
  const elLbOpenStage = mountEl.querySelector('#bending-lb-open-stage');

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };

  let cards = [];
  let visible = false;
  let disposed = false;
  let rafId = 0;

  // Scroll & physics state
  let scrollTarget = 0;
  let scrollCurrent = 0;
  let scrollLast = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragDistance = 0;
  let snapTimer = null;
  let centeredIndex = 0;
  let lastReportedCenterIdx = -1;

  // Maximized lightbox state
  let maximizedCard = null;
  let maximizeToken = 0;

  // Three.js WebGL state (lazy initialized when first shown)
  let renderer = null;
  let scene = null;
  let camera = null;
  let sharedGeo = null;
  let placeholderTex = null;
  let raycaster = null;
  let isFallbackDom = false;
  let viewportW = 12;
  let viewportH = 7;
  let itemSpacing = 3.2;
  let cardW = 2.4;
  let cardH = 3.6;

  /** @type {Array<{ card: object, index: number, mesh: THREE.Mesh, material: THREE.ShaderMaterial, texLoaded: boolean, loading: boolean }>} */
  let items = [];
  /** @type {Map<string, THREE.Texture>} */
  const textureCache = new Map();
  let texLoadGen = 0;

  function ensureWebGL() {
    if (renderer || isFallbackDom) return;
    const r = tryCreateRenderer();
    if (!r) {
      isFallbackDom = true;
      renderFallbackDom();
      return;
    }
    renderer = r;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.className = 'bending-canvas';
    elCanvasHost.replaceChildren(canvas);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 100);
    camera.position.z = 11.5;

    sharedGeo = new THREE.PlaneGeometry(1, 1, 32, 32);
    placeholderTex = createPlaceholderTexture();
    raycaster = new THREE.Raycaster();

    bindCanvasEvents(canvas);
    resize();
    rebuildMeshes();
  }

  function resize() {
    if (isFallbackDom) return;
    if (!renderer || !camera) return;
    const width = Math.max(1, elCanvasHost.clientWidth || 960);
    const height = Math.max(1, elCanvasHost.clientHeight || 480);
    const aspect = width / height;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);

    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const fovRad = (camera.fov * Math.PI) / 180;
    viewportH = 2 * Math.tan(fovRad / 2) * camera.position.z;
    viewportW = viewportH * aspect;

    const isNarrow = width < 640;
    cardH = viewportH * (isNarrow ? 0.64 : 0.68);
    cardW = cardH * (2 / 3);
    itemSpacing = cardW * (isNarrow ? 1.24 : 1.28);

    for (const item of items) {
      item.mesh.scale.set(cardW, cardH, 1);
    }
  }

  function clearMeshes() {
    if (!scene) return;
    for (const item of items) {
      scene.remove(item.mesh);
      item.material.dispose();
    }
    items = [];
  }

  function loadTextureForItem(item, gen) {
    if (item.texLoaded || item.loading) return;
    const id = item.card.id;
    const cached = textureCache.get(id);
    if (cached) {
      item.material.uniforms.tMap.value = cached;
      item.material.uniforms.uLoaded.value = 1.0;
      item.texLoaded = true;
      return;
    }

    item.loading = true;
    renderGalleryThumb(item.card, { width: 420, height: 630 })
      .then((dataUrl) => {
        if (disposed || gen !== texLoadGen || !dataUrl) return;
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (disposed || gen !== texLoadGen) return;
          let tex = textureCache.get(id);
          if (!tex) {
            tex = new THREE.Texture(img);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            if (renderer) {
              tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
            }
            tex.needsUpdate = true;
            textureCache.set(id, tex);
          }
          // Apply to all items sharing this card id (in case of small wrapped lists)
          for (const it of items) {
            if (it.card.id === id) {
              it.material.uniforms.tMap.value = tex;
              it.material.uniforms.uLoaded.value = 1.0;
              it.texLoaded = true;
            }
          }
        };
        img.src = dataUrl;
      })
      .catch(() => {})
      .finally(() => {
        item.loading = false;
      });
  }

  function rebuildMeshes() {
    if (isFallbackDom) {
      renderFallbackDom();
      return;
    }
    if (!scene || !sharedGeo) return;

    texLoadGen++;
    clearMeshes();

    if (!cards.length) {
      updateCaption(-1);
      return;
    }

    const gen = texLoadGen;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const pal = card.visual?.palette || {};
      const cached = textureCache.get(card.id);
      const mat = new THREE.ShaderMaterial({
        vertexShader: BENDING_VERT,
        fragmentShader: BENDING_FRAG,
        transparent: true,
        depthWrite: true,
        uniforms: {
          tMap: { value: cached || placeholderTex },
          uLoaded: { value: cached ? 1.0 : 0.0 },
          uTime: { value: 0 },
          uSpeed: { value: 0 },
          uBendFactor: { value: 0.08 },
          uBorderRadius: { value: 0.052 },
          uFocus: { value: 1.0 },
          uPlaceholderTop: { value: hexToColor(pal.bgTop, '#2B221D') },
          uPlaceholderBottom: { value: hexToColor(pal.bgBottom, '#15100D') },
        },
      });

      const mesh = new THREE.Mesh(sharedGeo, mat);
      mesh.scale.set(cardW, cardH, 1);
      mesh.userData.cardIndex = i;
      scene.add(mesh);

      items.push({
        card,
        index: i,
        mesh,
        material: mat,
        texLoaded: Boolean(cached),
        loading: false,
      });
    }

    // Center on index 0 cleanly
    scrollTarget = 0;
    scrollCurrent = 0;
    scrollLast = 0;
    centeredIndex = 0;
    lastReportedCenterIdx = -1;
    updateCaption(0);

    // Priority load textures near center first
    prioritizeTextures(gen);
  }

  function prioritizeTextures(gen) {
    if (!items.length) return;
    const total = items.length;
    const center = ((centeredIndex % total) + total) % total;
    const order = [];
    for (let offset = 0; offset <= Math.min(6, Math.floor(total / 2)); offset++) {
      order.push((center + offset) % total);
      if (offset > 0) order.push((center - offset + total) % total);
    }
    const seen = new Set();
    for (const idx of order) {
      if (seen.has(idx)) continue;
      seen.add(idx);
      loadTextureForItem(items[idx], gen);
    }
  }

  function updateCaption(idx) {
    if (!cards.length || idx < 0 || idx >= cards.length) {
      if (elCapIndex) elCapIndex.textContent = '0 / 0';
      if (elCapCode) elCapCode.textContent = '--';
      if (elCapTitle) elCapTitle.textContent = '暂无匹配卡片';
      if (elCapSub) elCapSub.textContent = '可尝试清除筛选条件查看全部 36 张咖啡图鉴';
      return;
    }
    const card = cards[idx];
    if (elCapIndex) elCapIndex.textContent = `${idx + 1} / ${cards.length}`;
    if (elCapCode) elCapCode.textContent = card.code || '--';
    if (elCapTitle) elCapTitle.textContent = card.title || '';
    if (elCapSub) {
      const sub = buildCardSubtitle(card);
      elCapSub.textContent = sub
        ? `${sub} · 点击卡片最大化显示，再点返回画廊`
        : '拖拽或滚轮滑动弯曲弧线 · 点击卡片最大化显示';
    }
  }

  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (!cards.length || isDragging) return;
      const snapped = Math.round(scrollTarget / itemSpacing) * itemSpacing;
      scrollTarget = clampScroll(snapped);
    }, 150);
  }

  function clampScroll(val) {
    if (cards.length < 4) {
      const minS = 0;
      const maxS = Math.max(0, (cards.length - 1) * itemSpacing);
      return Math.max(minS, Math.min(maxS, val));
    }
    return val;
  }

  function stepBy(delta) {
    if (!cards.length) return;
    clearTimeout(snapTimer);
    const currentStep = Math.round(scrollTarget / itemSpacing);
    scrollTarget = clampScroll((currentStep + delta) * itemSpacing);
  }

  function centerOnCardId(cardId) {
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx < 0) return;
    if (cards.length >= 4) {
      const totalW = cards.length * itemSpacing;
      const targetMod = idx * itemSpacing;
      const currentCycles = Math.round((scrollTarget - targetMod) / totalW);
      scrollTarget = targetMod + currentCycles * totalW;
    } else {
      scrollTarget = idx * itemSpacing;
    }
  }

  // ---- Maximized Lightbox (Click once -> Maximize; Click again -> Return to Bending Gallery) ----
  function openMaximize(card) {
    if (!card || !elLightbox) return;
    const token = ++maximizeToken;
    maximizedCard = card;
    centerOnCardId(card.id);

    const sub = buildCardSubtitle(card);
    const chips = buildCardChips(card);

    if (elLbCode) elLbCode.textContent = card.code || '--';
    if (elLbTitle) elLbTitle.textContent = card.title || '';
    if (elLbSub) elLbSub.textContent = sub;
    if (elLbChips) {
      elLbChips.innerHTML = chips
        .map(
          (ch) => `
            <span class="specimen-chip" style="--chip-color:${escapeHtml(ch.color)}">
              <span class="specimen-chip-dot" aria-hidden="true"></span>
              <span>${escapeHtml(ch.label)}</span>
            </span>
          `,
        )
        .join('');
    }
    if (elLbImg) {
      elLbImg.alt = `${card.code || ''} ${card.title || ''}`;
      // Instant preview using 420x630 cache, then upgrade seamlessly to retina 900x1350
      renderGalleryThumb(card, { width: 420, height: 630 }).then((fastUrl) => {
        if (token === maximizeToken && fastUrl && !elLbImg.dataset.hiResFor) {
          elLbImg.src = fastUrl;
        }
      });
      delete elLbImg.dataset.hiResFor;
      renderGalleryThumb(card, { width: 900, height: 1350 }).then((hiUrl) => {
        if (token === maximizeToken && hiUrl) {
          elLbImg.src = hiUrl;
          elLbImg.dataset.hiResFor = card.id;
        }
      });
    }

    elLbCard?.style.setProperty('--lb-rx', '0deg');
    elLbCard?.style.setProperty('--lb-ry', '0deg');
    elLightbox.hidden = false;
    requestAnimationFrame(() => {
      elLightbox.classList.add('is-open');
    });
  }

  function closeMaximize() {
    if (!maximizedCard || !elLightbox) return;
    maximizeToken++;
    maximizedCard = null;
    elLightbox.classList.remove('is-open');
    elLightbox.hidden = true;
  }

  function stepMaximized(delta) {
    if (!maximizedCard || !cards.length) return;
    const idx = cards.findIndex((c) => c.id === maximizedCard.id);
    const base = idx >= 0 ? idx : 0;
    const nextIdx = (base + delta + cards.length) % cards.length;
    openMaximize(cards[nextIdx]);
  }

  // Click maximized card again -> toggle cleanly back to Bending Gallery mode
  elLbCard?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMaximize();
  });

  // Subtle interactive 3D pointer tilt on the maximized hero card
  elLbCard?.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = elLbCard.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    elLbCard.style.setProperty('--lb-ry', `${(nx * 8.5).toFixed(2)}deg`);
    elLbCard.style.setProperty('--lb-rx', `${(-ny * 6.5).toFixed(2)}deg`);
  });

  elLbCard?.addEventListener('pointerleave', () => {
    elLbCard.style.setProperty('--lb-rx', '0deg');
    elLbCard.style.setProperty('--lb-ry', '0deg');
  });

  elLbBackdrop?.addEventListener('click', () => closeMaximize());
  elLbPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    stepMaximized(-1);
  });
  elLbNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    stepMaximized(1);
  });
  elLbOpenStage?.addEventListener('click', (e) => {
    e.stopPropagation();
    const targetId = maximizedCard?.id;
    closeMaximize();
    if (targetId) onOpenInStage?.(targetId);
  });

  // ---- Canvas Pointer & Wheel Events ----
  function bindCanvasEvents(canvas) {
    let activePointerId = null;

    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      activePointerId = e.pointerId;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartScroll = scrollTarget;
      dragDistance = 0;
      clearTimeout(snapTimer);
      canvas.classList.add('is-dragging');
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore synthetic event without pointer capture
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!isDragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - dragStartX;
      dragDistance = Math.max(dragDistance, Math.abs(dx));
      const worldPerPx = viewportW / Math.max(1, canvas.clientWidth);
      scrollTarget = clampScroll(dragStartScroll - dx * worldPerPx * 1.45);
    });

    const endDrag = (e) => {
      if (!isDragging || e.pointerId !== activePointerId) return;
      isDragging = false;
      activePointerId = null;
      canvas.classList.remove('is-dragging');

      // Tap / Click detection (< 10px movement): Raycast clicked card -> Maximize!
      if (dragDistance < 10 && raycaster && camera && items.length) {
        const rect = canvas.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
        const hits = raycaster.intersectObjects(
          items.map((it) => it.mesh),
          false,
        );
        if (hits.length > 0) {
          const hitIdx = hits[0].object.userData.cardIndex;
          const hitCard = cards[hitIdx];
          if (hitCard) {
            openMaximize(hitCard);
            return;
          }
        }
      }

      scheduleSnap();
    };

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    canvas.addEventListener(
      'wheel',
      (e) => {
        if (!visible || maximizedCard) return;
        const primaryDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(primaryDelta) < 0.5) return;
        e.preventDefault();
        scrollTarget = clampScroll(scrollTarget + primaryDelta * 0.0085);
        scheduleSnap();
      },
      { passive: false },
    );
  }

  elPrev?.addEventListener('click', () => stepBy(-1));
  elNext?.addEventListener('click', () => stepBy(1));
  elCaptionTrigger?.addEventListener('click', () => {
    const card = cards[centeredIndex];
    if (card) openMaximize(card);
  });

  // ---- Main Animation Loop (Paused when hidden!) ----
  let startTime = performance.now();

  function tick(now) {
    if (disposed || !visible) {
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(tick);

    if (!renderer || !scene || !camera) return;

    const elapsedSec = (now - startTime) * 0.001;
    const ease = reducedMotion.matches ? 1 : 0.095;
    scrollCurrent += (scrollTarget - scrollCurrent) * ease;
    const velocity = scrollCurrent - scrollLast;
    scrollLast = scrollCurrent;

    const count = items.length;
    if (count > 0) {
      const wrapLoop = count >= 4;
      const totalWidth = count * itemSpacing;
      const halfTotal = totalWidth / 2;
      const halfViewport = viewportW / 2;
      const bend = viewportW < 9.5 ? 1.85 : 2.65;
      const radius = (halfViewport * halfViewport + bend * bend) / (2 * bend);

      let nearestIdx = 0;
      let nearestAbsX = Infinity;

      for (let i = 0; i < count; i++) {
        const item = items[i];
        let x = i * itemSpacing - scrollCurrent;
        if (wrapLoop) {
          x = ((((x + halfTotal) % totalWidth) + totalWidth) % totalWidth) - halfTotal;
        }

        const absX = Math.abs(x);
        if (absX < nearestAbsX) {
          nearestAbsX = absX;
          nearestIdx = i;
        }

        // Cull items well outside visible frustum
        const isInView = absX < halfViewport + cardW * 1.4;
        item.mesh.visible = isInView;
        if (!isInView) continue;

        const effX = Math.min(absX, halfViewport * 1.12);
        const underSqrt = Math.max(0, radius * radius - effX * effX);
        const arc = radius - Math.sqrt(underSqrt);

        // Convex rainbow arch: center card rises proudest, side cards gracefully bend down & tilt outward
        item.mesh.position.x = x;
        item.mesh.position.y = -arc * 0.88 + 0.14;
        item.mesh.position.z = -arc * 0.55;
        item.mesh.rotation.z = -Math.sign(x) * Math.asin(Math.min(0.95, effX / radius)) * 0.92;
        item.mesh.rotation.y = -Math.sign(x) * Math.min(0.32, (absX / Math.max(1, halfViewport)) * 0.24);

        const focus = Math.max(0, 1 - absX / (itemSpacing * 1.75));
        const scaleBoost = 1 + focus * 0.085;
        item.mesh.scale.set(cardW * scaleBoost, cardH * scaleBoost, 1);

        const u = item.material.uniforms;
        u.uTime.value = reducedMotion.matches ? 0 : elapsedSec;
        u.uSpeed.value = reducedMotion.matches ? 0 : velocity * 4.5;
        u.uFocus.value = focus;
        u.uBendFactor.value = 0.075 + Math.min(0.12, Math.abs(velocity) * 0.4);

        if (!item.texLoaded && !item.loading && absX < halfViewport + cardW * 1.1) {
          loadTextureForItem(item, texLoadGen);
        }
      }

      centeredIndex = nearestIdx;
      if (centeredIndex !== lastReportedCenterIdx) {
        lastReportedCenterIdx = centeredIndex;
        updateCaption(centeredIndex);
        prioritizeTextures(texLoadGen);
      }
    }

    renderer.render(scene, camera);
  }

  // ---- Graceful CSS Fallback if WebGL unavailable ----
  function renderFallbackDom() {
    if (!isFallbackDom) return;
    elCanvasHost.innerHTML = `
      <div class="bending-fallback-track">
        ${cards
          .map(
            (card) => `
              <button type="button" class="bending-fallback-card" data-fb-id="${escapeHtml(card.id)}">
                <span class="bending-cap-code">${escapeHtml(card.code)}</span>
                <strong>${escapeHtml(card.title)}</strong>
              </button>
            `,
          )
          .join('')}
      </div>
    `;
    elCanvasHost.querySelectorAll('.bending-fallback-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = cards.find((c) => c.id === btn.dataset.fbId);
        if (card) openMaximize(card);
      });
    });
  }

  let resizeRaf = 0;
  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          if (!visible || disposed) return;
          if (resizeRaf) cancelAnimationFrame(resizeRaf);
          resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            resize();
          });
        })
      : null;
  resizeObserver?.observe(elCanvasHost);

  return {
    setCards(nextCards, { invalidateIds = [] } = {}) {
      for (const id of invalidateIds) {
        const oldTex = textureCache.get(id);
        if (oldTex) {
          oldTex.dispose();
          textureCache.delete(id);
        }
      }
      cards = Array.isArray(nextCards) ? [...nextCards] : [];
      if (maximizedCard && !cards.some((c) => c.id === maximizedCard.id)) {
        closeMaximize();
      }
      if (renderer || isFallbackDom) {
        rebuildMeshes();
      } else if (cards.length) {
        updateCaption(0);
      }
    },

    setVisible(nextVisible) {
      const want = Boolean(nextVisible);
      visible = want;
      if (want) {
        ensureWebGL();
        resize();
        if (!rafId && !isFallbackDom) {
          startTime = performance.now();
          rafId = requestAnimationFrame(tick);
        }
      } else {
        closeMaximize();
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      }
    },

    isMaximized: () => Boolean(maximizedCard),
    closeMaximize,

    handleKeyDown(event) {
      if (!visible) return false;
      if (maximizedCard) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeMaximize();
          return true;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          stepMaximized(-1);
          return true;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          stepMaximized(1);
          return true;
        }
      }
      return false;
    },

    destroy() {
      disposed = true;
      visible = false;
      clearTimeout(snapTimer);
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      clearMeshes();
      for (const tex of textureCache.values()) tex.dispose();
      textureCache.clear();
      sharedGeo?.dispose();
      placeholderTex?.dispose();
      renderer?.dispose();
    },
  };
}
