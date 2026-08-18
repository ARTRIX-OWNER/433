const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let filePath = path.join(ROOT, decoded);
  const resolved = path.resolve(filePath);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return null;
  }
  return resolved;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = safeResolve(urlPath);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (urlPath === '/' || urlPath === '/login' || urlPath === '/sign-up') {
    if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else if (urlPath === '/login' && fs.existsSync(path.join(ROOT, 'login.html'))) {
      filePath = path.join(ROOT, 'login.html');
    } else if (urlPath === '/sign-up' && fs.existsSync(path.join(ROOT, 'sign-up', 'index.html'))) {
      filePath = path.join(ROOT, 'sign-up', 'index.html');
    } else {
      filePath = path.join(ROOT, 'index.html');
    }
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const isAsset = ['.js', '.mjs', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.otf'].includes(ext);
    if (isAsset) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    if (fs.existsSync(path.join(ROOT, 'index.html'))) {
      filePath = path.join(ROOT, 'index.html');
    } else {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  fs.createReadStream(filePath)
    .on('error', () => {
      res.writeHead(404);
      res.end('Not Found');
    })
    .pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
