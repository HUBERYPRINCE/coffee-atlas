#!/usr/bin/env node
/**
 * Zero-dependency static development server for Coffee-Atlas-3D.
 * Usage: node scripts/dev-server.mjs [--port 4173] [--host 127.0.0.1]
 */

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

function parseArgs(argv) {
  let port = Number(process.env.PORT) || 4173;
  let host = process.env.HOST || '127.0.0.1';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port' || arg === '-p') {
      const next = Number(argv[i + 1]);
      if (Number.isFinite(next) && next > 0 && next < 65536) {
        port = next;
        i++;
      }
    } else if (arg.startsWith('--port=')) {
      const next = Number(arg.slice('--port='.length));
      if (Number.isFinite(next) && next > 0 && next < 65536) port = next;
    } else if (arg === '--host' || arg === '-h') {
      if (argv[i + 1]) {
        host = argv[i + 1];
        i++;
      }
    } else if (arg.startsWith('--host=')) {
      host = arg.slice('--host='.length) || host;
    }
  }

  return { port, host };
}

function resolveSafePath(urlPathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }

  const normalized = decoded === '/' ? '/index.html' : decoded;
  const fullPath = path.resolve(ROOT_DIR, `.${normalized}`);
  if (!fullPath.startsWith(ROOT_DIR)) {
    return null;
  }
  return fullPath;
}

async function handleRequest(req, res) {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const reqUrl = new URL(req.url || '/', 'http://localhost');
  let targetPath = resolveSafePath(reqUrl.pathname);
  if (!targetPath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  try {
    let stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
      stat = await fs.stat(targetPath);
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const data = await fs.readFile(targetPath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.byteLength,
      'Cache-Control': ext === '.webp' || ext === '.png' ? 'public, max-age=300' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });

    if (method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Not Found: ${reqUrl.pathname}`);
      return;
    }
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal Server Error: ${err?.message || 'unknown'}`);
  }
}

const { port, host } = parseArgs(process.argv.slice(2));
const server = http.createServer(handleRequest);

server.listen(port, host, () => {
  console.log(`[Coffee-Atlas-3D] Dev server running at http://${host}:${port}/`);
  console.log(`[Coffee-Atlas-3D] Serving root: ${ROOT_DIR}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
