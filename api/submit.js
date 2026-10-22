/**
 * POST /api/submit — recibe el formulario y guarda el contacto en Turso.
 */

import { buildContact, insertContact } from "../lib/contactos.js";
import {
  methodNotAllowed,
  readJsonBody,
  requestContext,
  sendJson,
} from "../lib/http.js";
import { getDb } from "../lib/turso.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "64kb",
    },
  },
};

const MESSAGES = {
  es: {
    read: "No se pudo leer el formulario. Revisa los datos.",
    fields: "Revisa los campos marcados.",
    save: "No se pudo guardar el contacto. Inténtalo de nuevo.",
  },
  fr: {
    read: "Impossible de lire le formulaire. Vérifiez les données.",
    fields: "Vérifiez les champs indiqués.",
    save: "Impossible d’enregistrer le contact. Réessayez.",
  },
};

function prefersFrench(req, payload) {
  const bodyLang = String(payload?.lang || "").toLowerCase();
  if (bodyLang === "fr") return true;
  if (bodyLang === "es") return false;
  const accept = String(req.headers?.["accept-language"] || "").toLowerCase();
  return accept.split(",")[0]?.trim().startsWith("fr") || false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch {
    const copy = MESSAGES[prefersFrench(req) ? "fr" : "es"];
    return sendJson(res, 400, {
      ok: false,
      error: copy.read,
    });
  }

  const copy = MESSAGES[prefersFrench(req, payload) ? "fr" : "es"];
  const built = buildContact(payload);

  if (built.spam) {
    // Respuesta silenciosa: no damos pistas a los bots.
    return sendJson(res, 202, { ok: true });
  }

  if (!built.record || Object.keys(built.errors).length) {
    return sendJson(res, 400, {
      ok: false,
      error: copy.fields,
      errors: built.errors,
    });
  }

  const record = {
    ...built.record,
    ...requestContext(req),
  };

  try {
    const saved = await insertContact(getDb(), record);
    return sendJson(res, 201, {
      ok: true,
      id: saved.id,
      created_at: saved.created_at,
    });
  } catch (error) {
    console.error("[api/submit] No se pudo guardar el contacto:", error);
    return sendJson(res, 500, {
      ok: false,
      error: copy.save,
    });
  }
}
