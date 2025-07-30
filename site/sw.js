const CACHE_VERSION = 'v1';
const CACHE_NAME = `timepulse-${CACHE_VERSION}`;

// 修改缓存资源列表，只包含确定存在的文件
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/site.webmanifest'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        
        // 使用Promise.allSettled代替cache.addAll，这样即使某些资源请求失败，也不会导致整个缓存过程失败
        return Promise.allSettled(
          urlsToCache.map(url => 
            fetch(url)
              .then(response => {
                if (!response || !response.ok) {
                  console.log(`无法缓存资源: ${url}`);
                  return;
                }
                return cache.put(url, response);
              })
              .catch(err => console.log(`缓存资源失败: ${url}, 错误: ${err}`))
          )
        );
      })
  );
  
  // 立即激活新版本的Service Worker
  self.skipWaiting();
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即接管页面，不等待刷新
      clients.claim()
    ])
  );
});

// 处理fetch请求
self.addEventListener('fetch', event => {
  // 添加错误处理以防网络请求失败
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中找到了请求的资源，则返回
        if (response) {
          return response;
        }
        
        // 尝试从网络获取资源
        return fetch(event.request)
          .then(response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应以便我们可以同时将其存入缓存并返回
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.log(`缓存请求失败: ${event.request.url}, 错误: ${err}`));
              
            return response;
          })
          .catch(error => {
            console.log('Fetch失败:', error);
            
            // 检查是否为API请求
            const url = new URL(event.request.url);
            if (url.pathname.includes('/api/')) {
              // 如果是API请求，返回离线状态的JSON响应
              return new Response(
                JSON.stringify({ 
                  offline: true, 
                  message: '您当前处于离线模式，此操作需要网络连接'
                }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            // 如果是HTML请求，尝试返回缓存中的离线页面或默认响应
            return caches.match('/offline.html')
              .then(offlineResponse => {
                return offlineResponse || new Response(
                  '网络错误，您当前处于离线模式',
                  { 
                    status: 503, 
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/html' }
                  }
                );
              });
          });
      })
      .catch(error => {
        console.log('缓存匹配失败:', error);
        return new Response('网络错误，无法加载资源', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      })
  );
});

// 处理消息 - 接收倒计时信息并设置通知
self.addEventListener('message', event => {
  const data = event.data;
  
  if (data.action === 'scheduleNotification') {
    const { title, timestamp, body, id } = data;
    
    console.log('收到通知调度请求:', { title, timestamp, id });
    
    // 计算倒计时剩余时间
    const timeUntilNotification = timestamp - Date.now();
    
    console.log('距离通知时间还有:', timeUntilNotification, 'ms');
    
    if (timeUntilNotification <= 0) {
      // 如果时间已过，立即发送通知
      console.log('立即发送通知:', title);
      showNotification(title, body, id);
    } else {
      // 设置定时器，到时间时发送通知
      console.log('设置定时器，将在', timeUntilNotification, 'ms后发送通知');
      
      // 为了提高可靠性，我们同时使用多种方式来确保通知能够发送
      const timerId = setTimeout(() => {
        console.log('定时器触发，发送通知:', title);
        showNotification(title, body, id);
      }, timeUntilNotification);
      
      // 存储定时器ID，以便后续可能的取消操作
      if (!self.activeTimers) {
        self.activeTimers = new Map();
      }
      self.activeTimers.set(id, timerId);
    }
  } else if (data.action === 'cancelNotification') {
    // 处理取消通知请求
    const { id } = data;
    console.log('收到取消通知请求:', id);
    
    if (self.activeTimers && self.activeTimers.has(id)) {
      const timerId = self.activeTimers.get(id);
      clearTimeout(timerId);
      self.activeTimers.delete(id);
      console.log('已取消通知定时器:', id);
    }
    
    // 同时取消已显示的通知
    self.registration.getNotifications({ tag: id }).then(notifications => {
      notifications.forEach(notification => {
        notification.close();
        console.log('已关闭通知:', id);
      });
    });
  } else if (data.action === 'updateCache') {
    // 处理缓存更新请求
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('正在更新缓存...');
          
          // 重新获取核心资源并检查是否有更新
          return Promise.allSettled(
            urlsToCache.map(url => 
              // 先获取缓存中的资源
              cache.match(url).then(cachedResponse => {
                return fetch(url, { cache: 'reload' }) // 强制绕过浏览器缓存
                  .then(networkResponse => {
                    if (!networkResponse || !networkResponse.ok) {
                      console.log(`更新缓存失败: ${url}`);
                      return { updated: false };
                    }
                    
                    // 比较 ETag 或 Last-Modified 来检查是否有更新
                    let hasUpdate = false;
                    if (cachedResponse) {
                      const cachedETag = cachedResponse.headers.get('etag');
                      const networkETag = networkResponse.headers.get('etag');
                      const cachedLastModified = cachedResponse.headers.get('last-modified');
                      const networkLastModified = networkResponse.headers.get('last-modified');
                      
                      if (cachedETag && networkETag) {
                        hasUpdate = cachedETag !== networkETag;
                      } else if (cachedLastModified && networkLastModified) {
                        hasUpdate = cachedLastModified !== networkLastModified;
                      } else {
                        // 如果没有 ETag 或 Last-Modified，比较内容长度
                        hasUpdate = cachedResponse.headers.get('content-length') !== networkResponse.headers.get('content-length');
                      }
                    } else {
                      // 如果缓存中没有，说明是新资源
                      hasUpdate = true;
                    }
                    
                    return cache.put(url, networkResponse.clone()).then(() => ({
                      updated: hasUpdate,
                      url: url
                    }));
                  })
                  .catch(err => {
                    console.log(`更新缓存资源失败: ${url}, 错误: ${err}`);
                    return { updated: false };
                  });
              })
            )
          ).then(results => {
            // 检查是否有任何资源更新
            const hasUpdates = results.some(result => 
              result.status === 'fulfilled' && result.value.updated
            );
            
            // 通知客户端缓存已更新
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  action: 'cacheUpdated',
                  timestamp: Date.now(),
                  hasUpdates: hasUpdates
                });
              });
            });
            
            if (hasUpdates) {
              console.log('缓存已更新，发现新内容');
            } else {
              console.log('缓存已检查，无新内容');
            }
          });
        })
    );
  } else if (data.action === 'checkForUpdates') {
    // 处理检查更新请求（页面加载时）
    event.waitUntil(
      checkForUpdatesAndNotify(data.isInitialLoad || false)
    );
  }
});

// 检查更新并通知的辅助函数
async function checkForUpdatesAndNotify(isInitialLoad = false) {
  try {
    const cache = await caches.open(CACHE_NAME);
    console.log(isInitialLoad ? '页面加载时检查更新...' : '检查更新...');
    
    const updateResults = await Promise.allSettled(
      urlsToCache.map(async url => {
        try {
          const cachedResponse = await cache.match(url);
          const networkResponse = await fetch(url, { cache: 'no-cache' });
          
          if (!networkResponse || !networkResponse.ok) {
            return { url, updated: false, error: 'Network response not ok' };
          }
          
          let hasUpdate = false;
          if (cachedResponse) {
            // 比较 ETag 或 Last-Modified
            const cachedETag = cachedResponse.headers.get('etag');
            const networkETag = networkResponse.headers.get('etag');
            const cachedLastModified = cachedResponse.headers.get('last-modified');
            const networkLastModified = networkResponse.headers.get('last-modified');
            
            if (cachedETag && networkETag) {
              hasUpdate = cachedETag !== networkETag;
            } else if (cachedLastModified && networkLastModified) {
              hasUpdate = cachedLastModified !== networkLastModified;
            } else {
              // 比较内容长度
              const cachedLength = cachedResponse.headers.get('content-length');
              const networkLength = networkResponse.headers.get('content-length');
              hasUpdate = cachedLength !== networkLength;
            }
          } else {
            // 缓存中没有此资源，视为有更新
            hasUpdate = true;
          }
          
          if (hasUpdate) {
            // 更新缓存
            await cache.put(url, networkResponse.clone());
          }
          
          return { url, updated: hasUpdate };
        } catch (error) {
          console.log(`检查 ${url} 更新失败:`, error);
          return { url, updated: false, error: error.message };
        }
      })
    );
    
    // 统计更新结果
    const successfulResults = updateResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    const hasUpdates = successfulResults.some(result => result.updated);
    const updatedUrls = successfulResults
      .filter(result => result.updated)
      .map(result => result.url);
    
    // 通知所有客户端
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        action: hasUpdates ? 'cacheUpdatedWithChanges' : 'cacheChecked',
        timestamp: Date.now(),
        hasUpdates: hasUpdates,
        updatedUrls: updatedUrls,
        isInitialLoad: isInitialLoad
      });
    });
    
    if (hasUpdates) {
      console.log(`发现 ${updatedUrls.length} 个资源更新:`, updatedUrls);
    } else {
      console.log('检查完成，无更新内容');
    }
    
  } catch (error) {
    console.error('检查更新失败:', error);
  }
}

// 显示通知的函数
function showNotification(title, body, id) {
  console.log('显示通知:', { title, body, id });
  
  try {
    self.registration.showNotification(title, {
      body: body || '倒计时已结束！',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon.ico',
      tag: id,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: {
        countdownId: id
      },
      // 添加额外的选项以提高兼容性
      silent: false,
      renotify: true,
      timestamp: Date.now()
    });
    console.log('通知显示成功:', title);
  } catch (error) {
    console.error('显示通知失败:', error);
  }
}

// 处理通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // 点击通知时打开应用并导航到相应倒计时
  const countdownId = event.notification.data.countdownId;
  const urlToOpen = new URL('/', self.location.origin);
  
  if (countdownId) {
    urlToOpen.searchParams.set('id', countdownId);
  }
  
  // 打开应用或将应用置于前台
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(windowClients => {
      // 检查应用是否已经打开
      for (let client of windowClients) {
        if (client.url === urlToOpen.href && 'focus' in client) {
          return client.focus();
        }
      }
      // 如果应用没有打开，则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen.href);
      }
    })
  );
});
