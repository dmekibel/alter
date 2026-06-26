// Generates a Higgsfield "custom server" (Cloudflare Durable Object) that serves
// ALTER's static client embedded inline (Workers have no filesystem at runtime).
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

const files = {
  '/index.html': { ct: 'text/html; charset=utf-8', body: read('index.html') },
  '/app.js': { ct: 'text/javascript; charset=utf-8', body: read('app.js') },
  '/manifest.json': { ct: 'application/json; charset=utf-8', body: read('manifest.json') },
};

const out = `import { DurableObject } from 'cloudflare:workers';
// ALTER — self-contained pixel-art life sim. Single-player; the engine forwards
// every request to fetch(); we just serve the embedded client.
const FILES = ${JSON.stringify(files)};
export class GameServer extends DurableObject {
  async fetch(request) {
    let p = new URL(request.url).pathname;
    if (p === '/' || p === '') p = '/index.html';
    const f = FILES[p] || FILES['/index.html'];
    return new Response(f.body, { headers: { 'content-type': f.ct, 'cache-control': 'no-cache' } });
  }
}
`;
fs.writeFileSync(path.join(dir, 'server.js'), out);
console.log('server.js written: ' + out.length + ' bytes');
