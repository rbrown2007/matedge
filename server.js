#!/usr/bin/env node
/**
 * MatEdge Local Server
 * Run: node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.css':  'text/css',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html for SPA routing
      fs.readFile(path.join(DIR, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=86400',
      'Service-Worker-Allowed': '/'
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  ⚡ MatEdge is running!\n');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${getLocalIP()}:${PORT}  ← use this on your phone\n`);
  console.log('  Press Ctrl+C to stop.\n');
});

function getLocalIP() {
  const { networkInterfaces } = require('os');
  for (const iface of Object.values(networkInterfaces())) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) return alias.address;
    }
  }
  return 'your-local-ip';
}
