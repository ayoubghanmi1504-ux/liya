/**
 * lib/turso.js — cliente compartido de Turso
 * -----------------------------------------------------------------------------
 * Se usa @libsql/client/web para que funcione en Vercel sin binarios nativos.
 * Variables necesarias:
 *   TURSO_DATABASE_URL
 *   TURSO_AUTH_TOKEN
 */

import { createClient } from "@libsql/client/web";

let client = null;

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url || !authToken) {
    throw new Error(
      "Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en las variables de entorno."
    );
  }

  if (!client) {
    client = createClient({
      url,
      authToken,
      intMode: "number",
    });
  }

  return client;
}
