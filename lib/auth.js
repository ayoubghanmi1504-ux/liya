/**
 * lib/auth.js — contraseña básica del panel privado
 * -----------------------------------------------------------------------------
 * Acepta dos formatos:
 *   Authorization: Bearer <ADMIN_PASSWORD>
 *   Authorization: Basic base64(<ADMIN_USER>:<ADMIN_PASSWORD>)
 *
 * El panel usa Bearer para no mostrar el diálogo nativo del navegador en cada
 * petición. Basic se mantiene disponible para probar con curl o herramientas.
 *
 * Si no existe ADMIN_PASSWORD ni ADMIN_TOKEN, se usa el hash de respaldo de
 * abajo. En producción es recomendable definir ADMIN_PASSWORD en Vercel.
 */

import { createHash, timingSafeEqual } from "node:crypto";

// Hash SHA-256 de la contraseña de arranque solicitada para /admin.html.
// ADMIN_PASSWORD o ADMIN_TOKEN, si existen, siempre tienen prioridad.
const DEFAULT_ADMIN_PASSWORD_HASH =
  "c484fa964434da72f1bc2151092dfe19c9f8562f89926cab33202e3eba70b492";

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function adminConfigured() {
  return Boolean(expectedPassword() || DEFAULT_ADMIN_PASSWORD_HASH);
}

function expectedPassword() {
  return (process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "").trim();
}

function passwordMatches(value) {
  const expected = expectedPassword();
  if (expected) return safeEqual(value, expected);

  const hash = createHash("sha256").update(String(value)).digest("hex");
  return safeEqual(hash, DEFAULT_ADMIN_PASSWORD_HASH);
}

export function isAdmin(req) {
  if (!adminConfigured()) return false;

  const header = String(req.headers?.authorization || "");
  const separatorIndex = header.indexOf(" ");
  const scheme = separatorIndex === -1
    ? ""
    : header.slice(0, separatorIndex).toLowerCase();
  const credential = separatorIndex === -1
    ? ""
    : header.slice(separatorIndex + 1).trim();

  if (scheme === "bearer") {
    return passwordMatches(credential);
  }

  if (scheme === "basic") {
    try {
      const decoded = Buffer.from(credential, "base64").toString("utf8");
      const separator = decoded.indexOf(":");
      if (separator === -1) return false;

      const user = decoded.slice(0, separator);
      const password = decoded.slice(separator + 1);
      const expectedUser = (process.env.ADMIN_USER || "admin").trim();

      return safeEqual(user, expectedUser) && passwordMatches(password);
    } catch {
      return false;
    }
  }

  return false;
}
