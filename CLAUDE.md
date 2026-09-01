@AGENTS.md

# CLAUDE.md

Operating instructions for Claude Code in this repo. Read `PRD.md` (what/why) and `ARCHITECTURE.md` (how) before making non-trivial changes — this file is conventions and guardrails, not a repeat of either. The `@AGENTS.md` import above is managed by `next dev` — leave it in place; it points at the version-matched Next.js docs bundled in `node_modules/next/dist/docs/`, since this Next.js version has breaking changes vs. older training data (e.g. `middleware.ts` → `proxy.ts`, edge runtime dropped for it — see ARCHITECTURE §10).

## Commands

- `pnpm dev` — dev server
- `pnpm build` — production build (validates SSR/types across all routes)
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Jest unit tests
- `pnpm cypress:component` — Cypress component tests
- `pnpm cypress:e2e` — Cypress E2E (requires `dev` running)

Package manager: pnpm (per the actual scaffold — `packageManager` pin in `package.json`).

## Git Workflow

- Work is broken into stories (feature areas), each into small commits (types → mock data/API → service → UI → tests) — Conventional Commits format (`feat(auth): ...`, `test(cart): ...`).
- **pre-commit** (Husky + lint-staged, staged files only): ESLint --fix, Prettier, `tsc --noEmit`. Fast, local, no build.
- **pre-push**: full Jest suite with a coverage gate (`jest.config.ts` → `coverageThreshold`, 70% to start).
- **CI** (GitHub Actions): Jest + coverage, Cypress E2E, `next build` + a bundle-size budget. Coverage and bundle-size are evaluated at PR/CI level, not per commit — a commit can legitimately be partial work mid-story.

## Conventions

- **Rendering**: follow ARCHITECTURE §2 per-route — don't SSR `/cart`/`/checkout` data, don't CSR `/products`/`/products/[id]`.
- **Reads vs writes**: reads go through Route Handlers (`app/api/**`) called via `lib/services/*`, consumed by TanStack Query. Writes follow the same path — no Server Actions (deliberate, see ARCHITECTURE discussion history).
- **Route Handlers stay thin**: parse/validate the request, delegate to `server/services/*`, shape the response. Business logic does not live in `route.ts` files.
- **Zod at every boundary**: every Route Handler validates its input; every form validates with the same schema client-side (`lib/validation/*`, shared, not duplicated).
- **Zustand stores are domain-scoped**, state + actions colocated in one store file (`useCartStore`, `useCheckoutStore`, `useAuthStore`) — don't introduce a Redux-style separate actions layer.
- **Tests are colocated**: `foo.ts` + `foo.test.ts` side by side, not a mirrored `__tests__` tree.
- **No new dependencies** for something an already-chosen tool covers (e.g. don't add a second HTTP client, a second form library, a second state manager). Flag it and ask instead of adding one.
- **Async Request APIs are always async** (Next.js 16): `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` must all be awaited — there is no synchronous compatibility mode. Use `PageProps`/`LayoutProps`/`RouteContext` helper types (`next typegen`) for type-safe access.

### Styling (Tailwind v4)

- Tailwind utility classes only. No CSS Modules, styled-components, or a separate `.css` file per component. `app/globals.css` is the only stylesheet: `@import "tailwindcss"`, the `@theme` block, and base resets/fonts.
- Tailwind v4 is CSS-first — there is no `tailwind.config.ts`. Design tokens (colors, spacing, fonts) are CSS custom properties inside the `@theme` block in `app/globals.css` (e.g. `--color-brand-500: #3b82f6;` — this automatically generates `bg-brand-500`, `text-brand-500`, etc.). Don't add a `tailwind.config.ts` "to be safe" — it's not needed and won't be picked up by default.
- No arbitrary values (`bg-[#1a2b3c]`, `w-[137px]`) for anything that's a design decision — add a token to `@theme` instead, so there's one source of truth for the design system. Arbitrary values are fine for genuinely one-off, non-reused cases.
- No inline `style={}` unless the value is computed at runtime (e.g. a measured width) — static styling is always classes.
- Conditional/merged classNames go through a `cn()` helper (`clsx` + `tailwind-merge`, in `lib/cn.ts`), never manual string concatenation — `tailwind-merge` resolves conflicting utilities (e.g. two different `p-*` values) correctly.
- Components with multiple visual variants (`Button` size/variant, `Badge` status) use `class-variance-authority`, not chains of ternaries in the className.
- Mobile-first breakpoints: unprefixed classes are the mobile layout, `sm:`/`md:`/`lg:` layer up — matches the desktop/tablet/mobile requirement in PRD.
- `components/ui/*` owns all of its own styling. Feature components (`ProductCard`, `CartItem`, etc.) compose `ui/` primitives and layout utility classes; they don't re-implement primitive styles.

### Imports & File Structure

- Absolute imports via the `@/` path alias (`@/components/...`, `@/lib/...`) — no `../../../` relative chains crossing top-level folders. Relative imports are fine within the same folder.
- Named exports for everything except Next.js files that require a default export (`page.tsx`, `layout.tsx`, `route.ts`). One component per file, filename matches the export (`ProductCard.tsx` exports `ProductCard`).
- No barrel (`index.ts` re-export) files. Import directly from the specific file — avoids tree-shaking surprises and circular-import risk for marginal typing convenience.
- Import order (external packages → `@/` internal → relative) is enforced by ESLint, not hand-maintained — don't fight the linter's autofix.

## Guardrails (non-negotiable)

- **Never model or log raw card data.** No `cardNumber`, `cvv`, or similar field anywhere in types, state, requests, or logs — only `PaymentProvider`'s opaque `token`. This is a deliberate, explicit deviation from the original notes; do not reintroduce it.
- **Client-side auth/route gating is UX only.** Every mutating Route Handler must re-validate the access token server-side, regardless of what `proxy.ts` or the UI already checked.
- **Access token stays in memory** (Zustand, not persisted). Refresh token stays in an httpOnly cookie, never read from JS.
- **No `dangerouslySetInnerHTML`** without an explicit sanitization step and a reason documented inline.
- **Stubbed integrations stay behind their interface** (`PaymentProvider`, `NotificationService`, analytics). Don't wire a real vendor SDK in for payment/notifications without checking first — PostHog is the one exception already agreed (analytics + observability, real SDK).
- **Don't add features beyond `PRD.md`.** If something seems missing or ambiguous, ask — don't assume and build it.

## Env Vars

| Var                        | Used for                                           |
| -------------------------- | -------------------------------------------------- |
| `JWT_SECRET`               | signing/verifying access + refresh tokens (`jose`) |
| `NEXT_PUBLIC_POSTHOG_KEY`  | PostHog client init                                |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog client init                                |

---

_Next: `README.md` — project overview, setup, and how AI was used to build this._
