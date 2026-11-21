import * as THREE from 'three';

/**
 * Custom GLSL holographic optical shader suite inspired by RuiC-card-skill (BV183YT6REBS)
 * and calibrated for both Darkroom Walnut (#120E0C -> #231A15) and BaiXiang Light Gallery (#F3EFE7) stages.
 *
 * Finishes (uFinish):
 *   0 = pearl    (vivid mother-of-pearl iridescent refraction driven by card-local viewing vector)
 *   1 = silver   (crisp cool platinum-silver anisotropic micro-brushed metallic ribbon)
 *   2 = original (foil off — archival matte cotton card & pure artwork fidelity)
 *   3 = gold     (molten champagne-copper gold laminate + gilded edge seal & botanical lineart glint)
 */

export const FINISH_MAP = Object.freeze({
  pearl: 0,
  silver: 1,
  original: 2,
  gold: 3,
});

export const CARD_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalLocal;
varying vec3 vPosLocal;

void main() {
  vUv = uv;
  vNormalLocal = normalize(normal);
  vPosLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const COMMON_GLSL = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vNormalLocal;
varying vec3 vPosLocal;

uniform float uTime;
uniform float uFoil;
uniform float uScale;
uniform float uDepth;
uniform float uBgDepth;
uniform float uFxDepth;
uniform float uFinish;
uniform float uHasLine;
uniform float uHasFx;
uniform float uRelief;
uniform float uSafeScale;
uniform float uThemeLight;
uniform vec2 uFit;
uniform vec2 uSafeOffset;
uniform vec3 uView;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float inside(vec2 p) {
  return step(0.0, p.x) * step(0.0, p.y) * step(p.x, 1.0) * step(p.y, 1.0);
}

// Card-local orthographic parallax offset: positive depth pops forward, negative recedes.
vec2 parallax(vec2 uv, float depth) {
  return uv + uView.xy / max(abs(uView.z), 0.4) * depth * 0.10;
}

// Saturated mother-of-pearl rainbow spectral curve
vec3 spectrum(float phase) {
  return 0.60 + 0.36 * cos(6.2831853 * (phase + vec3(0.0, 0.33, 0.67)));
}

// "original" (uFinish == 2) turns off metallic laminate while preserving artwork.
float strength() {
  return abs(uFinish - 2.0) < 0.05 ? 0.0 : uFoil;
}

// Diagonal micro-groove anisotropic holographic diffraction grating
float microGroove(vec2 uv) {
  return 0.5 + 0.5 * sin(uv.x * 165.0 + uv.y * 105.0 + uView.x * 26.0 - uView.y * 14.0);
}

// View-angle driven holographic film color with clear physical differentiation across pearl / silver / gold.
vec3 film(vec2 uv) {
  float phase = uv.x * 0.85 + uv.y * 0.55 + uView.x * 1.55 - uView.y * 0.95;

  if (uFinish > 2.5) {
    // 烫金 (molten champagne-copper gold foil)
    float hi = 0.5 + 0.5 * sin(phase * 6.2831853);
    float glint = 0.5 + 0.5 * cos((phase + 0.22) * 6.2831853);
    float sheen = pow(0.5 + 0.5 * sin((phase * 1.42 - 0.10) * 6.2831853), 2.2);
    vec3 deepCopper = vec3(0.64, 0.39, 0.13);
    vec3 moltenGold = vec3(0.93, 0.72, 0.32);
    vec3 champagne = vec3(1.00, 0.94, 0.70);
    vec3 baseGold = mix(deepCopper, moltenGold, hi * 0.62 + glint * 0.38);
    return mix(baseGold, champagne, sheen * 0.58);
  }

  if (uFinish > 0.5 && uFinish < 1.5) {
    // 银箔 (crisp cool brushed platinum-silver foil)
    float brush = 0.5 + 0.5 * sin((uv.x * 1.15 - uv.y * 0.35 + uView.x * 1.8 - uView.y * 0.7) * 6.2831853);
    float specBand = pow(0.5 + 0.5 * sin((phase * 1.25 + 0.18) * 6.2831853), 2.4);
    vec3 coolSteel = vec3(0.68, 0.75, 0.84);
    vec3 brushedPlat = vec3(0.86, 0.91, 0.97);
    vec3 iceGlint = vec3(0.96, 0.99, 1.00);
    vec3 baseSilver = mix(coolSteel, brushedPlat, brush * 0.72 + 0.28);
    return mix(baseSilver, iceGlint, specBand * 0.55);
  }

  // 珠光 (vivid iridescent mother-of-pearl nacre refraction)
  vec3 primaryRainbow = spectrum(phase * 1.18 + uView.x * 0.45);
  vec3 secondaryNacre = spectrum(phase * 0.78 - uv.y * 0.45 + 0.28);
  vec3 nacre = mix(primaryRainbow, secondaryNacre, 0.34);
  // Subtle luminous silk sheen without washing out prismatic hues
  return mix(nacre, vec3(0.98, 0.94, 0.96), 0.09);
}

// 10th-power silky directional sweep driven by local viewing angle.
float sweep(vec2 uv) {
  float primary = pow(0.5 + 0.5 * sin((uv.x * 0.72 + uv.y * 0.45 + uView.x * 1.25 + uView.y * 0.65) * 6.2831853), 10.0);
  float secondary = pow(0.5 + 0.5 * sin((uv.x * 0.48 - uv.y * 0.62 + uView.x * 0.90 - uView.y * 0.78 + 0.3) * 6.2831853), 14.0);
  return clamp(primary + secondary * 0.35, 0.0, 1.30);
}
`;

export const FRONT_FRAGMENT_SHADER =
  COMMON_GLSL +
  /* glsl */ `
uniform sampler2D tSubject;
uniform sampler2D tBackground;
uniform sampler2D tText;
uniform sampler2D tLine;
uniform sampler2D tEffects;

void main() {
  vec2 uv = vUv;
  vec2 su = ((parallax(uv, uDepth) - 0.5) / max(uScale * uFit, vec2(0.001)) + 0.5) * uSafeScale + uSafeOffset;
  vec2 bu = parallax(uv, uBgDepth);
  vec2 eu = parallax(uv, uFxDepth);

  vec4 subject = texture2D(tSubject, clamp(su, 0.0, 1.0));
  subject.a *= inside(su) * (1.0 - uRelief);

  vec3 bg = texture2D(tBackground, clamp(bu, 0.0, 1.0)).rgb;
  vec3 col = mix(bg, subject.rgb, subject.a);

  // Subtle finish-calibrated tonal grade (keeps illustration authentic while distinguishing materials)
  if (uFinish > 2.5) {
    col = col * vec3(1.035, 0.965, 0.835) + vec3(0.028, 0.011, 0.0);
  } else if (uFinish > 0.5 && uFinish < 1.5) {
    col = col * vec3(0.955, 0.985, 1.035);
  }

  // Mid-depth botanical/aromatic effects layer between subject and typography
  vec4 fx = texture2D(tEffects, clamp(eu, 0.0, 1.0));
  fx.a *= inside(eu);
  col = mix(col, fx.rgb, fx.a * (1.0 - uRelief) * uHasFx);

  vec3 foil = film(uv);
  float amount = strength();
  float luminance = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float band = sweep(uv);
  float groove = microGroove(uv);

  bool isGold = uFinish > 2.5;
  bool isSilver = uFinish > 0.5 && uFinish < 1.5;
  bool isPearl = uFinish < 0.5;

  // Silky metallic laminate tuned per material: amplifies dark areas so obsidian roasts shimmer cleanly
  float finishBoost = isGold ? 1.62 : (isSilver ? 1.42 : 1.32);
  float absorbFactor = isPearl ? 0.14 : (isSilver ? 0.17 : 0.20);
  col *= 1.0 - amount * absorbFactor * (1.0 - foil) * (0.20 + band * 0.80);
  col += foil * amount * band * finishBoost * (0.068 + 0.122 * (1.0 - luminance));

  // Diagonal micro-groove anisotropic holographic diffraction glint modulated by sweep(uv)
  if (isPearl) {
    // Iridescent prismatic micro-diffraction wave across pearl mother-of-pearl finish
    float pPhase = uv.x * 0.95 + uv.y * 0.65 + uView.x * 1.9 - uView.y * 1.1 + groove * 0.22;
    vec3 prism = spectrum(pPhase);
    float nacreWave = pow(groove, 1.4) * (0.22 + band * 0.95);
    col += prism * amount * nacreWave * (0.055 + 0.085 * (1.0 - luminance));
  } else if (isSilver) {
    // Crisp cool platinum-silver anisotropic brushed micro-grooves
    float brushGlint = pow(groove, 2.1) * (0.18 + band * 1.15);
    col += vec3(0.86, 0.93, 1.00) * amount * brushGlint * (0.062 + 0.085 * (1.0 - luminance));
  } else if (isGold) {
    // Warm molten champagne-gold fine metallic foil grooves
    float goldGroove = pow(groove, 1.8) * (0.16 + band * 1.10);
    col += vec3(1.00, 0.88, 0.56) * amount * goldGroove * (0.064 + 0.082 * (1.0 - luminance));
  }

  // Edge seal foil halo along card perimeter
  float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float edge = 1.0 - smoothstep(0.014, 0.058, edgeDist);
  float edgeGain = isGold ? 0.48 : (isSilver ? 0.40 : 0.34);
  col = mix(col, foil * 0.80 + 0.18, edge * amount * edgeGain);

  // 480x720 micron holographic shimmer flakes
  vec2 cell = floor(uv * vec2(480.0, 720.0));
  float flake = step(0.9935, hash(cell)) *
    pow(0.5 + 0.5 * sin(hash(cell + 8.0) * 30.0 + uView.x * 20.0 + uView.y * 8.0 + uTime * 0.65), 10.0);
  col += foil * flake * amount * (isGold ? 0.19 : (isPearl ? 0.18 : 0.15));

  // White-ground black-line botanical engraving glint (co-registered with subject parallax)
  float lineMask = (1.0 - smoothstep(0.08, 0.32, texture2D(tLine, clamp(su, 0.0, 1.0)).r)) * uHasLine;
  float lineWeight = inside(su) * max(subject.a, 0.25) * (1.0 - uRelief);
  vec3 lineColor = isGold ? vec3(1.0, 0.92, 0.62) : (isSilver ? vec3(0.92, 0.97, 1.0) : foil);
  float lineGain = isGold ? (0.048 + band * 0.21) : (0.036 + band * 0.16);
  col += lineColor * lineMask * lineWeight * lineGain * amount;

  // Zero-parallax locked gilded frame & typography overlay (stays razor-sharp)
  vec4 text = texture2D(tText, uv);
  vec3 textCol = text.rgb;
  // Whisper of metallic reflection on warm gold frame strokes while preserving dark scrim legibility
  float textGoldMask = smoothstep(0.45, 0.75, text.r) * (1.0 - smoothstep(0.65, 0.92, text.b));
  textCol += foil * (band * 0.85 + groove * band * 0.35) * amount * textGoldMask * 0.13;
  col = mix(col, textCol, text.a * (1.0 - uRelief));

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), 1.0);
  #include <colorspace_fragment>
}
`;

export const EDGE_FRAGMENT_SHADER =
  COMMON_GLSL +
  /* glsl */ `
void main() {
  vec3 viewDir = normalize(uView);
  vec3 n = normalize(vNormalLocal);
  float ndotv = clamp(abs(dot(n, viewDir)), 0.0, 1.0);
  float fresnel = pow(1.0 - ndotv, 2.2);
  float spec = pow(clamp(dot(n, normalize(viewDir + vec3(0.28, 0.36, 0.45))), 0.0, 1.0), 10.0);
  float band = sweep(vUv);
  float groove = microGroove(vUv);
  float amt = strength();

  // Base metallic / paper-ply color tailored to each finish
  vec3 col;
  if (abs(uFinish - 2.0) < 0.05) {
    // Original cotton card: layered archival warm cream-paper ply along thickness
    float ply = 0.5 + 0.5 * sin(vPosLocal.z * 260.0);
    col = mix(vec3(0.76, 0.70, 0.60), vec3(0.86, 0.81, 0.72), ply * 0.4 + ndotv * 0.5);
    col += vec3(0.06, 0.05, 0.04) * spec;
    // Slight warm-bronze darkening on light gallery backdrop so cotton edge remains crisp
    col = mix(col, col * vec3(0.80, 0.76, 0.71), uThemeLight * 0.72);
  } else if (uFinish > 2.5) {
    // Brushed molten champagne-copper gold bevel
    vec3 base = mix(vec3(0.48, 0.31, 0.12), vec3(0.88, 0.67, 0.30), ndotv * 0.65 + 0.25);
    col = mix(base, film(vUv) * 0.74 + 0.26, amt * 0.70);
    col += vec3(1.0, 0.92, 0.66) * (spec * 0.44 + band * 0.24 + groove * band * 0.14 + fresnel * 0.16) * max(amt, 0.35);
  } else if (uFinish > 0.5 && uFinish < 1.5) {
    // Brushed platinum silver bevel
    vec3 base = mix(vec3(0.44, 0.49, 0.56), vec3(0.83, 0.88, 0.94), ndotv * 0.65 + 0.25);
    col = mix(base, film(vUv) * 0.68 + 0.32, amt * 0.68);
    col += vec3(0.95, 0.98, 1.0) * (spec * 0.48 + band * 0.22 + groove * band * 0.15 + fresnel * 0.15) * max(amt, 0.35);
  } else {
    // Satin pearl iridescent bevel
    vec3 base = mix(vec3(0.60, 0.56, 0.55), vec3(0.86, 0.83, 0.82), ndotv * 0.65 + 0.25);
    col = mix(base, film(vUv) * 0.72 + 0.28, amt * 0.76);
    col += film(vUv) * (spec * 0.36 + band * 0.22 + fresnel * 0.16) * max(amt, 0.32);
  }

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), 1.0);
  #include <colorspace_fragment>
}
`;

export const BACK_FRAGMENT_SHADER =
  COMMON_GLSL +
  /* glsl */ `
uniform sampler2D tBack;

void main() {
  // Back mesh is physically rotated Y = PI so vUv maps left->right, bottom->top without flip.
  vec4 art = texture2D(tBack, vUv);
  vec3 paper = vec3(0.965, 0.945, 0.906);
  vec3 col = mix(paper, art.rgb, art.a);

  // Subtle restrained archival cotton pearlescence — keeps 6D radar & big typography razor-crisp
  float amt = strength();
  vec3 foil = film(vUv);
  float band = sweep(vUv);
  float groove = microGroove(vUv);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));

  // Only kiss the light paper surface gently; keep dark ink high-contrast
  float paperMask = smoothstep(0.45, 0.88, luma);
  col *= 1.0 - amt * 0.050 * (1.0 - foil) * paperMask;
  col += foil * band * amt * (0.020 + (0.032 + groove * 0.012) * paperMask);

  // Delicate outer edge seal matching card perimeter
  float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float edge = 1.0 - smoothstep(0.010, 0.036, edgeDist);
  col = mix(col, foil * 0.68 + 0.28, edge * amt * 0.22);

  // On BaiXiang light gallery stage (uThemeLight > 0.5), carve a refined dark-bronze hairline rim
  // so warm cotton card back maintains crisp architectural separation against warm-ivory backdrop
  if (uThemeLight > 0.5) {
    float rimFine = 1.0 - smoothstep(0.003, 0.015, edgeDist);
    float rimShade = 1.0 - smoothstep(0.012, 0.044, edgeDist);
    vec3 antiqueBronze = vec3(0.36, 0.25, 0.15);
    col = mix(col, col * vec3(0.93, 0.90, 0.86), rimShade * 0.55);
    col = mix(col, antiqueBronze, rimFine * 0.54);
  }

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), 1.0);
  #include <colorspace_fragment>
}
`;

export const SUBJECT_FRAGMENT_SHADER =
  COMMON_GLSL +
  /* glsl */ `
uniform sampler2D tSubject;
uniform sampler2D tLine;

void main() {
  vec2 su = ((vUv - 0.5) / max(uScale * uFit, vec2(0.001)) + 0.5) * uSafeScale + uSafeOffset;
  if (inside(su) < 0.5) discard;

  vec4 art = texture2D(tSubject, su);
  if (art.a < 0.06) discard;

  // 2px alpha neighborhood bevel detect -> warm gilded die-cut rim on physical relief layer
  vec2 px = 1.0 / vec2(1024.0, 1536.0);
  float aMin = min(
    min(texture2D(tSubject, clamp(su + vec2(px.x * 2.0, 0.0), 0.0, 1.0)).a,
        texture2D(tSubject, clamp(su - vec2(px.x * 2.0, 0.0), 0.0, 1.0)).a),
    min(texture2D(tSubject, clamp(su + vec2(0.0, px.y * 2.0), 0.0, 1.0)).a,
        texture2D(tSubject, clamp(su - vec2(0.0, px.y * 2.0), 0.0, 1.0)).a)
  );

  vec3 col = art.rgb;
  vec3 foil = film(vUv);
  float amt = strength();
  float band = sweep(vUv);
  float groove = microGroove(vUv);

  col += foil * (band * 0.11 + pow(groove, 1.8) * band * 0.06) * amt;

  // Co-registered botanical engraving glint on relief subject
  float lineMask = (1.0 - smoothstep(0.08, 0.32, texture2D(tLine, su).r)) * uHasLine;
  vec3 lineColor = uFinish > 2.5 ? vec3(1.0, 0.92, 0.62) : (uFinish > 0.5 && uFinish < 1.5 ? vec3(0.92, 0.97, 1.0) : foil);
  col += lineColor * lineMask * (0.045 + band * 0.19) * amt;

  // Subtle gold/silver die-cut contour highlight
  vec3 rimTint = (uFinish > 0.5 && uFinish < 1.5) ? vec3(0.84, 0.90, 0.96) : vec3(0.90, 0.74, 0.40);
  col = mix(col, rimTint, (1.0 - aMin) * 0.25);

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), art.a);
  #include <colorspace_fragment>
}
`;

export const EFFECTS_FRAGMENT_SHADER =
  COMMON_GLSL +
  /* glsl */ `
uniform sampler2D tEffects;

void main() {
  vec4 art = texture2D(tEffects, vUv);
  float alpha = art.a * uHasFx;
  if (alpha < 0.015) discard;

  vec3 col = art.rgb + film(vUv) * sweep(vUv) * strength() * 0.13;
  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), alpha);
  #include <colorspace_fragment>
}
`;

export const TEXT_FRAGMENT_SHADER =
  COMMON_GLSL +
  /* glsl */ `
uniform sampler2D tText;

void main() {
  vec4 art = texture2D(tText, vUv);
  if (art.a < 0.02) discard;

  vec3 col = art.rgb;
  float goldMask = smoothstep(0.45, 0.75, art.r) * (1.0 - smoothstep(0.65, 0.92, art.b));
  col += film(vUv) * sweep(vUv) * strength() * goldMask * 0.13;

  gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)), art.a);
  #include <colorspace_fragment>
}
`;

/**
 * Create a 1x1 solid RGBA DataTexture for neutral fallbacks.
 */
export function createSolidDataTexture(r, g, b, a) {
  const tex = new THREE.DataTexture(new Uint8Array([r, g, b, a]), 1, 1, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create the shared uniform dictionary and ShaderMaterials for the card assembly.
 */
export function createCardMaterials(initialTextures = {}) {
  const emptyTransparent = createSolidDataTexture(0, 0, 0, 0);
  const emptyWhite = createSolidDataTexture(255, 255, 255, 255);
  const emptyDark = createSolidDataTexture(24, 18, 15, 255);
  const emptyCotton = createSolidDataTexture(246, 241, 231, 255);

  const uniforms = {
    tBackground: { value: initialTextures.tBackground || emptyDark },
    tSubject: { value: initialTextures.tSubject || emptyTransparent },
    tEffects: { value: initialTextures.tEffects || emptyTransparent },
    tLine: { value: initialTextures.tLine || emptyWhite },
    tText: { value: initialTextures.tText || emptyTransparent },
    tBack: { value: initialTextures.tBack || emptyCotton },
    uTime: { value: 0 },
    uView: { value: new THREE.Vector3(0, 0, 1) },
    uFit: { value: new THREE.Vector2(1, 1) },
    uSafeScale: { value: 1 },
    uSafeOffset: { value: new THREE.Vector2(0, 0) },
    uFoil: { value: 0.62 },
    uScale: { value: 1.0 },
    uDepth: { value: 0.32 },
    uFxDepth: { value: 0.44 },
    uBgDepth: { value: -0.22 },
    uFinish: { value: FINISH_MAP.gold },
    uHasLine: { value: 1 },
    uHasFx: { value: 1 },
    uRelief: { value: 0 },
    uThemeLight: { value: 0.0 },
  };

  const makeMat = (fragmentShader, opts = {}) =>
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: CARD_VERTEX_SHADER,
      fragmentShader,
      side: THREE.FrontSide,
      transparent: Boolean(opts.transparent),
      depthWrite: opts.depthWrite ?? true,
      depthTest: opts.depthTest ?? true,
    });

  const materials = {
    web_front: makeMat(FRONT_FRAGMENT_SHADER),
    web_back: makeMat(BACK_FRAGMENT_SHADER),
    web_edge: makeMat(EDGE_FRAGMENT_SHADER),
    web_subject: makeMat(SUBJECT_FRAGMENT_SHADER, { transparent: true, depthWrite: true }),
    web_effects: makeMat(EFFECTS_FRAGMENT_SHADER, { transparent: true, depthWrite: false }),
    // Keep relief typography/gold border hugged tight to the beveled card face (Z=+0.095)
    // while always remaining legible over floating subject/effects (FrontSide culls on back flip)
    web_text: makeMat(TEXT_FRAGMENT_SHADER, { transparent: true, depthWrite: false, depthTest: false }),
  };

  const fallbackTextures = [emptyTransparent, emptyWhite, emptyDark, emptyCotton];

  return {
    uniforms,
    materials,
    dispose() {
      for (const mat of Object.values(materials)) {
        mat.dispose();
      }
      for (const tex of fallbackTextures) {
        tex.dispose();
      }
    },
  };
}
