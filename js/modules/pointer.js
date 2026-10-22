/**
 * pointer.js — Luz ambiental que sigue al cursor
 * -----------------------------------------------------------------------------
 * Solo se activa con puntero fino y sin movimiento reducido. Escribe dos
 * variables CSS en <html> para que el fondo (layout.css → .page-bg::after)
 * dibuje un halo suave. No afecta al layout ni captura eventos.
 */

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function initPointer() {
  if (!window.matchMedia(FINE_POINTER).matches) return;
  if (window.matchMedia(REDUCED_MOTION).matches) return;

  const root = document.documentElement;
  let frame = 0;
  let x = window.innerWidth * 0.5;
  let y = window.innerHeight * 0.45;

  const paint = () => {
    frame = 0;
    root.style.setProperty('--pointer-x', `${x}px`);
    root.style.setProperty('--pointer-y', `${y}px`);
  };

  root.style.setProperty('--pointer-x', `${x}px`);
  root.style.setProperty('--pointer-y', `${y}px`);

  window.addEventListener(
    'pointermove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    },
    { passive: true }
  );
}
