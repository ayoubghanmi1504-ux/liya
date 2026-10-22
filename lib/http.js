/**
 * lib/http.js — utilidades HTTP para las Vercel Functions
 * -----------------------------------------------------------------------------
 * Sin frameworks: respuestas JSON/CSV, lectura de body y contexto de la request.
 */

export function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(body);
}

export function sendText(res, status, body, contentType, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(body);
}

export function methodNotAllowed(res, allowed = []) {
  return sendJson(
    res,
    405,
    { ok: false, error: "Método no permitido." },
    { Allow: allowed.join(", ") }
  );
}

export async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString("utf8"));
    }
    if (typeof req.body === "string") {
      return JSON.parse(req.body);
    }
    if (typeof req.body === "object") {
      return req.body;
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

export function getHeader(req, name) {
  const value = req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

export function getClientIp(req) {
  const forwarded = getHeader(req, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = getHeader(req, "x-real-ip");
  if (realIp) return realIp.trim();
  return req.socket?.remoteAddress || "";
}

function cleanHeader(value, maxLength) {
  return String(value || "").replace(/\0/g, "").trim().slice(0, maxLength);
}

export function requestContext(req) {
  return {
    ip: cleanHeader(getClientIp(req), 120) || null,
    user_agent: cleanHeader(getHeader(req, "user-agent"), 600) || null,
    accept_language: cleanHeader(getHeader(req, "accept-language"), 300) || null,
    origin: cleanHeader(getHeader(req, "origin"), 400) || null,
    host: cleanHeader(getHeader(req, "host"), 200) || null,
  };
}
