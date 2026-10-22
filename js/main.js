/**
 * main.js — Punto de entrada de la aplicación
 * -----------------------------------------------------------------------------
 * Solo orquesta módulos. La lógica vive en /js/modules para mantener el código
 * pequeño, testeable y fácil de mover a un framework si algún día hace falta.
 */

import { initNavigation } from './modules/navigation.js?v=16';
import { initPointer } from './modules/pointer.js?v=16';
import { initHero } from './modules/hero.js?v=16';
import { initReveal } from './modules/reveal.js?v=16';
import { initPortfolio } from './modules/portfolio.js?v=16';
import { initContact } from './modules/contact.js?v=16';

const init = () => {
  initNavigation();
  initPointer();
  initHero();
  initReveal();
  initPortfolio();
  initContact();
};

/* Ejecuta cuando el DOM está listo, tanto si el script carga en <head> como al final */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
