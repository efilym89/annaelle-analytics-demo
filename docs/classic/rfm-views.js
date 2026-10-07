/* Two presentations of the same RFM rows. No data fetching or classification here. */
(function () {
  'use strict';

  const STORAGE_KEY = 'annaelle-rfm-view-v1';
  const segments = [
    { name: 'Чемпионы', tone: 'violet', icon: 'crown', description: 'Частые и недавние визиты' },
    { name: 'Лояльные', tone: 'sage', icon: 'heart', description: 'Регулярно возвращаются' },
    { name: 'Новички', tone: 'sky', icon: 'spark', description: 'Первый визит состоялся недавно' },
    { name: 'Нужно внимание', tone: 'peach', icon: 'clock', description: 'Не входят в остальные сегменты' },
    { name: 'Под риском', tone: 'rose', icon: 'attention', description: 'Последний визит 76–120 дней назад' },
    { name: 'Спящие', tone: 'slate', icon: 'moon', description: 'Не были более 120 дней' }
  ];
  const icons = {
    tiles: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    charts: '<path d="M4 4v16h16M8 15v-4m5 4V7m5 8v-6"/>',
    crown: '<path d="m3 7 4 3 5-6 5 6 4-3-2 11H5L3 7ZM6 21h12"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    attention: '<path d="m10.3 4.6-8 13.9A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.5l-8-13.9a2 2 0 0 0-3.4 0ZM12 9v5m0 3v.1"/>',
    moon: '<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>'
  };
  let currentView = 'tiles';
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'charts') currentView = 'charts';
  } catch { /* Browser preferences are optional. */ }

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>';
  }

  function finite(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }

  function aggregate(rows) {
    return segments.map(segment => {
      const members = rows.filter(row => row.segment === segment.name);
      const total = key => members.reduce((result, row) => result + finite(row[key]), 0);
      return {
        ...segment,
        count: members.length,
        share: rows.length ? members.length / rows.length * 100 : 0,
        money: total('m'),
        recency: members.length ? total('r') / members.length : null,
        frequency: members.length ? total('f') / members.length : null
      };
    });
  }

  function toolbar() {
    return '<div class="rfm-toolbar"><div><h2 id="rfm-heading">Клиентские сегменты</h2><p>Два вида одного отчёта. Состав клиентов и суммы не меняются.</p></div>' +
      '<div class="rfm-view-switch" role="group" aria-label="Вид RFM-анализа">' +
      [['tiles', 'Плитки'], ['charts', 'Графики']].map(([view, label]) =>
        '<button type="button" data-rfm-view="' + view + '" aria-pressed="' + (view === currentView) + '" aria-controls="rfm-presentation">' + icon(view) + '<span>' + label + '</span></button>'
      ).join('') + '</div></div>';
  }

  function tiles(groups, total, format) {
    const { num, money, esc } = format;
    return '<div class="rfm-tiles">' + groups.map((group, index) =>
      '<article class="rfm-segment rfm-tone-' + group.tone + (group.count ? '' : ' is-empty') + '" aria-labelledby="rfm-segment-' + index + '">' +
        '<div class="rfm-segment-head"><span class="rfm-segment-icon">' + icon(group.icon) + '</span>' +
        '<span class="rfm-segment-share">' + (total ? esc(num(group.share, 1)) + '% базы' : 'Нет выборки') + '</span></div>' +
        '<h3 id="rfm-segment-' + index + '">' + esc(group.name) + '</h3><p class="rfm-segment-description">' + esc(group.description) + '</p>' +
        '<div class="rfm-segment-count"><strong>' + esc(num(group.count)) + '</strong><span>клиентов</span></div>' +
        '<div class="rfm-share-track" aria-hidden="true"><span style="--rfm-bar:' + group.share.toFixed(3) + '%"></span></div>' +
        '<dl class="rfm-segment-stats"><div><dt>R · дней без визита</dt><dd>' + esc(num(group.recency, 1)) + '</dd></div>' +
        '<div><dt>F · визитов на клиента</dt><dd>' + esc(num(group.frequency, 1)) + '</dd></div>' +
        '<div class="rfm-money-stat"><dt>M · платежи сегмента</dt><dd>' + esc(money(group.money)) + '</dd></div></dl>' +
      '</article>'
    ).join('') + '</div><p class="rfm-view-note">R и F — средние по сегменту. M — сумма платежей минус возвраты за историю до даты среза.</p>';
  }

  function clientChart(groups, total, format) {
    const { num, esc } = format;
    const circumference = 2 * Math.PI * 68;
    let offset = 0;
    const arcs = groups.map(group => {
      const arc = total ? group.count / total * circumference : 0;
      const circle = '<circle class="rfm-ring-segment rfm-tone-' + group.tone + '" cx="100" cy="100" r="68" stroke-dasharray="' + arc.toFixed(4) + ' ' + (circumference - arc).toFixed(4) + '" stroke-dashoffset="' + (-offset).toFixed(4) + '"/>';
      offset += arc;
      return circle;
    }).join('');
    return '<section class="panel rfm-chart-panel" aria-labelledby="rfm-count-title"><div class="rfm-chart-heading"><h3 id="rfm-count-title">Состав клиентской базы</h3><p>Количество и доля каждого сегмента</p></div>' +
      '<div class="rfm-distribution"><div class="rfm-donut"><svg class="rfm-donut-svg" viewBox="0 0 200 200" aria-hidden="true"><circle class="rfm-ring-track" cx="100" cy="100" r="68"/>' + arcs + '</svg>' +
      '<div class="rfm-donut-center"><strong>' + esc(num(total)) + '</strong><span>клиентов</span></div></div>' +
      '<ul class="rfm-chart-legend">' + groups.map(group => '<li class="rfm-tone-' + group.tone + '"><span class="rfm-legend-dot" aria-hidden="true"></span><span>' + esc(group.name) + '</span><strong>' + esc(num(group.count)) + '</strong><small>' + (total ? esc(num(group.share, 1)) + '%' : '—') + '</small></li>').join('') + '</ul></div>' +
      (!total ? '<p class="rfm-chart-empty">Для выбранных условий клиентов нет.</p>' : '') + '</section>';
  }

  function paymentsChart(groups, format) {
    const { num, money, esc } = format;
    const maximum = Math.max(0, ...groups.map(group => Math.abs(group.money)));
    const totalMoney = groups.reduce((total, group) => total + group.money, 0);
    const hasNegative = groups.some(group => group.money < 0);
    return '<section class="panel rfm-chart-panel" aria-labelledby="rfm-payments-title"><div class="rfm-chart-heading"><h3 id="rfm-payments-title">Платежи по сегментам</h3><p>Чистые поступления за историю до даты среза</p></div>' +
      '<div class="rfm-payments-total"><strong>' + esc(num(totalMoney)) + '</strong><span>сум · всего</span></div>' +
      '<ul class="rfm-payment-bars">' + groups.map(group => '<li class="rfm-tone-' + group.tone + (group.money < 0 ? ' is-negative' : '') + '"><div class="rfm-payment-label"><span>' + esc(group.name) + '</span><strong>' + esc(money(group.money)) + '</strong></div>' +
        '<div class="rfm-payment-track" aria-hidden="true"><span style="--rfm-bar:' + (maximum ? Math.abs(group.money) / maximum * 100 : 0).toFixed(3) + '%"></span></div></li>').join('') + '</ul>' +
      '<p class="rfm-view-note">' + (hasNegative ? 'Минус означает, что возвраты превысили платежи. Длина полосы показывает абсолютную сумму.' : 'Продажа и использование абонемента не задваивают поступления.') + '</p></section>';
  }

  window.renderRfmViews = function (rows, format) {
    const groups = aggregate(rows);
    const content = currentView === 'charts'
      ? '<div class="rfm-charts">' + clientChart(groups, rows.length, format) + paymentsChart(groups, format) + '</div>'
      : tiles(groups, rows.length, format);
    return '<section class="rfm-workspace" aria-labelledby="rfm-heading">' + toolbar() +
      '<div id="rfm-presentation" data-rfm-presentation="' + currentView + '">' + content + '</div></section>';
  };

  function selectView(view, restoreFocus) {
    if (!['tiles', 'charts'].includes(view) || currentView === view) return;
    currentView = view;
    try { localStorage.setItem(STORAGE_KEY, view); } catch { /* Session choice still works. */ }
    document.dispatchEvent(new CustomEvent('annaelle:rfm-viewchange', { detail: { view } }));
    if (restoreFocus) requestAnimationFrame(() => {
      const button = document.querySelector('.rfm-view-switch [data-rfm-view="' + view + '"]');
      if (button) button.focus({ preventScroll: true });
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.rfm-view-switch [data-rfm-view]');
    if (button) selectView(button.dataset.rfmView, true);
  });
  document.addEventListener('keydown', event => {
    const button = event.target.closest('.rfm-view-switch [data-rfm-view]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const view = event.key === 'Home' ? 'tiles' : event.key === 'End' ? 'charts' : currentView === 'tiles' ? 'charts' : 'tiles';
    if (view === currentView) return;
    selectView(view, true);
  });
})();
