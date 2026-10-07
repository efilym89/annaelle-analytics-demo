/* Progressive enhancement: the native select remains the source of form values. */
(() => {
  'use strict';

  const controls = new Set();
  const enhanced = new WeakMap();
  let serial = 0;
  let opened = null;
  let updateFrame = 0;
  let positionFrame = 0;
  let typeBuffer = '';
  let typeTimer = 0;
  const chevron = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const check = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 10 3 3 7-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const available = item => !item.disabled && !item.hidden && !item.parentElement?.disabled;
  const optionsOf = control => Array.from(control.select.options).filter(option => !option.hidden);

  function close(restoreFocus = false) {
    if (!opened) return;
    const control = opened;
    opened = null;
    control.button.setAttribute('aria-expanded', 'false');
    control.button.removeAttribute('aria-activedescendant');
    control.wrapper.classList.remove('is-open');
    control.popup?.remove();
    control.popup = null;
    document.documentElement.removeAttribute('data-select-open');
    typeBuffer = '';
    clearTimeout(typeTimer);
    if (restoreFocus && control.button.isConnected) control.button.focus({preventScroll: true});
  }

  function positionPopup() {
    positionFrame = 0;
    const control = opened;
    if (!control?.popup) return;
    if (!control.button.isConnected || !control.button.getClientRects().length || control.button.closest('[inert]')) return close();
    const rect = control.button.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width || window.innerWidth;
    const viewportHeight = viewport?.height || window.innerHeight;
    const originX = viewport?.offsetLeft || 0;
    const originY = viewport?.offsetTop || 0;
    if (rect.bottom < originY || rect.top > originY + viewportHeight) return close();
    const gutter = 12;
    const width = Math.min(Math.max(rect.width, 244), viewportWidth - gutter * 2);
    const below = originY + viewportHeight - rect.bottom - gutter - 8;
    const above = rect.top - originY - gutter - 8;
    control.popup.style.width = width + 'px';
    const desired = Math.min(control.popup.scrollHeight + 2, 340);
    const upwards = below < Math.min(desired, 200) && above > below;
    const height = Math.min(desired, Math.max(80, upwards ? above : below));
    const left = Math.max(originX + gutter, Math.min(rect.left, originX + viewportWidth - width - gutter));
    control.popup.style.maxHeight = height + 'px';
    control.popup.style.left = left + 'px';
    control.popup.style.top = Math.max(originY + gutter, upwards ? rect.top - height - 8 : rect.bottom + 8) + 'px';
    control.popup.dataset.direction = upwards ? 'up' : 'down';
  }

  function queuePosition() {
    if (opened && !positionFrame) positionFrame = requestAnimationFrame(positionPopup);
  }

  function setActive(control, index, scroll = true) {
    const options = optionsOf(control);
    if (!options[index] || !available(options[index])) return;
    control.activeIndex = index;
    control.popup.querySelectorAll('[role="option"]').forEach((element, optionIndex) => {
      element.classList.toggle('is-active', optionIndex === index);
    });
    const active = control.popup.querySelector('[data-option-index="' + index + '"]');
    control.button.setAttribute('aria-activedescendant', active.id);
    if (scroll) active.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }

  function open(control, direction = 0) {
    if (control.select.disabled) return;
    if (opened === control) return;
    close();
    const popup = document.createElement('div');
    popup.id = control.listId;
    popup.className = 'select-menu';
    popup.setAttribute('role', 'listbox');
    popup.setAttribute('aria-label', control.label);
    const options = optionsOf(control);
    let previousGroup = null;
    options.forEach((option, index) => {
      const group = option.parentElement.tagName === 'OPTGROUP' ? option.parentElement.label : null;
      if (group && group !== previousGroup) {
        const heading = document.createElement('div');
        heading.className = 'select-menu-group';
        heading.textContent = group;
        heading.setAttribute('role', 'presentation');
        popup.append(heading);
      }
      previousGroup = group;
      const item = document.createElement('div');
      item.id = control.listId + '-option-' + index;
      item.className = 'select-menu-option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));
      item.dataset.optionIndex = index;
      if (!available(option)) item.setAttribute('aria-disabled', 'true');
      const text = document.createElement('span');
      text.textContent = option.label;
      item.append(text);
      item.insertAdjacentHTML('beforeend', check);
      popup.append(item);
    });
    control.popup = popup;
    opened = control;
    control.button.focus({preventScroll: true});
    control.wrapper.classList.add('is-open');
    control.button.setAttribute('aria-expanded', 'true');
    document.documentElement.setAttribute('data-select-open', '');
    // Keep a dialog's popup inside its accessibility tree. Keyboard focus stays
    // on the combobox, so list options do not create a second focus trap.
    const host = control.button.closest('[role="dialog"]') || document.body;
    host.append(popup);
    positionPopup();
    const selected = options.findIndex(option => option.selected && available(option));
    const first = options.findIndex(available);
    const last = options.map(available).lastIndexOf(true);
    setActive(control, selected >= 0 ? selected : direction < 0 ? last : first);
    popup.addEventListener('pointerdown', event => event.preventDefault());
    popup.addEventListener('pointermove', event => {
      const option = event.target.closest('[data-option-index]');
      if (option) setActive(control, Number(option.dataset.optionIndex), false);
    });
    popup.addEventListener('click', event => {
      const option = event.target.closest('[data-option-index]');
      if (option) choose(control, Number(option.dataset.optionIndex));
    });
  }

  function choose(control, index) {
    const option = optionsOf(control)[index];
    if (!option || !available(option)) return;
    const previous = control.select.value;
    const identity = control.select.id ? '#' + CSS.escape(control.select.id) : control.select.dataset.filter ? 'select[data-filter="' + CSS.escape(control.select.dataset.filter) + '"]' : null;
    control.select.value = option.value;
    close();
    sync(control);
    if (previous !== option.value) {
      control.select.dispatchEvent(new Event('input', {bubbles: true}));
      control.select.dispatchEvent(new Event('change', {bubbles: true}));
    }
    // Report filters are re-rendered after change. Restore the same field,
    // not a detached button, and never move the page's scroll position.
    enhanceAll();
    const next = control.button.isConnected ? control : identity ? enhanced.get(document.querySelector(identity)) : null;
    next?.button.focus({preventScroll: true});
  }

  function move(control, direction) {
    const options = optionsOf(control);
    let index = control.activeIndex;
    for (let step = 0; step < options.length; step++) {
      index = (index + direction + options.length) % options.length;
      if (available(options[index])) return setActive(control, index);
    }
  }

  function onKey(control, event) {
    const isOpen = opened === control;
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      return close(true);
    }
    if (event.key === 'Tab') return close();
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (!isOpen) {
        open(control, event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1);
        if (event.key !== 'Home' && event.key !== 'End') return;
      }
      if (event.key === 'Enter' || event.key === ' ') return choose(control, control.activeIndex);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') return move(control, event.key === 'ArrowDown' ? 1 : -1);
      const indices = optionsOf(control).map((option, index) => available(option) ? index : -1).filter(index => index >= 0);
      return setActive(control, event.key === 'Home' ? indices[0] : indices[indices.length - 1]);
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      if (!isOpen) open(control);
      const character = event.key.toLocaleLowerCase('ru');
      typeBuffer += character;
      clearTimeout(typeTimer);
      typeTimer = setTimeout(() => { typeBuffer = ''; }, 650);
      const options = optionsOf(control);
      const repeated = typeBuffer.length > 1 && Array.from(typeBuffer).every(letter => letter === character);
      const term = repeated ? character : typeBuffer;
      const start = repeated ? control.activeIndex + 1 : 0;
      for (let step = 0; step < options.length; step++) {
        const index = (start + step) % options.length;
        if (available(options[index]) && options[index].label.toLocaleLowerCase('ru').startsWith(term)) return setActive(control, index);
      }
    }
  }

  function sync(control) {
    const label = control.select.selectedOptions[0]?.label || 'Выберите значение';
    if (control.text.textContent !== label) control.text.textContent = label;
    if (control.button.disabled !== control.select.disabled) control.button.disabled = control.select.disabled;
    control.button.title = label;
    const labelName = control.select.getAttribute('aria-label') || control.select.name || 'Выбор';
    if (control.label !== labelName) {
      control.label = labelName;
      control.button.setAttribute('aria-label', labelName + ': ' + label);
    } else if (control.button.getAttribute('aria-label') !== labelName + ': ' + label) {
      control.button.setAttribute('aria-label', labelName + ': ' + label);
    }
  }

  function enhance(select) {
    if (select.multiple || select.size > 1 || select.closest('[data-native-select]')) return;
    const wrapper = document.createElement('span');
    wrapper.className = 'custom-select';
    const button = document.createElement('button');
    const listId = 'annaelle-select-' + (++serial);
    button.type = 'button';
    button.className = 'select-trigger';
    button.setAttribute('role', 'combobox');
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', listId);
    button.setAttribute('aria-autocomplete', 'none');
    const text = document.createElement('span');
    text.className = 'select-trigger-value';
    button.append(text);
    button.insertAdjacentHTML('beforeend', chevron);
    select.before(wrapper);
    wrapper.append(select, button);
    select.classList.add('is-enhanced-select');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    const control = {select, wrapper, button, text, listId, label: '', popup: null, activeIndex: -1};
    enhanced.set(select, control);
    controls.add(control);
    sync(control);
    button.addEventListener('click', () => opened === control ? close() : open(control));
    button.addEventListener('keydown', event => onKey(control, event));
    select.addEventListener('change', () => sync(control));
    const label = wrapper.closest('label');
    label?.addEventListener('click', event => {
      if (event.target === label || event.target.closest('.filter-icon')) button.click();
    });
  }

  function enhanceAll() {
    updateFrame = 0;
    controls.forEach(control => {
      if (!control.select.isConnected) {
        if (opened === control) close();
        controls.delete(control);
      } else sync(control);
    });
    document.querySelectorAll('select:not(.is-enhanced-select)').forEach(enhance);
  }

  new MutationObserver(() => {
    if (!updateFrame) updateFrame = requestAnimationFrame(enhanceAll);
  }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'selected']});
  document.addEventListener('pointerdown', event => {
    if (opened && !opened.wrapper.contains(event.target) && !opened.popup?.contains(event.target)) close();
  }, true);
  document.addEventListener('focusin', event => {
    if (opened && !opened.wrapper.contains(event.target) && !opened.popup?.contains(event.target)) close();
  });
  window.addEventListener('resize', queuePosition, {passive: true});
  window.addEventListener('scroll', event => {
    if (opened?.popup?.contains(event.target)) return;
    queuePosition();
  }, {passive: true, capture: true});
  window.visualViewport?.addEventListener('resize', queuePosition, {passive: true});
  window.visualViewport?.addEventListener('scroll', queuePosition, {passive: true});
  window.addEventListener('hashchange', () => close());
  window.addEventListener('popstate', () => close());
  document.addEventListener('change', () => {
    if (!updateFrame) updateFrame = requestAnimationFrame(enhanceAll);
  });
  enhanceAll();
})();
