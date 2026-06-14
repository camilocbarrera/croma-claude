---
name: croma-legal-agent
description: Scaffold a ready-to-run "Croma Agent" legal chat — a Spanish-first AI chat in Next.js (App Router) powered by Groq (openai/gpt-oss-120b) with streaming tool calls, Markdown rendering, autoscroll, and Croma branding. Tools ship UNWIRED and honestly report "no access" until real endpoints are added — they NEVER return placeholder/mock data. Use when the user wants to create/scaffold/bootstrap a Croma legal agent, a "legal agent chat", a Groq chat with tool calling, or replicate the Croma Agent demo. Triggers - "croma legal agent", "scaffold legal agent", "create a legal agent chat", "Croma Agent demo", "Groq chat with tools".
---

# Croma Legal Agent — scaffold

Drops a complete, branded legal-agent chat into a Next.js App Router project. The
chat runs **live immediately**; the tools ship unwired and honestly report "no
access" until real endpoints are added (one file).

## ⛔ Non-negotiable rule: NEVER use placeholder/mock data

This is the most important rule of this skill. Fabricated results confuse and
mislead real users. So:

- A tool must return **real** data from an endpoint, OR an honest **error / "no
  access"** result. Never anything in between.
- The shipped `app/tools.ts` returns an explicit "not connected" error — **do
  not** "helpfully" replace it with sample/example/mock cases to make the demo
  look fuller. An unwired tool showing a clear ⚠ "Sin acceso a los datos" pill is
  the correct, intended behavior.
- When wiring a real endpoint, keep the no-fabrication contract: if the key is
  missing or the API fails, return `{ error: "…" }` — never invent a fallback.
- Do not loosen the system prompt's instruction to report errors instead of
  inventing data, and do not change the UI so errors render as success.

## What ships

- **Chat** (`app/page.tsx`) — Croma branding (indigo `#5967E8` accent, logos),
  glass header, hero empty-state with suggestions, user/assistant bubbles,
  streaming tool-call status pills (loading / success / honest **error**),
  robust autoscroll.
- **API route** (`app/api/chat/route.ts`) — Groq `openai/gpt-oss-120b`, Spanish
  system prompt (told to report tool errors, never fabricate), streamed tool
  calls, reasoning hidden.
- **Tools** (`app/tools.ts`) — `searchByName` + `searchByNumber`, **unwired**:
  each returns an honest "not connected / no access" error, with a commented
  `cromaPost` helper and `TODO`s showing exactly where the real `fetch` goes. No
  mock data.
- **Branding** — `public/croma.svg` (wordmark), `public/croma-mark.svg` (icon).

## Prerequisites

A **Next.js App Router** project with **Tailwind CSS v4** and **React 19**. If
there is no project yet, create one first:

```bash
npx create-next-app@latest my-legal-agent --ts --app --tailwind --eslint --no-src-dir --import-alias "@/*"
cd my-legal-agent
```

> The scaffold writes into `app/` and `public/`. Tailwind v4 is required because
> `globals.css` uses `@import "tailwindcss"` and `@source` directives.

## Steps

Run these from the target project root. Detect the package manager from the
lockfile: use **bun** if `bun.lock`/`bun.lockb` exists, else **npm** (swap
`bun add` → `npm install`, `bun run dev` → `npm run dev`).

### 1. Install dependencies

```bash
bun add ai @ai-sdk/groq @ai-sdk/react zod streamdown @streamdown/code use-stick-to-bottom lucide-react
```

### 2. Copy the template files

Copy everything from this skill's `assets/` into the project, preserving paths.
Overwrite the default `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`.

| From (skill `assets/`)  | To (project)            |
| ----------------------- | ----------------------- |
| `app/page.tsx`          | `app/page.tsx`          |
| `app/layout.tsx`        | `app/layout.tsx`        |
| `app/globals.css`       | `app/globals.css`       |
| `app/tools.ts`          | `app/tools.ts`          |
| `app/api/chat/route.ts` | `app/api/chat/route.ts` |
| `public/croma.svg`      | `public/croma.svg`      |
| `public/croma-mark.svg` | `public/croma-mark.svg` |

> `layout.tsx` uses the Geist fonts and imports `./globals.css`. If the target
> project's `layout.tsx` already differs significantly, only graft in the
> `globals.css` import and the `--font-geist-*` variables rather than
> overwriting blindly.

### 3. Set the Groq API key

Create `.env.local` (copy `assets/env.local.example`) and fill in a key from
https://console.groq.com/keys :

```
GROQ_API_KEY=gsk_...
```

### 4. Run and verify

```bash
bun run dev
```

Open the app, send "¿Qué puedes hacer?" (general reply) and click a suggestion
like "Busca procesos de PEDRO CIFUENTES" — a tool-call status pill should appear,
turn into a ⚠ **"Sin acceso a los datos"** pill, and the assistant should plainly
say it can't access the data yet. That honest "no access" (NOT a fake result) is
the correct, intended state and confirms the streaming + tool-calling pipeline
works end-to-end before any real endpoint.

## Wiring real endpoints later

Edit **`app/tools.ts`** only. Each tool's `execute` currently returns an honest
"not connected" error; replace its body with a `fetch` to the real endpoint (a
commented `cromaPost` helper and per-tool `TODO` lines show the exact call).
Preserve the no-placeholder contract: if the key is missing or the API fails,
return `{ error: "…" }` — never invent a fallback. Keep each tool's `inputSchema`
and name unchanged so the UI labels in `app/page.tsx` (`TOOL_LABELS`) and the
system prompt keep matching. Add the endpoint's key to `.env.local` (e.g.
`CROMA_API_KEY`).

## Customizing branding / identity

- **Accent color**: `--accent` in `app/globals.css` (default Croma indigo).
- **Name & status**: header `<h1>` and the system prompt in
  `app/api/chat/route.ts`.
- **Suggestions**: `SUGGESTIONS` array in `app/page.tsx`.
- **Model / speed**: `MODEL` in `route.ts` (`llama-3.1-8b-instant` for max
  speed; `openai/gpt-oss-120b` is the default, matching Croma).

## Key gotchas (don't regress these)

- **Never reintroduce placeholder/mock data** (see the rule above). Unwired
  tools stay as honest "no access" errors.
- `convertToModelMessages(messages)` is **async** in AI SDK v6 — it must be
  `await`ed before passing to `streamText`.
- `app/globals.css` **must** keep the two `@source ".../streamdown/..."` and
  `@source ".../@streamdown/code/..."` lines, or Markdown tables render
  unstyled.
- Assistant text renders through `Streamdown`; user text stays plain. Don't swap
  the assistant back to a raw `<p>` or Markdown (tables/bold) won't render.
