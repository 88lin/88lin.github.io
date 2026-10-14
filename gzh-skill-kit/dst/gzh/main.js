// 改进vh - 处理移动端地址栏的视口高度问题
function updateVH() {
  const vh = window.innerHeight * 1;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

updateVH();

window.addEventListener('resize', updateVH);
window.addEventListener('orientationchange', updateVH);

// 页面加载动画
document.addEventListener('DOMContentLoaded', () => {
  // 功能特色项目依次显示
  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 1000 + index * 150);
  });
});

// 鼠标移动视差效果（仅桌面端）
if (window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    const card = document.querySelector('.wechat-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 50;
    const rotateY = (centerX - x) / 50;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    } else {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }
  });

  const card = document.querySelector('.wechat-card');
  if (card) {
    card.style.transition = 'transform 0.1s ease-out';
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  }
}

// 二维码长按保存提示
const qrcode = document.querySelector('.qrcode');
if (qrcode) {
  let pressTimer;

  qrcode.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      // 创建提示
      const toast = document.createElement('div');
      toast.textContent = '长按图片可以保存二维码';
      toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      `;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }, 500);
  });

  qrcode.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  qrcode.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
  });
}

// 添加淡出动画
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(fadeStyle);