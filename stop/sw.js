const CACHE_NAME = 'stfu-v2';

/* 站点可能部署在子目录下（如 /stop/），这里必须用相对路径。
   原先写死的 "/" 会去请求站点根域的资源，全部 404，
   cache.addAll 一旦遇到失败，Service Worker 就装不上。 */
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install - cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // 逐条添加，单个资源缺失不影响其余资源入缓存
      .then((cache) =>
        Promise.all(
          ASSETS.map((url) =>
            cache.add(url).catch((err) => console.warn('[sw] 预缓存失败:', url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - 仅对 GET 走缓存优先，避免把 POST 之类的请求也塞进缓存
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
