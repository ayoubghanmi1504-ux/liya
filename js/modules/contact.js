/**
 * contact.js — BLOQUE 5
 * -----------------------------------------------------------------------------
 * Responsabilidades:
 *  1. Validar el formulario en cliente (sin librerías).
 *  2. Enviar el contacto a /api/submit, que lo guarda en Turso.
 *  3. Si el servidor no está disponible, abrir el cliente de correo como respaldo.
 *  4. Preseleccionar el plan/servicio al llegar desde Precios o Portfolio.
 *
 * El backend vive en /api y la bandeja privada en admin.html.
 */

const SELECTORS = {
  form: '[data-contact-form]',
  project: '[data-contact-project]',
  planNote: '[data-plan-note]',
  status: '[data-form-status]',
  submit: '[type="submit"]',
  prefill: '[data-plan], [data-service]',
  jump: '[data-contact-jump]',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const IS_FR = (document.documentElement.lang || 'es').toLowerCase().startsWith('fr');
const COPY = IS_FR
  ? {
      nameRequired: 'Indiquez votre nom.',
      emailInvalid: 'Saisissez une adresse e-mail valide.',
      messageShort: 'Dites-nous en un peu plus (10 caractères minimum).',
      consentRequired: 'Nous avons besoin de votre accord pour vous répondre.',
      consentText: 'J’accepte que Liyā Agency me contacte au sujet de ce projet.',
      preselected: (label) => `Présélectionné : ${label}. Vous pouvez le modifier si vous le souhaitez.`,
      noProject: 'Non défini',
      unknownProject: 'Je ne sais pas encore',
      mailSubject: (project, name) => `Nouveau projet — ${project} — ${name}`,
      mailGreeting: 'Bonjour Liyā Agency,',
      mailIntro: (name, project) => `Je m’appelle ${name} et je souhaite parler de : ${project}.`,
      mailEmail: 'E-mail :',
      mailCompany: 'Entreprise :',
      mailMessage: 'Message :',
      mailFooter: 'Envoyé depuis liyagency.es',
      sending: 'Envoi…',
      submitError: (status) => `Impossible d’envoyer le formulaire (${status}).`,
      reviewFields: 'Vérifiez les champs indiqués.',
      success: 'Message bien reçu. Nous vous répondrons sous 24 h.',
      fallback: 'La boîte de réception est momentanément indisponible. Ouverture de votre client e-mail pour ne pas perdre votre message…',
      fallbackLink: 'Ouvrir l’e-mail',
      errorWithRecipient: (message, recipient) =>
        `${message} Si le problème persiste, écrivez-nous à ${recipient}.`,
      progress: (done, total) => `${done} sur ${total} champs complétés`,
    }
  : {
      nameRequired: 'Escribe tu nombre.',
      emailInvalid: 'Introduce un email válido.',
      messageShort: 'Cuéntanos un poco más (mínimo 10 caracteres).',
      consentRequired: 'Necesitamos tu consentimiento para responderte.',
      consentText: 'Acepto que Liyā Agency me contacte sobre este proyecto.',
      preselected: (label) => `Preseleccionado: ${label}. Puedes cambiarlo si quieres.`,
      noProject: 'No definido',
      unknownProject: 'Aún no lo sé',
      mailSubject: (project, name) => `Nuevo proyecto — ${project} — ${name}`,
      mailGreeting: 'Hola Liyā Agency,',
      mailIntro: (name, project) => `Me llamo ${name} y quiero hablar sobre: ${project}.`,
      mailEmail: 'Email:',
      mailCompany: 'Empresa:',
      mailMessage: 'Mensaje:',
      mailFooter: 'Enviado desde liyagency.es',
      sending: 'Enviando…',
      submitError: (status) => `No se pudo enviar el formulario (${status}).`,
      reviewFields: 'Revisa los campos marcados.',
      success: 'Mensaje recibido. Te responderemos en menos de 24 h.',
      fallback: 'La bandeja no está disponible ahora mismo. Abrimos tu correo para no perder el mensaje…',
      fallbackLink: 'Abrir el correo',
      errorWithRecipient: (message, recipient) =>
        `${message} Si persiste, escríbenos a ${recipient}.`,
      progress: (done, total) => `${done} de ${total} campos completados`,
    };

/* Reglas de validación. Cada una devuelve "" si el campo es válido. */
const RULES = [
  {
    name: 'nombre',
    validate: (value) => (value.trim().length >= 2 ? '' : COPY.nameRequired),
  },
  {
    name: 'email',
    validate: (value) =>
      EMAIL_PATTERN.test(value.trim()) ? '' : COPY.emailInvalid,
  },
  {
    name: 'mensaje',
    validate: (value) =>
      value.trim().length >= 10 ? '' : COPY.messageShort,
  },
  {
    name: 'consentimiento',
    validate: (_, input) =>
      input.checked ? '' : COPY.consentRequired,
  },
];

/* =============================================================================
   PRESELECCIÓN DE PLAN / SERVICIO
   ========================================================================== */
function initPresets(form) {
  const select = form.querySelector(SELECTORS.project);
  const note = form.querySelector(SELECTORS.planNote);
  if (!select || !note) return;

  const preselect = (value) => {
    const option = [...select.options].find((item) => item.value === value);
    if (!option) return;

    select.value = value;
    note.textContent = COPY.preselected(option.textContent.trim());
    note.hidden = false;
  };

  document.querySelectorAll(SELECTORS.prefill).forEach((link) => {
    link.addEventListener('click', () => {
      preselect(link.dataset.plan || link.dataset.service);
    });
  });

  select.addEventListener('change', () => {
    note.hidden = true;
  });
}

/* =============================================================================
   VALIDACIÓN
   ========================================================================== */
function setFieldError(input, message) {
  const field = input.closest('.field');
  const error = document.querySelector(`[data-error-for="${input.name}"]`);
  if (!field) return;

  field.classList.toggle('field--invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');

  if (error) error.textContent = message;
}

function clearOnInput(form) {
  const status = form.querySelector(SELECTORS.status);

  const clearStatusIfResolved = () => {
    if (!status || status.dataset.state !== 'error') return;
    if (form.querySelector('.field--invalid')) return;

    status.textContent = '';
    status.removeAttribute('data-state');
  };

  form.querySelectorAll('.field__control, .field__checkbox').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('field--invalid')) {
        setFieldError(input, '');
      }
      clearStatusIfResolved();
    });

    input.addEventListener('change', () => {
      if (input.closest('.field')?.classList.contains('field--invalid')) {
        setFieldError(input, '');
      }
      clearStatusIfResolved();
    });
  });
}

/* =============================================================================
   FALLBACK POR EMAIL
   ========================================================================== */
function buildMailto(form, recipient) {
  const data = new FormData(form);
  const select = form.querySelector(SELECTORS.project);
  const project = select?.options[select.selectedIndex]?.textContent.trim() || COPY.noProject;

  const name = String(data.get('nombre') || '').trim();
  const email = String(data.get('email') || '').trim();
  const company = String(data.get('empresa') || '').trim();
  const message = String(data.get('mensaje') || '').trim();

  const subject = COPY.mailSubject(project, name);
  const body = [
    COPY.mailGreeting,
    '',
    COPY.mailIntro(name, project),
    '',
    `${COPY.mailEmail} ${email}`,
    company ? `${COPY.mailCompany} ${company}` : null,
    '',
    COPY.mailMessage,
    message,
    '',
    '—',
    COPY.mailFooter,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* =============================================================================
   DATOS DEL ENVÍO
   ========================================================================== */
function collectMetadata(form) {
  const nav = navigator;
  const connection =
    nav.connection || nav.mozConnection || nav.webkitConnection || {};

  const utm = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    if (/^(utm_|gclid$|fbclid$|msclkid$|ref$|source$)/i.test(key)) {
      utm[key] = value;
    }
  }

  const startedAt = Number(form.dataset.startedAt || Date.now());
  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : null;
  const prefersDark = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : null;

  return {
    page_url: window.location.href,
    referrer: document.referrer || '',
    utm,
    elapsed_ms: Math.max(0, Date.now() - startedAt),
    form_version: form.dataset.formVersion || '2026-10',
    source: 'web',
    consent_text:
      form.dataset.consentText ||
      'Acepto que Liyā Agency me contacte sobre este proyecto.',
    meta: {
      screen_width: window.screen?.width ?? null,
      screen_height: window.screen?.height ?? null,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_pixel_ratio: window.devicePixelRatio ?? null,
      platform: nav.platform || '',
      language: nav.language || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      cookie_enabled: nav.cookieEnabled ?? null,
      do_not_track: nav.doNotTrack || window.doNotTrack || '',
      color_scheme: prefersDark === null ? '' : prefersDark ? 'dark' : 'light',
      reduced_motion: prefersReducedMotion,
      max_touch_points: nav.maxTouchPoints ?? 0,
      hardware_concurrency: nav.hardwareConcurrency ?? null,
      device_memory: nav.deviceMemory ?? null,
      connection_type: connection.effectiveType || connection.type || '',
      connection_downlink: connection.downlink ?? null,
      connection_rtt: connection.rtt ?? null,
    },
  };
}

function buildPayload(form) {
  const data = new FormData(form);
  const select = form.querySelector(SELECTORS.project);
  const project = select?.value || 'no-lo-se';
  const projectLabel =
    select?.options[select.selectedIndex]?.textContent.trim() || COPY.unknownProject;
  const consent = form.elements.consentimiento;

  return {
    nombre: String(data.get('nombre') || '').trim(),
    email: String(data.get('email') || '').trim(),
    lang: (document.documentElement.lang || 'es').startsWith('fr') ? 'fr' : 'es',
    empresa: String(data.get('empresa') || '').trim(),
    proyecto: project,
    proyecto_label: projectLabel,
    mensaje: String(data.get('mensaje') || '').trim(),
    consentimiento: Boolean(consent?.checked),
    website: String(data.get('website') || ''),
    ...collectMetadata(form),
  };
}

async function submitToApi(form) {
  const endpoint = form.dataset.contactEndpoint || '/api/submit';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(form)),
    credentials: 'same-origin',
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.error || COPY.submitError(response.status)
    );
    error.status = response.status;
    error.fieldErrors = data?.errors || null;
    error.fallback = Boolean(data?.fallback);
    error.code = data?.code || null;
    throw error;
  }

  return data;
}

/* =============================================================================
   ENVÍO
   ========================================================================== */
function initSubmit(form) {
  const status = form.querySelector(SELECTORS.status);
  const recipient = form.dataset.contactEmail || 'hola@liyagency.es';
  const honeypot = form.elements.website;
  const submitButton = form.querySelector(SELECTORS.submit);
  const submitHtml = submitButton?.innerHTML || '';

  form.noValidate = true;
  form.dataset.startedAt = String(Date.now());

  const setStatus = (message, state = '', action = null) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;

    if (action?.href) {
      const link = document.createElement('a');
      link.className = 'contact-form__status-link';
      link.href = action.href;
      link.textContent = action.label || action.href;
      status.append(' ', link);
    }
  };

  const setBusy = (busy) => {
    if (!submitButton) return;
    submitButton.disabled = busy;
    if (busy) {
      submitButton.textContent = COPY.sending;
    } else {
      submitButton.innerHTML = submitHtml;
    }
  };

  const clearErrors = () => {
    RULES.forEach(({ name }) => {
      const input = form.elements[name];
      if (input) setFieldError(input, '');
    });
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (honeypot?.value) return;

    let firstInvalid = null;

    RULES.forEach(({ name, validate }) => {
      const input = form.elements[name];
      if (!input) return;

      const message = validate(input.value, input);
      setFieldError(input, message);

      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      setStatus(COPY.reviewFields, 'error');
      firstInvalid.focus();
      return;
    }

    setBusy(true);
    setStatus(COPY.sending);

    try {
      await submitToApi(form);

      setStatus(COPY.success, 'success');

      form.reset();
      form.dataset.startedAt = String(Date.now());
      clearErrors();
      form.querySelector(SELECTORS.planNote)?.setAttribute('hidden', '');
      form.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (error) {
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([name, message]) => {
          const input = form.elements[name];
          if (input) setFieldError(input, message);
        });
      }

      const serverUnavailable =
        error.name === 'TypeError' ||
        error.status === 404 ||
        error.status === 405 ||
        error.status >= 500 ||
        error.fallback;

      if (serverUnavailable) {
        const mailto = buildMailto(form, recipient);
        setStatus(COPY.fallback, 'error', {
          href: mailto,
          label: COPY.fallbackLink,
        });
        window.setTimeout(() => {
          window.location.href = mailto;
        }, 900);
        return;
      }

      setStatus(
        error.fieldErrors
          ? COPY.reviewFields
          : COPY.errorWithRecipient(error.message, recipient),
        'error'
      );
    } finally {
      setBusy(false);
    }
  });
}

/* =============================================================================
   PROGRESO DEL BRIEF
   ========================================================================== */
function initProgress(form) {
  const meter = form.querySelector('[data-form-progress]');
  const count = form.querySelector('[data-form-progress-count]');
  const fill = form.querySelector('[data-form-progress-fill]');
  if (!meter || !count || !fill) return;

  const update = () => {
    const done = RULES.reduce((total, { name, validate }) => {
      const input = form.elements[name];
      return total + (input && !validate(input.value, input) ? 1 : 0);
    }, 0);

    count.textContent = String(done);
    fill.style.width = `${(done / RULES.length) * 100}%`;
    meter.setAttribute('aria-valuenow', String(done));
    meter.setAttribute('aria-valuetext', COPY.progress(done, RULES.length));
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
}

/* =============================================================================
   SALTO AL FORMULARIO
   ========================================================================== */
function initJump(form) {
  document.querySelectorAll(SELECTORS.jump).forEach((link) => {
    link.addEventListener('click', () => {
      window.setTimeout(() => {
        form.querySelector('input, select, textarea')?.focus({ preventScroll: true });
      }, 420);
    });
  });
}

/* =============================================================================
   INICIALIZADOR
   ========================================================================== */
export function initContact() {
  const form = document.querySelector(SELECTORS.form);
  if (!form) return;

  initPresets(form);
  clearOnInput(form);
  initProgress(form);
  initJump(form);
  initSubmit(form);
}
