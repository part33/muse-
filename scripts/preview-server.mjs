import { open, realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../dist', import.meta.url));
const port = 5175;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function isInside(root, filePath) {
  const path = relative(root, filePath);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

function sendError(request, response, status, message, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(message),
    'Cache-Control': 'no-store',
    ...headers,
  });
  response.end(request.method === 'HEAD' ? undefined : message);
}

export function createPreviewServer({ root = defaultRoot } = {}) {
  const basePath = resolve(root);

  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      sendError(request, response, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
      return;
    }

    let pathname;
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      pathname = decodeURIComponent(url.pathname).replaceAll('\\', '/');
      if (pathname.includes('\0')) throw new URIError('Invalid path');
    } catch {
      sendError(request, response, 400, 'Bad request');
      return;
    }

    const requestedPath = resolve(basePath, `.${pathname}`);
    if (!isInside(basePath, requestedPath)) {
      sendError(request, response, 403, 'Forbidden');
      return;
    }

    try {
      const realRoot = await realpath(basePath);
      let filePath = await realpath(requestedPath);
      if (!isInside(realRoot, filePath)) {
        sendError(request, response, 403, 'Forbidden');
        return;
      }
      if ((await stat(filePath)).isDirectory()) {
        filePath = await realpath(join(filePath, 'index.html'));
        if (!isInside(realRoot, filePath)) {
          sendError(request, response, 403, 'Forbidden');
          return;
        }
      }

      const file = await open(filePath, 'r');
      try {
        const info = await file.stat();
        if (!info.isFile()) {
          sendError(request, response, 404, 'Not found');
          return;
        }
        response.writeHead(200, {
          'Content-Type': mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
          'Content-Length': info.size,
          'Cache-Control': 'no-store',
        });
        if (request.method === 'HEAD') {
          response.end();
          return;
        }
        await pipeline(file.createReadStream({ autoClose: false }), response);
      } finally {
        await file.close();
      }
    } catch (error) {
      if (response.headersSent) {
        response.destroy();
      } else if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        sendError(request, response, 404, 'Not found');
      } else if (error.code === 'EACCES' || error.code === 'EPERM') {
        sendError(request, response, 403, 'Forbidden');
      } else {
        sendError(request, response, 500, 'Internal server error');
      }
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createPreviewServer().listen(port, '127.0.0.1', () => {
    console.log(`Portfolio preview: http://127.0.0.1:${port}/`);
  });
}
