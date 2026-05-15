#!/usr/bin/env node
/**
 * MatEdge Local Server
 * Run: node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DIR = __dirname;

// Free key from https://api.nal.usda.gov — replace for production
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.css':  'text/css',
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function handleFoodSearch(req, res, query) {
  if (!query) { sendJSON(res, 400, { error: 'Missing query' }); return; }

  const usdaPath = `/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=25&api_key=${USDA_API_KEY}&dataType=Foundation,SR%20Legacy,Branded`;
  const options = {
    hostname: 'api.nal.usda.gov',
    path: usdaPath,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  const usdaReq = https.request(options, (usdaRes) => {
    let body = '';
    usdaRes.on('data', chunk => body += chunk);
    usdaRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        const foods = (data.foods || [])
          .filter(f => {
            const n = f.foodNutrients || [];
            return f.description && n.some(x => x.nutrientName && x.nutrientName.includes('Energy') && x.value > 0);
          })
          .map(f => {
            const getNutrient = (name) => {
              const n = (f.foodNutrients || []).find(x => x.nutrientName && x.nutrientName.includes(name));
              return n ? Math.round((n.value || 0) * 10) / 10 : 0;
            };
            return {
              name: f.description,
              brand: f.brandOwner || f.brandName || '',
              category: f.foodCategory || f.dataType || '',
              kcal: getNutrient('Energy'),
              protein: getNutrient('Protein'),
              carbs: getNutrient('Carbohydrate'),
              fat: getNutrient('Total lipid'),
              fiber: getNutrient('Fiber'),
              sugar: getNutrient('Sugars'),
              sodium: getNutrient('Sodium'),
              servingSize: f.servingSize || 100,
              servingUnit: f.servingSizeUnit || 'g',
              servingLabel: f.servingSize ? `${f.servingSize}${f.servingSizeUnit || 'g'}` : '100g',
            };
          });
        sendJSON(res, 200, { foods, source: 'usda' });
      } catch(e) {
        sendJSON(res, 500, { error: 'Failed to parse USDA response' });
      }
    });
  });

  usdaReq.on('error', (e) => {
    sendJSON(res, 502, { error: 'USDA API unreachable', detail: e.message, fallback: true });
  });

  usdaReq.setTimeout(8000, () => {
    usdaReq.destroy();
    sendJSON(res, 504, { error: 'USDA API timeout', fallback: true });
  });

  usdaReq.end();
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (pathname === '/api/food-search') {
    handleFoodSearch(req, res, parsed.query.q);
    return;
  }

  let filePath = path.join(DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) {
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
  console.log(`  Network: http://${getLocalIP()}:${PORT}  <- use this on your phone\n`);
  console.log('  Food search: USDA FoodData Central (600,000+ foods)');
  if (USDA_API_KEY === 'DEMO_KEY') {
    console.log('  Using DEMO_KEY - get a free key at api.nal.usda.gov for full access\n');
  }
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
