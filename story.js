const scenes = {
  install: ['media/download.png', 'Блок установки Atomic Chat', '01 / Скачивание', 'Установка', 'Переход с лендинга в приложение', '↓', 'prototype/'],
  model: ['prototype/assets/final-02.png', 'Список локальных и облачных моделей', '02 / Выбор модели', 'Модель выбрана', 'Можно начать локальный диалог', '✓', 'prototype/?step=02'],
  answer: ['prototype/assets/final-04.png', 'Первый ответ модели', '03 / Ответ', 'Ответ получен', 'Модель завершила запрос', '✓', 'prototype/?step=04'],
  catalog: ['prototype/assets/final-1.png', 'Ход загрузки модели', '04 / Каталог', 'Модель загружается', 'Прогресс виден прямо в каталоге', '↓', 'prototype/?step=06'],
  error: ['prototype/assets/final-05.png', 'Ошибка генерации', '05 / Восстановление', 'Генерация остановлена', 'Можно повторить запрос или сменить модель', '!', 'prototype/?step=05']
};
const stage = document.querySelector('#story-screen');
const notice = document.querySelector('#story-notice');
const beats = Array.from(document.querySelectorAll('.beat'));
const compact = matchMedia('(max-width: 800px)');
let current = 'install';
let queued = false;

function setScene(name) {
  if (name === current) return;
  current = name;
  const [image, alt, label, title, message, icon, target] = scenes[name];
  stage.src = image;
  stage.alt = alt;
  document.querySelector('#screen-link').href = image;
  document.querySelector('#stage-label').textContent = label;
  document.querySelector('#stage-link').href = target;
  document.querySelector('#story-icon').textContent = icon;
  document.querySelector('#story-notice-title').textContent = title;
  document.querySelector('#story-notice-text').textContent = message;
  stage.classList.remove('swap');
  notice.classList.remove('pop');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    stage.classList.add('swap');
    notice.classList.add('pop');
  }));
}

function update() {
  queued = false;
  const range = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--progress', range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0);
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
  for (const node of document.querySelectorAll('.reveal')) reveals.observe(node);
}
