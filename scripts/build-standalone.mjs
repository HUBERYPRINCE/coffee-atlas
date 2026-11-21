#!/usr/bin/env node
/**
 * Single-file offline HTML bundler for Coffee-Atlas-3D.
 * Bundles Three.js + data + engine + art + UI with esbuild,
 * inlines CSS and any available hero-bean layered WebP/PNG assets
 * into dist/coffee-atlas-3d-standalone.html (zero network requests, file:// ready).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CSS_PATH = path.join(ROOT_DIR, 'src', 'styles', 'atelier-dark.css');
const ENTRY_JS_PATH = path.join(ROOT_DIR, 'src', 'main.js');
const HERO_ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'hero-beans');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_HTML_PATH = path.join(DIST_DIR, 'coffee-atlas-3d-standalone.html');

const LAYER_NAMES = ['bg', 'subject', 'lineart'];
const IMAGE_EXTS = [
  { ext: '.webp', mime: 'image/webp' },
  { ext: '.png', mime: 'image/png' },
  { ext: '.jpg', mime: 'image/jpeg' },
  { ext: '.jpeg', mime: 'image/jpeg' },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function escapeInlineScript(code) {
  return code.replace(/<\/script/gi, '<\\/script');
}

function escapeInlineStyle(css) {
  return css.replace(/<\/style/gi, '<\\/style');
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function collectHeroAssets() {
  const inlineAssets = {};
  let fileCount = 0;
  let rawBytes = 0;
  let encodedBytes = 0;

  if (!(await pathExists(HERO_ASSETS_DIR))) {
    return { inlineAssets, fileCount, rawBytes, encodedBytes };
  }

  const entries = await fs.readdir(HERO_ASSETS_DIR, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const heroDir = entry.name;
    const dirPath = path.join(HERO_ASSETS_DIR, heroDir);
    const layerMap = {};

    for (const layer of LAYER_NAMES) {
      for (const { ext, mime } of IMAGE_EXTS) {
        const candidate = path.join(dirPath, `${layer}${ext}`);
        if (await pathExists(candidate)) {
          const buf = await fs.readFile(candidate);
          const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
          layerMap[layer] = dataUri;
          fileCount++;
          rawBytes += buf.byteLength;
          encodedBytes += Buffer.byteLength(dataUri, 'utf8');
          break;
        }
      }
    }

    if (Object.keys(layerMap).length > 0) {
      inlineAssets[heroDir] = layerMap;
    }
  }

  return { inlineAssets, fileCount, rawBytes, encodedBytes };
}

async function buildStandalone() {
  const startTime = Date.now();

  const [templateHtml, rawCss, heroResult] = await Promise.all([
    fs.readFile(INDEX_HTML_PATH, 'utf8'),
    fs.readFile(CSS_PATH, 'utf8'),
    collectHeroAssets(),
  ]);

  // 1. Minify CSS
  const cssTransformed = await esbuild.transform(rawCss, {
    loader: 'css',
    minify: true,
    target: ['chrome100', 'safari15', 'firefox100'],
  });
  const minifiedCss = escapeInlineStyle(cssTransformed.code.trim());

  // 2. Bundle JS + Three.js + data + engine + art + UI into a single IIFE for file:// safety
  const jsBundleResult = await esbuild.build({
    entryPoints: [ENTRY_JS_PATH],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2020', 'chrome100', 'safari15', 'firefox100'],
    minify: true,
    legalComments: 'none',
    define: {
      'process.env.NODE_ENV': '"production"',
      __STANDALONE_BUILD__: 'true',
    },
  });

  if (!jsBundleResult.outputFiles || jsBundleResult.outputFiles.length === 0) {
    throw new Error('esbuild produced no output bundle.');
  }
  const bundledJs = escapeInlineScript(jsBundleResult.outputFiles[0].text.trim());

  // 3. Serialize inlined hero assets
  const inlineAssetsJson = escapeInlineScript(JSON.stringify(heroResult.inlineAssets));
  const inlineAssetsScript = `<script>window.__INLINE_HERO_ASSETS__=${inlineAssetsJson};</script>`;

  // 4. Assemble standalone HTML
  let html = templateHtml;

  // Replace stylesheet link with inlined <style>
  const cssLinkRegex = /<link\s+rel=["']stylesheet["']\s+href=["']\.\/src\/styles\/atelier-dark\.css["']\s*\/?>/i;
  if (!cssLinkRegex.test(html)) {
    throw new Error('Could not locate stylesheet link in index.html');
  }
  html = html.replace(cssLinkRegex, () => `<style>${minifiedCss}</style>`);

  // Strip importmap block (not needed when bundled)
  const importMapRegex = /<!--\s*STANDALONE_IMPORTMAP_START\s*-->[\s\S]*?<!--\s*STANDALONE_IMPORTMAP_END\s*-->/i;
  html = html.replace(importMapRegex, '');

  // Inject hero assets payload
  const assetsHookRegex = /<!--\s*STANDALONE_INLINE_ASSETS_HOOK\s*-->/i;
  if (!assetsHookRegex.test(html)) {
    throw new Error('Could not locate STANDALONE_INLINE_ASSETS_HOOK in index.html');
  }
  html = html.replace(assetsHookRegex, () => inlineAssetsScript);

  // Replace ES module entrypoint script with classic inline IIFE script
  const scriptBlockRegex = /<!--\s*STANDALONE_SCRIPT_START\s*-->[\s\S]*?<!--\s*STANDALONE_SCRIPT_END\s*-->/i;
  if (!scriptBlockRegex.test(html)) {
    throw new Error('Could not locate STANDALONE_SCRIPT_START/END in index.html');
  }
  html = html.replace(scriptBlockRegex, () => `<script>${bundledJs}</script>`);

  // Stamp build comment
  const stamp = `<!-- Coffee-Atlas-3D Standalone Offline Edition | Built ${new Date().toISOString()} -->\n`;
  html = stamp + html;

  await fs.mkdir(DIST_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_HTML_PATH, html, 'utf8');

  const cssBytes = Buffer.byteLength(minifiedCss, 'utf8');
  const jsBytes = Buffer.byteLength(bundledJs, 'utf8');
  const totalBytes = Buffer.byteLength(html, 'utf8');
  const elapsed = Date.now() - startTime;

  console.log('');
  console.log('=== Coffee-Atlas-3D Standalone Build Summary ===');
  console.log(`Output:         ${path.relative(ROOT_DIR, OUTPUT_HTML_PATH)}`);
  console.log(`Inlined CSS:    ${formatBytes(cssBytes)}`);
  console.log(`Bundled JS:     ${formatBytes(jsBytes)} (Three.js + 36 cards + shaders + UI)`);
  console.log(
    `Hero Assets:    ${Object.keys(heroResult.inlineAssets).length} hero layer sets, ${heroResult.fileCount} layers (${formatBytes(heroResult.rawBytes)} raw -> ${formatBytes(heroResult.encodedBytes)} base64)`,
  );
  console.log(`Total HTML:     ${formatBytes(totalBytes)}`);
  console.log(`Build Time:     ${elapsed} ms`);
  console.log('================================================');
  console.log('');
}

buildStandalone().catch((err) => {
  console.error('[build-standalone] Build failed:', err);
  process.exit(1);
});
