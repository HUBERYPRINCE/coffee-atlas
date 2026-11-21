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

// Vivid jewel-saturated 7-color prismatic rainbow spectral curve (zero chalky pastel floor)
vec3 spectrum(float phase) {
  return 0.54 + 0.44 * cos(6.2831853 * (phase + vec3(0.0, 0.33, 0.67)));
}

// "original" (uFinish == 2) turns off metallic laminate while preserving artwork.
float strength() {
  return abs(uFinish - 2.0) < 0.05 ? 0.0 : uFoil;
}

// Diagonal micro-groove anisotropic holographic diffraction grating
float microGroove(vec2 uv) {
  return 0.5 + 0.5 * sin(uv.x * 165.0 + uv.y * 105.0 + uView.x * 26.0 - uView.y * 14.0);
}

// View-angle + gentle time-flowing holographic film color (Molten Champagne Gold / Vivid 7-Color Holo / Brushed Platinum).
vec3 film(vec2 uv) {
  float flow = uTime * 0.085;
  float phase = uv.x * 0.88 + uv.y * 0.58 + uView.x * 1.55 - uView.y * 0.95 + flow;

  if (uFinish > 2.5) {
    // 烫金流光 (radiant molten champagne gold with subtle rainbow micro-diffraction)
    float hi = 0.5 + 0.5 * sin(phase * 6.2831853);
    float glint = 0.5 + 0.5 * cos((phase + 0.22) * 6.2831853);
    float sheen = pow(max(0.5 + 0.5 * sin((phase * 1.42 - 0.10) * 6.2831853), 0.0001), 2.0);
    vec3 warmGold = vec3(0.90, 0.65, 0.20);
    vec3 moltenGold = vec3(1.00, 0.82, 0.36);
    vec3 champagne = vec3(1.00, 0.94, 0.72);
    vec3 baseGold = mix(warmGold, moltenGold, hi * 0.60 + glint * 0.40);
    vec3 goldTone = mix(baseGold, champagne, sheen * 0.58);
    vec3 prismWhisper = spectrum(phase * 1.08);
    return mix(goldTone, prismWhisper, 0.14);
  }

  if (uFinish > 0.5 && uFinish < 1.5) {
    // 银箔流光 (crisp brushed platinum-silver foil with cool ice-rainbow glint)
    float brush = 0.5 + 0.5 * sin((uv.x * 1.15 - uv.y * 0.35 + uView.x * 1.8 - uView.y * 0.7 + flow) * 6.2831853);
    float specBand = pow(max(0.5 + 0.5 * sin((phase * 1.25 + 0.18) * 6.2831853), 0.0001), 2.2);
    vec3 coolSteel = vec3(0.74, 0.81, 0.90);
    vec3 brushedPlat = vec3(0.91, 0.95, 0.99);
    vec3 iceGlint = vec3(0.98, 1.00, 1.00);
    vec3 baseSilver = mix(coolSteel, brushedPlat, brush * 0.72 + 0.28);
    vec3 silverTone = mix(baseSilver, iceGlint, specBand * 0.55);
    return mix(silverTone, spectrum(phase * 1.15), 0.16);
  }

  // 七彩珠光 (vivid crystal-clear 7-color prismatic rainbow holo refraction)
  vec3 primaryRainbow = spectrum(phase * 1.18 + uView.x * 0.45);
  vec3 secondaryNacre = spectrum(phase * 0.82 - uv.y * 0.42 + 0.31);
  return mix(primaryRainbow, secondaryNacre, 0.34);
}

// Tight, crisp, zero-floor specular ribbon sweeps driven by local viewing angle + gentle time drift.
float sweep(vec2 uv) {
  float flow = uTime * 0.14;
  float primary = pow(max(0.5 + 0.5 * sin((uv.x * 0.78 + uv.y * 0.48 + uView.x * 1.25 + uView.y * 0.65 - flow) * 6.2831853), 0.0001), 11.0);
  float secondary = pow(max(0.5 + 0.5 * sin((uv.x * 0.48 - uv.y * 0.62 + uView.x * 0.90 - uView.y * 0.78 + flow * 0.7 + 0.3) * 6.2831853), 0.0001), 15.0);
  return clamp(primary + secondary * 0.45, 0.0, 1.35);
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
  float subjectInside = inside(su);
  subject.a *= subjectInside;
  float subjectMask = subject.a * (1.0 - uRelief);

  vec3 bg = texture2D(tBackground, clamp(bu, 0.0, 1.0)).rgb;
  vec3 col = mix(bg, subject.rgb, subjectMask);

  // Preserve 100% razor-sharp, deeply saturated artwork & true deep blacks (zero fog floor)
  float baseLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(baseLuma), col, 1.14), 0.0, 1.0);
  // Subtle black-preserving S-curve contrast enhancement (0 -> 0, 1 -> 1)
  vec3 sCurve = col * col * (3.0 - 2.0 * col);
  col = mix(col, sCurve, 0.12);

  // Mid-depth botanical/aromatic effects layer between subject and typography
  vec4 fx = texture2D(tEffects, clamp(eu, 0.0, 1.0));
  float fxMask = fx.a * inside(eu) * (1.0 - uRelief) * uHasFx;
  col = mix(col, fx.rgb, fxMask);

  vec3 foil = film(uv);
  float amount = strength();
  float band = sweep(uv);
  float bandTight = band * pow(max(band, 0.0001), 0.6); // exact zero-floor pow(band, 1.6)
  float bandRibbon = band * pow(max(band, 0.0001), 0.25); // exact zero-floor pow(band, 1.25)
  float groove = microGroove(uv);

  bool isGold = uFinish > 2.5;
  bool isSilver = uFinish > 0.5 && uFinish < 1.5;
  bool isPearl = uFinish < 0.5;

  // Full-Art collector card subject protection: brilliant foil on background & floating effects,
  // crystal-clear hero botanical subject with zero milky veil
  float bgWeight = 1.0 - subjectMask * 0.72;
  float grooveWeight = clamp(1.0 - subjectMask * 0.88 + fxMask * 0.65, 0.0, 1.0);

  // Zero-floor multiplicative jewel-boost + crisp narrow specular highlight
  // (gleams like lacquered metallic foil without ever lifting blacks or washing out saturation)
  col *= 1.0 + foil * amount * band * 0.38 * bgWeight;
  col += foil * amount * bandTight * 0.16 * bgWeight;

  // Floating aromatic effects (petals, sparks, mist) catch vivid specular sparkle
  col += foil * amount * bandRibbon * fxMask * 0.22;

  // Zero-floor diagonal micro-groove anisotropic holographic diffraction (strictly gated by band)
  float grooveGate = grooveWeight * smoothstep(0.05, 0.65, band);
  if (isPearl) {
    float pPhase = uv.x * 1.05 + uv.y * 0.72 + uView.x * 2.05 - uView.y * 1.15 + uTime * 0.14 + groove * 0.28;
    vec3 prism = spectrum(pPhase);
    float nacreSpec = pow(max(groove, 0.0001), 2.1) * bandRibbon;
    col *= 1.0 + prism * amount * nacreSpec * 0.34 * bgWeight;
    col += prism * amount * nacreSpec * 0.18 * grooveGate;
  } else if (isSilver) {
    float brushSpec = pow(max(groove, 0.0001), 2.5) * bandRibbon;
    col *= 1.0 + vec3(0.92, 0.96, 1.00) * amount * brushSpec * 0.28 * bgWeight;
    col += vec3(0.92, 0.96, 1.00) * amount * brushSpec * 0.17 * grooveGate;
  } else if (isGold) {
    float goldSpec = pow(max(groove, 0.0001), 2.1) * bandRibbon;
    vec3 goldPrism = mix(vec3(1.00, 0.88, 0.46), spectrum(uv.x * 1.0 + uv.y * 0.65 + uView.x * 1.45 + uTime * 0.12), 0.36);
    col *= 1.0 + goldPrism * amount * goldSpec * 0.30 * bgWeight;
    col += goldPrism * amount * goldSpec * 0.16 * grooveGate;
  }

  // Crisp live specular edge glint along the hero subject silhouette (keeps interior 100% pure)
  if (subjectMask > 0.42 && amount > 0.001 && band > 0.02) {
    vec2 spx = vec2(2.0 / 1024.0, 2.0 / 1536.0);
    float aMin = min(
      min(texture2D(tSubject, clamp(su + vec2(spx.x, 0.0), 0.0, 1.0)).a,
          texture2D(tSubject, clamp(su - vec2(spx.x, 0.0), 0.0, 1.0)).a),
      min(texture2D(tSubject, clamp(su + vec2(0.0, spx.y), 0.0, 1.0)).a,
          texture2D(tSubject, clamp(su - vec2(0.0, spx.y), 0.0, 1.0)).a)
    );
    float subjectRim = smoothstep(0.45, 0.85, subjectMask) * (1.0 - smoothstep(0.15, 0.65, aMin));
    vec3 rimColor = isGold ? vec3(1.00, 0.91, 0.56) : (isSilver ? vec3(0.93, 0.97, 1.00) : foil);
    col += rimColor * subjectRim * band * 0.44 * amount;
  }

  // Radiant molten champagne-gold / prismatic bezel halo along card perimeter
  float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float edge = 1.0 - smoothstep(0.012, 0.046, edgeDist);
  float edgeGain = isGold ? 0.68 : (isSilver ? 0.58 : 0.64);
  vec3 bezelFoil = isGold
    ? mix(foil, spectrum(uv.x * 1.15 + uv.y * 0.85 + uView.x * 1.6 + uTime * 0.12), 0.24)
    : foil;
  vec3 edgeSheen = bezelFoil * (0.84 + band * 0.32) + vec3(0.10) * bandTight;
  col = mix(col, clamp(edgeSheen, 0.0, 1.0), edge * amount * edgeGain);

  // 480x720 micron holographic shimmer flakes (weighted to background/effects so hero art stays crystal-clear)
  vec2 cell = floor(uv * vec2(480.0, 720.0));
  float flake = step(0.9935, hash(cell)) *
    pow(max(0.5 + 0.5 * sin(hash(cell + 8.0) * 30.0 + uView.x * 20.0 + uView.y * 8.0 + uTime * 0.65), 0.0001), 14.0);
  col += foil * flake * amount * (isGold ? 0.24 : (isPearl ? 0.26 : 0.19)) * (0.18 + 0.82 * bgWeight);

  // White-ground black-line botanical engraving glint (co-registered with subject parallax)
  float lineMask = (1.0 - smoothstep(0.08, 0.32, texture2D(tLine, clamp(su, 0.0, 1.0)).r)) * uHasLine;
  float lineWeight = subjectInside * max(subject.a, 0.25) * (1.0 - uRelief);
  vec3 lineColor = isGold
    ? mix(vec3(1.00, 0.90, 0.54), spectrum(uv.x * 1.1 + uv.y * 0.7 + uView.x * 1.5 + uTime * 0.12), 0.24)
    : (isSilver ? vec3(0.92, 0.97, 1.0) : foil);
  float lineGain = isGold
    ? (0.025 + band * 0.36 + groove * band * 0.14)
    : (0.020 + band * 0.32 + groove * band * 0.12);
  col += lineColor * lineMask * lineWeight * lineGain * amount;

  // Zero-parallax locked gilded frame & typography overlay (stays razor-sharp & gleams like live hot-stamped foil)
  vec4 text = texture2D(tText, uv);
  vec3 textCol = text.rgb;
  float textGoldMask = smoothstep(0.45, 0.78, text.r) * (1.0 - smoothstep(0.68, 0.94, text.b));
  vec3 textFoil = isGold
    ? mix(foil, spectrum(uv.x * 1.2 + uv.y * 0.8 + uView.x * 1.8 + uTime * 0.12), 0.22)
    : foil;
  textCol *= 1.0 + textFoil * (0.10 + band * 0.46) * amount * textGoldMask;
  textCol += textFoil * (band * 0.48 + groove * band * 0.24) * amount * textGoldMask * 0.36;
  col = mix(col, clamp(textCol, 0.0, 1.0), text.a * (1.0 - uRelief));

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
  float fresnel = pow(max(1.0 - ndotv, 0.0001), 2.2);
  float spec = pow(max(clamp(dot(n, normalize(viewDir + vec3(0.28, 0.36, 0.45))), 0.0, 1.0), 0.0001), 10.0);
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
    // Mirror-bright molten champagne-gold & prismatic bevel
    vec3 base = mix(vec3(0.76, 0.57, 0.24), vec3(1.00, 0.88, 0.54), ndotv * 0.65 + 0.30);
    vec3 edgePrism = mix(film(vUv), spectrum(vUv.x * 1.2 + vUv.y * 0.8 + uView.x * 1.5 + uTime * 0.12), 0.24);
    col = mix(base, edgePrism * 0.80 + 0.20, amt * 0.74);
    col += vec3(1.0, 0.96, 0.78) * (spec * 0.52 + band * 0.34 + groove * band * 0.18 + fresnel * 0.24) * max(amt, 0.45);
  } else if (uFinish > 0.5 && uFinish < 1.5) {
    // Luminous brushed platinum silver bevel
    vec3 base = mix(vec3(0.64, 0.71, 0.78), vec3(0.94, 0.97, 1.00), ndotv * 0.65 + 0.28);
    col = mix(base, film(vUv) * 0.72 + 0.28, amt * 0.70);
    col += vec3(0.97, 0.99, 1.0) * (spec * 0.52 + band * 0.30 + groove * band * 0.18 + fresnel * 0.22) * max(amt, 0.45);
  } else {
    // Radiant 7-color prismatic mother-of-pearl bevel
    vec3 base = mix(vec3(0.76, 0.72, 0.74), vec3(0.96, 0.94, 0.96), ndotv * 0.65 + 0.28);
    col = mix(base, film(vUv) * 0.76 + 0.24, amt * 0.78);
    col += film(vUv) * (spec * 0.40 + band * 0.28 + fresnel * 0.18) * max(amt, 0.36);
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
  // Match front-card saturation & contrast curve with true deep blacks preserved
  float baseLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(baseLuma), col, 1.14), 0.0, 1.0);
  vec3 sCurve = col * col * (3.0 - 2.0 * col);
  col = mix(col, sCurve, 0.12);

  vec3 foil = film(vUv);
  float amt = strength();
  float band = sweep(vUv);
  float bandTight = band * pow(max(band, 0.0001), 0.6);
  float groove = microGroove(vUv);

  // Zero-floor varnished polish on floating hero relief subject (0.28 weight matches Full-Art protection)
  col *= 1.0 + foil * amt * band * 0.38 * 0.28;
  col += foil * amt * bandTight * 0.16 * 0.28;

  // Co-registered botanical engraving glint on relief subject
  float lineMask = (1.0 - smoothstep(0.08, 0.32, texture2D(tLine, su).r)) * uHasLine;
  bool isGold = uFinish > 2.5;
  bool isSilver = uFinish > 0.5 && uFinish < 1.5;
  vec3 lineColor = isGold
    ? mix(vec3(1.00, 0.90, 0.54), spectrum(vUv.x * 1.1 + vUv.y * 0.7 + uView.x * 1.5 + uTime * 0.12), 0.24)
    : (isSilver ? vec3(0.92, 0.97, 1.0) : foil);
  float lineGain = isGold
    ? (0.025 + band * 0.36 + groove * band * 0.14)
    : (0.020 + band * 0.32 + groove * band * 0.12);
  col += lineColor * lineMask * lineGain * amt;

  // Crisp gold/silver/prismatic die-cut contour highlight + live specular rim catch
  vec3 rimTint = isSilver ? vec3(0.86, 0.92, 0.98) : (isGold ? vec3(0.96, 0.80, 0.42) : foil);
  float dieRim = 1.0 - aMin;
  col = mix(col, rimTint, dieRim * 0.22);
  col += rimTint * dieRim * band * 0.38 * amt;

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

  float band = sweep(vUv);
  float bandRibbon = band * pow(max(band, 0.0001), 0.25);
  vec3 col = art.rgb + film(vUv) * bandRibbon * strength() * 0.24;
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
  float band = sweep(vUv);
  float groove = microGroove(vUv);
  float amt = strength();
  float goldMask = smoothstep(0.45, 0.78, art.r) * (1.0 - smoothstep(0.68, 0.94, art.b));
  vec3 foil = film(vUv);
  vec3 textFoil = uFinish > 2.5
    ? mix(foil, spectrum(vUv.x * 1.2 + vUv.y * 0.8 + uView.x * 1.8 + uTime * 0.12), 0.22)
    : foil;
  col *= 1.0 + textFoil * (0.10 + band * 0.46) * amt * goldMask;
  col += textFoil * (band * 0.48 + groove * band * 0.24) * amt * goldMask * 0.36;

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
    uFoil: { value: 0.72 },
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
