/* Browser-local appearance only. No API requests or customer data. Loaded in head
   so the saved palette is applied before the first frame. */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'annaelle-appearance-v1';
  let theme = 'light';
  try {
    theme = localStorage.getItem(key) === 'dark' ? 'dark' : 'light';
    const preferences = JSON.parse(localStorage.getItem('annaelle-demo-ui-v2') || '{}');
    if (preferences.reduced) root.classList.add('reduce-appearance-motion');
  } catch { /* Storage is optional, including private browsing. */ }
  root.dataset.theme = theme;
  root.classList.add('is-booting');
  const started = performance.now();
  const mark = '<div class="brand-loader" aria-hidden="true"><span class="loader-orbit"></span><span class="loader-orbit secondary"></span><img src="assets/annaelle-symbol-ink.svg" alt="" width="36" height="51"><i></i><i></i><i></i></div>';
  function applyTheme(value) {
    theme = value === 'dark' ? 'dark' : 'light';
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#191821' : '#fbfaff';
    try { localStorage.setItem(key, theme); } catch { /* Session preference remains. */ }
    document.dispatchEvent(new CustomEvent('annaelle:themechange', {detail:{theme}}));
  }
  window.AnnaelleAppearance = {
    get theme() { return theme; },
    setTheme: applyTheme,
    loaderMarkup: () => mark,
  };
  function reveal() {
    root.classList.remove('is-booting');
    const screen = document.getElementById('boot-screen');
    if (screen) { screen.setAttribute('aria-hidden', 'true'); screen.inert = true; }
  }
  // Failsafe: a failed font or unrelated module must never lock the page.
  setTimeout(reveal, 4000);
  document.addEventListener('DOMContentLoaded', async () => {
    const holder = document.getElementById('boot-mark');
    if (holder) holder.innerHTML = mark;
    const reduced = root.classList.contains('reduce-appearance-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    await Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1000))]);
    const remaining = reduced ? 0 : Math.max(0, 650 - (performance.now() - started));
    setTimeout(() => requestAnimationFrame(reveal), remaining);
    applyTheme(theme);
  }, {once:true});
})();
