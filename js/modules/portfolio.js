/**
 * portfolio.js — BLOQUE 4
 * -----------------------------------------------------------------------------
 * Responsabilidades:
 *  1. Mover el carrusel con flechas, teclado y arrastre de ratón.
 *  2. Filtrar por categoría (Todos / Restauración / Bienestar / Comercio / Servicios).
 *  3. Abrir un caso en un <dialog> nativo, reutilizando la captura de su card.
 *  4. Gestionar foco, cierre con Esc/backdrop y bloqueo del scroll de fondo.
 *
 * EDITAR AQUÍ: los detalles de cada caso (reto, solución, entregables y stack).
 * El título, categoría y año se leen del HTML de cada card (data-*).
 * Las cards usan capturas en assets/img/proyectos; no enlazan a webs externas.
 */

const PROJECTS = {
  "avallier": {
    "description": "Web para un restaurante de alta cocina que necesitaba transmitir su experiencia antes de que el cliente reservara.",
    "challenge": "La carta y la bodega eran el centro del proyecto, pero la web anterior no transmitía la sala, el producto ni el nivel de la casa.",
    "solution": "Una web editorial con jerarquía clara, menús, bodega y un flujo de reserva directo. Fotografía y tipografía al servicio del producto.",
    "deliverables": [
      "Dirección de arte",
      "Diseño y desarrollo web",
      "Carta y bodega",
      "Reservas y contacto"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Responsive"
    ]
  },
  "noma-coffee": {
    "description": "Tienda online para un tostador de café de especialidad que vendía principalmente por Instagram.",
    "challenge": "Explicar origen, tueste y suscripción sin convertir la compra en una clase magistral.",
    "solution": "Catálogo corto, fichas con notas de cata y suscripción en dos pasos. El café se entiende y se compra rápido.",
    "deliverables": [
      "E-commerce",
      "Suscripción",
      "Fichas de producto",
      "Checkout"
    ],
    "stack": [
      "E-commerce",
      "Suscripción",
      "CRO"
    ]
  },
  "the-jochoys": {
    "description": "Web de marca para un restaurante de street food que quería dejar de depender solo de redes sociales.",
    "challenge": "Todo el carácter del local vivía en Instagram; la web tenía que conservarlo y sumar carta, galería y cómo llegar.",
    "solution": "Una identidad tipográfica fuerte, carta directa y galería visual. La energía del local se traslada a la pantalla sin perder claridad.",
    "deliverables": [
      "Dirección de arte",
      "Web responsive",
      "Carta y galería",
      "Localización y contacto"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Google Maps"
    ]
  },
  "isabel-malonda": {
    "description": "Escuela de yoga Iyengar que necesitaba explicar su método y ordenar horarios, tarifas e inscripciones.",
    "challenge": "La práctica era muy cuidada, pero la información estaba dispersa y la web no transmitía la calma del espacio.",
    "solution": "Una web serena con el método como eje, horarios claros y una primera clase de prueba como acción principal.",
    "deliverables": [
      "Diseño y desarrollo",
      "Método y clases",
      "Horarios y tarifas",
      "Formulario de inscripción"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Formularios"
    ]
  },
  "telero": {
    "description": "Web para un restaurante de cocina española que necesitaba presentar su carta y llenar reservas.",
    "challenge": "Un negocio de barrio con una oferta amplia que se perdía en una web anticuada.",
    "solution": "Estructura por especialidades, carta fácil de escanear y reservas visibles desde el primer scroll.",
    "deliverables": [
      "Diseño web",
      "Carta digital",
      "Reservas",
      "Contenido"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Responsive"
    ]
  },
  "kite-skin": {
    "description": "Marca de skincare que necesitaba una tienda online tan simple como su rutina.",
    "challenge": "El catálogo era pequeño, pero la web no ayudaba a elegir ni explicaba el orden de uso.",
    "solution": "Una tienda con rutina guiada, fichas cortas y checkout directo. El producto se entiende en segundos.",
    "deliverables": [
      "E-commerce",
      "Rutina guiada",
      "Fichas de producto",
      "Checkout"
    ],
    "stack": [
      "E-commerce",
      "UX",
      "CRO"
    ]
  },
  "atlas-fitness": {
    "description": "Gimnasio boutique que necesitaba llenar clases sin quemar presupuesto en anuncios.",
    "challenge": "La oferta era buena, pero el mensaje se diluía entre horarios, tarifas y fotos de Instagram.",
    "solution": "Una landing con una promesa clara, prueba gratuita y reserva de clase. Menos ruido y una acción principal.",
    "deliverables": [
      "Estrategia y copy",
      "Landing",
      "Reserva de clase",
      "Medición"
    ],
    "stack": [
      "Landing",
      "CRO",
      "Analítica"
    ]
  },
  "hamburgueseria": {
    "description": "Plantilla visual para hamburgueserías artesanales que quieren una presencia propia sin empezar de cero.",
    "challenge": "El sector está lleno de webs iguales: carta, fotos y poco carácter.",
    "solution": "Un sistema modular con hero potente, carta editable y bloques de galería, opiniones y localización.",
    "deliverables": [
      "Sistema visual",
      "Plantilla responsive",
      "Carta editable",
      "Bloques de contenido"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Plantilla"
    ]
  },
  "lumen-dental": {
    "description": "Clínica dental que quería transmitir calma y claridad desde la primera visita.",
    "challenge": "La gente llega con miedo y poca información; la web sumaba fricción en vez de resolver dudas.",
    "solution": "Una web limpia con tratamientos explicados, equipo visible y una cita online sin pasos innecesarios.",
    "deliverables": [
      "Diseño web",
      "Página de tratamientos",
      "Cita online",
      "Contenido de confianza"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Reservas"
    ]
  },
  "sur-studio": {
    "description": "Estudio de arquitectura que quería una web sobria para presentar obra pública y privada.",
    "challenge": "Muchos proyectos y una identidad visual que no terminaba de ordenarlos.",
    "solution": "Una estructura de archivo con filtros por tipología, fichas técnicas y una tipografía que deja hablar al espacio.",
    "deliverables": [
      "Arquitectura de contenido",
      "Diseño web",
      "Archivo de obra",
      "Fichas técnicas"
    ],
    "stack": [
      "HTML",
      "CSS",
      "CMS"
    ]
  },
  "marea": {
    "description": "Hotel boutique frente al mar que quería reservas directas y menos dependencia de plataformas.",
    "challenge": "La web era una ficha genérica; no transmitía el entorno ni el trato del hotel.",
    "solution": "Una web con atmósfera costera, habitaciones claras y un motor de reserva visible. La estancia se imagina antes de reservar.",
    "deliverables": [
      "Diseño web",
      "Habitaciones",
      "Reservas directas",
      "Contenido"
    ],
    "stack": [
      "HTML",
      "Tailwind",
      "Reservas"
    ]
  },
  "casa-verde": {
    "description": "Estudio de interiorismo que necesitaba un portfolio a la altura de sus proyectos.",
    "challenge": "Las fotos eran buenas, pero la web las apilaba sin criterio y no contaba el proceso.",
    "solution": "Un portfolio editorial con proyectos, materiales y una narrativa visual que deja respirar las imágenes.",
    "deliverables": [
      "Dirección de arte",
      "Portfolio",
      "Fichas de proyecto",
      "SEO"
    ],
    "stack": [
      "HTML",
      "CSS",
      "SEO"
    ]
  }
};


/* =============================================================================
   VERSIÓN FRANCESA
   El HTML francés vive en /fr.html. Los textos estáticos se traducen allí; aquí
   se traducen los detalles del modal y los mensajes dinámicos del carrusel.
   ========================================================================== */
const IS_FR = (document.documentElement.lang || 'es').toLowerCase().startsWith('fr');

const PROJECTS_FR = {
  "avallier": {
    "description": "Site pour un restaurant de haute gastronomie qui devait transmettre son expérience avant même la réservation.",
    "challenge": "La carte et la cave étaient au cœur du projet, mais l’ancien site ne reflétait ni la salle, ni les produits, ni le niveau de la maison.",
    "solution": "Un site éditorial avec une hiérarchie claire, les menus, la cave et un parcours de réservation direct. La photographie et la typographie au service du produit.",
    "deliverables": ["Direction artistique", "Design et développement web", "Carte et cave", "Réservations et contact"],
    "stack": ["HTML", "Tailwind", "Responsive"]
  },
  "noma-coffee": {
    "description": "Boutique en ligne pour un torréfacteur de café de spécialité qui vendait principalement via Instagram.",
    "challenge": "Expliquer l’origine, la torréfaction et l’abonnement sans transformer l’achat en cours magistral.",
    "solution": "Un catalogue court, des fiches avec notes de dégustation et un abonnement en deux étapes. Le café se comprend et s’achète rapidement.",
    "deliverables": ["E-commerce", "Abonnement", "Fiches produit", "Paiement"],
    "stack": ["E-commerce", "Abonnement", "CRO"]
  },
  "the-jochoys": {
    "description": "Site de marque pour un restaurant de street food qui voulait cesser de dépendre uniquement des réseaux sociaux.",
    "challenge": "Tout le caractère du lieu vivait sur Instagram ; le site devait le conserver et ajouter la carte, la galerie et l’accès.",
    "solution": "Une identité typographique forte, une carte directe et une galerie visuelle. L’énergie du lieu passe à l’écran sans perdre en clarté.",
    "deliverables": ["Direction artistique", "Site responsive", "Carte et galerie", "Localisation et contact"],
    "stack": ["HTML", "Tailwind", "Google Maps"]
  },
  "isabel-malonda": {
    "description": "École de yoga Iyengar qui devait expliquer sa méthode et organiser horaires, tarifs et inscriptions.",
    "challenge": "La pratique était très soignée, mais l’information était dispersée et le site ne transmettait pas le calme du lieu.",
    "solution": "Un site serein avec la méthode comme fil conducteur, des horaires clairs et un premier cours d’essai comme action principale.",
    "deliverables": ["Design et développement", "Méthode et cours", "Horaires et tarifs", "Formulaire d’inscription"],
    "stack": ["HTML", "Tailwind", "Formulaires"]
  },
  "telero": {
    "description": "Site pour un restaurant de cuisine espagnole qui devait présenter sa carte et remplir ses réservations.",
    "challenge": "Un commerce de quartier avec une offre large, perdu dans un site dépassé.",
    "solution": "Une structure par spécialités, une carte facile à parcourir et des réservations visibles dès le premier défilement.",
    "deliverables": ["Design web", "Carte digitale", "Réservations", "Contenu"],
    "stack": ["HTML", "Tailwind", "Responsive"]
  },
  "kite-skin": {
    "description": "Marque de soins qui avait besoin d’une boutique en ligne aussi simple que sa routine.",
    "challenge": "Le catalogue était petit, mais le site n’aidait ni à choisir ni à comprendre l’ordre d’utilisation.",
    "solution": "Une boutique avec routine guidée, fiches courtes et paiement direct. Le produit se comprend en quelques secondes.",
    "deliverables": ["E-commerce", "Routine guidée", "Fiches produit", "Paiement"],
    "stack": ["E-commerce", "UX", "CRO"]
  },
  "atlas-fitness": {
    "description": "Salle de sport boutique qui devait remplir ses cours sans brûler son budget publicitaire.",
    "challenge": "L’offre était bonne, mais le message se diluait entre horaires, tarifs et photos Instagram.",
    "solution": "Une landing avec une promesse claire, un essai gratuit et la réservation de cours. Moins de bruit, une seule action principale.",
    "deliverables": ["Stratégie et copywriting", "Landing", "Réservation de cours", "Mesure"],
    "stack": ["Landing", "CRO", "Analytics"]
  },
  "hamburgueseria": {
    "description": "Modèle visuel pour des restaurants de burgers artisanaux qui veulent une présence propre sans repartir de zéro.",
    "challenge": "Le secteur est plein de sites identiques : carte, photos et peu de caractère.",
    "solution": "Un système modulaire avec un hero puissant, une carte modifiable et des blocs galerie, avis et localisation.",
    "deliverables": ["Système visuel", "Modèle responsive", "Carte modifiable", "Blocs de contenu"],
    "stack": ["HTML", "Tailwind", "Modèle"]
  },
  "lumen-dental": {
    "description": "Clinique dentaire qui voulait transmettre calme et clarté dès la première visite.",
    "challenge": "Les patients arrivent avec de la peur et peu d’informations ; le site ajoutait de la friction au lieu de répondre aux questions.",
    "solution": "Un site clair avec des soins expliqués, une équipe visible et un rendez-vous en ligne sans étapes inutiles.",
    "deliverables": ["Design web", "Page soins", "Rendez-vous en ligne", "Contenu de confiance"],
    "stack": ["HTML", "Tailwind", "Réservations"]
  },
  "sur-studio": {
    "description": "Studio d’architecture qui voulait un site sobre pour présenter ses projets publics et privés.",
    "challenge": "Beaucoup de projets et une identité visuelle qui ne parvenait pas à les organiser.",
    "solution": "Une structure d’archive avec filtres par typologie, fiches techniques et une typographie qui laisse parler l’espace.",
    "deliverables": ["Architecture de contenu", "Design web", "Archive de projets", "Fiches techniques"],
    "stack": ["HTML", "CSS", "CMS"]
  },
  "marea": {
    "description": "Hôtel boutique en bord de mer qui voulait des réservations directes et moins de dépendance aux plateformes.",
    "challenge": "Le site était une fiche générique ; il ne transmettait ni l’environnement ni l’accueil de l’hôtel.",
    "solution": "Un site à l’atmosphère côtière, des chambres claires et un moteur de réservation visible. Le séjour se imagine avant la réservation.",
    "deliverables": ["Design web", "Chambres", "Réservations directes", "Contenu"],
    "stack": ["HTML", "Tailwind", "Réservations"]
  },
  "casa-verde": {
    "description": "Studio de design d’intérieur qui avait besoin d’un portfolio à la hauteur de ses projets.",
    "challenge": "Les photos étaient belles, mais le site les empilait sans critère et ne racontait pas le processus.",
    "solution": "Un portfolio éditorial avec projets, matières et une narration visuelle qui laisse respirer les images.",
    "deliverables": ["Direction artistique", "Portfolio", "Fiches projet", "SEO"],
    "stack": ["HTML", "CSS", "SEO"]
  }
};

const UI = IS_FR
  ? {
      status: (visible) =>
        `${visible} ${visible === 1 ? 'projet affiché' : 'projets affichés'}.`,
      live: (index, total, title) => `Projet ${index} sur ${total} : ${title}`,
    }
  : {
      status: (visible) =>
        `Mostrando ${visible} ${visible === 1 ? 'proyecto' : 'proyectos'}.`,
      live: (index, total, title) => `Proyecto ${index} de ${total}: ${title}`,
    };

/* Selectores centralizados */
const SELECTORS = {
  filter: '[data-filter]',
  card: '[data-project-card]',
  open: '[data-project-open]',
  modal: '[data-project-modal]',
  status: '[data-portfolio-status]',
  rail: '[data-portfolio-rail]',
  track: '[data-portfolio-track]',
  prev: '[data-portfolio-prev]',
  next: '[data-portfolio-next]',
  current: '[data-portfolio-current]',
  total: '[data-portfolio-total]',
};

/* =============================================================================
   FILTROS
   ========================================================================== */
function initFilters(cards, onChange) {
  const filters = [...document.querySelectorAll(SELECTORS.filter)];
  const status = document.querySelector(SELECTORS.status);
  if (!filters.length) return;

  const apply = (filter) => {
    let visible = 0;

    cards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.setAttribute('aria-pressed', String(active));
    });

    if (status) {
      status.textContent = UI.status(visible);
    }

    onChange?.();
    animateVisibleCards(cards);
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.filter));
  });
}

/* Entrada suave de las cards al cambiar de filtro */
function animateVisibleCards(cards) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards
    .filter((card) => !card.hidden)
    .forEach((card, index) => {
      card.animate(
        [
          { opacity: 0, transform: 'translateY(14px) scale(0.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        {
          duration: 420,
          delay: index * 55,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        }
      );
    });
}

/* =============================================================================
   TILT + FOCO
   Inclinación sutil de las cards siguiendo el ratón. Solo en puntero fino y
   sin movimiento reducido; en táctil no se registra nada.
   ========================================================================== */
function initCardTilt(cards) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach((card) => {
    let frame = 0;
    let localX = 0;
    let localY = 0;

    const paint = () => {
      frame = 0;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = localX / rect.width;
      const y = localY / rect.height;
      const rotateX = (0.5 - y) * 4;
      const rotateY = (x - 0.5) * 5;

      card.style.setProperty('--spot-x', `${localX}px`);
      card.style.setProperty('--spot-y', `${localY}px`);
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    };

    card.addEventListener('pointerenter', () => card.classList.add('is-interacting'));

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      localX = event.clientX - rect.left;
      localY = event.clientY - rect.top;
      if (!frame) frame = window.requestAnimationFrame(paint);
    });

    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-interacting');
      card.style.transform = '';
      card.style.removeProperty('--spot-x');
      card.style.removeProperty('--spot-y');
    });
  });
}

/* =============================================================================
   CARRUSEL
   Arrastre con ratón, flechas y teclado. El scroll táctil queda en manos del
   navegador y el contador refleja siempre la card alineada a la izquierda.
   ========================================================================== */
function initCarousel(cards) {
  const rail = document.querySelector(SELECTORS.rail);
  const track = document.querySelector(SELECTORS.track);
  const prev = document.querySelector(SELECTORS.prev);
  const next = document.querySelector(SELECTORS.next);
  const current = document.querySelector(SELECTORS.current);
  const total = document.querySelector(SELECTORS.total);

  if (!rail || !track) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => (reducedMotion.matches ? 'auto' : 'smooth');
  const visibleCards = () => cards.filter((card) => !card.hidden);

  let frame = 0;

  const gap = () => {
    const styles = getComputedStyle(track);
    return parseFloat(styles.columnGap || styles.gap) || 0;
  };

  const step = () => {
    const first = visibleCards()[0];
    return first ? first.getBoundingClientRect().width + gap() : rail.clientWidth * 0.8;
  };

  const update = () => {
    frame = 0;

    const items = visibleCards();
    if (total) total.textContent = String(items.length).padStart(2, '0');

    if (!items.length) {
      if (current) current.textContent = '00';
      if (prev) prev.disabled = true;
      if (next) next.disabled = true;
      return;
    }

    const styles = getComputedStyle(track);
    const start = rail.getBoundingClientRect().left + (parseFloat(styles.paddingLeft) || 0);
    let active = 0;
    let best = Infinity;

    items.forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - start);
      if (distance < best) {
        best = distance;
        active = index;
      }
    });

    const atStart = rail.scrollLeft <= 2;
    const scrollable = rail.scrollWidth > rail.clientWidth + 2;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;

    if (!scrollable || atStart) active = 0;
    else if (atEnd) active = items.length - 1;

    if (current) current.textContent = String(active + 1).padStart(2, '0');
    if (prev) prev.disabled = !scrollable || atStart;
    if (next) next.disabled = !scrollable || atEnd;
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  const refresh = () => {
    rail.scrollTo({ left: 0, behavior: 'auto' });
    schedule();
  };

  const move = (direction) => {
    rail.scrollBy({ left: step() * direction, behavior: behavior() });
  };

  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));

  rail.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  rail.addEventListener('keydown', (event) => {
    if (event.target !== rail) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });

  /* Arrastre con ratón: en táctil dejamos el scroll nativo */
  let drag = null;
  let suppressClick = false;
  let suppressTimer = 0;

  rail.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: rail.scrollLeft, moved: false };
  });

  window.addEventListener(
    'pointermove',
    (event) => {
      if (!drag) return;

      const delta = event.clientX - drag.x;
      if (!drag.moved && Math.abs(delta) > 5) {
        drag.moved = true;
        rail.classList.add('is-dragging');
      }
      if (!drag.moved) return;

      event.preventDefault();
      rail.scrollLeft = drag.left - delta;
    },
    { passive: false }
  );

  const endDrag = () => {
    if (!drag) return;

    if (drag.moved) {
      suppressClick = true;
      window.clearTimeout(suppressTimer);
      suppressTimer = window.setTimeout(() => {
        suppressClick = false;
      }, 280);
    }

    drag = null;
    rail.classList.remove('is-dragging');
    schedule();
  };

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  rail.addEventListener(
    'click',
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    },
    true
  );

  schedule();
  window.addEventListener('load', schedule, { once: true });
  document.fonts?.ready.then(schedule);

  return refresh;
}

/* =============================================================================
   MODAL DE PROYECTO
   ========================================================================== */
function initModal(cards) {
  const modal = document.querySelector(SELECTORS.modal);
  if (!modal) return;

  const title = modal.querySelector('[data-modal-title]');
  const meta = modal.querySelector('[data-modal-meta]');
  const desc = modal.querySelector('[data-modal-desc]');
  const challenge = modal.querySelector('[data-modal-challenge]');
  const solution = modal.querySelector('[data-modal-solution]');
  const deliverables = modal.querySelector('[data-modal-deliverables]');
  const stack = modal.querySelector('[data-modal-stack]');
  const preview = modal.querySelector('[data-modal-preview]');
  const closeButton = modal.querySelector('[data-modal-close]');
  const cta = modal.querySelector('[data-modal-cta]');
  const prevButton = modal.querySelector('[data-modal-prev]');
  const nextButton = modal.querySelector('[data-modal-next]');
  const position = modal.querySelector('[data-modal-index]');
  const total = modal.querySelector('[data-modal-total]');
  const live = modal.querySelector('[data-modal-status]');

  let lastTrigger = null;
  let activeCard = null;

  const visibleCards = () => cards.filter((card) => !card.hidden);

  const fillList = (list, items) => {
    list.replaceChildren(
      ...items.map((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
      })
    );
  };

  const render = (card) => {
    const project = (IS_FR ? PROJECTS_FR : PROJECTS)[card.dataset.project];
    if (!project) return;

    const list = visibleCards();
    const index = Math.max(0, list.indexOf(card));
    activeCard = card;

    title.textContent = card.dataset.title;
    meta.textContent = `${card.dataset.categoryLabel} · ${card.dataset.year}`;
    desc.textContent = project.description;
    challenge.textContent = project.challenge;
    solution.textContent = project.solution;
    fillList(deliverables, project.deliverables);

    stack.replaceChildren(
      ...project.stack.map((tag) => {
        const span = document.createElement('span');
        span.className = 'project-modal__tag';
        span.textContent = tag;
        return span;
      })
    );

    // Reutilizamos el marco de la card, ampliado dentro del modal.
    // La captura también alimenta el fondo desenfocado de la columna visual.
    const screen = card.querySelector('.project-screen');
    const shot = card.querySelector('.ps-shot');
    if (shot) {
      const src = shot.currentSrc || shot.src;
      if (src) modal.style.setProperty('--modal-shot', `url("${src}")`);
    }

    if (screen) {
      const clone = screen.cloneNode(true);
      const cloneShot = clone.querySelector('.ps-shot');
      if (cloneShot) {
        cloneShot.loading = 'eager';
        cloneShot.decoding = 'async';
      }
      preview.replaceChildren(clone);
    } else {
      preview.replaceChildren(document.createTextNode(''));
    }

    if (position) position.textContent = String(index + 1).padStart(2, '0');
    if (total) total.textContent = String(list.length).padStart(2, '0');
    if (live) live.textContent = UI.live(index + 1, list.length, card.dataset.title);
    if (prevButton) prevButton.disabled = list.length < 2;
    if (nextButton) nextButton.disabled = list.length < 2;

    modal.querySelector('.project-modal__inner')?.scrollTo({ top: 0, behavior: 'auto' });
  };

  const open = (card, trigger) => {
    if (!(IS_FR ? PROJECTS_FR : PROJECTS)[card.dataset.project]) return;

    lastTrigger = trigger || card.querySelector(SELECTORS.open) || lastTrigger;
    render(card);
    modal.showModal();
    document.body.classList.add('is-locked');
  };

  const move = (direction) => {
    const list = visibleCards();
    if (list.length < 2 || !activeCard) return;

    const current = Math.max(0, list.indexOf(activeCard));
    const next = list[(current + direction + list.length) % list.length];
    lastTrigger = next.querySelector(SELECTORS.open) || lastTrigger;
    render(next);
  };

  const close = () => {
    if (modal.open) modal.close();
  };

  cards.forEach((card) => {
    const trigger = card.querySelector(SELECTORS.open);
    trigger?.addEventListener('click', () => open(card, trigger));
  });

  prevButton?.addEventListener('click', () => move(-1));
  nextButton?.addEventListener('click', () => move(1));

  modal.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });

  closeButton?.addEventListener('click', close);

  // Cerrar al hacer clic fuera del panel (backdrop)
  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside) close();
  });

  // El CTA lleva a contacto: cerramos y dejamos que el ancla navegue
  cta?.addEventListener('click', close);

  modal.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    lastTrigger?.focus({ preventScroll: true });
    lastTrigger = null;
  });
}

/* =============================================================================
   INICIALIZADOR
   ========================================================================== */
export function initPortfolio() {
  const cards = [...document.querySelectorAll(SELECTORS.card)];
  if (!cards.length) return;

  const refreshCarousel = initCarousel(cards);
  initFilters(cards, refreshCarousel);
  initCardTilt(cards);
  initModal(cards);
}
