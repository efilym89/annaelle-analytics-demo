/* Presentation and keyboard behaviour only. The report model stays in app.js. */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const sidebar = byId('sidebar');
  const menuButton = byId('menu-button');
  const sidebarBackdrop = byId('sidebar-backdrop');
  const drawer = byId('drawer');
  const search = byId('search-modal');
  const shell = document.querySelector('.app-shell');
  const main = document.querySelector('main');
  const mobile = window.matchMedia('(max-width: 1024px)');
  const originalOverflow = document.body.style.overflow;
  const originalRootOverflow = document.documentElement.style.overflow;

  const paths = {
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    sales: '<path d="M4 20V5m0 15h16M8 15l4-4 4 2 5-7m-5 0h5v5"/>',
    clients: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5v1"/>',
    rfm: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m15.5 8.5 5-5M18 3h3v3"/>',
    memberships: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3m6-1 1 1 2-2"/>',
    workload: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 11h18m-9 3v3l2 1"/>',
    masters: '<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M3 10h3m-1.5-1.5v3M18 5h3m-1.5-1.5v3"/>',
    managers: '<path d="M4 14v-3a8 8 0 0 1 16 0v5a4 4 0 0 1-4 4h-2"/><rect x="3" y="10" width="4" height="7" rx="2"/><rect x="17" y="10" width="4" height="7" rx="2"/><path d="M10 20h4"/>',
    marketing: '<path d="m14 6 6-3v16l-6-3H7a4 4 0 0 1 0-8h7ZM14 6v10M7 16l2 5h4l-2-5"/>',
    cross: '<path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3.5-2 5-5m3-4c1.5-2 2.5-3 4-3h3m-4-4 4 4-4 4"/>',
    finance: '<path d="M20 8V5H6a3 3 0 0 0 0 6h14v10H6a3 3 0 0 1-3-3V8m17 7h-5v3h5"/>',
    planning: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 11h18m-13 5 3 3 5-5"/>',
    inventory: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>',
    quality: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6"/>',
    settings: '<path d="M4 6h4m4 0h8M4 12h10m4 0h2M4 18h2m4 0h10"/><circle cx="10" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    branch: '<path d="M4 21V5l8-2v18M4 21h16V9l-8-2M8 7v1m0 3v1m0 3v1m8-4v1m0 3v1M2 21h20"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 11h18m-14 4h2m3 0h2m-7 3h2"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 6-3 8-3 8h18s-3-2-3-8M10 20h4"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>'
  };

  function icon(name) {
    const holder = document.createElement('template');
    holder.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-ui-icon="' + name + '">' + paths[name] + '</svg>';
    return holder.content.firstElementChild;
  }

  function setIcon(element, name) {
    if (!element || !paths[name]) return;
    const previous = element.querySelector(':scope > svg');
    if (previous?.dataset.uiIcon === name) return;
    if (previous) previous.replaceWith(icon(name));
    else element.prepend(icon(name));
  }

  function polishRenderedContent() {
    if (document.body.classList.contains('ui-local-update')) {
      // Keep this render still after the temporary body class expires. A full
      // report render replaces these nodes, so page transitions animate again.
      Array.from(byId('view').children).forEach(element => element.setAttribute('data-local-render', ''));
    }
    document.querySelectorAll('.nav-item[data-nav], .search-result[data-search-nav]').forEach(button => {
      setIcon(button, button.dataset.nav || button.dataset.searchNav);
    });
    document.querySelectorAll('.search-result[data-search-client]').forEach(button => setIcon(button, 'clients'));
    document.querySelectorAll('.highlight-icon').forEach((element, index) => setIcon(element, ['sales', 'workload', 'clients'][index]));
    document.querySelectorAll('.row-button').forEach(button => {
      if (button.textContent.trim() === '↗') button.replaceChildren(icon('arrow'));
    });
    document.querySelectorAll('.data-table th').forEach(heading => {
      const sort = heading.querySelector('[data-sort]');
      if (sort) heading.setAttribute('aria-sort', /↑$/.test(sort.textContent) ? 'ascending' : /↓$/.test(sort.textContent) ? 'descending' : 'none');
    });
    document.querySelectorAll('.table-wrap').forEach(wrap => {
      const scrollable = wrap.scrollWidth > wrap.clientWidth + 1;
      wrap.tabIndex = scrollable ? 0 : -1;
      if (scrollable) {
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', 'Таблица отчёта. Прокрутите, чтобы увидеть все столбцы');
      } else {
        wrap.removeAttribute('role');
        wrap.removeAttribute('aria-label');
      }
    });
    document.title = 'ANNAELLE · ' + byId('page-title').textContent;
  }

  Object.entries({
    'menu-button': 'menu', 'search-button': 'search', 'drawer-close': 'close',
    'search-field-icon': 'search', 'branch-icon': 'branch', 'period-icon': 'calendar',
    'export-button': 'download', 'notifications-button': 'bell'
  }).forEach(([id, name]) => setIcon(byId(id), name));
  const chevron = document.querySelector('.profile-chevron');
  if (chevron) chevron.replaceChildren(icon('chevron'));

  const menuClose = document.createElement('button');
  menuClose.type = 'button';
  menuClose.className = 'sidebar-close icon-button';
  menuClose.setAttribute('aria-label', 'Закрыть меню');
  menuClose.append(icon('close'));
  sidebar.prepend(menuClose);
  menuClose.addEventListener('click', () => sidebarBackdrop.click());
  menuButton.setAttribute('aria-controls', 'sidebar');
  menuButton.setAttribute('aria-haspopup', 'dialog');
  sidebarBackdrop.tabIndex = -1;
  byId('search-button').setAttribute('aria-controls', 'search-modal');
  byId('search-button').setAttribute('aria-haspopup', 'dialog');
  byId('global-search').setAttribute('role', 'searchbox');
  byId('global-search').setAttribute('aria-controls', 'search-results');
  ['profile-button', 'notifications-button', 'help-button'].forEach(id => {
    byId(id).setAttribute('aria-haspopup', 'dialog');
    byId(id).setAttribute('aria-controls', 'drawer');
  });

  let currentLayer = null;
  let returnFocus = null;
  let interactionOrigin = null;
  let moveFocusToReport = false;
  let localUpdateTimer = 0;

  function markLocalUpdate() {
    clearTimeout(localUpdateTimer);
    document.body.classList.add('ui-local-update');
    localUpdateTimer = setTimeout(() => document.body.classList.remove('ui-local-update'), 350);
  }

  function endLocalUpdate() {
    clearTimeout(localUpdateTimer);
    document.body.classList.remove('ui-local-update');
  }

  const isVisible = element => Boolean(element?.isConnected && element.getClientRects().length && !element.closest('[inert]'));
  const canRestoreFocus = element => isVisible(element) && element.matches('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]');
  const controls = layer => Array.from(layer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(isVisible);
  const menuIsOpen = () => mobile.matches && sidebar.classList.contains('open');
  const activeLayer = () => !drawer.hidden ? drawer : !search.hidden ? search : menuIsOpen() ? sidebar : null;

  function closeMenu() {
    if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
    sidebarBackdrop.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }

  function focusStart(layer) {
    const target = layer === search ? byId('global-search') : layer === drawer ? byId('drawer-close') : sidebar.querySelector('[aria-current="page"]');
    (target || controls(layer)[0])?.focus({preventScroll: true});
  }

  function syncLayers() {
    if (!mobile.matches || !drawer.hidden || !search.hidden) closeMenu();
    const next = activeLayer();
    const menuOpen = next === sidebar;
    const modalOpen = next === drawer || next === search;
    if (next && !currentLayer) returnFocus = interactionOrigin || document.activeElement;
    shell.inert = modalOpen;
    main.inert = menuOpen;
    sidebar.inert = mobile.matches && !menuOpen;
    if (mobile.matches && !menuOpen) sidebar.setAttribute('aria-hidden', 'true');
    else sidebar.removeAttribute('aria-hidden');
    if (menuOpen) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
    }
    menuButton.setAttribute('aria-expanded', String(menuOpen));
    menuButton.setAttribute('aria-label', menuOpen ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = next ? 'hidden' : originalOverflow;
    document.documentElement.style.overflow = next ? 'hidden' : originalRootOverflow;
    if (next && next !== currentLayer && !next.contains(document.activeElement)) focusStart(next);
    if (!next && currentLayer) {
      const target = moveFocusToReport ? byId('view') : canRestoreFocus(returnFocus) ? returnFocus : mobile.matches ? menuButton : byId('view');
      target.focus({preventScroll: true});
      returnFocus = null;
      moveFocusToReport = false;
    }
    currentLayer = next;
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button, a, input, select');
    if (event.target.closest('[data-sort], [data-page]')) markLocalUpdate();
    else if (event.target.closest('[data-nav], [data-search-nav], [data-search-client], [data-setting], [data-reset-demo], [data-retry], #reset-filter, .brand')) endLocalUpdate();
    if (!activeLayer()) interactionOrigin = target || document.activeElement;
    if (event.target.closest('[data-nav], [data-search-nav], .brand') && (menuIsOpen() || activeLayer() === search)) moveFocusToReport = true;
  }, true);

  document.addEventListener('input', event => {
    if (event.target.id === 'report-search') markLocalUpdate();
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches('#branch-filter, #period-filter, #compare-toggle, #view-state, [data-filter]')) endLocalUpdate();
  }, true);

  document.addEventListener('keydown', event => {
    const layer = activeLayer();
    if (!layer && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') interactionOrigin = document.activeElement;
    // Escape belongs to an expanded combobox before it belongs to its dialog.
    if (event.key === 'Escape' && document.documentElement.hasAttribute('data-select-open')) return;
    if (!layer) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      (layer === sidebar ? sidebarBackdrop : layer === search ? byId('search-close') : byId('drawer-close')).click();
      return;
    }
    if (event.key === 'Tab') {
      const items = controls(layer);
      const first = items[0];
      const last = items[items.length - 1];
      const focused = document.activeElement;
      event.stopPropagation();
      if (!first) {
        event.preventDefault();
      } else if (!layer.contains(focused) || (event.shiftKey && focused === first) || (!event.shiftKey && focused === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
    if (layer === search && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      const results = Array.from(search.querySelectorAll('.search-result'));
      const index = results.indexOf(document.activeElement);
      if (results.length && (document.activeElement === byId('global-search') || index >= 0)) {
        event.preventDefault();
        const next = event.key === 'ArrowDown' ? results[(index + 1) % results.length] : index > 0 ? results[index - 1] : index === 0 ? byId('global-search') : results[results.length - 1];
        next.focus();
      }
    }
  }, true);

  document.addEventListener('focusin', event => {
    const layer = activeLayer();
    if (layer && !layer.contains(event.target)) focusStart(layer);
  });

  const layerObserver = new MutationObserver(syncLayers);
  [sidebar, drawer, search].forEach(element => layerObserver.observe(element, {attributes: true, attributeFilter: ['class', 'hidden']}));
  let polishFrame = 0;
  function queuePolish() {
    if (polishFrame) return;
    polishFrame = requestAnimationFrame(() => {
      polishFrame = 0;
      polishRenderedContent();
    });
  }
  const contentObserver = new MutationObserver(queuePolish);
  [byId('view'), byId('navigation'), byId('search-results')].forEach(element => contentObserver.observe(element, {childList: true, subtree: true}));
  mobile.addEventListener('change', syncLayers);
  window.addEventListener('hashchange', endLocalUpdate);
  window.addEventListener('popstate', endLocalUpdate);
  window.addEventListener('resize', queuePolish, {passive: true});
  syncLayers();
  polishRenderedContent();
})();
