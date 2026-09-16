const scriptSource = document.currentScript?.src;
if (scriptSource && !document.querySelector('link[rel="icon"]')) {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = new URL('favicon.svg', scriptSource).href;
  document.head.append(favicon);
}

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const footerLinks = document.querySelector('.footer-links');

if (menuButton && nav) {
  nav.id ||= 'main-navigation';
  menuButton.setAttribute('aria-controls', nav.id);
}

if (footerLinks) {
  const socialNetworks = [
    {
      name: 'Instagram',
      slug: 'instagram',
      url: 'https://www.instagram.com/alvar_torres_ok/',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.25"/><circle class="icon-fill" cx="17.4" cy="6.7" r="1.1"/></svg>',
    },
    {
      name: 'Facebook',
      slug: 'facebook',
      url: 'https://www.facebook.com/profile.php?id=61587842156510',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="icon-fill" d="M14.2 8.2V6.7c0-.7.5-.9 1-.9h2.7V2.1L14.7 2C11.5 2 9.9 3.9 9.9 6.4v1.8H7v4.1h2.9V22h4.3v-9.7h3.3l.6-4.1h-3.9Z"/></svg>',
    },
    {
      name: 'Linktree',
      slug: 'linktree',
      url: 'https://linktr.ee/alvartorres',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22V8M12 8 5 15M12 8l7 7M12 8H3M12 8h9M12 8 7 3M12 8l5-5"/></svg>',
    },
  ];
  footerLinks.replaceChildren();
  footerLinks.setAttribute('aria-label', 'Redes sociales');
  socialNetworks.forEach(({ name, slug, url, icon }) => {
    const link = document.createElement('a');
    link.className = `social-link social-${slug}`;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${name} de Alvar Torres (abre en una pestaña nueva)`);
    link.innerHTML = `${icon}<span>${name}</span>`;
    footerLinks.append(link);
  });
}

// Los servidores resuelven /bio/ como /bio/index.html. Al abrir el sitio
// directamente desde una carpeta local, hacemos esa resolución explícita.
if (window.location.protocol === 'file:') {
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href?.endsWith('/')) link.setAttribute('href', `${href}index.html`);
  });
}

const headlines = [
  'Argentina necesita un <em>Nuevo Contrato Social.</em>',
  'Un país distinto empieza con un <em>Nuevo Contrato Social.</em>',
  'Un país distinto empieza con <em>reglas distintas.</em>',
  'La transparencia no se promete. <em>Se diseña.</em>',
  'El Estado tiene que rendirte cuentas <em>a vos.</em>',
  'No alcanza con cambiar nombres. Hay que cambiar <em>las reglas.</em>',
  'Cada peso público tiene que estar <em>a la vista.</em>',
  'La política pide confianza. Nosotros proponemos <em>control.</em>',
  'Que el poder no pueda <em>esconderse.</em>',
  'El problema no es la gente. Son <em>las reglas del juego.</em>',
];

const headline = document.querySelector('[data-visit-headline]');
let visitImageIndex = 0;
if (headline) {
  const storageKey = 'alvar-headline-last';
  const imageStorageKey = 'alvar-image-last';
  let lastIndex = -1;
  let lastImageIndex = -1;
  try {
    lastIndex = Number.parseInt(localStorage.getItem(storageKey) ?? '-1', 10);
    lastImageIndex = Number.parseInt(localStorage.getItem(imageStorageKey) ?? '-1', 10);
  } catch (_) {
    // La experiencia sigue funcionando si el navegador bloquea localStorage.
  }
  const available = headlines.map((_, index) => index).filter((index) => index !== lastIndex);
  const randomIndex = available[Math.floor(Math.random() * available.length)];
  const availableImages = Array.from({ length: 7 }, (_, index) => index).filter((index) => index !== lastImageIndex);
  visitImageIndex = availableImages[Math.floor(Math.random() * availableImages.length)];
  headline.innerHTML = headlines[randomIndex];
  try {
    localStorage.setItem(storageKey, String(randomIndex));
    localStorage.setItem(imageStorageKey, String(visitImageIndex));
  } catch (_) {
    // No se necesita persistencia para mostrar una frase.
  }
}

const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const closeMenu = ({ restoreFocus = false } = {}) => {
  if (!menuButton || !nav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (window.matchMedia('(max-width: 980px)').matches) nav.inert = true;
  if (restoreFocus) menuButton.focus();
};

const syncMobileMenu = () => {
  if (!menuButton || !nav) return;
  const mobile = window.matchMedia('(max-width: 980px)').matches;
  if (!mobile) closeMenu();
  nav.inert = mobile && !nav.classList.contains('open');
};

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav.classList.toggle('open', open);
  nav.inert = !open;
  document.body.classList.toggle('menu-open', open);
  if (open) nav.querySelector('a')?.focus();
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) closeMenu({ restoreFocus: true });
});

window.addEventListener('resize', syncMobileMenu, { passive: true });
syncMobileMenu();

const chapterButtons = [...document.querySelectorAll('[data-chapter-button]')];
const chapterPanels = [...document.querySelectorAll('[data-chapter-panel]')];

function selectChapter(chapterId, moveFocus = false) {
  chapterButtons.forEach((button) => {
    const selected = button.dataset.chapterButton === chapterId;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) button.focus();
  });
  chapterPanels.forEach((panel) => {
    const selected = panel.dataset.chapterPanel === chapterId;
    panel.hidden = !selected;
    panel.classList.toggle('active', selected);
  });
}

chapterButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectChapter(button.dataset.chapterButton));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
    const next = (index + direction + chapterButtons.length) % chapterButtons.length;
    selectChapter(chapterButtons[next].dataset.chapterButton, true);
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((item) => observer.observe(item));
}

const images = [...document.querySelectorAll('[data-carousel] img')];
const dotsContainer = document.querySelector('[data-dots]');
const counter = document.querySelector('.portrait-number');

if (images.length && dotsContainer && counter) {
  let currentSlide = 0;
  function showSlide(index) {
    currentSlide = (index + images.length) % images.length;
    if (!images[currentSlide].src && images[currentSlide].dataset.src) images[currentSlide].src = images[currentSlide].dataset.src;
    images.forEach((image, i) => image.classList.toggle('active', i === currentSlide));
    [...dotsContainer.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
    });
    counter.textContent = `${String(currentSlide + 1).padStart(2, '0')}/${String(images.length).padStart(2, '0')}`;
    const nextImage = images[(currentSlide + 1) % images.length];
    if (!nextImage.src && nextImage.dataset.src) nextImage.src = nextImage.dataset.src;
  }
  images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Mostrar foto ${index + 1}`);
    dot.addEventListener('click', () => {
      showSlide(index);
    });
    dotsContainer.append(dot);
  });
  showSlide(visitImageIndex);
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();
