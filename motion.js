const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const sceneFilms = new Map(Array.from(document.querySelectorAll('[data-assembly]'), scene => [
  scene, {film:scene.querySelector('video'), cue:scene.querySelector('[data-film-cue]') || scene}
]));

function prepareFilm(film) {
  if (motionPreference.matches || film.preload !== 'none') return;
  film.preload = 'auto';
  film.load();
}

function playFilm(scene, film) {
  if (motionPreference.matches) return;
  prepareFilm(film);
  if (film.currentTime > 0) film.currentTime = 0;
  film.play().catch(() => {
    scene.classList.remove('is-playing');
    scene.removeAttribute('data-pending');
  });
}

const supportsObserver = 'IntersectionObserver' in window;
const preloader = supportsObserver ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    preloader.unobserve(entry.target);
    prepareFilm(sceneFilms.get(entry.target).film);
  }
}, {rootMargin:'420px'}) : null;

const entrances = supportsObserver ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entrances.unobserve(entry.target);
    const scene = entry.target.closest('[data-assembly]');
    playFilm(scene, sceneFilms.get(scene).film);
  }
}, {rootMargin:'-72px 0px -96px 0px', threshold:.22}) : null;

for (const [scene, {film, cue}] of sceneFilms) {
  film.addEventListener('playing', () => scene.classList.add('is-playing'));
  film.addEventListener('ended', () => {
    scene.removeAttribute('data-pending');
    scene.classList.remove('is-playing');
  });
  film.addEventListener('error', () => {
    scene.removeAttribute('data-pending');
    scene.classList.remove('is-playing');
  });
  if (!motionPreference.matches && entrances) {
    if (scene.matches('.finale-assembly')) scene.setAttribute('data-pending', '');
    preloader.observe(scene);
    entrances.observe(cue);
  }
}

document.querySelectorAll('[data-replay]').forEach(button => {
  button.addEventListener('click', () => {
    const scene = document.querySelector(button.dataset.replay);
    const {film, cue} = sceneFilms.get(scene);
    entrances?.unobserve(cue);
    playFilm(scene, film);
  });
});

motionPreference.addEventListener('change', ({matches}) => {
  if (!matches) return;
  for (const [scene, {film}] of sceneFilms) {
    film.pause();
    scene.classList.remove('is-playing');
    scene.removeAttribute('data-pending');
  }
});
