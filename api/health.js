/**
 * GET /api/health — comprueba que Turso responde y que la tabla existe.
 */

import { methodNotAllowed, sendJson } from "../lib/http.js";
import { ensureSchema } from "../lib/schema.js";
import { getDb } from "../lib/turso.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const hasUrl = Boolean(process.env.TURSO_DATABASE_URL?.trim());
  const hasToken = Boolean(process.env.TURSO_AUTH_TOKEN?.trim());

  if (!hasUrl || !hasToken) {
    return sendJson(res, 503, {
      ok: false,
      service: "liya-contact-api",
      database: "turso",
      code: "missing_env",
      missing: [
        ...(hasUrl ? [] : ["TURSO_DATABASE_URL"]),
        ...(hasToken ? [] : ["TURSO_AUTH_TOKEN"]),
      ],
      error: "Faltan variables de Turso en Vercel.",
    });
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    const result = await db.execute({
      sql: "SELECT 1 AS ok",
      args: [],
    });

    return sendJson(res, 200, {
      ok: true,
      service: "liya-contact-api",
      database: "turso",
      schema: true,
      time: new Date().toISOString(),
      db: Number(result.rows[0]?.ok) === 1,
    });
  } catch (error) {
    console.error("[api/health] Turso no responde:", error);
    return sendJson(res, 503, {
      ok: false,
      service: "liya-contact-api",
      database: "turso",
      code: "db_unreachable",
      error: "No se pudo conectar con Turso.",
    });
  }
}
