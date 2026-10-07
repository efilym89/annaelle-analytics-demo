/* Presentation only: keep the existing chart values and controls while making
   their SVG coordinates and labels fit the actual report width. */
(() => {
  'use strict';

  const view = document.getElementById('view');
  if (!view) return;

  const CHART_HEIGHT = 240;
  const originalCharts = new WeakMap();
  const overflowStates = new WeakMap();
  const observed = new Set();
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  let frame = 0;

  function number(element, attribute) {
    return Number(element.getAttribute(attribute));
  }

  function rememberChart(svg) {
    if (originalCharts.has(svg)) return originalCharts.get(svg);
    // Ignore any unrelated SVGs or future chart formats, including all donuts.
    const box = (svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
    if (box.length !== 4 || box[2] !== 600 || box[3] !== 230) return null;
    const original = {
      paths: Array.from(svg.querySelectorAll('path'), element => ({
        element, d: element.getAttribute('d') || ''
      })),
      lines: Array.from(svg.querySelectorAll('line'), element => ({
        element, x1: number(element, 'x1'), x2: number(element, 'x2')
      })),
      points: Array.from(svg.querySelectorAll('circle.chart-point'), element => ({
        element, x: number(element, 'cx')
      })),
      labels: Array.from(svg.querySelectorAll('text'), element => ({
        element, x: number(element, 'x'), y: number(element, 'y')
      })),
      width: null
    };
    originalCharts.set(svg, original);
    return original;
  }

  function projectPath(path, projectX) {
    // app.js emits only M/L coordinate pairs and a possible closing Z. Read
    // from the immutable snapshot so repeated resizes never accumulate error.
    return path.replace(/([ML])\s*(-?(?:\d+\.?\d*|\.\d+))[,\s]+(-?(?:\d+\.?\d*|\.\d+))/g,
      (_, command, x, y) => command + projectX(Number(x)).toFixed(2) + ' ' + y);
  }

  function fitChart(svg) {
    const original = rememberChart(svg);
    const container = svg.closest('.chart');
    if (!original || !container || !svg.getClientRects().length) return;
    const width = Math.round(container.clientWidth);
    if (width < 120 || original.width === width) return;
    original.width = width;

    const left = 42;
    const right = width - 16;
    const plotWidth = right - left;
    const projectX = x => left + (x - 42) / 520 * plotWidth;
    svg.classList.add('responsive-chart');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + CHART_HEIGHT);
    svg.style.width = '100%';
    svg.style.height = CHART_HEIGHT + 'px';
    svg.style.minHeight = CHART_HEIGHT + 'px';
    svg.style.maxHeight = CHART_HEIGHT + 'px';

    original.paths.forEach(({element, d}) => element.setAttribute('d', projectPath(d, projectX)));
    original.lines.forEach(({element, x1, x2}) => {
      element.setAttribute('x1', projectX(x1).toFixed(2));
      element.setAttribute('x2', projectX(x2).toFixed(2));
    });
    original.points.forEach(({element, x}) => element.setAttribute('cx', projectX(x).toFixed(2)));

    const dates = original.labels.filter(label => label.y > 190);
    const count = Math.min(dates.length, Math.max(2, Math.floor(plotWidth / 64) + 1));
    const shown = new Set();
    for (let i = 0; i < count; i++) {
      shown.add(Math.round(i * (dates.length - 1) / Math.max(1, count - 1)));
    }
    original.labels.forEach(({element, x, y}) => {
      element.style.fontSize = '11px';
      if (y <= 190) {
        element.setAttribute('x', '0');
        return;
      }
      const index = dates.findIndex(label => label.element === element);
      element.style.display = shown.has(index) ? '' : 'none';
      element.setAttribute('x', projectX(x).toFixed(2));
      element.setAttribute('text-anchor', index === 0 ? 'start' : index === dates.length - 1 ? 'end' : 'middle');
    });
    // Resizing is immediate; the existing initial animation and both reduced
    // motion preferences keep their normal CSS behaviour.
  }

  function fitOverflow(container) {
    if (!container.getClientRects().length || !container.clientWidth) return;
    let state = overflowStates.get(container);
    if (!state) {
      state = {hint: null, tabindex: container.getAttribute('tabindex')};
      overflowStates.set(container, state);
    }
    const hasOverflow = container.scrollWidth > container.clientWidth + 2;
    container.classList.toggle('has-horizontal-overflow', hasOverflow);
    if (hasOverflow) {
      if (!state.hint || !state.hint.isConnected) {
        state.hint = document.createElement('p');
        state.hint.className = 'scroll-hint';
        container.after(state.hint);
      }
      const action = coarsePointer.matches ? 'Проведите вбок' : 'Прокрутите по горизонтали';
      const text = action + (container.classList.contains('heatmap')
        ? ', чтобы увидеть все дни →' : ', чтобы увидеть все столбцы →');
      if (state.hint.textContent !== text) state.hint.textContent = text;
      state.hint.hidden = false;
      if (state.tabindex === null) container.setAttribute('tabindex', '0');
    } else {
      if (state.hint) state.hint.hidden = true;
      if (state.tabindex === null) container.removeAttribute('tabindex');
    }
  }

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(schedule) : null;

  function observe(element) {
    if (!resizeObserver || observed.has(element)) return;
    resizeObserver.observe(element);
    observed.add(element);
  }

  function refresh() {
    frame = 0;
    for (const element of observed) {
      if (!view.contains(element)) {
        resizeObserver.unobserve(element);
        observed.delete(element);
      }
    }
    view.querySelectorAll('svg.chart-svg').forEach(svg => {
      const container = svg.closest('.chart');
      if (container) observe(container);
      fitChart(svg);
    });
    view.querySelectorAll('.table-wrap,.heatmap').forEach(container => {
      observe(container);
      fitOverflow(container);
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(refresh);
  }

  // Only child-list changes are relevant. Our SVG attributes, styles, classes
  // and hidden flags cannot recursively trigger this observer.
  new MutationObserver(schedule).observe(view, {childList: true, subtree: true});
  window.addEventListener('resize', schedule, {passive: true});
  coarsePointer.addEventListener?.('change', schedule);
  if (document.fonts?.ready) document.fonts.ready.then(schedule);
  schedule();
})();
