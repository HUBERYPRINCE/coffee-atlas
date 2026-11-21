import * as THREE from 'three';

/**
 * Procedural 5:7.5 (2:3 exact) collector card geometry with beveled metallic edges
 * and toggleable physical relief layers — zero external Blender / .glb dependency.
 *
 * Coordinate & UV convention:
 * - Card spans X: [-2.5, +2.5], Y: [-3.75, +3.75], outer corner radius = 0.30.
 * - Bevel wraps 0.02 inward, leaving flat front/back faces of 4.96 x 7.46 (radius 0.28)
 *   sitting at Z = +/- 0.080.
 * - web_front sits at Z = +0.082 facing +Z with standard UVs (0..1 left->right, bottom->top).
 * - web_back sits at Z = -0.082 rotated Y = PI (normal faces -Z in local space; when card flips
 *   by PI, normal faces +Z and UVs read left->right, bottom->top with zero mirroring).
 * - Relief layers (web_subject, web_effects, web_text) float in front of web_front when uRelief = 1.
 */

export const CARD_DIMENSIONS = Object.freeze({
  width: 5.0,
  height: 7.5,
  radius: 0.30,
  depth: 0.12,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 4,
  curveSegments: 24,
  faceZ: 0.082,
  reliefZ: {
    text: 0.095,
    subject: 0.155,
    effects: 0.215,
  },
});

/**
 * Create a centered rounded-rectangle THREE.Shape.
 */
export function createRoundedRectShape(width, height, radius) {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);
  const shape = new THREE.Shape();

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);

  return shape;
}

/**
 * Normalize planar UV coordinates to [0, 1] x [0, 1] across a centered box of (width, height).
 * Bottom-left = (0, 0), Top-right = (1, 1) — matches Three.js CanvasTexture (flipY = true)
 * and physical positive-up Y parallax math.
 */
function normalizePlanarUVs(geometry, width, height) {
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  const invW = 1 / width;
  const invH = 1 / height;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv[i * 2] = THREE.MathUtils.clamp(x * invW + 0.5, 0, 1);
    uv[i * 2 + 1] = THREE.MathUtils.clamp(y * invH + 0.5, 0, 1);
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

/**
 * Normalize edge/bevel UVs continuously around the card body so holographic foil sweeps
 * smoothly along the chamfered rim.
 */
function normalizeEdgeUVs(geometry, width, height, totalThickness) {
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  const invW = 1 / width;
  const invH = 1 / height;
  const invZ = totalThickness > 0 ? 1 / totalThickness : 1;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Blend slight Z phase into U so metallic edge shimmer shifts across the card thickness
    const u = THREE.MathUtils.clamp(x * invW + 0.5 + z * invZ * 0.08, 0, 1);
    const v = THREE.MathUtils.clamp(y * invH + 0.5, 0, 1);
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

/**
 * Build the complete procedural collector card mesh hierarchy.
 *
 * @param {object} materials Map containing:
 *   web_front, web_back, web_edge, web_subject, web_effects, web_text
 * @returns {{
 *   group: THREE.Group,
 *   meshes: { front, back, edge, subject, effects, text },
 *   reliefLayers: { subject: THREE.Mesh[], effects: THREE.Mesh[], text: THREE.Mesh[] },
 *   geometries: THREE.BufferGeometry[],
 *   dispose: () => void
 * }}
 */
export function buildCardAssembly(materials) {
  const {
    width,
    height,
    radius,
    depth,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments,
    faceZ,
    reliefZ,
  } = CARD_DIMENSIONS;

  // Inner flat face size so extruded bevel expands outward to exact 5.0 x 7.5 (r = 0.30)
  const faceWidth = width - bevelSize * 2;
  const faceHeight = height - bevelSize * 2;
  const faceRadius = Math.max(0.05, radius - bevelSize);

  const innerShape = createRoundedRectShape(faceWidth, faceHeight, faceRadius);

  // 1. Solid beveled card body (web_edge)
  const edgeGeo = new THREE.ExtrudeGeometry(innerShape, {
    depth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments,
  });
  edgeGeo.translate(0, 0, -depth / 2);
  edgeGeo.computeVertexNormals();
  normalizeEdgeUVs(edgeGeo, width, height, depth + bevelThickness * 2);

  // 2. Shared flat rounded face geometry for front, back, and relief planes
  const faceGeo = new THREE.ShapeGeometry(innerShape, curveSegments);
  faceGeo.computeVertexNormals();
  normalizePlanarUVs(faceGeo, faceWidth, faceHeight);

  const group = new THREE.Group();
  group.name = 'coffee_holo_card';

  const edgeMesh = new THREE.Mesh(edgeGeo, materials.web_edge);
  edgeMesh.name = 'web_edge';
  edgeMesh.renderOrder = 0;

  const frontMesh = new THREE.Mesh(faceGeo, materials.web_front);
  frontMesh.name = 'web_front';
  frontMesh.position.set(0, 0, faceZ);
  frontMesh.renderOrder = 1;

  const backMesh = new THREE.Mesh(faceGeo, materials.web_back);
  backMesh.name = 'web_back';
  backMesh.position.set(0, 0, -faceZ);
  backMesh.rotation.y = Math.PI;
  backMesh.renderOrder = 1;

  // 3. Dedicated physical relief planes (hidden when uRelief = 0, revealed when uRelief = 1)
  const subjectMesh = new THREE.Mesh(faceGeo, materials.web_subject);
  subjectMesh.name = 'web_subject';
  subjectMesh.position.set(0, 0, reliefZ.subject);
  subjectMesh.visible = false;
  subjectMesh.renderOrder = 2;
  subjectMesh.userData.baseZ = reliefZ.subject;
  subjectMesh.userData.baseScale = new THREE.Vector3(1, 1, 1);

  const effectsMesh = new THREE.Mesh(faceGeo, materials.web_effects);
  effectsMesh.name = 'web_effects';
  effectsMesh.position.set(0, 0, reliefZ.effects);
  effectsMesh.visible = false;
  effectsMesh.renderOrder = 3;
  effectsMesh.userData.baseZ = reliefZ.effects;
  effectsMesh.userData.baseScale = new THREE.Vector3(1, 1, 1);

  const textMesh = new THREE.Mesh(faceGeo, materials.web_text);
  textMesh.name = 'web_text';
  textMesh.position.set(0, 0, reliefZ.text);
  textMesh.visible = false;
  textMesh.renderOrder = 4;
  textMesh.userData.baseZ = reliefZ.text;
  textMesh.userData.baseScale = new THREE.Vector3(1, 1, 1);

  group.add(edgeMesh, frontMesh, backMesh, subjectMesh, effectsMesh, textMesh);

  const geometries = [edgeGeo, faceGeo];

  return {
    group,
    meshes: {
      front: frontMesh,
      back: backMesh,
      edge: edgeMesh,
      subject: subjectMesh,
      effects: effectsMesh,
      text: textMesh,
    },
    reliefLayers: {
      subject: [subjectMesh],
      effects: [effectsMesh],
      text: [textMesh],
    },
    geometries,
    dispose() {
      for (const geo of geometries) {
        geo.dispose();
      }
    },
  };
}
