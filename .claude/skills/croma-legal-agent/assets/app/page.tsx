"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Check,
  Loader2,
  LoaderIcon,
  SquareIcon,
  TriangleAlert,
} from "lucide-react";
import { useRef, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

// Plugin de bloques de código para Streamdown (mismo que usa croma).
const STREAMDOWN_PLUGINS = { code };

const SUGGESTIONS = [
  "Busca procesos de PEDRO CIFUENTES",
  "Consulta el radicado 11001600001720180327700",
  "¿Qué procesos judiciales tiene Bancolombia?",
];

export default function Home() {
  const { messages, sendMessage, status } = useChat();

  return (
    <main className="flex h-dvh flex-col">
      {/* Encabezado */}
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/croma-mark.svg"
            alt="Croma"
            className="size-8 rounded-xl shadow-sm ring-1 ring-border"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">Croma Agent</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              En línea
            </p>
          </div>
        </div>
      </header>

      {/* Conversación — se pega al fondo al transmitir; si subes, se detiene. */}
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6">
            <EmptyState onPick={(text) => sendMessage({ text })} />
          </div>
        </div>
      ) : (
        <StickToBottom
          className="relative flex-1 overflow-hidden"
          initial="smooth"
          resize="smooth"
          role="log"
        >
          <StickToBottom.Content className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-6">
            {messages.map((message) => (
              <MessageView key={message.id} message={message} />
            ))}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground msg-in">
                <Loader2 className="size-4 animate-spin text-accent" /> Pensando…
              </div>
            )}
          </StickToBottom.Content>
          <ScrollToBottomButton />
        </StickToBottom>
      )}

      <ChatInput status={status} onSubmit={(text) => sendMessage({ text })} />
    </main>
  );
}

/** Botón flotante "bajar al final" — visible solo cuando no estás al fondo. */
function ScrollToBottomButton() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <button
      type="button"
      onClick={() => scrollToBottom()}
      aria-label="Bajar al final"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex size-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition-all hover:scale-105 hover:border-accent/40"
    >
      <ArrowDownIcon className="size-4" />
    </button>
  );
}

/** Una conversación vacía: hero + sugerencias para arrancar. */
function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-accent/30 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/croma-mark.svg"
            alt="Croma"
            className="size-16 rounded-3xl shadow-lg ring-1 ring-border"
          />
        </div>
        <div className="space-y-1.5">
          <h2 className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            ¿En qué puedo ayudarte?
          </h2>
          <p className="text-sm text-muted-foreground">
            Pregúntame lo que necesites.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-foreground/80 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-foreground hover:shadow-md"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
        <span>con tecnología de</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/croma.svg" alt="Croma" className="h-3.5 w-auto opacity-70" />
      </div>
    </div>
  );
}

/** Un turno: usuario (burbuja a la derecha) o asistente (avatar + texto). */
function MessageView({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end msg-in">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm leading-relaxed text-accent-foreground shadow-md shadow-accent/20">
          {message.parts.map((part, i) =>
            part.type === "text" ? (
              <p key={i} className="whitespace-pre-wrap">
                {part.text}
              </p>
            ) : null,
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-3 msg-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/croma-mark.svg"
        alt="Croma"
        className="mt-0.5 size-7 shrink-0 rounded-lg ring-1 ring-border"
      />
      <div className="min-w-0 flex-1 space-y-1 pt-0.5 text-sm">
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <Streamdown
                key={i}
                plugins={STREAMDOWN_PLUGINS}
                className="leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              >
                {part.text}
              </Streamdown>
            );
          }
          if (part.type.startsWith("tool-")) {
            return <ToolStatus key={i} part={part} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

/** Línea de estado amigable para una llamada a herramienta (estilo croma). */
const TOOL_LABELS: Record<string, { loading: string; done: string }> = {
  searchByName: { loading: "Buscando procesos por nombre…", done: "Búsqueda completada" },
  searchByNumber: { loading: "Buscando el radicado…", done: "Radicado consultado" },
};

function ToolStatus({ part }: { part: any }) {
  const name = part.type.replace("tool-", "");
  const labels = TOOL_LABELS[name] ?? {
    loading: "Consultando…",
    done: "Consulta completada",
  };

  // Honestidad ante todo: una herramienta falla si lanza un error
  // (state "output-error") O si devuelve un objeto con campo `error` (p. ej.
  // sin acceso / sin endpoint configurado). NUNCA mostramos datos inventados.
  const errored =
    part.state === "output-error" ||
    (part.output && typeof part.output === "object" && "error" in part.output);
  const done = part.state === "output-available" && !errored;
  const finished = done || errored;

  return (
    <div className="my-1 inline-flex max-w-full flex-col">
      <span
        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          errored
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : done
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-accent/20 bg-accent/5 text-accent"
        }`}
      >
        {errored ? (
          <TriangleAlert className="size-3.5" />
        ) : done ? (
          <Check className="size-3.5" />
        ) : (
          <Loader2 className="size-3.5 animate-spin" />
        )}
        {errored ? "Sin acceso a los datos" : done ? labels.done : labels.loading}
      </span>

      {/* Detalle de la llamada — para ver "las acciones" de tool calling. */}
      {finished && (
        <details className="mt-1.5">
          <summary className="cursor-pointer select-none pl-1 text-[11px] text-muted-foreground hover:text-foreground">
            ver datos
          </summary>
          <pre className="mt-1.5 max-h-72 overflow-auto rounded-xl border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-foreground/70">
            {JSON.stringify(
              { input: part.input, output: part.output, error: part.errorText },
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

/** Caja de entrada con autocrecimiento y botón de envío (estilo croma). */
function ChatInput({
  status,
  onSubmit,
}: {
  status: string;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  const submit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  return (
    <div className="bg-gradient-to-t from-background via-background/90 to-transparent">
      <div className="mx-auto w-full max-w-3xl px-4 pb-5 pt-3">
        <div className="rounded-3xl border border-border bg-background/80 shadow-lg shadow-black/5 backdrop-blur-xl transition-all focus-within:border-accent/50 focus-within:shadow-accent/10">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            onInput={() => {
              const el = ref.current;
              if (el) {
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
              }
            }}
            placeholder={
              isLoading ? "Esperando una respuesta…" : "Escribe un mensaje…"
            }
            disabled={isLoading}
            rows={1}
            className="max-h-[200px] min-h-[52px] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-sm leading-[1.5] outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <p className="px-1 text-[11px] text-muted-foreground">
              Beta · Verifica la información importante
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() && !isLoading}
              className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-all ${
                value.trim()
                  ? "bg-accent text-accent-foreground shadow-md shadow-accent/30 hover:scale-105"
                  : "bg-muted text-muted-foreground"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {status === "submitted" ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : status === "streaming" ? (
                <SquareIcon className="size-3.5" />
              ) : (
                <ArrowUpIcon className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
