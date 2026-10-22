/**
 * navigation.js
 * -----------------------------------------------------------------------------
 * Responsabilidades:
 *  1. Activar el estado visual del header al hacer scroll (.is-scrolled).
 *  2. Abrir/cerrar el menú móvil de forma accesible (foco, Esc, scroll lock).
 *  3. Marcar el enlace activo según la sección visible (cuando existan).
 *
 * No hay dependencias externas. Se inicializa desde js/main.js.
 */

/* Selectores centralizados: si cambias el HTML, solo tocas este objeto. */
const SELECTORS = {
  header: '[data-header]',
  toggle: '[data-nav-toggle]',
  menu: '[data-mobile-nav]',
  navLink: '[data-nav-link]',
  // Todas las secciones que tengan id y estén enlazadas por la navegación
  section: 'main section[id]',
};

const SCROLL_THRESHOLD = 16; // px de scroll antes de aplicar el fondo del header
const DESKTOP_QUERY = '(min-width: 960px)'; // debe coincidir con components.css

const IS_FR = (document.documentElement.lang || 'es').toLowerCase().startsWith('fr');
const COPY = IS_FR
  ? { open: 'Ouvrir le menu', close: 'Fermer le menu' }
  : { open: 'Abrir menú', close: 'Cerrar menú' };

/* =============================================================================
   HEADER AL HACER SCROLL
   Usa requestAnimationFrame para no saturar el hilo principal.
   ========================================================================== */
function initScrollState(header) {
  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update(); // estado correcto al recargar a mitad de página
}

/* =============================================================================
   MENÚ MÓVIL
   ========================================================================== */
function initMobileMenu(header, toggle, menu) {
  const desktop = window.matchMedia(DESKTOP_QUERY);
  const pageMain = document.querySelector('main');
  const focusableSelector =
    'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

  const isOpen = () => !menu.hidden;

  const open = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', COPY.close);
    document.body.classList.add('is-locked');
    header.classList.add('is-menu-open');
    // El contenido de detrás queda inaccesible para teclado y lectores de pantalla
    pageMain?.setAttribute('inert', '');

    // Llevamos el foco al primer enlace para lectores de pantalla y teclado
    const firstLink = menu.querySelector(focusableSelector);
    firstLink?.focus({ preventScroll: true });
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!isOpen()) return;

    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', COPY.open);
    document.body.classList.remove('is-locked');
    header.classList.remove('is-menu-open');
    pageMain?.removeAttribute('inert');

    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  /* Botón hamburguesa */
  toggle.addEventListener('click', () => {
    isOpen() ? close() : open();
  });

  /* Cualquier enlace del overlay cierra el menú (luego el ancla hace scroll) */
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => close({ restoreFocus: false }));
  });

  /* Cerrar con Escape */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      close();
    }

    /* Foco atrapado dentro de header + menú mientras está abierto */
    if (event.key === 'Tab' && isOpen()) {
      const focusables = [...header.querySelectorAll(focusableSelector), ...menu.querySelectorAll(focusableSelector)]
        .filter(
          (element) =>
            element.offsetParent !== null &&
            window.getComputedStyle(element).visibility !== 'hidden'
        );

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* Si el usuario pasa a desktop con el menú abierto, lo cerramos sin robar foco */
  desktop.addEventListener('change', (event) => {
    if (event.matches) close({ restoreFocus: false });
  });
}

/* =============================================================================
   ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE
   Funciona en cuanto el Hero/Servicios/etc. tengan id. Hasta entonces no hace nada.
   ========================================================================== */
function initActiveLink() {
  const links = [...document.querySelectorAll(SELECTORS.navLink)];
  if (!links.length) return;

  // Empareja cada enlace (#precios) con su sección real (<section id="precios">)
  const pairs = links
    .map((link) => {
      const id = link.getAttribute('href')?.replace('#', '');
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!pairs.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  /* rootMargin crea una "franja" en el centro del viewport:
     la sección que la cruza es la activa. */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  pairs.forEach(({ section }) => observer.observe(section));
}

/* =============================================================================
   INICIALIZADOR
   ========================================================================== */
export function initNavigation() {
  const header = document.querySelector(SELECTORS.header);
  if (!header) return;

  initScrollState(header);

  const toggle = document.querySelector(SELECTORS.toggle);
  const menu = document.querySelector(SELECTORS.menu);
  if (toggle && menu) initMobileMenu(header, toggle, menu);

  initActiveLink();
}
