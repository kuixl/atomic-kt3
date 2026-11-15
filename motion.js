const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const assemblies = Array.from(document.querySelectorAll('[data-assembly]'));

function playAssembly(section) {
  if (!section || motionPreference.matches) return;
  const item = section.querySelector('.model-window') || section;
  if (item.classList.contains('is-playing')) {
    item.classList.remove('is-playing');
    void item.offsetWidth;
  }
  item.classList.add('is-playing');
  item.removeAttribute('data-pending');
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const isFinale = entry.target.matches('.finale-assembly');
      if (!entry.isIntersecting || entry.intersectionRatio < (isFinale ? .16 : .35)) continue;
      observer.unobserve(entry.target);
      entry.target.removeAttribute('data-pending');
      if (entry.target.querySelector('.is-playing') || entry.target.classList.contains('is-playing')) continue;
      playAssembly(entry.target);
    }
  }, {threshold: [.16, .35]});
  assemblies.forEach(section => {
    if (section.matches('.finale-assembly')) section.setAttribute('data-pending', '');
    observer.observe(section);
  });
}
document.querySelectorAll('[data-replay]').forEach(button => {
  button.addEventListener('click', () => playAssembly(document.querySelector(button.dataset.replay)));
});
