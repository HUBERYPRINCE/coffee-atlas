import * as THREE from 'three';
import { buildCardAssembly } from './card-geometry.js';
import { createCardMaterials, FINISH_MAP } from './holo-shaders.js';
import { LRUTexturePool } from './texture-pool.js';
import { createCSS3DFallbackStage } from './css3d-fallback.js';
import { invalidateCardThumb, resolveCardLayers } from '../art/hybrid-resolver.js';

/**
 * Main Three.js + GLSL 3D Holographic Card Stage Controller (V2.0).
 *
 * Features:
 * - OrthographicCamera with enlarged ~25% showcase framing (desktop 1440x900 + mobile 390x844)
 * - Dual-theme support ('dark' Darkroom Walnut & 'light' BaiXiang Light Gallery)
 * - Responsive mouse hover micro-parallax (~±10° Y, ±6.3° X) seamlessly blended with inertia drag
 * - Smooth damped inertia drag (±0.68 rad), pinch & wheel zoom (0.78x - 1.35x), double-click 180° flip
 * - Parallax shader mode (uRelief = 0) & physical multi-plane relief diorama mode (uRelief = 1)
 * - Dual-theme 1400x1800 collector poster PNG export (Darkroom Walnut & BaiXiang Rice-Paper Gallery)
 * - Automatic GPU texture LRU pooling (max 5 cards) + automatic CSS 3D fallback if WebGL fails
 * - Exposes window.__holo for verification & automation hooks
 */

const POSTER_SERIF_FONT = `'Songti SC', 'Noto Serif SC', 'STSong', Georgia, serif`;
const POSTER_SANS_FONT = `'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', -apple-system, sans-serif`;
const POSTER_MONO_FONT = `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;

const FINISH_POSTER_LABELS = {
  gold: 'GOLD FOIL · 烫金',
  pearl: 'PEARL · 珠光',
  silver: 'SILVER FOIL · 银箔',
  original: 'COTTON · 原画棉纸',
};

function paintPosterBackdropAndColophon(
  ctx,
  { width, height, card, flipped, finish, foil, relief, theme = 'dark', drawCardFn },
) {
  const isLight = theme === 'light';

  if (isLight) {
    // 1. BaiXiang Warm Rice-Paper Gallery Backdrop (#F4F0E8)
    ctx.fillStyle = '#F4F0E8';
    ctx.fillRect(0, 0, width, height);

    const gallerySpot = ctx.createRadialGradient(
      width * 0.5,
      height * 0.42,
      width * 0.05,
      width * 0.5,
      height * 0.46,
      height * 0.72,
    );
    gallerySpot.addColorStop(0.0, '#FBF9F3');
    gallerySpot.addColorStop(0.45, '#F4F0E8');
    gallerySpot.addColorStop(0.82, '#EDE6D9');
    gallerySpot.addColorStop(1.0, '#E5DDD0');
    ctx.fillStyle = gallerySpot;
    ctx.fillRect(0, 0, width, height);

    // Subtle organic rice-paper linen fibers (deterministic pseudo-random)
    ctx.save();
    let seed = 133791;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    ctx.lineWidth = 1.0;
    for (let i = 0; i < 220; i++) {
      const fx = rand() * width;
      const fy = rand() * height;
      const fl = 12 + rand() * 26;
      const fa = rand() * Math.PI * 2;
      ctx.strokeStyle =
        i % 2 === 0
          ? `rgba(130, 104, 76, ${(0.025 + rand() * 0.028).toFixed(3)})`
          : `rgba(255, 253, 248, ${(0.18 + rand() * 0.16).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(fa) * fl, fy + Math.sin(fa) * fl);
      ctx.stroke();
    }
    ctx.restore();

    // Refined deep-espresso & antique-bronze exhibition double margin frame
    ctx.strokeStyle = 'rgba(92, 66, 40, 0.28)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(42, 42, width - 84, height - 84);
    ctx.strokeStyle = 'rgba(139, 92, 31, 0.16)';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(52, 52, width - 104, height - 104);
  } else {
    // 1. Opaque dark walnut coffee bar spotlight backdrop (#231A15 -> #100C0A)
    ctx.fillStyle = '#100C0A';
    ctx.fillRect(0, 0, width, height);

    const spot = ctx.createRadialGradient(
      width * 0.5,
      height * 0.44,
      width * 0.04,
      width * 0.5,
      height * 0.46,
      height * 0.68,
    );
    spot.addColorStop(0.0, '#261C17');
    spot.addColorStop(0.38, '#231A15');
    spot.addColorStop(0.74, '#16100D');
    spot.addColorStop(1.0, '#100C0A');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);

    // Subtle warm champagne-copper gallery halo behind the card
    const halo = ctx.createRadialGradient(width * 0.5, height * 0.45, 20, width * 0.5, height * 0.45, width * 0.44);
    halo.addColorStop(0.0, 'rgba(214, 162, 94, 0.075)');
    halo.addColorStop(0.6, 'rgba(214, 162, 94, 0.02)');
    halo.addColorStop(1.0, 'rgba(214, 162, 94, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    // Subtle exhibition margin frame
    ctx.strokeStyle = 'rgba(214, 162, 94, 0.16)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(42, 42, width - 84, height - 84);
  }

  // 2. Render centered 3D / fallback card layer
  drawCardFn(ctx);

  // 3. Bottom collector colophon (fine bronze/copper rule + brand left + card spec right)
  const marginX = 84;
  const ruleY = height - 154;
  const centerX = width * 0.5;

  const ruleStroke = isLight ? 'rgba(139, 92, 31, 0.42)' : 'rgba(214, 162, 94, 0.36)';
  const accentColor = isLight ? '#9A6826' : '#D6A25E';
  const inkMain = isLight ? '#1E1814' : '#F4EDE2';
  const inkRight = isLight ? '#231A15' : '#F2E9DC';
  const inkBrandEn = isLight ? 'rgba(139, 92, 31, 0.90)' : 'rgba(214, 162, 94, 0.86)';
  const inkSub = isLight ? 'rgba(92, 76, 62, 0.78)' : 'rgba(184, 168, 152, 0.74)';
  const inkSubDim = isLight ? 'rgba(104, 88, 74, 0.70)' : 'rgba(184, 168, 152, 0.62)';

  ctx.save();
  ctx.strokeStyle = ruleStroke;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(marginX, ruleY);
  ctx.lineTo(centerX - 18, ruleY);
  ctx.moveTo(centerX + 18, ruleY);
  ctx.lineTo(width - marginX, ruleY);
  ctx.stroke();

  // Centered copper/bronze diamond ornament on rule
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(centerX, ruleY - 6);
  ctx.lineTo(centerX + 6, ruleY);
  ctx.lineTo(centerX, ruleY + 6);
  ctx.lineTo(centerX - 6, ruleY);
  ctx.closePath();
  ctx.fill();

  // Left: Brand mark (dot + 焙境图鉴 · ROAST & TERROIR ATLAS)
  const rowY = ruleY + 52;
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(marginX + 6, rowY, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 28px ${POSTER_SERIF_FONT}`;
  ctx.fillStyle = inkMain;
  const brandCn = '焙境图鉴';
  ctx.fillText(brandCn, marginX + 24, rowY);
  const brandCnW = ctx.measureText(brandCn).width;

  ctx.font = `500 17px ${POSTER_MONO_FONT}`;
  ctx.fillStyle = inkBrandEn;
  ctx.fillText('·  ROAST & TERROIR ATLAS', marginX + 24 + brandCnW + 14, rowY + 1);

  // Right: Card code · Title · 01 FRONT / 02 BACK (auto-fit so zero overlap with brand)
  const code = card?.code || 'CA-01';
  const title = card?.title || '世界咖啡豆图鉴';
  const faceTag = flipped ? '02 BACK' : '01 FRONT';
  const rightMain = `${code} · ${title} · ${faceTag}`;

  const maxRightW = width - marginX * 2 - (brandCnW + 310);
  let fontSize = 23;
  ctx.font = `600 ${fontSize}px ${POSTER_SANS_FONT}`;
  while (fontSize > 16 && ctx.measureText(rightMain).width > maxRightW) {
    fontSize -= 1;
    ctx.font = `600 ${fontSize}px ${POSTER_SANS_FONT}`;
  }
  let displayRight = rightMain;
  while (displayRight.length > 8 && ctx.measureText(displayRight).width > maxRightW) {
    displayRight = `${displayRight.slice(0, -2)}…`;
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = inkRight;
  ctx.fillText(displayRight, width - marginX, rowY);

  // Subtle second micro-line on right showing finish & foil/relief state
  const finishDesc = FINISH_POSTER_LABELS[finish] || FINISH_POSTER_LABELS.gold;
  const detailParts = [finishDesc];
  if (finish !== 'original') detailParts.push(`FOIL ${Math.round((foil ?? 0.62) * 100)}%`);
  if (relief) detailParts.push('RELIEF');
  ctx.font = `500 15px ${POSTER_MONO_FONT}`;
  ctx.fillStyle = inkSub;
  ctx.fillText(detailParts.join('  ·  '), width - marginX, rowY + 34);

  // Subtle left subtitle under brand
  ctx.textAlign = 'left';
  ctx.fillStyle = inkSubDim;
  ctx.fillText(
    isLight ? '白相 · 暖白美术馆典藏版  ·  BAIXIANG GALLERY' : 'SPECIALTY COFFEE COLLECTOR EDITION',
    marginX + 24,
    rowY + 34,
  );

  ctx.restore();
}

function triggerPngDownload(dataUrl, filename) {
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function buildShadowTexture(mode) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');

  if (mode === 'light') {
    // Clean gallery soft warm-gray contact shadow (no heavy muddy black halo on rice-paper wall)
    const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 124);
    grad.addColorStop(0.0, 'rgba(38, 30, 24, 0.26)');
    grad.addColorStop(0.38, 'rgba(54, 44, 36, 0.14)');
    grad.addColorStop(0.72, 'rgba(72, 62, 52, 0.045)');
    grad.addColorStop(1.0, 'rgba(72, 62, 52, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  } else {
    // Deep espresso contact occlusion + subtle warm copper-amber bar underglow
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
    grad.addColorStop(0.0, 'rgba(6, 3, 2, 0.62)');
    grad.addColorStop(0.36, 'rgba(10, 6, 4, 0.36)');
    grad.addColorStop(0.68, 'rgba(182, 122, 56, 0.09)');
    grad.addColorStop(1.0, 'rgba(182, 122, 56, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createAmbientShadowMesh(initialTheme = 'dark') {
  const darkTex = buildShadowTexture('dark');
  const lightTex = buildShadowTexture('light');

  const mat = new THREE.MeshBasicMaterial({
    map: initialTheme === 'light' ? lightTex : darkTex,
    transparent: true,
    depthWrite: false,
  });
  const geo = new THREE.PlaneGeometry(7.6, 10.2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0.22, -0.45, -1.2);
  mesh.renderOrder = -10;

  return {
    mesh,
    setTheme(nextTheme) {
      const target = nextTheme === 'light' ? lightTex : darkTex;
      if (mat.map !== target) {
        mat.map = target;
        mat.needsUpdate = true;
      }
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      darkTex.dispose();
      lightTex.dispose();
    },
  };
}

function tryCreateWebGLRenderer() {
  const attempts = [
    {
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    },
    {
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    },
  ];

  let lastError = null;
  for (const opts of attempts) {
    try {
      const r = new THREE.WebGLRenderer(opts);
      const gl = r.getContext();
      if (gl) return { renderer: r, error: null };
      r.dispose();
    } catch (err) {
      lastError = err;
    }
  }
  return { renderer: null, error: lastError || new Error('WebGL context unavailable') };
}

export function createHoloStage(containerEl, callbacks = {}) {
  if (!containerEl) {
    throw new Error('createHoloStage requires a valid container element');
  }

  const { renderer, error: webglError } = tryCreateWebGLRenderer();
  if (!renderer) {
    console.warn('[holo-stage] WebGL unavailable, falling back to CSS 3D:', webglError);
    return createCSS3DFallbackStage(containerEl, callbacks, webglError);
  }

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false, addEventListener() {}, removeEventListener() {} };

  let theme =
    typeof document !== 'undefined' && document.documentElement?.dataset?.theme === 'dark'
      ? 'dark'
      : 'light';

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const canvas = renderer.domElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.setAttribute('aria-hidden', 'true');
  containerEl.replaceChildren(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 4.45, -4.45, 0.1, 100);
  camera.position.set(0, 0, 20);

  const { uniforms, materials, dispose: disposeMaterials } = createCardMaterials();
  uniforms.uThemeLight.value = theme === 'light' ? 1.0 : 0.0;

  const assembly = buildCardAssembly(materials);
  const root = assembly.group;
  scene.add(root);

  const shadowObj = createAmbientShadowMesh(theme);
  const shadow = shadowObj.mesh;
  scene.add(shadow);

  // Compile shaders early & verify runnability — gracefully degrade to CSS 3D on driver failure
  try {
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    const failedPrograms = (renderer.info?.programs || []).filter(
      (p) => p.diagnostics && !p.diagnostics.runnable,
    );
    if (failedPrograms.length > 0) {
      throw new Error('Shader compilation failed on this GPU');
    }
  } catch (compileError) {
    console.warn('[holo-stage] Shader compilation failed, degrading to CSS 3D:', compileError);
    shadowObj.dispose();
    assembly.dispose();
    disposeMaterials();
    renderer.dispose();
    canvas.remove();
    return createCSS3DFallbackStage(containerEl, callbacks, compileError);
  }

  const texturePool = new LRUTexturePool(5, renderer);
  const invQuat = new THREE.Quaternion();

  // ---- Interactive & Visual State ----
  let currentCard = null;
  let lastBoundCardId = null;
  let activeBundle = null;
  const pendingDisposeBundles = [];
  let loadToken = 0;
  let disposed = false;

  // Tactile card-deal micro-impulse (scale 0.972 -> 1.0 & +-0.06 rad horizontal settle in ~180ms)
  let dealScale = 1.0;
  let dealRotOffsetY = 0.0;
  let dealDirection = 1;

  let finish = 'gold';
  let foil = 0.62;
  let relief = false;
  let flipped = false;
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
  let targetY = -0.15;
  let smoothRotX = targetX;
  let smoothRotY = targetY;

  // Alive mouse-hover follow parallax (disabled during drag or prefers-reduced-motion)
  let hoverTargetX = 0;
  let hoverTargetY = 0;
  let hoverRotX = 0;
  let hoverRotY = 0;
  let isPointerHovering = false;
  let hoverBlend = 0;

  let targetShiftX = 0;
  let currentShiftX = 0;

  let dragging = false;
  let dragDistance = 0;
  let lastPointer = { x: 0, y: 0 };
  let singleClickTimer = null;
  let paused = false;
  let hadMultiTouch = false;
  /** @type {Map<number, {x: number, y: number}>} */
  const activePointers = new Map();
  let pinchStartDist = 0;
  let pinchStartZoom = 1;

  let lastTime = 0;
  let elapsed = 0;
  let viewportAspect = 1;
  let frustumHalfHeight = 4.45;

  root.rotation.set(targetX, targetY, 0);

  function emitState() {
    callbacks.onStateChange?.(api.getState());
  }

  function updateReliefLayout() {
    const active = relief;
    assembly.meshes.subject.visible = active;
    assembly.meshes.effects.visible = active;
    assembly.meshes.text.visible = active;

    if (!active) return;

    // Hug the gold frame & typography tightly to the card face (Z=+0.095) like hot-stamped foil
    // so 25°-35° tilt never detaches the border from the beveled metallic card body.
    const textZ = 0.095;
    const subjectZ = THREE.MathUtils.clamp(0.155 + (params.subjectDepth - 0.32) * 0.09, 0.115, 0.210);
    const effectsZ = THREE.MathUtils.clamp(
      Math.max(subjectZ + 0.045, 0.215 + (params.effectsDepth - 0.44) * 0.11),
      0.165,
      0.285,
    );

    assembly.meshes.text.position.z = textZ;
    assembly.meshes.subject.position.z = subjectZ;
    assembly.meshes.effects.position.z = effectsZ;
  }

  function computeDrawerShiftOffset() {
    const width = containerEl.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280);
    if (!drawerShift || width < 960) return 0;
    const halfWidth = frustumHalfHeight * viewportAspect;
    // Shift card comfortably into the left open space next to a ~420px right drawer
    return -Math.min(2.05, halfWidth * 0.24);
  }

  function resize() {
    if (disposed) return;
    const width = Math.max(1, containerEl.clientWidth || window.innerWidth || 390);
    const height = Math.max(1, containerEl.clientHeight || window.innerHeight || 640);
    const aspect = width / height;
    viewportAspect = aspect;

    // Enlarged ~25% showcase framing: commanding centerpiece on 1440x900 desktop & 390x844 mobile with zero clipping
    const baseHalfHeight = relief ? 4.58 : 4.45;
    const minHalfWidth = relief ? 3.22 : 3.12;
    const halfHeight = Math.max(baseHalfHeight, minHalfWidth / aspect) / zoom;
    frustumHalfHeight = halfHeight;

    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    targetShiftX = computeDrawerShiftOffset();
  }

  function flushPendingDisposals(keepBundle = null) {
    for (let i = pendingDisposeBundles.length - 1; i >= 0; i--) {
      const b = pendingDisposeBundles[i];
      if (b && b !== keepBundle) {
        b.dispose();
        pendingDisposeBundles.splice(i, 1);
      }
    }
  }

  function applyTextureBundle(bundle, cardId = null) {
    uniforms.tBackground.value = bundle.tBackground;
    uniforms.tSubject.value = bundle.tSubject;
    uniforms.tEffects.value = bundle.tEffects;
    uniforms.tLine.value = bundle.tLine;
    uniforms.tText.value = bundle.tText;
    uniforms.tBack.value = bundle.tBack;
    uniforms.uHasLine.value = bundle.hasLine ? 1 : 0;
    uniforms.uHasFx.value = bundle.hasFx ? 1 : 0;
    activeBundle = bundle;
    texturePool.setPinned(cardId);
    flushPendingDisposals(bundle);
  }

  function applyCardVisualDefaults(card) {
    const vis = card?.visual || {};
    finish = FINISH_MAP[vis.defaultFinish] !== undefined ? vis.defaultFinish : 'gold';
    foil = THREE.MathUtils.clamp(vis.foilStrength ?? 0.62, 0, 1);

    const d = vis.depths || {};
    params.subjectScale = THREE.MathUtils.clamp(d.subjectScale ?? 1.0, 0.75, 1.35);
    params.subjectDepth = THREE.MathUtils.clamp(d.subjectDepth ?? 0.32, -0.2, 0.9);
    params.effectsDepth = THREE.MathUtils.clamp(d.effectsDepth ?? 0.44, -0.2, 0.9);
    params.backgroundDepth = THREE.MathUtils.clamp(d.backgroundDepth ?? -0.22, -0.6, 0.2);

    uniforms.uFinish.value = FINISH_MAP[finish] ?? FINISH_MAP.gold;
    uniforms.uFoil.value = foil;
    uniforms.uScale.value = params.subjectScale;
    uniforms.uDepth.value = params.subjectDepth;
    uniforms.uFxDepth.value = params.effectsDepth;
    uniforms.uBgDepth.value = params.backgroundDepth;
    updateReliefLayout();
  }

  // ---- Pointer, Hover Parallax, Touch Pinch, Wheel & Keyboard Interactions ----
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 1) {
      dragging = true;
      dragDistance = 0;
      hadMultiTouch = false;
      auto = false;
      isPointerHovering = false;
      hoverTargetX = 0;
      hoverTargetY = 0;
      lastPointer = { x: e.clientX, y: e.clientY };
      containerEl.classList.add('dragging');
      emitState();
    } else if (activePointers.size === 2) {
      dragging = false;
      hadMultiTouch = true;
      if (singleClickTimer) {
        clearTimeout(singleClickTimer);
        singleClickTimer = null;
      }
      const pts = Array.from(activePointers.values());
      pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      pinchStartZoom = zoom;
    }

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic test events may omit active pointerId
    }
  };

  const onPointerMove = (e) => {
    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointers.size === 2) {
      const pts = Array.from(activePointers.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (pinchStartDist > 0) {
        zoom = THREE.MathUtils.clamp(pinchStartZoom * (dist / pinchStartDist), 0.78, 1.35);
        resize();
      }
      return;
    }

    if (!dragging) {
      // Subtle responsive mouse-hover parallax when gliding over stage
      if (e.pointerType !== 'touch' && !reducedMotion.matches) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const nx = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
          // NDC vertical coordinate (+1 at top, -1 at bottom) so -ny tilts card face up toward cursor
          const ny = THREE.MathUtils.clamp(1 - ((e.clientY - rect.top) / rect.height) * 2, -1, 1);
          // In Three.js XYZ Euler order, positive deltaY turns BOTH front (0) & back (PI) faces rightward
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

    const base = flipped ? Math.PI : 0;
    // In Three.js XYZ Euler order, positive deltaY turns the visible face right on both front & back
    targetY = THREE.MathUtils.clamp(targetY + dx * 0.0065, base - 0.68, base + 0.68);
    targetX = THREE.MathUtils.clamp(targetX + dy * 0.0045, -0.38, 0.38);
    lastPointer = { x: e.clientX, y: e.clientY };
  };

  const onPointerLeave = () => {
    isPointerHovering = false;
    hoverTargetX = 0;
    hoverTargetY = 0;
  };

  const releasePointer = (e) => {
    const wasDragging = dragging;
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      dragging = false;
      containerEl.classList.remove('dragging');
      // Clean single tap/click (< 6px drag, single pointer) toggles back to Bending Gallery unless a 2nd tap flips the card
      if (e.type === 'pointerup' && wasDragging && !hadMultiTouch && dragDistance < 6 && callbacks.onSingleClick) {
        if (singleClickTimer) {
          clearTimeout(singleClickTimer);
          singleClickTimer = null;
          // Double-tap on touch devices flips card cleanly
          if (e.pointerType === 'touch') {
            api.toggleFlip();
          }
        } else {
          singleClickTimer = setTimeout(() => {
            singleClickTimer = null;
            callbacks.onSingleClick?.();
          }, 235);
        }
      }
    } else if (activePointers.size === 1) {
      const [pt] = activePointers.values();
      lastPointer = { x: pt.x, y: pt.y };
      dragging = true;
    }
  };

  const onDblClick = () => {
    if (singleClickTimer) {
      clearTimeout(singleClickTimer);
      singleClickTimer = null;
    }
    if (dragDistance > 8) return;
    api.toggleFlip();
  };

  const onWheel = (e) => {
    e.preventDefault();
    zoom = THREE.MathUtils.clamp(zoom - e.deltaY * 0.00095, 0.78, 1.35);
    resize();
    emitState();
  };

  const onKeyDown = (e) => {
    // Only tilt via arrows when the stage container itself is focused
    if (document.activeElement !== containerEl && document.activeElement !== canvas) return;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    auto = false;
    const base = flipped ? Math.PI : 0;
    if (e.key === 'ArrowLeft') targetY -= 0.09;
    if (e.key === 'ArrowRight') targetY += 0.09;
    if (e.key === 'ArrowUp') targetX -= 0.07;
    if (e.key === 'ArrowDown') targetX += 0.07;
    targetY = THREE.MathUtils.clamp(targetY, base - 0.68, base + 0.68);
    targetX = THREE.MathUtils.clamp(targetX, -0.38, 0.38);
    emitState();
  };

  const onContextLost = (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    callbacks.onNotice?.('3D 渲染上下文已暂停，正在等待恢复…');
  };

  const onContextRestored = () => {
    flushPendingDisposals(null);
    activeBundle = null;
    lastBoundCardId = null;
    texturePool.clear();
    if (currentCard) api.loadCard(currentCard);
    renderer.setAnimationLoop(animate);
    callbacks.onNotice?.('3D 渲染已恢复');
  };

  const onReducedMotionChange = () => {
    if (reducedMotion.matches) {
      auto = false;
      dealScale = 1.0;
      dealRotOffsetY = 0.0;
      isPointerHovering = false;
      hoverTargetX = 0;
      hoverTargetY = 0;
      hoverRotX = 0;
      hoverRotY = 0;
      hoverBlend = 0;
      emitState();
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('lostpointercapture', releasePointer);
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  containerEl.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  reducedMotion.addEventListener?.('change', onReducedMotionChange);

  let resizeRaf = 0;
  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          if (resizeRaf) cancelAnimationFrame(resizeRaf);
          resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            if (!disposed) resize();
          });
        })
      : null;
  resizeObserver?.observe(containerEl);

  // ---- Main Render Loop ----
  function animate(now) {
    if (disposed || paused) return;
    const dt = Math.min((now - lastTime) / 1000, 0.06) || 0;
    lastTime = now;

    if (typeof document !== 'undefined' && document.hidden) return;

    if (!reducedMotion.matches || auto) {
      elapsed += dt;
    }

    const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 9.5);
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

    const base = flipped ? Math.PI : 0;

    if (auto && !dragging) {
      // Gently attenuate idle sway when hovering so cursor parallax feels immediate and tactile
      const swayScale = 1 - hoverBlend * 0.72;
      targetY = base + (Math.sin(elapsed * 0.45) * 0.24 - 0.05) * swayScale;
      targetX = (Math.sin(elapsed * 0.56) * 0.058 - 0.018) * swayScale;
    }

    smoothRotX += (targetX - smoothRotX) * ease;
    smoothRotY += (targetY - smoothRotY) * ease;

    // Restrained ~180ms card-deal micro-impulse damping (skipped under prefers-reduced-motion)
    if (reducedMotion.matches) {
      dealScale = 1.0;
      dealRotOffsetY = 0.0;
    } else if (dealScale !== 1.0 || dealRotOffsetY !== 0.0) {
      const dealEase = 1 - Math.exp(-dt * 18.0);
      dealScale += (1.0 - dealScale) * dealEase;
      dealRotOffsetY += (0.0 - dealRotOffsetY) * dealEase;
      if (Math.abs(1.0 - dealScale) < 0.0004) dealScale = 1.0;
      if (Math.abs(dealRotOffsetY) < 0.0004) dealRotOffsetY = 0.0;
    }

    const combinedX = THREE.MathUtils.clamp(smoothRotX + hoverRotX, -0.44, 0.44);
    const combinedY = THREE.MathUtils.clamp(smoothRotY + hoverRotY, base - 0.74, base + 0.74);

    root.rotation.x = combinedX;
    root.rotation.y = combinedY + dealRotOffsetY;
    root.scale.setScalar(dealScale);

    // Gentle idle breathing float (disabled under prefers-reduced-motion)
    const floatY = reducedMotion.matches ? 0 : Math.sin(elapsed * 1.15) * 0.055;
    currentShiftX += (targetShiftX - currentShiftX) * ease;
    root.position.set(currentShiftX, floatY, 0);

    // Exact orthographic card-local viewing vector (invariant to drawer horizontal shift)
    root.updateMatrixWorld(true);
    invQuat.copy(root.quaternion).invert();
    uniforms.uView.value.set(0, 0, 1).applyQuaternion(invQuat).normalize();
    uniforms.uTime.value = reducedMotion.matches && !auto ? 0 : elapsed;

    // Dynamic ambient bottom shadow tracks rotation, deal pulse & drawer shift
    const edgeFactor = Math.abs(Math.sin(root.rotation.y));
    shadow.scale.set(
      (1 - edgeFactor * 0.24) * dealScale,
      (1 - Math.abs(Math.sin(root.rotation.x)) * 0.08) * dealScale,
      1,
    );
    shadow.position.x = currentShiftX + (theme === 'light' ? 0.16 : 0.22);
    shadow.position.y = (theme === 'light' ? -0.40 : -0.45) + floatY * 0.35;

    renderer.render(scene, camera);
  }

  resize();
  renderer.setAnimationLoop(animate);

  // ---- Public Stage Controller API ----
  const api = {
    async loadCard(card) {
      if (!card || disposed) return;
      const token = ++loadToken;
      currentCard = card;
      callbacks.onLoadStart?.(card);

      try {
        const bundle = await texturePool.getOrCreate(
          card.id,
          () => resolveCardLayers(card),
          { shouldCommit: () => !disposed && token === loadToken },
        );
        if (disposed || token !== loadToken || !bundle) return;

        const isCardSwitch = lastBoundCardId !== null && lastBoundCardId !== card.id;
        applyTextureBundle(bundle, card.id);
        applyCardVisualDefaults(card);
        lastBoundCardId = card.id;

        // Restrained tactile barista card-deal micro-impulse on card change
        if (isCardSwitch && !reducedMotion.matches) {
          dealScale = 0.972;
          dealRotOffsetY = dealDirection * 0.06;
          dealDirection = -dealDirection;
        }

        if (typeof window !== 'undefined' && window.__holo) {
          window.__holo.cardId = card.id;
        }
        callbacks.onLoadComplete?.(card);
        emitState();
      } catch (err) {
        console.error('[holo-stage] Failed to load card:', card?.id, err);
        callbacks.onError?.(err);
      }
    },

    setTheme(nextTheme) {
      const normalized = nextTheme === 'light' ? 'light' : 'dark';
      const changed = theme !== normalized;
      theme = normalized;
      uniforms.uThemeLight.value = theme === 'light' ? 1.0 : 0.0;
      shadowObj.setTheme(theme);
      if (changed) emitState();
    },

    setFinish(value) {
      if (FINISH_MAP[value] === undefined) return;
      const changed = finish !== value;
      finish = value;
      uniforms.uFinish.value = FINISH_MAP[value];
      // Tactile wrist-tilt shimmer impulse so the new holographic sheen immediately glints across the card
      if (changed && !reducedMotion.matches) {
        dealRotOffsetY = dealDirection * 0.145;
        dealDirection = -dealDirection;
      }
      emitState();
    },

    setFoil(value) {
      const next = THREE.MathUtils.clamp(Number(value), 0, 1);
      if (Number.isNaN(next)) return;
      foil = next;
      uniforms.uFoil.value = foil;
      emitState();
    },

    setParam(key, value) {
      const v = Number(value);
      if (Number.isNaN(v)) return;

      if (key === 'scale' || key === 'subjectScale' || key === 'uScale') {
        params.subjectScale = THREE.MathUtils.clamp(v, 0.75, 1.35);
        uniforms.uScale.value = params.subjectScale;
      } else if (key === 'depth' || key === 'subjectDepth' || key === 'uDepth') {
        params.subjectDepth = THREE.MathUtils.clamp(v, -0.2, 0.9);
        uniforms.uDepth.value = params.subjectDepth;
      } else if (key === 'fxDepth' || key === 'fx-depth' || key === 'effectsDepth' || key === 'uFxDepth') {
        params.effectsDepth = THREE.MathUtils.clamp(v, -0.2, 0.9);
        uniforms.uFxDepth.value = params.effectsDepth;
      } else if (key === 'bgDepth' || key === 'bg-depth' || key === 'backgroundDepth' || key === 'uBgDepth') {
        params.backgroundDepth = THREE.MathUtils.clamp(v, -0.6, 0.2);
        uniforms.uBgDepth.value = params.backgroundDepth;
      } else if (key === 'foil' || key === 'foilStrength' || key === 'uFoil') {
        api.setFoil(v);
        return;
      } else if (key === 'relief' || key === 'uRelief') {
        api.setRelief(Boolean(v));
        return;
      }

      updateReliefLayout();
      emitState();
    },

    setRelief(enabled) {
      relief = Boolean(enabled);
      uniforms.uRelief.value = relief ? 1 : 0;
      updateReliefLayout();
      resize();
      emitState();
    },

    setFlipped(value) {
      const next = Boolean(value);
      const changed = flipped !== next;
      flipped = next;
      auto = false;
      targetY = flipped ? Math.PI : 0;
      targetX = 0;
      if (changed) {
        callbacks.onFlipChange?.(flipped);
      }
      emitState();
    },

    toggleFlip() {
      api.setFlipped(!flipped);
    },

    flip(value) {
      api.setFlipped(value === undefined ? !flipped : Boolean(value));
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
      targetShiftX = computeDrawerShiftOffset();
      emitState();
    },

    resetView() {
      targetX = -0.04;
      targetY = -0.15;
      hoverTargetX = 0;
      hoverTargetY = 0;
      hoverRotX = 0;
      hoverRotY = 0;
      isPointerHovering = false;
      hoverBlend = 0;
      dealScale = 1.0;
      dealRotOffsetY = 0.0;
      zoom = 1.0;
      const wasFlipped = flipped;
      flipped = false;
      auto = !reducedMotion.matches;
      relief = false;
      uniforms.uRelief.value = 0;

      if (currentCard) {
        applyCardVisualDefaults(currentCard);
      } else {
        finish = 'gold';
        foil = 0.62;
        uniforms.uFinish.value = FINISH_MAP.gold;
        uniforms.uFoil.value = foil;
      }

      updateReliefLayout();
      resize();
      if (wasFlipped) callbacks.onFlipChange?.(false);
      emitState();
    },

    reset() {
      api.resetView();
    },

    getState() {
      return {
        ready: true,
        fallback: false,
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

      // If evicting the currently displayed card, detach safely and dispose once replacement binds
      if (currentCard?.id === targetId && activeBundle) {
        const detached = texturePool.detach(targetId);
        if (detached) pendingDisposeBundles.push(detached);
        return true;
      }
      return texturePool.evict(targetId);
    },

    resize,

    setPaused(nextPaused) {
      const want = Boolean(nextPaused);
      if (paused === want) return;
      paused = want;
      if (singleClickTimer) {
        clearTimeout(singleClickTimer);
        singleClickTimer = null;
      }
      if (!paused && !disposed) {
        lastTime = performance.now();
        renderer.setAnimationLoop(animate);
      } else {
        renderer.setAnimationLoop(null);
      }
    },

    exportPoster(options = {}) {
      if (disposed) return null;
      const download = options.download !== false;
      const W = Math.max(700, Number(options.width) || 1400);
      const H = Math.max(900, Number(options.height) || 1800);
      const posterTheme = options.theme === 'light' || options.theme === 'dark' ? options.theme : theme;

      const prevSize = new THREE.Vector2();
      renderer.getSize(prevSize);
      const prevRatio = renderer.getPixelRatio();
      const prevBounds = {
        left: camera.left,
        right: camera.right,
        top: camera.top,
        bottom: camera.bottom,
      };
      const prevRootPos = root.position.clone();
      const prevRootScale = root.scale.clone();
      const prevShadowPos = shadow.position.clone();
      const prevThemeLight = uniforms.uThemeLight.value;

      try {
        // Temporarily center card (clearing drawerShift, deal micro-pulse & float) and lift above colophon
        renderer.setPixelRatio(1);
        renderer.setSize(W, H, false);

        uniforms.uThemeLight.value = posterTheme === 'light' ? 1.0 : 0.0;
        shadowObj.setTheme(posterTheme);

        const capHalfH = relief ? 5.20 : 5.04;
        const liftOffsetY = -0.44;
        camera.left = (-capHalfH * W) / H;
        camera.right = (capHalfH * W) / H;
        camera.top = capHalfH + liftOffsetY;
        camera.bottom = -capHalfH + liftOffsetY;
        camera.updateProjectionMatrix();

        root.position.set(0, 0, 0);
        root.scale.set(1, 1, 1);
        shadow.position.set(posterTheme === 'light' ? 0.16 : 0.22, posterTheme === 'light' ? -0.40 : -0.45, -1.2);
        root.updateMatrixWorld(true);
        invQuat.copy(root.quaternion).invert();
        uniforms.uView.value.set(0, 0, 1).applyQuaternion(invQuat).normalize();
        renderer.render(scene, camera);

        const poster = document.createElement('canvas');
        poster.width = W;
        poster.height = H;
        const ctx = poster.getContext('2d');

        paintPosterBackdropAndColophon(ctx, {
          width: W,
          height: H,
          card: currentCard,
          flipped,
          finish,
          foil,
          relief,
          theme: posterTheme,
          drawCardFn: (targetCtx) => {
            targetCtx.drawImage(renderer.domElement, 0, 0, W, H);
          },
        });

        const dataUrl = poster.toDataURL('image/png');
        const safeCode = String(currentCard?.code || 'coffee-card').replace(/[^A-Za-z0-9_-]+/g, '-');
        const filename = `${safeCode}-${flipped ? 'back' : 'front'}.png`;

        if (download) {
          triggerPngDownload(dataUrl, filename);
        }
        return { dataUrl, filename, width: W, height: H };
      } catch (err) {
        console.error('[holo-stage] exportPoster failed:', err);
        callbacks.onNotice?.('海报导出失败，请重试');
        return null;
      } finally {
        uniforms.uThemeLight.value = prevThemeLight;
        shadowObj.setTheme(theme);
        root.position.copy(prevRootPos);
        root.scale.copy(prevRootScale);
        shadow.position.copy(prevShadowPos);
        root.updateMatrixWorld(true);
        Object.assign(camera, prevBounds);
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(prevRatio);
        renderer.setSize(prevSize.x, prevSize.y, false);
        renderer.render(scene, camera);
      }
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      renderer.setAnimationLoop(null);
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = 0;
      }
      resizeObserver?.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerup', releasePointer);
      canvas.removeEventListener('pointercancel', releasePointer);
      canvas.removeEventListener('lostpointercapture', releasePointer);
      canvas.removeEventListener('dblclick', onDblClick);
      canvas.removeEventListener('wheel', onWheel);
      containerEl.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      reducedMotion.removeEventListener?.('change', onReducedMotionChange);
      flushPendingDisposals(null);
      texturePool.dispose();
      shadowObj.dispose();
      assembly.dispose();
      disposeMaterials();
      renderer.dispose();
      canvas.remove();
    },
  };

  if (typeof window !== 'undefined') {
    window.__holo = {
      ready: true,
      fallback: false,
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
      renderer,
      scene,
      camera,
      root,
      uniforms,
      layers: assembly.reliefLayers,
      pool: texturePool,
    };
  }

  return api;
}
