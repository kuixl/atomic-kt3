const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const assemblies = Array.from(document.querySelectorAll('[data-assembly]'));

function playAssembly(section) {
  if (!section || motionPreference.matches) return;
  const item = section.querySelector('.model-window') || section;
  item.classList.remove('is-playing');
  requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('is-playing')));
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      playAssembly(entry.target);
    }
  }, {threshold: .35});
  assemblies.forEach(section => observer.observe(section));
}
document.querySelectorAll('[data-replay]').forEach(button => {
  button.addEventListener('click', () => playAssembly(document.querySelector(button.dataset.replay)));
});
