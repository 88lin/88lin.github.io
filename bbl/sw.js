/* 版本号参与缓存名，发布新版本时改这里即可让旧缓存失效 */
const CACHE_VERSION = "v2";
let cacheName = "sourceCache-" + CACHE_VERSION;

/* 只预缓存确实存在的资源。原先列出的 favicon.ico 在仓库里并不存在，
   cache.addAll 只要有一个 404 就整批失败，Service Worker 会直接装不上。 */
let resorces = ["", "index.html", "script.js", "style.css"];

let pathname = new URL(self.registration.scope).pathname;
resorces = resorces.map((s) => pathname + s);

async function precache() {
  let cache = await caches.open(cacheName);
  /* 逐条添加并忽略单点失败，避免任一资源缺失拖垮整个预缓存 */
  await Promise.all(
    resorces.map((url) =>
      cache.add(url).catch((err) => console.warn("[sw] 预缓存失败:", url, err))
    )
  );
}

self.addEventListener("install", (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

/* 清理上一版本遗留的缓存，否则用户会一直拿到旧文件 */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function cacheRefresh(req) {
  let refresh = fetch(req).then(async (rsp) => {
    if (rsp.ok) {
      let cache = await caches.open(cacheName);
      cache.put(req, rsp.clone());
    }
    return rsp;
  });
  return (pathname != "/" ? await caches.match(req) : null) || (await refresh);
}

self.addEventListener("fetch", (e) => {
  if (resorces.includes(new URL(e.request.url).pathname))
    e.respondWith(cacheRefresh(e.request));
});
