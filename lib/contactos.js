/**
 * lib/contactos.js — validación, consultas y CSV de contactos
 * -----------------------------------------------------------------------------
 * Lógica compartida por /api/submit.js y /api/admin.js.
 */

export const PROJECT_LABELS = {
  "no-lo-se": "Aún no lo sé",
  landing: "Landing page",
  ecommerce: "Tienda online",
  optimizacion: "Optimización web",
  esencial: "Plan Presencia",
  crecimiento: "Plan E-commerce",
  pro: "Plan Optimización",
};

const PROJECT_LABELS_FR = {
  "no-lo-se": "Je ne sais pas encore",
  landing: "Landing page",
  ecommerce: "Boutique en ligne",
  optimizacion: "Optimisation web",
  esencial: "Offre Présence",
  crecimiento: "Offre E-commerce",
  pro: "Offre Optimisation",
};

const COPY = {
  es: {
    name: "Escribe tu nombre.",
    email: "Introduce un email válido.",
    message: "Cuéntanos un poco más (mínimo 10 caracteres).",
    consent: "Necesitamos tu consentimiento para responderte.",
    consentText: "Acepto que Liyā Agency me contacte sobre este proyecto.",
    fallbackProject: "Aún no lo sé",
    labels: PROJECT_LABELS,
  },
  fr: {
    name: "Indiquez votre nom.",
    email: "Saisissez une adresse e-mail valide.",
    message: "Dites-nous en un peu plus (10 caractères minimum).",
    consent: "Nous avons besoin de votre accord pour vous répondre.",
    consentText: "J’accepte que Liyā Agency me contacte au sujet de ce projet.",
    fallbackProject: "Je ne sais pas encore",
    labels: PROJECT_LABELS_FR,
  },
};

export const STATUSES = ["new", "read", "archived"];
const STATUS_SET = new Set(STATUSES);

export const CONTACT_COLUMNS = [
  "created_at",
  "updated_at",
  "status",
  "nombre",
  "email",
  "empresa",
  "proyecto",
  "proyecto_label",
  "mensaje",
  "consentimiento",
  "consent_text",
  "source",
  "form_version",
  "page_url",
  "referrer",
  "utm_json",
  "ip",
  "user_agent",
  "accept_language",
  "origin",
  "host",
  "screen_width",
  "screen_height",
  "viewport_width",
  "viewport_height",
  "device_pixel_ratio",
  "platform",
  "language",
  "timezone",
  "cookie_enabled",
  "do_not_track",
  "color_scheme",
  "reduced_motion",
  "max_touch_points",
  "hardware_concurrency",
  "device_memory",
  "connection_type",
  "connection_downlink",
  "connection_rtt",
  "elapsed_ms",
  "notes",
  "raw_json",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function utcNow() {
  return new Date().toISOString();
}

export function cleanText(value, maxLength) {
  return String(value ?? "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

export function cleanInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function cleanFloat(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function boolInt(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value === false || value === 0 || value === "0" || value === "false") {
    return 0;
  }
  return 1;
}

function isTruthyConsent(value) {
  return [true, 1, "1", "true", "on", "yes"].includes(value);
}

export function buildContact(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      record: null,
      errors: { _: "El cuerpo debe ser un objeto JSON." },
      spam: false,
    };
  }

  if (payload.website) {
    return { record: null, errors: {}, spam: true };
  }

  const lang = cleanText(payload.lang, 5).toLowerCase() === "fr" ? "fr" : "es";
  const copy = COPY[lang];

  const nombre = cleanText(payload.nombre, 120);
  const email = cleanText(payload.email, 254);
  const empresa = cleanText(payload.empresa, 160);
  const proyecto = cleanText(payload.proyecto, 40) || "no-lo-se";
  const mensaje = cleanText(payload.mensaje, 5000);
  const consentimiento = isTruthyConsent(payload.consentimiento);

  const projectLabel =
    cleanText(payload.proyecto_label, 80) ||
    copy.labels[proyecto] ||
    copy.fallbackProject;

  const errors = {};
  if (nombre.length < 2) errors.nombre = copy.name;
  if (!EMAIL_PATTERN.test(email)) errors.email = copy.email;
  if (mensaje.length < 10) {
    errors.mensaje = copy.message;
  }
  if (!consentimiento) {
    errors.consentimiento = copy.consent;
  }

  if (Object.keys(errors).length) {
    return { record: null, errors, spam: false };
  }

  const meta =
    payload.meta && typeof payload.meta === "object" && !Array.isArray(payload.meta)
      ? payload.meta
      : {};
  const utm =
    payload.utm && typeof payload.utm === "object" && !Array.isArray(payload.utm)
      ? payload.utm
      : {};

  const now = utcNow();

  const record = {
    created_at: now,
    updated_at: now,
    status: "new",
    nombre,
    email,
    empresa: empresa || null,
    proyecto,
    proyecto_label: projectLabel,
    mensaje,
    consentimiento: consentimiento ? 1 : 0,
    consent_text:
      cleanText(payload.consent_text, 300) || copy.consentText,
    source: cleanText(payload.source, 80) || "web",
    form_version: cleanText(payload.form_version, 40) || "2026-10",
    page_url: cleanText(payload.page_url, 1000) || null,
    referrer: cleanText(payload.referrer, 1000) || null,
    utm_json: Object.keys(utm).length ? JSON.stringify(utm) : null,
    ip: null,
    user_agent: null,
    accept_language: null,
    origin: null,
    host: null,
    screen_width: cleanInt(meta.screen_width),
    screen_height: cleanInt(meta.screen_height),
    viewport_width: cleanInt(meta.viewport_width),
    viewport_height: cleanInt(meta.viewport_height),
    device_pixel_ratio: cleanFloat(meta.device_pixel_ratio),
    platform: cleanText(meta.platform, 120) || null,
    language: cleanText(meta.language, 80) || null,
    timezone: cleanText(meta.timezone, 120) || null,
    cookie_enabled: boolInt(meta.cookie_enabled),
    do_not_track: cleanText(meta.do_not_track, 40) || null,
    color_scheme: cleanText(meta.color_scheme, 40) || null,
    reduced_motion: boolInt(meta.reduced_motion),
    max_touch_points: cleanInt(meta.max_touch_points),
    hardware_concurrency: cleanInt(meta.hardware_concurrency),
    device_memory: cleanFloat(meta.device_memory),
    connection_type: cleanText(meta.connection_type, 60) || null,
    connection_downlink: cleanFloat(meta.connection_downlink),
    connection_rtt: cleanInt(meta.connection_rtt),
    elapsed_ms: cleanInt(payload.elapsed_ms),
    notes: "",
    raw_json: JSON.stringify(payload),
  };

  return { record, errors: {}, spam: false };
}

export async function insertContact(db, record) {
  const placeholders = CONTACT_COLUMNS.map(() => "?").join(", ");
  const columns = CONTACT_COLUMNS.join(", ");
  const args = CONTACT_COLUMNS.map((column) => record[column] ?? null);

  const result = await db.execute({
    sql: `INSERT INTO contactos (${columns}) VALUES (${placeholders}) RETURNING id, created_at`,
    args,
  });

  const row = result.rows[0];
  if (!row) throw new Error("No se pudo recuperar el contacto guardado.");

  return {
    id: Number(row.id),
    created_at: String(row.created_at),
  };
}

function normalizeRow(row) {
  const output = {};
  for (const key of Object.keys(row)) {
    const value = row[key];
    output[key] = typeof value === "bigint" ? Number(value) : value;
  }
  return output;
}

export async function listContacts(db, { q, status, project, limit, offset }) {
  const where = [];
  const args = [];

  if (q) {
    const like = `%${q}%`;
    where.push(
      "(nombre LIKE ? OR email LIKE ? OR empresa LIKE ? OR mensaje LIKE ? OR proyecto_label LIKE ?)"
    );
    args.push(like, like, like, like, like);
  }

  if (STATUS_SET.has(status)) {
    where.push("status = ?");
    args.push(status);
  }

  if (project) {
    where.push("proyecto = ?");
    args.push(project);
  }

  const clause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

  const [countResult, rowsResult] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) AS total FROM contactos${clause}`,
      args,
    }),
    db.execute({
      sql: `SELECT * FROM contactos${clause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    }),
  ]);

  return {
    total: Number(countResult.rows[0]?.total || 0),
    items: rowsResult.rows.map(normalizeRow),
  };
}

export async function getContact(db, id) {
  const result = await db.execute({
    sql: "SELECT * FROM contactos WHERE id = ?",
    args: [id],
  });
  return result.rows[0] ? normalizeRow(result.rows[0]) : null;
}

export async function updateContact(db, id, { status, notes }) {
  const fields = [];
  const args = [];

  if (status !== undefined) {
    if (!STATUS_SET.has(status)) {
      const error = new Error("Estado no válido.");
      error.statusCode = 400;
      throw error;
    }
    fields.push("status = ?");
    args.push(status);
  }

  if (notes !== undefined) {
    fields.push("notes = ?");
    args.push(cleanText(notes, 8000));
  }

  if (!fields.length) return null;

  fields.push("updated_at = ?");
  args.push(utcNow(), id);

  const result = await db.execute({
    sql: `UPDATE contactos SET ${fields.join(", ")} WHERE id = ? RETURNING *`,
    args,
  });

  return result.rows[0] ? normalizeRow(result.rows[0]) : null;
}

export async function deleteContact(db, id) {
  const result = await db.execute({
    sql: "DELETE FROM contactos WHERE id = ? RETURNING id",
    args: [id],
  });
  return result.rows.length > 0;
}

export async function getStats(db) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const queries = [
    { key: "total", sql: "SELECT COUNT(*) AS n FROM contactos", args: [] },
    {
      key: "new",
      sql: "SELECT COUNT(*) AS n FROM contactos WHERE status = 'new'",
      args: [],
    },
    {
      key: "read",
      sql: "SELECT COUNT(*) AS n FROM contactos WHERE status = 'read'",
      args: [],
    },
    {
      key: "archived",
      sql: "SELECT COUNT(*) AS n FROM contactos WHERE status = 'archived'",
      args: [],
    },
    {
      key: "today",
      sql: "SELECT COUNT(*) AS n FROM contactos WHERE substr(created_at, 1, 10) = ?",
      args: [today],
    },
    {
      key: "week",
      sql: "SELECT COUNT(*) AS n FROM contactos WHERE created_at >= ?",
      args: [weekAgo],
    },
  ];

  const results = await Promise.all(
    queries.map((query) =>
      db.execute({ sql: query.sql, args: query.args })
    )
  );

  return Object.fromEntries(
    queries.map((query, index) => [
      query.key,
      Number(results[index].rows[0]?.n || 0),
    ])
  );
}

export async function exportContacts(db) {
  const result = await db.execute(
    "SELECT * FROM contactos ORDER BY created_at DESC, id DESC"
  );
  return result.rows.map(normalizeRow);
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(rows) {
  const columns = ["id", ...CONTACT_COLUMNS];
  const lines = [columns.map(csvCell).join(",")];

  for (const row of rows) {
    lines.push(columns.map((column) => csvCell(row[column])).join(","));
  }

  return lines.join("\r\n");
}
