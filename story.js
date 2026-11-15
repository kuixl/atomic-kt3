const beats = Array.from(document.querySelectorAll('.beat'));
const frames = Array.from(document.querySelectorAll('.screen-layer'));
const route = Array.from(document.querySelectorAll('.route a'));
const stageLabel = document.querySelector('#stage-label');
const stageLink = document.querySelector('#stage-link');
const stageZoom = document.querySelector('#stage-zoom');
const compact = matchMedia('(max-width: 800px)');
const assets = new Map();
let active = 0;
let visibleLayer = 0;
let revision = 0;
let queued = false;
let fadeCleanup;

function loadImage(src) {
  if (!assets.has(src)) {
    const image = new Image();
    image.src = src;
    assets.set(src, image.decode().catch(error => {
      assets.delete(src);
      throw error;
    }));
  }
  return assets.get(src);
}

const scenes = beats.map(beat => {
  const image = beat.querySelector('img');
  return {
    src: image.getAttribute('src'),
    alt: image.alt,
    label: beat.querySelector('.meta').textContent,
    href: beat.querySelector('a').getAttribute('href')
  };
});

route.forEach((link, index) => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = beats[index];
    history.replaceState(null, '', '#' + target.id);
    target.scrollIntoView({behavior:'instant',block:'start'});
    showScene(index);
  });
});

async function showScene(index) {
  if (index === active) return;
  active = index;
  const change = ++revision;
  const {src, alt, label, href} = scenes[index];
  const nextLayer = 1 - visibleLayer;
  const nextFrame = frames[nextLayer];
  try {
    await loadImage(src);
    if (change !== revision) return;
    clearTimeout(fadeCleanup);
    nextFrame.classList.remove('underlay');
    nextFrame.src = src;
    await nextFrame.decode();
  } catch {
    if (change === revision) active = -1;
    return;
  }
  if (change !== revision) return;
  const previous = frames[visibleLayer];
  previous.classList.add('underlay');
  previous.classList.remove('is-visible');
  previous.setAttribute('aria-hidden', 'true');
  nextFrame.alt = alt;
  nextFrame.removeAttribute('aria-hidden');
  nextFrame.classList.add('is-visible');
  visibleLayer = nextLayer;
  fadeCleanup = setTimeout(() => previous.classList.remove('underlay'), 210);
  stageLabel.textContent = label;
  stageLink.href = href;
  stageZoom.dataset.zoom = src;
  route.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
  if (scenes[index + 1]) loadImage(scenes[index + 1].src).catch(() => {});
}

function update() {
  queued = false;
  const range = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--progress', range > 0 ? scrollY / range : 0);
  if (compact.matches) return;
  const index = beats.findIndex(beat => beat.getBoundingClientRect().bottom >= innerHeight * .52);
  showScene(index < 0 ? beats.length - 1 : index);
}

function scheduleUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}
window.addEventListener('scroll', scheduleUpdate, {passive:true});
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('load', scheduleUpdate);
scheduleUpdate();

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      reveal.unobserve(entry.target);
    }
  }, {threshold: .08});
  for (const node of document.querySelectorAll('.reveal, .beat')) reveal.observe(node);
  const warmup = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    if (compact.matches) return;
    loadImage(scenes[1].src).catch(() => {});
    loadImage(scenes[2].src).catch(() => {});
    warmup.disconnect();
  }, {rootMargin: '550px'});
  warmup.observe(document.querySelector('#scenario'));
}

const dialog = document.querySelector('#image-dialog');
const viewport = dialog.querySelector('.image-viewport');
const detail = viewport.querySelector('img');
let scale = 1;

function zoom(value) {
  scale = Math.max(1, Math.min(3, value));
  detail.style.width = scale * 100 + '%';
  document.querySelector('#zoom-out').disabled = scale <= 1;
  document.querySelector('#zoom-in').disabled = scale >= 3;
}

for (const beat of beats) {
  const button = document.createElement('button');
  button.className = 'zoom-control mobile-zoom';
  button.type = 'button';
  button.dataset.zoom = beat.querySelector('img').getAttribute('src');
  button.textContent = 'Увеличить экран +';
  beat.querySelector('img').after(button);
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-zoom]');
  if (!button) return;
  detail.src = button.dataset.zoom;
  detail.alt = button.closest('figure, article')?.querySelector('img')?.alt || 'Экран Atomic Chat';
  dialog.showModal();
  zoom(1);
  viewport.scrollTo(0, 0);
});
document.querySelector('#zoom-in').onclick = () => zoom(scale + .5);
document.querySelector('#zoom-out').onclick = () => zoom(scale - .5);
dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
