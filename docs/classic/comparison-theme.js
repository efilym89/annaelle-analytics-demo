/* A presentation-only adapter for the legacy layout. app.js is identical to the
   current mockup: this file only rearranges its rendered nodes and colours.
   It does not read DATA, calculate business metrics or contact external APIs. */
(() => {
  'use strict';
  const view = document.getElementById('view');
  const serviceColors = ['#ffc485', '#fc866c', '#58d6e5', '#8162e6'];
  const ringColors = ['#8162e6', '#fc866c', '#58d6e5', '#ffc485'];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function recolor() {
    view.querySelectorAll('.chart').forEach(chart => {
      chart.querySelectorAll('.chart-svg [stroke="#B77A88"]').forEach(el => el.setAttribute('stroke', '#fc866c'));
      chart.querySelectorAll('.chart-svg [stroke="#798665"]').forEach(el => el.setAttribute('stroke', '#7458ed'));
      chart.querySelectorAll('.chart-svg [fill="#B77A88"]').forEach(el => el.setAttribute('fill', '#fc866c'));
      chart.querySelectorAll('.legend i').forEach((el, i) => { el.style.background = i ? '#7458ed' : '#fc866c'; });
    });
    view.querySelectorAll('.donut').forEach(donut => {
      const circles = Array.from(donut.querySelectorAll('.donut-svg circle'));
      circles.forEach((circle, i) => circle.setAttribute('stroke', i ? ringColors[(i - 1) % ringColors.length] : '#eee9ff'));
      donut.querySelectorAll('.legend i').forEach((el, i) => { el.style.background = ringColors[i % ringColors.length]; });
    });
    view.querySelectorAll('.bar-list').forEach(list => {
      list.querySelectorAll('.bar-fill').forEach((el, i) => { el.style.background = serviceColors[i % serviceColors.length]; });
    });
    view.querySelectorAll('.heat-cell').forEach(cell => {
      cell.style.background = cell.style.background.replace('177, 183, 149', '116, 88, 237');
    });
  }

  function clientStat(metric, label, clone = false) {
    const button = clone ? metric.cloneNode(true) : metric;
    button.className = 'client-stat-button';
    button.querySelector('.mini-label').textContent = label;
    button.querySelectorAll('small,.trend').forEach(el => el.remove());
    return button;
  }

  function legacyServicePanel(panel) {
    const list = panel.querySelector('.bar-list');
    if (!list) return;
    const bars = node('div', 'service-bars');
    const legend = node('div', 'service-legend');
    list.querySelectorAll('.bar-row').forEach((row, index) => {
      const label = row.querySelector('span').textContent;
      const value = row.querySelector('strong').textContent;
      const width = row.querySelector('.bar-fill').style.width;
      const button = node('button', 'bar-column');
      button.dataset.nav = 'sales';
      button.setAttribute('aria-label', label + ': ' + value + ' визитов. Открыть продажи');
      button.title = label + ' · ' + value + ' визитов';
      const fill = node('span', 'bar');
      fill.style.height = width;
      fill.style.background = serviceColors[index % serviceColors.length];
      const letter = String.fromCharCode(97 + index);
      button.append(node('span', 'bar-value', value), fill, node('span', 'bar-letter', letter));
      bars.append(button);
      const item = node('div', 'legend-item');
      const square = node('span', 'legend-square', letter);
      square.style.background = serviceColors[index % serviceColors.length];
      item.append(square, node('span', '', label));
      legend.append(item);
    });
    list.replaceWith(bars, legend);
    panel.classList.add('legacy-service-panel');
  }

  function legacyOverview(grid) {
    if (grid.dataset.legacyReady) return;
    const metricGrid = view.querySelector(':scope > .metric-grid');
    const metrics = metricGrid ? Array.from(metricGrid.children) : [];
    const panels = Array.from(grid.children);
    const findPanel = title => panels.find(panel => panel.querySelector('h2')?.textContent === title);
    const services = findPanel('Популярные услуги');
    const clients = findPanel('Клиенты');
    const line = findPanel('Динамика студии');
    const focus = findPanel('Фокус внимания');
    const branches = findPanel('По филиалам');
    if (metrics.length !== 4 || !services || !clients || !line || !focus || !branches) return;
    grid.dataset.legacyReady = 'true';

    legacyServicePanel(services);
    clients.classList.add('legacy-client-panel');
    const layout = node('div', 'clients-layout');
    const stats = node('div', 'client-stats');
    const repeatText = clients.querySelector('.legend span:nth-child(2)')?.textContent || 'Повторные · 0';
    const repeat = node('button', 'client-stat-button');
    repeat.dataset.nav = 'clients';
    repeat.append(node('span', 'mini-label', 'Повторные'), node('strong', '', repeatText.split(' · ').at(-1)));
    stats.append(clientStat(metrics[2], 'Первый визит', true), repeat, clientStat(metrics[3], 'Всего в периоде'));
    layout.append(stats, clients.querySelector('.donut'));
    clients.append(layout);
    const link = node('button', 'link-button client-detail-link', 'Клиенты и возвратность ↗');
    link.dataset.nav = 'clients';
    clients.append(link);

    const stack = node('div', 'highlight-stack');
    metrics.slice(0, 3).forEach((metric, index) => {
      metric.className = 'highlight ' + ['peach', 'lavender', 'cyan'][index];
      const label = metric.querySelector('.mini-label');
      const value = metric.querySelector('strong');
      const foot = metric.querySelector('small');
      if (index === 0 && value.textContent.endsWith(' сум')) {
        value.textContent = value.textContent.slice(0, -4);
        value.append(node('span', 'currency', ' сум'));
      }
      label.className = 'highlight-label';
      foot.className = 'highlight-foot';
      const copy = node('div');
      copy.append(value, label, foot);
      const symbol = node('span', 'highlight-icon');
      const source = document.querySelector('[data-nav="' + ['sales', 'workload', 'clients'][index] + '"] svg');
      if (source) symbol.append(source.cloneNode(true));
      else symbol.textContent = '↗';
      metric.replaceChildren(copy, symbol);
      stack.append(metric);
    });
    metricGrid.remove();
    line.classList.add('legacy-line-panel');
    focus.className = 'notifications legacy-focus-panel';
    branches.classList.add('legacy-branch-panel');
    grid.replaceChildren(services, clients, stack, line, focus, branches);
    const periodComparison = Array.from(view.children).find(el => el.classList.contains('report-meta') && el.textContent.startsWith('Сравнение:'));
    if (periodComparison) grid.after(periodComparison);
  }

  function decorate() {
    recolor();
    const overview = view.querySelector('.overview-grid');
    if (overview) legacyOverview(overview);
  }
  new MutationObserver(decorate).observe(view, {childList: true, subtree: true});
  decorate();
})();
