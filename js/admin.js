/**
 * admin.js — Bandeja de entrada privada de Liyā Agency
 * -----------------------------------------------------------------------------
 * Consume la API /api/admin (Vercel + Turso). La contraseña se guarda solo en
 * sessionStorage y se envía en la cabecera Authorization. No se incluye en la URL.
 */

const PASSWORD_KEY = "liya-admin-password";

const state = {
  password: sessionStorage.getItem(PASSWORD_KEY) || "",
  items: [],
  total: 0,
  stats: null,
  selectedId: null,
  loading: false,
  toastTimer: null,
};

const STATUS_LABELS = {
  new: "Nuevo",
  read: "Leído",
  archived: "Archivado",
};

const PROJECT_LABELS = {
  "no-lo-se": "Aún no lo sé",
  landing: "Landing page",
  ecommerce: "Tienda online",
  optimizacion: "Optimización web",
  esencial: "Plan Presencia",
  crecimiento: "Plan E-commerce",
  pro: "Plan Optimización",
};

const $ = (selector) => document.querySelector(selector);

const el = {
  loginView: $("#login-view"),
  inboxView: $("#inbox-view"),
  loginForm: $("#login-form"),
  passwordInput: $("#password-input"),
  loginError: $("#login-error"),
  logoutBtn: $("#logout-btn"),
  refreshBtn: $("#refresh-btn"),
  reloadBtn: $("#reload-btn"),
  exportBtn: $("#export-btn"),
  searchInput: $("#search-input"),
  statusFilter: $("#status-filter"),
  projectFilter: $("#project-filter"),
  lastUpdate: $("#last-update"),
  statTotal: $("#stat-total"),
  statNew: $("#stat-new"),
  statToday: $("#stat-today"),
  statWeek: $("#stat-week"),
  resultCount: $("#result-count"),
  contactList: $("#contact-list"),
  listEmpty: $("#list-empty"),
  listError: $("#list-error"),
  detailEmpty: $("#detail-empty"),
  detailView: $("#detail-view"),
  detailProject: $("#detail-project"),
  detailName: $("#detail-name"),
  detailEmail: $("#detail-email"),
  detailStatus: $("#detail-status"),
  detailStatusSelect: $("#detail-status-select"),
  detailMessage: $("#detail-message"),
  detailNotes: $("#detail-notes"),
  detailFormGrid: $("#detail-form-grid"),
  detailContext: $("#detail-context"),
  detailDevice: $("#detail-device"),
  detailServer: $("#detail-server"),
  detailRaw: $("#detail-raw"),
  saveBtn: $("#save-btn"),
  deleteBtn: $("#delete-btn"),
  toast: $("#toast"),
};

/* =============================================================================
   UTILIDADES
   ========================================================================== */
function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function textOrDash(value) {
  return isBlank(value) ? "—" : String(value);
}

function boolLabel(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value === 1 || value === "1" || value === true ? "Sí" : "No";
}

function numberLabel(value, suffix = "") {
  if (isBlank(value)) return "—";
  return `${value}${suffix}`;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || textOrDash(status);
}

function statusClass(status) {
  return `status status--${status || "new"}`;
}

function projectLabel(item) {
  return item.proyecto_label || PROJECT_LABELS[item.proyecto] || "Aún no lo sé";
}

function formatDate(value, short = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-ES", short
    ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
    : { dateStyle: "medium", timeStyle: "short" }
  ).format(date);
}

function formatElapsed(value) {
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function parseJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function prettyJson(value) {
  const parsed = parseJson(value);
  if (parsed === null) return isBlank(value) ? "—" : String(value);
  return JSON.stringify(parsed, null, 2);
}

function utmSummary(value) {
  const parsed = parseJson(value);
  if (!parsed || !Object.keys(parsed).length) return "—";
  return Object.entries(parsed)
    .map(([key, val]) => `${key}: ${val}`)
    .join("\n");
}

function maybeHref(value) {
  const text = String(value || "").trim();
  return /^https?:\/\//i.test(text) ? text : "";
}

function renderEntries(container, entries) {
  container.replaceChildren();

  for (const entry of entries) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    const value = textOrDash(entry.value);

    dt.textContent = entry.label;

    if (entry.href && value !== "—") {
      const link = document.createElement("a");
      link.href = entry.href;
      link.textContent = value;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      dd.append(link);
    } else {
      dd.textContent = value;
      if (value === "—") dd.classList.add("is-empty");
      if (entry.multiline) dd.style.whiteSpace = "pre-wrap";
    }

    wrapper.append(dt, dd);
    container.append(wrapper);
  }
}

function showToast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.classList.toggle("is-error", isError);
  el.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    el.toast.classList.remove("is-visible");
  }, 3600);
}

function showLogin(message = "") {
  el.loginView.hidden = false;
  el.inboxView.hidden = true;
  el.logoutBtn.hidden = true;
  el.refreshBtn.disabled = true;
  el.exportBtn.disabled = true;
  el.loginError.hidden = !message;
  el.loginError.textContent = message;
  window.setTimeout(() => el.passwordInput.focus(), 80);
}

function showInbox() {
  el.loginView.hidden = true;
  el.inboxView.hidden = false;
  el.logoutBtn.hidden = false;
  el.refreshBtn.disabled = false;
  el.exportBtn.disabled = false;
  el.loginError.hidden = true;
}

function logout(message = "") {
  state.password = "";
  state.items = [];
  state.total = 0;
  state.stats = null;
  state.selectedId = null;
  sessionStorage.removeItem(PASSWORD_KEY);
  el.contactList.replaceChildren();
  el.detailView.hidden = true;
  el.detailEmpty.hidden = false;
  showLogin(message);
}

/* =============================================================================
   API
   ========================================================================== */
async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.password) headers.set("Authorization", `Bearer ${state.password}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, { ...options, headers });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    logout("La contraseña no es válida o ha caducado.");
    throw new Error("La contraseña no es válida o ha caducado.");
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}.`);
  }

  return data;
}

/* =============================================================================
   LISTA Y ESTADÍSTICAS
   ========================================================================== */
function renderStats() {
  const stats = state.stats || {};
  el.statTotal.textContent = String(stats.total ?? state.total ?? 0);
  el.statNew.textContent = String(stats.new ?? 0);
  el.statToday.textContent = String(stats.today ?? 0);
  el.statWeek.textContent = String(stats.week ?? 0);
}

function renderList() {
  el.contactList.replaceChildren();
  el.listEmpty.hidden = state.items.length > 0;
  el.listError.hidden = true;
  el.resultCount.textContent = `${state.total} contacto${state.total === 1 ? "" : "s"}`;

  const hasFilters = Boolean(
    el.searchInput.value.trim() || el.statusFilter.value || el.projectFilter.value
  );
  const emptyTitle = el.listEmpty.querySelector("strong");
  const emptyText = el.listEmpty.querySelector("span");
  if (emptyTitle) {
    emptyTitle.textContent = hasFilters
      ? "No hay contactos con estos filtros."
      : "Todavía no hay contactos.";
  }
  if (emptyText) {
    emptyText.textContent = hasFilters
      ? "Prueba a quitar la búsqueda o cambia el estado."
      : "Los envíos del formulario aparecerán aquí.";
  }

  for (const item of state.items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "contact-item";
    button.dataset.id = String(item.id);
    if (item.id === state.selectedId) button.classList.add("is-active");

    const dotClass = item.status === "new"
      ? "contact-item__dot contact-item__dot--new"
      : item.status === "archived"
        ? "contact-item__dot contact-item__dot--archived"
        : "contact-item__dot";

    button.innerHTML = `
      <span class="${dotClass}" aria-hidden="true"></span>
      <span class="contact-item__main">
        <span class="contact-item__name">${esc(item.nombre)}</span>
        <span class="contact-item__project">${esc(projectLabel(item))} · ${esc(item.email)}</span>
        <span class="contact-item__snippet">${esc(item.mensaje)}</span>
      </span>
      <span class="contact-item__meta">
        <span class="${statusClass(item.status)}">${esc(statusLabel(item.status))}</span>
        <span>${esc(formatDate(item.created_at, true))}</span>
      </span>
    `;

    button.addEventListener("click", () => selectContact(item.id));
    el.contactList.append(button);
  }
}

async function loadContacts({ silent = false } = {}) {
  if (state.loading) return;
  state.loading = true;

  const params = new URLSearchParams({ limit: "100" });
  const search = el.searchInput.value.trim();
  const status = el.statusFilter.value;
  const project = el.projectFilter.value;

  if (search) params.set("q", search);
  if (status) params.set("status", status);
  if (project) params.set("project", project);

  try {
    const data = await api(`/api/admin?resource=list&${params.toString()}`);
    state.items = data.items || [];
    state.total = data.total ?? state.items.length;
    state.stats = data.stats || null;
    renderStats();
    renderList();
    el.lastUpdate.textContent = `Actualizado ${new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())}`;

    if (state.selectedId && !state.items.some((item) => item.id === state.selectedId)) {
      clearDetail();
    }
    return true;
  } catch (error) {
    if (!silent) {
      el.listError.hidden = false;
      el.listError.textContent = error.message;
    }
    return false;
  } finally {
    state.loading = false;
  }
}

/* =============================================================================
   DETALLE
   ========================================================================== */
function clearDetail() {
  state.selectedId = null;
  el.detailEmpty.hidden = false;
  el.detailView.hidden = true;
  document.querySelectorAll(".contact-item.is-active").forEach((item) => {
    item.classList.remove("is-active");
  });
}

function selectContact(id) {
  state.selectedId = id;
  document.querySelectorAll(".contact-item").forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.id) === id);
  });

  api(`/api/admin?resource=detail&id=${id}`)
    .then((data) => {
      if (data?.item) renderDetail(data.item);
    })
    .catch((error) => showToast(error.message, true));
}

function renderDetail(item) {
  el.detailEmpty.hidden = true;
  el.detailView.hidden = false;

  el.detailProject.textContent = projectLabel(item);
  el.detailName.textContent = item.nombre || "Sin nombre";
  el.detailEmail.textContent = item.email || "—";
  el.detailEmail.href = item.email ? `mailto:${item.email}` : "#";
  el.detailStatus.textContent = statusLabel(item.status);
  el.detailStatus.className = statusClass(item.status);
  el.detailStatusSelect.value = item.status || "new";
  el.detailNotes.value = item.notes || "";
  el.detailMessage.textContent = item.mensaje || "—";
  el.detailRaw.textContent = prettyJson(item.raw_json);

  const raw = parseJson(item.raw_json) || {};
  const meta = raw.meta && typeof raw.meta === "object" ? raw.meta : {};

  renderEntries(el.detailFormGrid, [
    { label: "ID", value: item.id },
    { label: "Nombre", value: item.nombre },
    { label: "Email", value: item.email, href: item.email ? `mailto:${item.email}` : "" },
    { label: "Empresa", value: item.empresa },
    { label: "Proyecto", value: projectLabel(item) },
    { label: "Consentimiento", value: boolLabel(item.consentimiento) },
    { label: "Texto del consentimiento", value: item.consent_text },
    { label: "Recibido", value: formatDate(item.created_at) },
  ]);

  renderEntries(el.detailContext, [
    {
      label: "Página de origen",
      value: item.page_url,
      href: maybeHref(item.page_url),
    },
    {
      label: "Referrer",
      value: item.referrer,
      href: maybeHref(item.referrer),
    },
    { label: "UTM / parámetros", value: utmSummary(item.utm_json), multiline: true },
    { label: "Tiempo hasta enviar", value: formatElapsed(item.elapsed_ms) },
    { label: "Versión del formulario", value: item.form_version },
    { label: "Origen", value: item.source },
  ]);

  renderEntries(el.detailDevice, [
    {
      label: "Pantalla",
      value: item.screen_width && item.screen_height
        ? `${item.screen_width} × ${item.screen_height} px`
        : "",
    },
    {
      label: "Ventana",
      value: item.viewport_width && item.viewport_height
        ? `${item.viewport_width} × ${item.viewport_height} px`
        : "",
    },
    { label: "Densidad de píxel", value: numberLabel(item.device_pixel_ratio, "×") },
    { label: "Plataforma", value: item.platform },
    { label: "Idioma", value: item.language },
    { label: "Zona horaria", value: item.timezone },
    { label: "Puntos táctiles", value: numberLabel(item.max_touch_points) },
    { label: "Núcleos de CPU", value: numberLabel(item.hardware_concurrency) },
    { label: "Memoria del dispositivo", value: numberLabel(item.device_memory, " GB") },
    {
      label: "Conexión",
      value: item.connection_type
        ? [
            item.connection_type,
            item.connection_downlink ? `${item.connection_downlink} Mbps` : null,
            item.connection_rtt ? `${item.connection_rtt} ms RTT` : null,
          ].filter(Boolean).join(" · ")
        : "",
    },
    { label: "Tema del sistema", value: item.color_scheme },
    { label: "Movimiento reducido", value: boolLabel(item.reduced_motion) },
    { label: "Cookies activas", value: boolLabel(item.cookie_enabled) },
    { label: "Do Not Track", value: item.do_not_track },
  ]);

  renderEntries(el.detailServer, [
    { label: "IP", value: item.ip },
    { label: "User agent", value: item.user_agent, multiline: true },
    { label: "Accept-Language", value: item.accept_language },
    { label: "Origin", value: item.origin },
    { label: "Host", value: item.host },
    { label: "Creado", value: formatDate(item.created_at) },
    { label: "Actualizado", value: formatDate(item.updated_at) },
    { label: "Estado", value: statusLabel(item.status) },
    { label: "Proyecto (código)", value: item.proyecto },
    { label: "Meta extra", value: JSON.stringify(meta, null, 2), multiline: true },
  ]);

  el.detailStatus.textContent = statusLabel(item.status);
  el.detailStatus.className = statusClass(item.status);
}

/* =============================================================================
   ACCIONES
   ========================================================================== */
async function saveDetail() {
  if (!state.selectedId) return;

  el.saveBtn.disabled = true;
  try {
    const data = await api(`/api/admin?id=${state.selectedId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: el.detailStatusSelect.value,
        notes: el.detailNotes.value,
      }),
    });

    if (data?.item) {
      renderDetail(data.item);
      const item = state.items.find((entry) => entry.id === state.selectedId);
      if (item) {
        item.status = data.item.status;
        item.notes = data.item.notes;
      }
      renderList();
    }

    showToast("Contacto actualizado.");
    await loadContacts({ silent: true });
  } catch (error) {
    showToast(error.message, true);
  } finally {
    el.saveBtn.disabled = false;
  }
}

async function deleteDetail() {
  if (!state.selectedId) return;

  const item = state.items.find((entry) => entry.id === state.selectedId);
  const label = item?.nombre ? `“${item.nombre}”` : "este contacto";
  if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) {
    return;
  }

  el.deleteBtn.disabled = true;
  try {
    await api(`/api/admin?id=${state.selectedId}`, { method: "DELETE" });
    clearDetail();
    showToast("Contacto eliminado.");
    await loadContacts({ silent: true });
  } catch (error) {
    showToast(error.message, true);
  } finally {
    el.deleteBtn.disabled = false;
  }
}

async function exportCsv() {
  if (!state.password) return;

  el.exportBtn.disabled = true;
  try {
    const response = await fetch("/api/admin?resource=export&format=csv", {
      headers: { Authorization: `Bearer ${state.password}` },
    });

    if (response.status === 401) {
      logout("La contraseña no es válida o ha caducado.");
      return;
    }

    if (!response.ok) {
      throw new Error(`No se pudo exportar (${response.status}).`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `contactos-liya-${stamp}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exportado.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    el.exportBtn.disabled = false;
  }
}

async function login(password) {
  state.password = password;
  sessionStorage.setItem(PASSWORD_KEY, password);
  el.loginError.hidden = true;

  const ok = await loadContacts();
  if (!ok) {
    logout(el.listError.textContent || "No se pudo conectar con la bandeja.");
    return;
  }
  showInbox();
}

/* =============================================================================
   EVENTOS
   ========================================================================== */
el.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = el.passwordInput.value.trim();
  if (!password) {
    el.loginError.hidden = false;
    el.loginError.textContent = "Introduce la contraseña de administración.";
    return;
  }
  login(password);
});

el.logoutBtn.addEventListener("click", () => logout());

el.refreshBtn.addEventListener("click", () => loadContacts());
el.reloadBtn.addEventListener("click", () => loadContacts());

let searchTimer = null;
el.searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => loadContacts(), 280);
});

el.statusFilter.addEventListener("change", () => loadContacts());
el.projectFilter.addEventListener("change", () => loadContacts());

el.saveBtn.addEventListener("click", saveDetail);
el.deleteBtn.addEventListener("click", deleteDetail);
el.exportBtn.addEventListener("click", exportCsv);

/* Actualización silenciosa cada minuto mientras la pestaña está visible. */
window.setInterval(() => {
  if (state.password && !document.hidden) loadContacts({ silent: true });
}, 60000);

/* Arranque */
if (state.password) {
  login(state.password);
} else {
  showLogin();
}
