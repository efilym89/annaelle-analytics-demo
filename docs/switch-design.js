// Preserve the selected report and filters when comparing the two public designs.
document.addEventListener('click', function(event) {
  const link = event.target.closest('[data-design-target]');
  if (link) link.href = link.dataset.designTarget + (window.location.hash || '#overview');
});
