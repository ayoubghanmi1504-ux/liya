/**
 * hero.js — Interacciones del Hero (BLOQUE 2)
 * -----------------------------------------------------------------------------
 * Añade un parallax muy sutil al collage de proyectos siguiendo el ratón.
 * El collage son cuatro capturas repetidas y decorativas, así que:
 *  • Solo se activa con puntero fino (ratón/trackpad), nunca en táctil.
 *  • Se desactiva si el usuario prefiere movimiento reducido.
 *  • La animación se limita con requestAnimationFrame (sin jank).
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const FINE_POINTER = '(pointer: fine)';

function initParallax(hero) {
  const stage = hero.querySelector('[data-hero-collage]');
  if (!stage) return;
  if (!window.matchMedia(FINE_POINTER).matches) return;
  if (window.matchMedia(REDUCED_MOTION).matches) return;

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let frame = null;

  const render = () => {
    // Interpolación suave (easing manual) para que no siga el ratón de golpe
    current.x += (target.x - current.x) * 0.07;
    current.y += (target.y - current.y) * 0.07;

    // El collage se mueve como máximo 14px / 8px: profundidad, no distracción
    stage.style.setProperty('--collage-x', `${(current.x * 14).toFixed(2)}px`);
    stage.style.setProperty('--collage-y', `${(current.y * 8).toFixed(2)}px`);

    const settled =
      Math.abs(target.x - current.x) < 0.001 &&
      Math.abs(target.y - current.y) < 0.001;

    frame = settled ? null : window.requestAnimationFrame(render);
  };

  const start = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  hero.addEventListener(
    'pointermove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      start();
    },
    { passive: true }
  );

  hero.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    start();
  });
}

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  initParallax(hero);
}
