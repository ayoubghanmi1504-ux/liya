/**
 * reveal.js — Aparición de secciones al hacer scroll
 * -----------------------------------------------------------------------------
 * Añade .is-visible a los elementos [data-reveal] cuando entran en pantalla.
 * Es progresivo: si no hay JS o el usuario prefiere movimiento reducido, el
 * contenido se muestra igualmente (no se oculta nunca sin observador).
 *
 * Uso en HTML:
 *   <div data-reveal>...</div>
 *   <div data-reveal style="--reveal-delay: 120ms">...</div>
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length) return;

  // Sin animación: todo visible desde el primer frame
  if (window.matchMedia(REDUCED_MOTION).matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  // Solo ahora ocultamos los elementos (evita FOUC y deja fallback sin JS)
  document.documentElement.classList.add('has-reveal');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((item) => {
    // Si ya está en pantalla al cargar, se muestra sin esperar al scroll
    if (item.getBoundingClientRect().top < window.innerHeight) {
      item.classList.add('is-visible');
    } else {
      observer.observe(item);
    }
  });
}
