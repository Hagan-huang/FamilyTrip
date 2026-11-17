/* 越南跨年之旅 — Service Worker（離線快取）
 * 每次改版：VER 與 CORE 裡的 ?v= 要跟 index.html 的 APP_VER 一起改。 */
const VER = '1.0.1';
const CACHE = 'familytrip-' + VER;
const FONTS = 'familytrip-fonts';
const CORE = [
  './',
  'index.html',
  'data.js?v=1.0.1',
  'app.js?v=1.0.1',
  'manifest.webmanifest?v=1.0.1',
  'images/icon-192.png?v=1.0.1',
  'images/apple-touch-icon.png?v=1.0.1',
  'images/cover.svg?v=1.0.1'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 字型：先用快取，背景更新
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }
  // 其他網站（試算表、天氣、匯率、地圖）不經過快取，由網頁自己處理離線
  if (url.origin !== self.location.origin) return;

  // 開網頁：有網路拿最新的，3.5 秒沒回應或離線就用快取
  if (req.mode === 'navigate') {
    e.respondWith(
      Promise.race([fetch(req), timeout(3500)])
        .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)); return r; })
        .catch(() => caches.match('./').then(r => r || caches.match('index.html')))
    );
    return;
  }
  // 程式、圖片：快取優先；沒快取過的（例如之後才加的橫幅）抓到後存起來
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }))
  );
});
