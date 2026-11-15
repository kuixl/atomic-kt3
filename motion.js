(() => {
  const scene = document.querySelector('.finale-assembly');
  const film = scene.querySelector('video');
  const replay = document.querySelector('.finale-replay');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function prepare() {
    if (reducedMotion.matches || film.preload !== 'none') return;
    film.preload = 'auto';
    film.load();
  }

  function showStill() {
    scene.classList.remove('is-playing');
    scene.removeAttribute('data-pending');
  }

  function play() {
    if (reducedMotion.matches) return;
    prepare();
    if (film.currentTime > 0) film.currentTime = 0;
    film.play().catch(showStill);
  }

  film.addEventListener('playing', () => scene.classList.add('is-playing'));
  film.addEventListener('ended', showStill);
  film.addEventListener('error', showStill);

  let entrance;
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    scene.setAttribute('data-pending', '');
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      preload.disconnect();
      prepare();
    }, {rootMargin:'420px'});
    entrance = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      entrance.disconnect();
      play();
    }, {rootMargin:'-72px 0px -96px 0px', threshold:.22});
    preload.observe(scene);
    entrance.observe(scene);
  }

  replay.addEventListener('click', () => {
    entrance?.disconnect();
    play();
  });
  reducedMotion.addEventListener('change', ({matches}) => {
    if (!matches) return;
    film.pause();
    showStill();
  });
})();
