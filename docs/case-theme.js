(() => {
  const root = document.documentElement;
  document.body.classList.add('case-theme-page');

  const backdrop = document.createElement('div');
  backdrop.className = 'case-theme-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = '<span class="case-theme-orb"></span>';
  document.body.prepend(backdrop);

  const nav = document.createElement('nav');
  nav.className = 'case-theme-nav';
  nav.setAttribute('aria-label', '案例页导航');
  nav.innerHTML = `
    <a class="case-theme-home" href="../#projects">返回主页</a>
    <span class="case-theme-title">PARTH / CASE STUDY</span>
    <a class="case-theme-contact" href="mailto:3271408034@qq.com">联系</a>
  `;
  document.body.prepend(nav);

  let raf = 0;
  const updateMouse = (event) => {
    if (raf) {
      cancelAnimationFrame(raf);
    }

    raf = requestAnimationFrame(() => {
      root.style.setProperty('--case-mouse-x', `${event.clientX}px`);
      root.style.setProperty('--case-mouse-y', `${event.clientY}px`);
    });
  };

  window.addEventListener('pointermove', updateMouse, { passive: true });
})();
