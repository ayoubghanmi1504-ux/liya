/**
 * GET /api/health — comprueba que Turso responde.
 */

import { methodNotAllowed, sendJson } from "../lib/http.js";
import { getDb } from "../lib/turso.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
    const result = await getDb().execute({
      sql: "SELECT 1 AS ok",
      args: [],
    });

    return sendJson(res, 200, {
      ok: true,
      service: "liya-contact-api",
      database: "turso",
      time: new Date().toISOString(),
      db: Number(result.rows[0]?.ok) === 1,
    });
  } catch (error) {
    console.error("[api/health] Turso no responde:", error);
    return sendJson(res, 503, {
      ok: false,
      service: "liya-contact-api",
      database: "turso",
      error: "No se pudo conectar con Turso.",
    });
  }
}
