import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { tools } from "../../tools";

// Exactly the model croma uses (openai/gpt-oss-120b), served by Groq for speed.
const MODEL = "openai/gpt-oss-120b";

const systemPrompt = `Eres Croma Agent, un asistente general, útil y conciso. Respondes SIEMPRE en español.
Para preguntas generales, responde normalmente con tu propio conocimiento.
Además tienes dos herramientas para buscar procesos judiciales: por nombre (persona o empresa) y por número de radicado. Úsalas solo cuando el usuario te pida ese tipo de búsqueda; cuando lo hagas, no inventes datos y usa únicamente lo que devuelven las herramientas, resumiéndolo de forma clara (lista o tabla si hay varios resultados).
Si una herramienta devuelve un error o indica que no tiene acceso a los datos, díselo al usuario con claridad y NO inventes ni rellenes resultados.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: groq(MODEL),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    // Deja que el modelo llame una herramienta, lea el resultado y responda.
    stopWhen: stepCountIs(5),
    // gpt-oss es un modelo de razonamiento: lo mantenemos ligero (latencia) y
    // ocultamos su "pensamiento" para que no aparezca en la respuesta.
    providerOptions: { groq: { reasoningEffort: "low", reasoningFormat: "hidden" } },
  });

  // Transmite la respuesta (y cada llamada/resultado de herramienta) al navegador.
  return result.toUIMessageStreamResponse();
}
