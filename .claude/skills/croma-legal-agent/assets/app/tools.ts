import { tool } from "ai";
import { z } from "zod";

/**
 * Tools the model can call. Each one is a small function the AI decides to run
 * on its own — it picks the tool, fills in the arguments, we execute it, and
 * hand the result back so the model can answer.
 *
 * ⚠️ NOT WIRED YET. These tools are NOT connected to a real endpoint, so they
 * honestly return a "no access" error. They NEVER return fake/placeholder data
 * — inventing results would mislead users. The chat and the tool-calling UI
 * still work end-to-end: the model will tell the user it can't access the data
 * yet, and the status pill shows an error state.
 *
 * To make a tool real, replace the body of its `execute` with a `fetch` to your
 * endpoint (see the commented `cromaPost` helper) and add the key to
 * `.env.local`. Keep each tool's name and `inputSchema` unchanged so the UI
 * labels and system prompt keep matching.
 */

// Reusable "not connected" result. Honest, never fabricated.
const NOT_CONNECTED = {
  error:
    "Esta herramienta todavía no está conectada a un endpoint, así que no tengo acceso a los datos. Configúrala en app/tools.ts (y agrega su API key en .env.local).",
};

// The real call you'll drop in later (uncomment + use, then delete NOT_CONNECTED):
//
//   async function cromaPost(path: string, body: unknown) {
//     if (!process.env.CROMA_API_KEY) {
//       return { error: "Sin acceso: falta CROMA_API_KEY en .env.local." };
//     }
//     const res = await fetch(`https://api.croma.run${path}`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.CROMA_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });
//     if (!res.ok) return { error: `La API respondió ${res.status}.` };
//     return res.json();
//   }

export const tools = {
  // 1) Buscar procesos por nombre (persona o empresa).
  searchByName: tool({
    description:
      "Busca procesos judiciales por el nombre de una persona o empresa. Úsala cuando el usuario dé un nombre y quiera ver sus procesos.",
    inputSchema: z.object({
      name: z.string().min(3).max(200).describe("Nombre a buscar, p. ej. 'PEDRO CIFUENTES'"),
      entity_type: z
        .enum(["natural", "juridical"])
        .optional()
        .describe("'natural' para personas, 'juridical' para empresas. Por defecto 'natural'."),
    }),
    // TODO: return cromaPost("/co/rama-judicial/cases-by-entity/v1", { name, entity_type });
    execute: async () => NOT_CONNECTED,
  }),

  // 2) Buscar un proceso por número de radicado.
  searchByNumber: tool({
    description:
      "Busca un proceso judicial por su número de radicado (radicación). Úsala cuando el usuario dé un número de radicado.",
    inputSchema: z.object({
      registration_number: z
        .string()
        .describe("Número de radicado de 20 a 25 dígitos, p. ej. '11001600001720180327700'"),
    }),
    // TODO: return cromaPost("/co/rama-judicial/cases-by-radicado/v1", { registration_number });
    execute: async () => NOT_CONNECTED,
  }),
};
