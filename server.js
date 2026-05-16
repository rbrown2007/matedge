#!/usr/bin/env node
/**
 * Built for the Mat — Local Server
 * Run: node server.js
 * Then open: http://localhost:3000
 *
 * Food Search API Key Setup:
 * Get a free USDA key at https://api.nal.usda.gov (instant email delivery)
 * Then run: $env:USDA_API_KEY="your_key_here"; node server.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;

// Load .env file if present (keeps API keys out of source code)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [key, ...val] = line.trim().split('=');
      if (key && val.length) process.env[key] = val.join('=');
    });
  }
} catch(e) {}

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.css':  'text/css',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    ...SECURITY_HEADERS,
  });
  res.end(JSON.stringify(data));
}

function httpsGet(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (r) => {
      let body = '';
      r.on('data', chunk => body += chunk);
      r.on('end', () => resolve({ status: r.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// ── USDA FoodData Central ─────────────────────────────────────────────────
async function searchUSDA(query) {
  const path = `/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=50&api_key=${USDA_API_KEY}`;
  const r = await httpsGet({ hostname: 'api.nal.usda.gov', path, method: 'GET' });

  if (r.status !== 200) throw new Error(`USDA returned ${r.status}`);
  const data = JSON.parse(r.body);

  return (data.foods || [])
    .map(f => {
      const get = (name) => {
        const n = (f.foodNutrients || []).find(x => x.nutrientName && x.nutrientName.includes(name));
        return n ? Math.round((n.value || 0) * 10) / 10 : 0;
      };
      const kcal = get('Energy');
      if (!kcal) return null;
      return {
        id: f.fdcId,
        name: f.description,
        brand: f.brandOwner || f.brandName || '',
        category: f.foodCategory || f.dataType || '',
        dataType: f.dataType || '',
        kcal,
        protein: get('Protein'),
        carbs: get('Carbohydrate'),
        fat: get('Total lipid'),
        fiber: get('Fiber'),
        sugar: get('Sugars'),
        sodium: get('Sodium'),
        servingSize: f.servingSize || 100,
        servingUnit: f.servingSizeUnit || 'g',
        servingLabel: f.servingSize ? `${f.servingSize}${f.servingSizeUnit || 'g'}` : '100g',
        source: 'usda',
      };
    })
    .filter(Boolean);
}

// ── Open Food Facts (fallback / supplement) ───────────────────────────────
async function searchOFF(query) {
  const encoded = encodeURIComponent(query);
  const path = `/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=30&fields=product_name,brands,nutriments,serving_size,serving_quantity,categories_tags`;
  const r = await httpsGet({ hostname: 'world.openfoodfacts.org', path, method: 'GET' });

  if (r.status !== 200) throw new Error(`OFF returned ${r.status}`);
  const data = JSON.parse(r.body);

  return (data.products || [])
    .map(f => {
      const n = f.nutriments || {};
      const kcal = n['energy-kcal_100g'] || (n['energy_100g'] ? Math.round(n['energy_100g'] / 4.184) : 0);
      if (!kcal || !f.product_name) return null;
      const sg = parseFloat(f.serving_quantity) || 100;
      return {
        name: f.product_name,
        brand: f.brands || '',
        category: (f.categories_tags || []).slice(0,1).join('').replace('en:','') || '',
        kcal: Math.round(kcal),
        protein: Math.round((n['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((n['fat_100g'] || 0) * 10) / 10,
        fiber: Math.round((n['fiber_100g'] || 0) * 10) / 10,
        sugar: Math.round((n['sugars_100g'] || 0) * 10) / 10,
        sodium: Math.round((n['sodium_100g'] || 0) * 1000 * 10) / 10,
        servingSize: sg,
        servingUnit: 'g',
        servingLabel: f.serving_size || `${sg}g`,
        source: 'off',
      };
    })
    .filter(Boolean);
}

// ── Combined search with deduplication ────────────────────────────────────
async function handleFoodSearch(req, res, query) {
  if (!query) { sendJSON(res, 400, { error: 'Missing query' }); return; }

  let foods = [];
  let sources = [];

  // Try USDA first
  try {
    const usdaFoods = await searchUSDA(query);
    foods = foods.concat(usdaFoods);
    sources.push('usda');
    console.log(`[BFTM] USDA: ${usdaFoods.length} results for "${query}"`);
  } catch(e) {
    console.warn(`[BFTM] USDA failed: ${e.message}`);
  }

  // Always also try Open Food Facts for more branded results
  try {
    const offFoods = await searchOFF(query);
    // Deduplicate by name similarity
    const usdaNames = new Set(foods.map(f => f.name.toLowerCase().slice(0, 20)));
    const newFoods = offFoods.filter(f => !usdaNames.has(f.name.toLowerCase().slice(0, 20)));
    foods = foods.concat(newFoods);
    sources.push('off');
    console.log(`[BFTM] OFF: ${offFoods.length} results (${newFoods.length} new) for "${query}"`);
  } catch(e) {
    console.warn(`[BFTM] OFF failed: ${e.message}`);
  }

  if (foods.length === 0) {
    sendJSON(res, 200, { foods: [], source: 'none', fallback: true });
    return;
  }

  // Sort: Foundation/SR Legacy (most reliable) first, then branded, then OFF
  foods.sort((a, b) => {
    const rank = (f) => {
      if (f.dataType === 'Foundation') return 0;
      if (f.dataType === 'SR Legacy') return 1;
      if (f.source === 'usda') return 2;
      return 3;
    };
    return rank(a) - rank(b);
  });

  sendJSON(res, 200, { foods: foods.slice(0, 40), source: sources.join('+'), total: foods.length });
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsed.pathname;

  // HTTPS redirect (when running behind Railway or other proxies)
  const proto = req.headers['x-forwarded-proto'];
  if (proto && proto !== 'https') {
    res.writeHead(301, { 'Location': `https://${req.headers.host}${req.url}` });
    res.end();
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', ...SECURITY_HEADERS });
    res.end();
    return;
  }

  if (pathname === '/api/food-search') {
    try {
      await handleFoodSearch(req, res, parsed.searchParams.get('q'));
    } catch(e) {
      console.error('[BFTM] Food search error:', e);
      sendJSON(res, 500, { error: e.message, fallback: true });
    }
    return;
  }


  // Legal pages
  if (pathname === '/privacy') {
    const fp = path.join(DIR, 'privacy.html');
    const data = require('fs').readFileSync(fp);
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache', ...SECURITY_HEADERS });
    res.end(data); return;
  }
  if (pathname === '/terms') {
    const fp = path.join(DIR, 'terms.html');
    const data = require('fs').readFileSync(fp);
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache', ...SECURITY_HEADERS });
    res.end(data); return;
  }
  if (pathname === '/sitemap.xml') {
    const fp = path.join(DIR, 'sitemap.xml');
    const data = require('fs').readFileSync(fp);
    res.writeHead(200, { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=86400' });
    res.end(data); return;
  }
  if (pathname === '/robots.txt') {
    const fp = path.join(DIR, 'robots.txt');
    const data = require('fs').readFileSync(fp);
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'max-age=86400' });
    res.end(data); return;
  }

  // Blog routes — serve from /blog/ folder
  let filePath;
  if (pathname === '/blog' || pathname === '/blog/') {
    filePath = path.join(DIR, 'blog', 'index.html');
  } else if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '');
    filePath = path.join(DIR, 'blog', slug.endsWith('.html') ? slug : slug + '.html');
  } else {
    filePath = path.join(DIR, pathname === '/' ? 'index.html' : pathname);
  }
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end('Forbidden'); return; }

  console.log(`[BFTM] Serving: ${filePath}`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (!pathname.includes('favicon')) console.warn(`[BFTM] File not found: ${filePath}`);
      // For blog routes, return proper 404 (don't silently serve app)
      if (pathname.startsWith('/blog')) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - Blog page not found</h1><p>Looking for: ${filePath}</p><p>DIR is: ${DIR}</p>`);
        return;
      }
      // For app routes, fall back to index.html (SPA behavior)
      // For truly unknown routes, serve the branded 404 page
      const isKnownAppRoute = ['/', '/index.html', '/manifest.json', '/sw.js', '/favicon.ico', '/favicon.png'].includes(pathname) || pathname.startsWith('/icons/');
      const fallbackFile = isKnownAppRoute ? 'index.html' : '404.html';
      const fallbackStatus = isKnownAppRoute ? 200 : 404;
      fs.readFile(path.join(DIR, fallbackFile), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(fallbackStatus, { 'Content-Type': 'text/html', ...SECURITY_HEADERS });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=86400',
      'Service-Worker-Allowed': '/',
      ...SECURITY_HEADERS,
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  ⚡ Built for the Mat is running!\n');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${getLocalIP()}:${PORT}  <- use this on your phone\n`);
  console.log('  Food search: USDA FoodData Central + Open Food Facts (3M+ foods)');
  if (USDA_API_KEY === 'DEMO_KEY') {
    console.log('\n  ⚠  DEMO_KEY detected — USDA searches limited to 30/hour');
    console.log('  Get a free key at https://api.nal.usda.gov then run:');
    console.log('  Windows: $env:USDA_API_KEY="your_key"; node server.js');
    console.log('  Mac/Linux: USDA_API_KEY=your_key node server.js\n');
  } else {
    console.log('  ✓ USDA API key configured\n');
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
