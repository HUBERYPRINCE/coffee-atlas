#!/usr/bin/env node
/**
 * Static web bundle builder for GitHub Pages / static hosting (_site/).
 * Emits:
 *   _site/index.html           (loads local minified CSS + bundled JS; lazy-fetches WebP hero art)
 *   _site/atelier-dark.css
 *   _site/app.bundle.js
 *   _site/assets/hero-beans/   (all 16 hero layer sets / 48 WebP layers, cached cleanly by browser)
 *   _site/standalone.html      (optional single-file offline copy if dist/coffee-atlas-3d-standalone.html exists)
 *   _site/.nojekyll
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
const STANDALONE_PATH = path.join(ROOT_DIR, 'dist', 'coffee-atlas-3d-standalone.html');
const SITE_DIR = path.join(ROOT_DIR, '_site');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      count += await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
      count++;
    }
  }
  return count;
}

async function buildPages() {
  const startTime = Date.now();

  await fs.rm(SITE_DIR, { recursive: true, force: true });
  await fs.mkdir(SITE_DIR, { recursive: true });

  const [templateHtml, rawCss] = await Promise.all([
    fs.readFile(INDEX_HTML_PATH, 'utf8'),
    fs.readFile(CSS_PATH, 'utf8'),
  ]);

  // 1. Minify CSS
  const cssTransformed = await esbuild.transform(rawCss, {
    loader: 'css',
    minify: true,
    target: ['chrome100', 'safari15', 'firefox100'],
  });
  const minifiedCss = cssTransformed.code.trim();
  await fs.writeFile(path.join(SITE_DIR, 'atelier-dark.css'), minifiedCss, 'utf8');

  // 2. Bundle JS + Three.js + data + engine + art + UI
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
      __STANDALONE_BUILD__: 'false',
    },
  });

  if (!jsBundleResult.outputFiles || jsBundleResult.outputFiles.length === 0) {
    throw new Error('esbuild produced no output bundle.');
  }
  const bundledJs = jsBundleResult.outputFiles[0].text.trim();
  await fs.writeFile(path.join(SITE_DIR, 'app.bundle.js'), bundledJs, 'utf8');

  // 3. Rewrite index.html to point to local bundled CSS & JS (zero node_modules / CDN)
  let html = templateHtml;
  const cssLinkRegex = /<link\s+rel=["']stylesheet["']\s+href=["']\.\/src\/styles\/atelier-dark\.css["']\s*\/?>/i;
  if (!cssLinkRegex.test(html)) {
    throw new Error('Could not locate stylesheet link in index.html');
  }
  html = html.replace(cssLinkRegex, '<link rel="stylesheet" href="./atelier-dark.css" />');

  const importMapRegex = /<!--\s*STANDALONE_IMPORTMAP_START\s*-->[\s\S]*?<!--\s*STANDALONE_IMPORTMAP_END\s*-->/i;
  html = html.replace(importMapRegex, '');

  const assetsHookRegex = /<!--\s*STANDALONE_INLINE_ASSETS_HOOK\s*-->/i;
  html = html.replace(assetsHookRegex, '');

  const scriptBlockRegex = /<!--\s*STANDALONE_SCRIPT_START\s*-->[\s\S]*?<!--\s*STANDALONE_SCRIPT_END\s*-->/i;
  if (!scriptBlockRegex.test(html)) {
    throw new Error('Could not locate STANDALONE_SCRIPT_START/END in index.html');
  }
  html = html.replace(scriptBlockRegex, '<script defer src="./app.bundle.js"></script>');

  const stamp = `<!-- Coffee-Atlas-3D Web Pages Edition | Built ${new Date().toISOString()} -->\n`;
  await fs.writeFile(path.join(SITE_DIR, 'index.html'), stamp + html, 'utf8');

  // 4. Copy hero layered WebP assets
  let assetCount = 0;
  if (await pathExists(HERO_ASSETS_DIR)) {
    assetCount = await copyDir(HERO_ASSETS_DIR, path.join(SITE_DIR, 'assets', 'hero-beans'));
  }

  // 5. Copy standalone offline HTML as /standalone.html if available
  let hasStandalone = false;
  if (await pathExists(STANDALONE_PATH)) {
    await fs.copyFile(STANDALONE_PATH, path.join(SITE_DIR, 'standalone.html'));
    hasStandalone = true;
  }

  // 6. Disable Jekyll processing on GitHub Pages
  await fs.writeFile(path.join(SITE_DIR, '.nojekyll'), '', 'utf8');

  const elapsed = Date.now() - startTime;
  console.log('');
  console.log('=== Coffee-Atlas-3D GitHub Pages Build Summary ===');
  console.log(`Output Dir:     _site/`);
  console.log(`CSS:            ${formatBytes(Buffer.byteLength(minifiedCss, 'utf8'))}`);
  console.log(`JS Bundle:      ${formatBytes(Buffer.byteLength(bundledJs, 'utf8'))}`);
  console.log(`Hero WebPs:     ${assetCount} files`);
  console.log(`Standalone:     ${hasStandalone ? '_site/standalone.html included' : 'skipped'}`);
  console.log(`Build Time:     ${elapsed} ms`);
  console.log('==================================================');
  console.log('');
}

buildPages().catch((err) => {
  console.error('[build-pages] Build failed:', err);
  process.exit(1);
});
