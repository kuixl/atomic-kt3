const steps = {
  landing: ['media/hero.png', 'Первый экран Atomic Chat', 'С первого экрана можно перейти к скачиванию или посмотреть возможности продукта.', 'prototype/'],
  model: ['prototype/assets/final-02.png', 'Список локальных и облачных моделей', 'Список отделяет локальные модели от облачных. Выбранная модель отмечена галочкой.', 'prototype/?step=02'],
  answer: ['prototype/assets/final-04.png', 'Ответ модели в диалоге', 'После генерации ответ остаётся в истории диалога. Следующее сообщение можно отправить из того же окна.', 'prototype/?step=04'],
  error: ['prototype/assets/final-05.png', 'Ошибка генерации с кнопкой повтора', 'Сообщение объясняет, почему генерация остановилась. Из него можно повторить запрос или сменить модель.', 'prototype/?step=05']
};
const stepImage = document.querySelector('#step-image');
for (const button of document.querySelectorAll('[data-step]')) {
  button.addEventListener('click', () => {
    document.querySelector('.steps [aria-pressed="true"]').setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    const [source, alt, caption, link] = steps[button.dataset.step];
    stepImage.classList.remove('swap');
    stepImage.src = source;
    stepImage.alt = alt;
    requestAnimationFrame(() => requestAnimationFrame(() => stepImage.classList.add('swap')));
    document.querySelector('#step-caption').textContent = caption;
    document.querySelector('#step-link').href = link;
  });
}

const pagePicker = document.querySelector('#page-picker');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
for (let page = 1; page <= 15; page += 1) {
  pagePicker.add(new Option(String(page), String(page)));
}
function showPage(page) {
  pagePicker.value = String(page);
  const image = document.querySelector('#page-image');
  image.src = 'report/page-' + String(page).padStart(2, '0') + '.webp';
  image.alt = 'Страница ' + page + ' отчёта КТ3';
  document.querySelector('#page-link').href = 'atomic-kt3.pdf#page=' + page;
  previous.disabled = page === 1;
  next.disabled = page === 15;
}
pagePicker.addEventListener('change', () => showPage(Number(pagePicker.value)));
previous.addEventListener('click', () => showPage(Number(pagePicker.value) - 1));
next.addEventListener('click', () => showPage(Number(pagePicker.value) + 1));
showPage(1);
document.querySelector('#reader').hidden = false;

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }, {threshold: .14});
  for (const item of document.querySelectorAll('.reveal')) observer.observe(item);
}
