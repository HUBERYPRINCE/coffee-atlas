/**
 * 3D 展台 · 亮境无边界弯曲画廊 (Bright Luminous WebGL Bending Gallery)
 *
 * 参考 Inspira UI Bending Gallery：
 * - 100% 透明无框 WebGL 画布，直接悬浮于与单卡 3D 展台完全一致的亮境液态玻璃环境之上（绝不变暗、无黑色蒙层）
 * - 32×32 细分平面 + 自定义 GLSL 顶点波动与圆弧弯曲映射（R = (H² + B²) / 2B）
 * - 丝滑拖拽、滚轮/触控板滑动、惯性阻尼、磁吸居中与无限循环
 * - 点击任意弯曲卡片 -> 触发 onSelectCard(card)，在原亮色展台平滑最大化为完整 3D 全息交互单卡
 */

import * as THREE from 'three';
import { renderGalleryThumb } from '../art/hybrid-resolver.js';

const BENDING_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uBendFactor;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Inspira UI organic wave ripple proportional to scroll velocity
    float speedAmp = 0.016 + min(abs(uSpeed), 2.2) * 0.24;
    p.z += (sin(p.x * 3.8 + uTime * 1.4) * 0.55 + cos(p.y * 2.4 + uTime * 1.1) * 0.45) * speedAmp;
    // Subtle cylindrical micro-curve across each card plane
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
    // Aspect-aware rounded corner mask (2:3 collector card ratio)
    vec2 centered = vUv - 0.5;
    vec2 scaled = vec2(centered.x * 0.6667, centered.y);
    float d = roundedBoxSDF(scaled, vec2(0.3333, 0.5), uBorderRadius);
    float alpha = 1.0 - smoothstep(-0.004, 0.004, d);
    if (alpha < 0.01) discard;

    vec3 fallbackCol = mix(uPlaceholderBottom, uPlaceholderTop, vUv.y);
    vec4 texCol = texture2D(tMap, vUv);
    vec3 col = mix(fallbackCol, texCol.rgb, uLoaded);

    // Bright studio rim highlight so cards float crisply in the luminous light environment
    float rim = smoothstep(-0.018, -0.002, d) * (0.5 + 0.5 * vUv.y);
    col += vec3(1.0, 0.99, 0.97) * rim * 0.14;

    // Keep side cards vivid & luminous (never muddy or dark)
    float focusLift = mix(0.95, 1.04, uFocus);
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
  ctx.fillStyle = '#E8E4DC';
  ctx.fillRect(0, 0, 4, 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBendingGallery(mountEl, options = {}) {
  const { onSelectCard, onCenterChange } = options;

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

  // Three.js WebGL state
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
  let drawerShift = false;

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
    mountEl.replaceChildren(canvas);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 100);
    camera.position.z = 11.4;

    sharedGeo = new THREE.PlaneGeometry(1, 1, 32, 32);
    placeholderTex = createPlaceholderTexture();
    raycaster = new THREE.Raycaster();

    bindCanvasEvents(canvas);
    resize();
    rebuildMeshes();
  }

  function resize() {
    if (isFallbackDom || !renderer || !camera) return;
    const width = Math.max(1, mountEl.clientWidth || window.innerWidth || 960);
    const height = Math.max(1, mountEl.clientHeight || window.innerHeight || 600);
    const aspect = width / height;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);

    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const fovRad = (camera.fov * Math.PI) / 180;
    viewportH = 2 * Math.tan(fovRad / 2) * camera.position.z;
    viewportW = viewportH * aspect;

    const isNarrow = width < 640;
    const prevSpacing = itemSpacing;
    cardH = viewportH * (isNarrow ? 0.62 : 0.70);
    cardW = cardH * (2 / 3);
    itemSpacing = cardW * (isNarrow ? 1.24 : 1.26);

    // Preserve centered card index cleanly across viewport resizes
    if (prevSpacing > 0 && Math.abs(itemSpacing - prevSpacing) > 0.001) {
      const ratio = itemSpacing / prevSpacing;
      scrollTarget *= ratio;
      scrollCurrent *= ratio;
      scrollLast *= ratio;
    }

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
    renderGalleryThumb(item.card, { width: 480, height: 720 })
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
    if (!cards.length) return;

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
          uBendFactor: { value: 0.075 },
          uBorderRadius: { value: 0.052 },
          uFocus: { value: 1.0 },
          uPlaceholderTop: { value: hexToColor(pal.bgTop, '#E8E3DA') },
          uPlaceholderBottom: { value: hexToColor(pal.bgBottom, '#D4CEC3') },
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

    lastReportedCenterIdx = -1;
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

  function clampScroll(val) {
    if (cards.length < 4) {
      return Math.max(0, Math.min(Math.max(0, (cards.length - 1) * itemSpacing), val));
    }
    return val;
  }

  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (!cards.length || isDragging) return;
      const snapped = Math.round(scrollTarget / itemSpacing) * itemSpacing;
      scrollTarget = clampScroll(snapped);
    }, 145);
  }

  function stepBy(delta) {
    if (!cards.length) return;
    clearTimeout(snapTimer);
    const currentStep = Math.round(scrollTarget / itemSpacing);
    scrollTarget = clampScroll((currentStep + delta) * itemSpacing);
  }

  function centerOnCardId(cardId, { immediate = false } = {}) {
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx < 0) return;
    centeredIndex = idx;
    let nextTarget;
    if (cards.length >= 4) {
      const totalW = cards.length * itemSpacing;
      const targetMod = idx * itemSpacing;
      const currentCycles = Math.round((scrollTarget - targetMod) / totalW);
      nextTarget = targetMod + currentCycles * totalW;
    } else {
      nextTarget = idx * itemSpacing;
    }
    scrollTarget = nextTarget;
    if (immediate) {
      scrollCurrent = nextTarget;
      scrollLast = nextTarget;
      lastReportedCenterIdx = idx;
    }
    prioritizeTextures(texLoadGen);
  }

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

      // Clean click/tap (< 10px drag) -> Raycast card & maximize to full 3D Holographic Card!
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
            centerOnCardId(hitCard.id, { immediate: false });
            onSelectCard?.(hitCard);
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
        if (!visible) return;
        const primaryDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(primaryDelta) < 0.5) return;
        e.preventDefault();
        scrollTarget = clampScroll(scrollTarget + primaryDelta * 0.0085);
        scheduleSnap();
      },
      { passive: false },
    );
  }

  let startTime = performance.now();
  let currentDrawerShiftX = 0;

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

    const targetShift = drawerShift && (mountEl.clientWidth || 1200) >= 960 ? -viewportW * 0.14 : 0;
    currentDrawerShiftX += (targetShift - currentDrawerShiftX) * ease;

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

        const isInView = absX < halfViewport + cardW * 1.45;
        item.mesh.visible = isInView;
        if (!isInView) continue;

        const effX = Math.min(absX, halfViewport * 1.12);
        const underSqrt = Math.max(0, radius * radius - effX * effX);
        const arc = radius - Math.sqrt(underSqrt);

        item.mesh.position.x = x + currentDrawerShiftX;
        item.mesh.position.y = -arc * 0.85 + 0.12;
        item.mesh.position.z = -arc * 0.52;
        item.mesh.rotation.z = -Math.sign(x) * Math.asin(Math.min(0.95, effX / radius)) * 0.90;
        item.mesh.rotation.y = -Math.sign(x) * Math.min(0.30, (absX / Math.max(1, halfViewport)) * 0.22);

        const focus = Math.max(0, 1 - absX / (itemSpacing * 1.75));
        const scaleBoost = 1 + focus * 0.085;
        item.mesh.scale.set(cardW * scaleBoost, cardH * scaleBoost, 1);

        const u = item.material.uniforms;
        u.uTime.value = reducedMotion.matches ? 0 : elapsedSec;
        u.uSpeed.value = reducedMotion.matches ? 0 : velocity * 4.5;
        u.uFocus.value = focus;
        u.uBendFactor.value = 0.07 + Math.min(0.11, Math.abs(velocity) * 0.38);

        if (!item.texLoaded && !item.loading && absX < halfViewport + cardW * 1.1) {
          loadTextureForItem(item, texLoadGen);
        }
      }

      centeredIndex = nearestIdx;
      if (centeredIndex !== lastReportedCenterIdx) {
        lastReportedCenterIdx = centeredIndex;
        prioritizeTextures(texLoadGen);
        onCenterChange?.(cards[centeredIndex], centeredIndex);
      }
    }

    renderer.render(scene, camera);
  }

  function renderFallbackDom() {
    if (!isFallbackDom) return;
    mountEl.innerHTML = `
      <div class="bending-fallback-track">
        ${cards
          .map(
            (card) => `
              <button type="button" class="bending-fallback-card" data-fb-id="${escapeHtml(card.id)}">
                <span class="hud-code-badge">${escapeHtml(card.code)}</span>
                <strong>${escapeHtml(card.title)}</strong>
              </button>
            `,
          )
          .join('')}
      </div>
    `;
    mountEl.querySelectorAll('.bending-fallback-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = cards.find((c) => c.id === btn.dataset.fbId);
        if (card) onSelectCard?.(card);
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
  resizeObserver?.observe(mountEl);

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
      if (renderer || isFallbackDom) {
        rebuildMeshes();
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
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },

    setDrawerShift(open) {
      drawerShift = Boolean(open);
    },

    stepBy,
    centerOnCardId,
    getCenteredCard: () => cards[centeredIndex] || cards[0] || null,
    resize,

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
