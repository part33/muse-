import assert from 'node:assert/strict';
import { once } from 'node:events';
import { copyFile, mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { createPreviewServer } from './preview-server.mjs';

let fixture;
let root;
let server;
let port;

async function listen(instance) {
  instance.listen(0, '127.0.0.1');
  await once(instance, 'listening');
  return instance.address().port;
}

function get(path, method = 'GET', targetPort = port) {
  return new Promise((resolveResponse, reject) => {
    const req = request({ hostname: '127.0.0.1', port: targetPort, path, method, agent: false }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolveResponse({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString(),
      }));
      response.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

before(async () => {
  fixture = await mkdtemp(join(tmpdir(), 'portfolio-preview-test-'));
  root = join(fixture, 'site');
  await mkdir(join(root, 'case'), { recursive: true });
  await mkdir(join(root, 'empty'));
  await mkdir(join(fixture, 'site-private'));
  await writeFile(join(root, 'index.html'), '<h1>Home</h1>');
  await writeFile(join(root, 'case', 'index.html'), '<h1>Case</h1>');
  await writeFile(join(root, '资料 介绍.md'), 'Portfolio notes');
  await writeFile(join(fixture, 'site-private', 'secret.txt'), 'Private content');
  for (const name of ['hero.png', 'hero.jpg', 'hero.jpeg', 'hero.webp', 'README.md', 'app.css']) {
    await writeFile(join(root, name), `Content: ${name}`);
  }
  server = createPreviewServer({ root });
  port = await listen(server);
});

after(async () => {
  if (server) await new Promise((done) => server.close(done));
  if (fixture) {
    const path = relative(resolve(tmpdir()), resolve(fixture));
    assert.ok(!isAbsolute(path) && !path.startsWith('..') && path.startsWith('portfolio-preview-test-'));
    await rm(fixture, { recursive: true, force: true });
  }
});

test('serves the homepage and directory index pages, including query strings', async () => {
  assert.equal((await get('/')).body, '<h1>Home</h1>');
  for (const path of ['/case', '/case/', '/case/?from=home']) {
    const response = await get(path);
    assert.equal(response.status, 200);
    assert.equal(response.body, '<h1>Case</h1>');
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
  }
  assert.equal((await get(`/${encodeURIComponent('资料 介绍.md')}`)).body, 'Portfolio notes');
});

test('sends image, Markdown and stylesheet MIME types and supports HEAD', async () => {
  const expectedTypes = {
    'hero.png': 'image/png',
    'hero.jpg': 'image/jpeg',
    'hero.jpeg': 'image/jpeg',
    'hero.webp': 'image/webp',
    'README.md': 'text/markdown; charset=utf-8',
    'app.css': 'text/css; charset=utf-8',
  };
  for (const [name, type] of Object.entries(expectedTypes)) {
    const response = await get(`/${name}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], type);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.body, `Content: ${name}`);
  }
  const response = await get('/case/', 'HEAD');
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-length'], String(Buffer.byteLength('<h1>Case</h1>')));
  assert.equal(response.body, '');
});

test('returns 404 for missing files and directories without an index', async () => {
  for (const path of ['/missing.js', '/case/missing.html', '/empty/', '/index.html/missing']) {
    const response = await get(path);
    assert.equal(response.status, 404);
    assert.equal(response.body, 'Not found');
  }
  const response = await get('/missing.html', 'HEAD');
  assert.equal(response.status, 404);
  assert.equal(response.body, '');
});

test('rejects unsupported methods without serving files', async () => {
  const response = await get('/', 'POST');
  assert.equal(response.status, 405);
  assert.equal(response.headers.allow, 'GET, HEAD');
});

test('handles malformed URL encodings and stays available afterwards', async () => {
  for (const path of ['/%ZZ', '/%E0%A4%A', '/%00']) {
    assert.equal((await get(path)).status, 400);
  }
  assert.equal((await get('/')).status, 200);
});

test('blocks encoded traversal, including sibling directories with the same prefix', async () => {
  for (const path of ['/..%2fsite-private%2fsecret.txt', '/..%5csite-private%5csecret.txt']) {
    const response = await get(path);
    assert.equal(response.status, 403);
    assert.ok(!response.body.includes('Private content'));
  }
});

test('does not follow directory junctions or symlinks outside the preview root', async (t) => {
  try {
    await symlink(join(fixture, 'site-private'), join(root, 'external'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) {
      t.skip('This environment does not permit symlinks');
      return;
    }
    throw error;
  }
  assert.equal((await get('/external/secret.txt')).status, 403);
});

test('keeps serving requests after a client aborts a file download', async () => {
  await writeFile(join(root, 'large.bin'), Buffer.alloc(4 * 1024 * 1024));
  await new Promise((done, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path: '/large.bin', agent: false }, (response) => {
      response.once('data', () => {
        req.destroy();
        done();
      });
    });
    req.on('error', (error) => {
      if (error.code !== 'ECONNRESET') reject(error);
    });
    req.end();
  });
  const response = await get('/');
  assert.equal(response.status, 200);
  assert.equal(response.body, '<h1>Home</h1>');
});

test('resolves the default dist directory relative to the script, independently of cwd', async () => {
  const project = join(fixture, 'other-project');
  const script = join(project, 'scripts', 'preview-server.mjs');
  await mkdir(join(project, 'scripts'), { recursive: true });
  await mkdir(join(project, 'dist'));
  await copyFile(new URL('./preview-server.mjs', import.meta.url), script);
  await writeFile(join(project, 'dist', 'index.html'), '<h1>Script-relative site</h1>');
  const { createPreviewServer: createOtherServer } = await import(pathToFileURL(script));
  const otherServer = createOtherServer();
  const otherPort = await listen(otherServer);
  try {
    const response = await get('/', 'GET', otherPort);
    assert.equal(response.status, 200);
    assert.equal(response.body, '<h1>Script-relative site</h1>');
  } finally {
    await new Promise((done) => otherServer.close(done));
  }
});
