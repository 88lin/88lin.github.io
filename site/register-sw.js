// 检查浏览器是否支持Service Worker
if ('serviceWorker' in navigator) {
  let registration;
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        registration = reg;
        console.log('ServiceWorker 注册成功:', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker 注册失败:', error);
      });
      
    // 确保Service Worker控制页面后再设置通知
    navigator.serviceWorker.ready.then(reg => {
      console.log('ServiceWorker 已准备就绪');
      
      // 页面加载时检查更新
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'checkForUpdates',
          isInitialLoad: true
        });
      }
      
      // 监听从SW发来的消息
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.action === 'cacheUpdated') {
          console.log('缓存已更新：', new Date(event.data.timestamp).toLocaleString());
          // 这里可以显示缓存更新的通知或提示
          window.dispatchEvent(new CustomEvent('cacheUpdated', { detail: event.data }));
        } else if (event.data && event.data.action === 'cacheUpdatedWithChanges') {
          console.log(`${new Date().toLocaleTimeString()} | [PWA] 缓存已更新，发现新内容`);
          // 派发带有更新信息的事件
          window.dispatchEvent(new CustomEvent('cacheUpdatedWithChanges', { detail: event.data }));
        } else if (event.data && event.data.action === 'cacheChecked') {
          console.log('缓存检查完成，无更新：', new Date(event.data.timestamp).toLocaleString());
          window.dispatchEvent(new CustomEvent('cacheChecked', { detail: event.data }));
        }
      });
    }).catch(error => {
      console.error('ServiceWorker ready 错误:', error);
    });
  });
  
  // 处理在线状态变化
  window.addEventListener('online', () => {
    console.log('网络已恢复连接，正在更新缓存...');
    // 如果Service Worker已激活，发送更新缓存的消息
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: 'updateCache'
      });
      
      // 触发自定义事件，通知应用恢复在线状态
      window.dispatchEvent(new CustomEvent('appOnline'));
    }
  });
}

// 手动更新缓存的辅助函数
window.updateServiceWorkerCache = function() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: 'updateCache'
    });
    return true;
  }
  return false;
};
