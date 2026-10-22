/**
 * language.js — Preferencia de idioma ES / FR
 * -----------------------------------------------------------------------------
 * El español vive en / y el francés en /fr.html. Vercel redirige a los visitantes
 * de Marruecos a la versión francesa mediante reglas geográficas en vercel.json.
 *
 * Este script:
 *  1. Guarda en la cookie `liya_lang` el idioma de la página actual.
 *  2. Permite cambiar de idioma desde los enlaces [data-set-lang].
 *
 * La cookie hace que la elección manual se mantenga al volver a `/`.
 * No se ejecuta en admin.html.
 */

(() => {
  const COOKIE = 'liya_lang';
  const MAX_AGE = 60 * 60 * 24 * 365; // 1 año
  const current = (document.documentElement.lang || 'es').toLowerCase().startsWith('fr')
    ? 'fr'
    : 'es';

  const setCookie = (value) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  };

  // Recuerda el idioma que el visitante está viendo ahora mismo.
  setCookie(current);

  // Al pulsar ES / FR, guardamos la preferencia antes de navegar.
  document.querySelectorAll('[data-set-lang]').forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.setLang;
      if (value === 'es' || value === 'fr') setCookie(value);
    });
  });
})();
