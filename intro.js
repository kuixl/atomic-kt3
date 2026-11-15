const dock = document.querySelector('.chapter-dock');
const dockTrigger = document.querySelector('.dock-trigger');
const chapterMenu = document.querySelector('#chapter-menu');
const chatIntro = document.querySelector('#intro-chat');
const motionSetting = matchMedia('(prefers-reduced-motion: reduce)');

function setChapterMenu(open, restoreFocus = false) {
  dock.toggleAttribute('data-open', open);
  dockTrigger.setAttribute('aria-expanded', String(open));
  chapterMenu.inert = !open;
  if (restoreFocus) dockTrigger.focus({preventScroll:true});
}

dockTrigger.addEventListener('click', () => setChapterMenu(!dock.hasAttribute('data-open')));
chapterMenu.addEventListener('click', event => {
  if (event.target.closest('a')) setChapterMenu(false, true);
});
document.addEventListener('pointerdown', event => {
  if (!dock.contains(event.target) && dock.hasAttribute('data-open')) setChapterMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && dock.hasAttribute('data-open')) setChapterMenu(false, true);
});

const masthead = document.querySelector('.bar');
const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => masthead.classList.toggle('is-scrolled', !entry.isIntersecting), {threshold:0});
  observer.observe(hero);
}

function playChat() {
  if (motionSetting.matches) return;
  chatIntro.classList.remove('is-playing');
  requestAnimationFrame(() => requestAnimationFrame(() => chatIntro.classList.add('is-playing')));
}
document.querySelector('.chat-replay').addEventListener('click', playChat);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    playChat();
    observer.disconnect();
  }, {threshold:.22});
  observer.observe(chatIntro);
} else {
  playChat();
}
