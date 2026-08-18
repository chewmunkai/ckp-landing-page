// Static file server for the CKP webinar landing page.
//
// The page must be served over HTTP — opening the HTML from the filesystem fails,
// because Babel Standalone fetches the .jsx files over XHR and file:// blocks that.
//
//   node serve.js            -> http://localhost:4173
//   PORT=8080 node serve.js  -> http://localhost:8080

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const ENTRY = '/index.html';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = ENTRY;

  const file = path.join(ROOT, rel);
  if (!path.resolve(file).startsWith(path.resolve(ROOT))) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden');
    return;
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      console.log(`404 ${rel}`);
      res.writeHead(404, { 'content-type': 'text/plain' }).end(`not found: ${rel}`);
      return;
    }
    console.log(`200 ${rel}`);
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    }).end(buf);
  });
}).listen(PORT, () => {
  console.log(`CKP landing page  ->  http://localhost:${PORT}`);
});
