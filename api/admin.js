/**
 * /api/admin — API privada del panel de contactos.
 *
 * GET    /api/admin?resource=list&q=&status=&project=&limit=&offset=
 * GET    /api/admin?resource=detail&id=1
 * GET    /api/admin?resource=export&format=csv
 * PATCH  /api/admin?id=1            { "status": "read", "notes": "..." }
 * DELETE /api/admin?id=1
 *
 * Protegida con ADMIN_PASSWORD (Bearer o Basic Auth).
 */

import { adminConfigured, isAdmin } from "../lib/auth.js";
import {
  deleteContact,
  exportContacts,
  getContact,
  getStats,
  listContacts,
  toCsv,
  updateContact,
} from "../lib/contactos.js";
import {
  methodNotAllowed,
  readJsonBody,
  sendJson,
  sendText,
} from "../lib/http.js";
import { getDb } from "../lib/turso.js";

function requestUrl(req) {
  const host = req.headers?.host || "localhost";
  return new URL(req.url, `https://${host}`);
}

function parseId(value) {
  const id = Number.parseInt(value || "", 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export default async function handler(req, res) {
  if (!adminConfigured()) {
    console.error("[api/admin] Falta ADMIN_PASSWORD en las variables de entorno.");
    return sendJson(res, 500, {
      ok: false,
      error: "Falta configurar ADMIN_PASSWORD en Vercel.",
    });
  }

  if (!isAdmin(req)) {
    return sendJson(res, 401, {
      ok: false,
      error: "No autorizado. Revisa la contraseña.",
    });
  }

  const url = requestUrl(req);
  const resource = url.searchParams.get("resource") || "list";

  try {
    const db = getDb();

    if (req.method === "GET" && resource === "list") {
      const q = (url.searchParams.get("q") || "").trim();
      const status = (url.searchParams.get("status") || "").trim();
      const project = (url.searchParams.get("project") || "").trim();
      const limit = clampInt(url.searchParams.get("limit"), 100, 1, 200);
      const offset = clampInt(url.searchParams.get("offset"), 0, 0, 100000);

      const [list, stats] = await Promise.all([
        listContacts(db, { q, status, project, limit, offset }),
        getStats(db),
      ]);

      return sendJson(res, 200, {
        ok: true,
        items: list.items,
        total: list.total,
        stats,
        limit,
        offset,
      });
    }

    if (req.method === "GET" && resource === "detail") {
      const id = parseId(url.searchParams.get("id"));
      if (!id) {
        return sendJson(res, 400, { ok: false, error: "ID no válido." });
      }

      const item = await getContact(db, id);
      if (!item) {
        return sendJson(res, 404, {
          ok: false,
          error: "Contacto no encontrado.",
        });
      }

      return sendJson(res, 200, { ok: true, item });
    }

    if (req.method === "GET" && resource === "export") {
      const format = (url.searchParams.get("format") || "csv").toLowerCase();
      const rows = await exportContacts(db);
      const stamp = new Date().toISOString().slice(0, 10);

      if (format === "json") {
        return sendText(
          res,
          200,
          JSON.stringify(rows, null, 2),
          "application/json; charset=utf-8",
          {
            "Content-Disposition": `attachment; filename="contactos-liya-${stamp}.json"`,
          }
        );
      }

      return sendText(
        res,
        200,
        `\ufeff${toCsv(rows)}`,
        "text/csv; charset=utf-8",
        {
          "Content-Disposition": `attachment; filename="contactos-liya-${stamp}.csv"`,
        }
      );
    }

    if (req.method === "PATCH") {
      const id = parseId(url.searchParams.get("id"));
      if (!id) {
        return sendJson(res, 400, { ok: false, error: "ID no válido." });
      }

      let payload;
      try {
        payload = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, {
          ok: false,
          error: "El cuerpo de la petición no es válido.",
        });
      }

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return sendJson(res, 400, {
          ok: false,
          error: "El cuerpo de la petición debe ser un objeto JSON.",
        });
      }

      const status =
        payload.status === undefined ? undefined : String(payload.status);
      const notes =
        payload.notes === undefined ? undefined : String(payload.notes ?? "");

      if (status === undefined && notes === undefined) {
        return sendJson(res, 400, {
          ok: false,
          error: "No hay cambios que guardar.",
        });
      }

      const item = await updateContact(db, id, { status, notes });
      if (!item) {
        return sendJson(res, 404, {
          ok: false,
          error: "Contacto no encontrado.",
        });
      }

      return sendJson(res, 200, { ok: true, item });
    }

    if (req.method === "DELETE") {
      const id = parseId(url.searchParams.get("id"));
      if (!id) {
        return sendJson(res, 400, { ok: false, error: "ID no válido." });
      }

      const deleted = await deleteContact(db, id);
      if (!deleted) {
        return sendJson(res, 404, {
          ok: false,
          error: "Contacto no encontrado.",
        });
      }

      return sendJson(res, 200, { ok: true, deleted: id });
    }

    if (req.method !== "GET") {
      return methodNotAllowed(res, ["GET", "PATCH", "DELETE"]);
    }

    return sendJson(res, 404, {
      ok: false,
      error: "Ruta no encontrada.",
    });
  } catch (error) {
    console.error("[api/admin] Error:", error);

    if (error.statusCode === 400) {
      return sendJson(res, 400, {
        ok: false,
        error: error.message || "Datos no válidos.",
      });
    }

    return sendJson(res, 500, {
      ok: false,
      error: "Error interno del servidor. Revisa los logs de Vercel.",
    });
  }
}
