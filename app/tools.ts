import { tool } from "ai";
import { z } from "zod";

/**
 * Tools the model can call. Each one is a small function the AI decides to run
 * on its own — it picks the tool, fills in the arguments, we execute it, and
 * hand the result back so the model can answer.
 *
 * ✅ WIRED to Croma's Rama Judicial API (https://docs.usecroma.com/guides/colombia/rama-judicial).
 * No-fabrication contract: if the API key is missing or the request fails, we
 * return an honest `{ error }` — we NEVER invent or fill in fake results.
 */

// Real call against the Croma API. Returns parsed JSON, or `{ error }` on any
// failure — never a fabricated fallback.
async function cromaPost(path: string, body: unknown) {
  if (!process.env.CROMA_API_KEY) {
    return { error: "Sin acceso: falta CROMA_API_KEY en .env.local." };
  }
  try {
    const res = await fetch(`https://api.croma.run${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CROMA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        error: `La API de Croma respondió ${res.status}.${detail ? ` ${detail.slice(0, 300)}` : ""}`,
      };
    }
    return await res.json();
  } catch (e) {
    return {
      error: `No se pudo contactar la API de Croma: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export const tools = {
  // 1) Buscar procesos por nombre (persona o empresa).
  searchByName: tool({
    description:
      "Busca procesos judiciales en la Rama Judicial de Colombia por el nombre de una persona o empresa. Úsala cuando el usuario dé un nombre y quiera ver sus procesos.",
    inputSchema: z.object({
      name: z.string().min(3).max(200).describe("Nombre a buscar, p. ej. 'PEDRO CIFUENTES'"),
      entity_type: z
        .enum(["natural", "juridical"])
        .optional()
        .describe("'natural' para personas, 'juridical' para empresas. Por defecto 'natural'."),
      active_only: z
        .boolean()
        .optional()
        .describe("Si es true, solo devuelve procesos activos. Por defecto false."),
      page: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe("Página de resultados (1-1000). Por defecto 1."),
    }),
    execute: async ({ name, entity_type, active_only, page }) =>
      cromaPost("/co/rama-judicial/cases-by-entity/v1", {
        name,
        entity_type: entity_type ?? "natural",
        active_only: active_only ?? false,
        page: page ?? 1,
      }),
  }),

  // 2) Buscar un proceso por número de radicado.
  searchByNumber: tool({
    description:
      "Busca un proceso judicial en la Rama Judicial de Colombia por su número de radicado (radicación). Úsala cuando el usuario dé un número de radicado.",
    inputSchema: z.object({
      registration_number: z
        .string()
        .describe("Número de radicado de 20 a 25 dígitos, p. ej. '11001600001720180327700'"),
    }),
    execute: async ({ registration_number }) =>
      cromaPost("/co/rama-judicial/cases-by-radicado/v1", { registration_number }),
  }),
};
