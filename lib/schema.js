/**
 * lib/schema.js — creación segura de la tabla de contactos
 * -----------------------------------------------------------------------------
 * Permite que una instalación nueva funcione sin ejecutar SQL a mano.
 * `sql/schema.sql` sigue siendo la referencia para aplicar el esquema desde
 * Turso CLI. Las sentencias son idempotentes (IF NOT EXISTS).
 */

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS contactos (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at            TEXT NOT NULL,
    updated_at            TEXT NOT NULL,
    status                TEXT NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new', 'read', 'archived')),
    nombre                TEXT NOT NULL,
    email                 TEXT NOT NULL,
    empresa               TEXT,
    proyecto              TEXT,
    proyecto_label        TEXT,
    mensaje               TEXT NOT NULL,
    consentimiento        INTEGER NOT NULL DEFAULT 0,
    consent_text          TEXT,
    source                TEXT,
    form_version          TEXT,
    page_url              TEXT,
    referrer              TEXT,
    utm_json              TEXT,
    ip                    TEXT,
    user_agent            TEXT,
    accept_language       TEXT,
    origin                TEXT,
    host                  TEXT,
    screen_width          INTEGER,
    screen_height         INTEGER,
    viewport_width        INTEGER,
    viewport_height       INTEGER,
    device_pixel_ratio    REAL,
    platform              TEXT,
    language              TEXT,
    timezone              TEXT,
    cookie_enabled        INTEGER,
    do_not_track          TEXT,
    color_scheme          TEXT,
    reduced_motion        INTEGER,
    max_touch_points      INTEGER,
    hardware_concurrency  INTEGER,
    device_memory         REAL,
    connection_type       TEXT,
    connection_downlink   REAL,
    connection_rtt        INTEGER,
    elapsed_ms            INTEGER,
    notes                 TEXT NOT NULL DEFAULT '',
    raw_json              TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_contactos_created_at
    ON contactos(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_contactos_status
    ON contactos(status)`,
  `CREATE INDEX IF NOT EXISTS idx_contactos_proyecto
    ON contactos(proyecto)`,
];

let schemaPromise = null;

export function ensureSchema(db) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const sql of SCHEMA_STATEMENTS) {
        await db.execute({ sql, args: [] });
      }
    })().catch((error) => {
      // Si falla, permitimos reintentarlo en la siguiente petición.
      schemaPromise = null;
      throw error;
    });
  }

  return schemaPromise;
}
