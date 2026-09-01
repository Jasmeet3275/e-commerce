# E-commerce Web Platform

Product listing → detail → cart → checkout, single country/currency, built as a reference implementation for clean architecture, security, and performance practices. Status: planning complete, implementation not yet started.

## Docs

- [`PRD.md`](./PRD.md) — requirements (what/why)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design (how)
- [`CLAUDE.md`](./CLAUDE.md) — conventions, guardrails, commands for working in this repo (human or AI)

Read in that order before making non-trivial changes.

## Tech Stack

Next.js (App Router, TS) · Zustand · TanStack Query · Tailwind · Axios · Zod · Jest + Cypress · PostHog. Payment and journey-nudge (WhatsApp-style) integrations are mocked behind clean interfaces — see `ARCHITECTURE.md` §6/§9. Full rationale in `ARCHITECTURE.md` §1.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in JWT_SECRET, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
npm run dev
```

Other commands — see `CLAUDE.md` for the full list (lint, typecheck, Jest, Cypress).

## How AI Was Used

Built with Claude Code, doc-first: this round of `PRD.md` → `ARCHITECTURE.md` → `CLAUDE.md` → `README.md` was discussed and revised one file at a time before any implementation code was written, followed by setting up project-specific Claude Code skills/MCP tooling, then implementation. Each doc reflects deliberate engineering judgment, not a transcription of the original discussion notes — for example, the checkout data model was corrected to remove raw card fields (`cvv`, `number`) in favor of an opaque payment token, since modeling raw card data would normalize a PCI-DSS violation even in a mock system.

---
*Next: set up project-specific Claude Code skills/MCP servers, then begin implementation per `ARCHITECTURE.md`.*
