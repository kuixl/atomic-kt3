const scenes = {
  install: ['media/download.png', 'Блок установки Atomic Chat', '01 / Скачивание', 'Установка', 'Переход с лендинга в приложение', '↓', 'prototype/'],
  model: ['prototype/assets/final-02.png', 'Список локальных и облачных моделей', '02 / Выбор модели', 'Модель выбрана', 'Можно начать локальный диалог', '✓', 'prototype/?step=02'],
  answer: ['prototype/assets/final-04.png', 'Первый ответ модели', '03 / Ответ', 'Ответ получен', 'Модель завершила запрос', '✓', 'prototype/?step=04'],
  catalog: ['prototype/assets/final-1.png', 'Ход загрузки модели', '04 / Каталог', 'Модель загружается', 'Прогресс виден прямо в каталоге', '↓', 'prototype/?step=06'],
  error: ['prototype/assets/final-05.png', 'Ошибка генерации', '05 / Восстановление', 'Генерация остановлена', 'Можно повторить запрос или сменить модель', '!', 'prototype/?step=05']
};
const stage = document.querySelector('#story-screen');
const notice = document.querySelector('#story-notice');
const stageFrame = stage.closest('.stage');
const screenLink = document.querySelector('#screen-link');
const beats = Array.from(document.querySelectorAll('.beat'));
const compact = matchMedia('(max-width: 800px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const images = Object.fromEntries(Object.entries(scenes).map(([name, [url]]) => {
  const image = new Image();
  image.src = url;
  return [name, image];
}));
let current = 'install';
let displayed = 'install';
let queued = false;

async function setScene(name) {
  if (name === current) return;
  current = name;
  const [image, alt, label, title, message, icon, target] = scenes[name];
  try { await images[name].decode(); } catch { /* The linked frame remains available. */ }
  if (current !== name || displayed === name) return;
  displayed = name;
  screenLink.querySelector('.outgoing')?.remove();
  if (!reduced.matches) {
    const outgoing = stage.cloneNode();
    outgoing.removeAttribute('id');
    outgoing.alt = '';
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.className = 'outgoing';
    outgoing.addEventListener('animationend', () => outgoing.remove(), {once:true});
    screenLink.prepend(outgoing);
  }
  stageFrame.dataset.scene = name;
  stage.src = image;
  stage.alt = alt;
  screenLink.href = image;
  document.querySelector('#stage-label').textContent = label;
  document.querySelector('#stage-link').href = target;
  document.querySelector('#story-icon').textContent = icon;
  document.querySelector('#story-notice-title').textContent = title;
  document.querySelector('#story-notice-text').textContent = message;
  stage.classList.remove('swap');
  notice.classList.remove('pop');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (displayed !== name) return;
    stage.classList.add('swap');
    notice.classList.add('pop');
  }));
}

function update() {
  queued = false;
  const range = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--progress', range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0);
  const composition = document.querySelector('.composition');
  if (!reduced.matches && !compact.matches) {
    const rect = composition.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) {
      const offset = Math.max(-24, Math.min(24, (innerHeight * .45 - rect.top) * .055));
      composition.style.setProperty('--drift', offset.toFixed(1) + 'px');
    }
  }
  if (compact.matches) return;
  const active = beats.find(beat => beat.getBoundingClientRect().bottom >= innerHeight * .56);
  setScene((active || beats.at(-1)).dataset.scene);
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
  const reveals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      reveals.unobserve(entry.target);
    }
  }, {threshold:.08});
  for (const node of document.querySelectorAll('.reveal, .beat')) reveals.observe(node);
  const stageEntry = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    stageFrame.classList.add('on-screen');
    stageEntry.disconnect();
  }, {threshold:.28});
  stageEntry.observe(stageFrame);
}
