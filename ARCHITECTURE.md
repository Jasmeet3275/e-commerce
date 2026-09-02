# ARCHITECTURE — E-commerce Web Platform

## 1. Tech Stack

| Layer                     | Choice                             | Why                                                                                                                              |
| ------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Framework                 | Next.js (App Router, TS)           | SSR + hydration, file-based routing, Route Handlers double as the mock backend                                                   |
| Server state              | TanStack Query                     | Caching, retries, dedupe, SSR hydration boundary                                                                                 |
| Client state              | Zustand                            | Cart + session state, split into domain stores                                                                                   |
| Styling                   | Tailwind CSS                       | Fast, consistent, small bundle                                                                                                   |
| HTTP client               | Axios                              | Interceptors for auth header injection + 401 refresh-and-retry                                                                   |
| Validation                | Zod                                | Shared schema for forms and API boundary validation                                                                              |
| Forms                     | React Hook Form + Zod resolver     | Checkout/address forms                                                                                                           |
| Offline caching           | Service Worker + Cache Storage API | Disk-backed cache of app shell, product API responses, images — survives an offline reload                                       |
| Analytics + observability | PostHog                            | Journey events, session capture, error capture                                                                                   |
| Payment                   | Mocked                             | Client-side fake tokenizer — §6                                                                                                  |
| Testing                   | Vitest + Cypress                   | Vitest: unit (stores, utils, schemas) — native ESM, no transform fights with ESM-only deps like `jose`. Cypress: component + E2E |

## 2. Rendering Strategy

Every route SSRs its initial data server-side, then hydrates into TanStack Query client-side. Subsequent interaction (pagination, cart, forms) is client-driven, no full reloads.

- `/products` — fully SSR'd per page, offset pagination via `?page=` (§8) — no client-side query, no virtualization.
- `/products/[id]` — SSR + `generateMetadata` (title/description/JSON-LD).
- `/cart`, `/checkout` — CSR, `noindex`. Data is client-owned (Zustand/localStorage), so there's nothing to SSR. App Router still serves a server-rendered shell for fast paint on a cold entry (e.g. WhatsApp deep-link); contents then load client-side from Zustand or `/api/journey`.
- `/login` — CSR.

## 3. Folder Structure

```
app/
  products/page.tsx (+loading.tsx)
  products/[id]/page.tsx
  cart/page.tsx
  checkout/page.tsx
  login/page.tsx
  api/
    auth/{login,refresh,logout}/route.ts
    products/route.ts
    products/[id]/route.ts
    orders/route.ts
    orders/[id]/cancel/route.ts
    journey/route.ts
  layout.tsx
proxy.ts
components/
  ui/            Button, Input, Card, Skeleton, Modal, FormField
  product/       ProductCard, ProductGrid, PaginationFooter, SearchBar
  cart/  checkout/
lib/
  cn.ts          clsx + tailwind-merge helper — cn.test.ts
  api/           axios instance + interceptors
  services/      client-side typed API calls per domain — used by TanStack Query hooks
    productService.ts  productService.test.ts
    cartService.ts     cartService.test.ts
    authService.ts     authService.test.ts
    orderService.ts    orderService.test.ts
  store/
    useAuthStore.ts
    useCartStore.ts       useCartStore.test.ts
    useCheckoutStore.ts   useCheckoutStore.test.ts
  query/         queryClient factory, query keys
  auth/          jwt sign/verify (jose)
    tokens.ts   tokens.test.ts
  pwa/           registerServiceWorker.ts   registerServiceWorker.test.ts
  payment/       PaymentProvider interface + mock adapter    mockPaymentProvider.test.ts
  analytics/     posthog client wrapper
  validation/    zod schemas
    checkoutSchema.ts   checkoutSchema.test.ts
server/
  services/      business logic called by Route Handlers — keeps app/api/**/route.ts thin
    orderService.ts   orderService.test.ts   (placeOrder, cancel)
    authService.ts    authService.test.ts    (login, refresh)
    journeyService.ts journeyService.test.ts
data/products.ts   seeded mock catalog
types/
cypress/{e2e,component}/
public/sw.js       app-shell precache; cache-first images; stale-while-revalidate /api/products*
vitest.config.mts
vitest.setup.ts
```

Unit tests are colocated `*.test.ts` next to source, not a mirrored `__tests__` tree.

## 4. Data Models

```ts
User      { id, name, avatarUrl, country }
Product   { id, name, imageUrl, price, discount }
ProductList { items: Product[], pagination: { limit, offset, currentPage, totalPages, totalItems } }
ProductDetail { id, name, imageUrl, price, discount, description, images }  // extends Product
CartItem  { productId, count }
Order     { id, items: CartItem[], address, status: 'placed' | 'cancelled', createdAt }
Address   { line1, line2?, city, postalCode, country }
```

**Correction to original notes**: no `cardDetails { cvv, number }`. Checkout holds only a `paymentToken: string` from the mock `PaymentProvider` (§6) — raw card fields never enter app state, requests, or logs.

## 5. API Contract (mock backend, in-memory store)

| Route                    | Method   | Notes                                                                                                        |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `/api/products`          | GET      | `?limit&offset&search`, `Cache-Control: public, max-age=60, stale-while-revalidate=300`                      |
| `/api/products/:id`      | GET      | same cache policy                                                                                            |
| `/api/auth/login`        | POST     | sets httpOnly refresh cookie, returns access token                                                           |
| `/api/auth/refresh`      | POST     | reads refresh cookie, returns new access token                                                               |
| `/api/auth/logout`       | POST     | clears refresh cookie                                                                                        |
| `/api/journey`           | GET/POST | server-side snapshot of cart + in-progress checkout form, keyed by session — what a shared link resumes from |
| `/api/orders`            | POST     | places an order from the current cart                                                                        |
| `/api/orders/:id/cancel` | POST     | immediate cancel, any time, auth required                                                                    |

All mutating routes: Zod-validated body, auth re-checked server-side regardless of UI gating.

## 6. Payment (Mocked)

`PaymentProvider.tokenize(cardInput) → Promise<{ token: string }>`. Runs entirely client-side; raw card fields never reach app state or the network — only the token reaches `/api/orders`. Mirrors Stripe Elements, so swapping in the real SDK is a one-file change.

## 7. State & Data Flow

- **Zustand**, split by domain:
  - `useAuthStore` — access token, in memory only (not persisted), limits XSS exfiltration surface.
  - `useCartStore` — items, persisted via `persist` (localStorage), offline-readable.
  - `useCheckoutStore` — address/form draft, separate from cart so removing a cart item never resets checkout progress (PRD FR #7).
- **TanStack Query** — all server data, via `lib/services/*` (never axios directly from components). `staleTime` aligned to the 60s HTTP cache.
- Cart and checkout-draft changes debounce-sync to `/api/journey`, so a dropped session resolves correctly from a shared link on any device.
- Route Handlers: parse/validate, call `server/services/*`, shape the response.

## 8. Pagination & Search

Offset-based (`limit/offset`), 50 items/page, driven by a `?page=` search param — not infinite scroll. Each page is a distinct SSR'd, crawlable URL with its own numbered `PaginationFooter` links (real `<a href>`s, not JS-only buttons), so the full catalog is indexable and works with JS disabled. No virtualization: 50 plain DOM nodes per page is cheap enough on its own, and virtualizing an infinite-scroll feed was the actual cost driver — removed along with it. Images lazy-load via `next/image`, skeleton until loaded.

Search follows the same pattern: `SearchBar` is a plain `<form method="GET">` (no client component, no fetch) submitting `?q=` — server-side case-insensitive substring match on `name` in `listProducts`, filtered before the pagination math so `totalPages`/`totalItems` reflect the result set, not the full catalog. `PaginationFooter` carries `q` through its page links so paging through search results doesn't lose the term.

## 9. Caching

| What                                        | Where                                   | Strategy                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product list/detail responses (online)      | `Cache-Control` header + TanStack Query | 60s fresh, 300s stale-while-revalidate; CDN-cacheable (public, non-personalized)                                                                                                                                                                                                                                                                                                                                                                                             |
| Product responses + images (offline reload) | Service Worker → Cache Storage          | `sw.js` intercepts `fetch`: stale-while-revalidate for `/api/products*`, cache-first for images, network-first (cache fallback) for page navigations — a hard reload on a last-visited page still renders offline. Disk-backed, grows only with what's been viewed. `fetch()` is intercepted transparently, so TanStack Query needs no separate persister. Registered production-only (`lib/pwa/registerServiceWorker.ts`) — a SW fights `next dev`'s Fast Refresh otherwise |
| Cart / checkout draft                       | Zustand `persist` (localStorage)        | survives reload/offline                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Server-side journey truth                   | in-memory store, keyed by session       | resolved when a shared link is opened                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## 10. Auth & Direct-Link Redirect (PRD FR #6)

- Access token: short-lived JWT, in memory (Zustand), sent as `Authorization: Bearer` via an Axios request interceptor.
- Refresh token: httpOnly + Secure + SameSite=Strict cookie, invisible to JS. On 401, the response interceptor calls `/api/auth/refresh` once and retries.
- `proxy.ts` (`proxy()` — Next.js 16 renamed `middleware`/`middleware.ts`; runs on the Node.js runtime, edge is no longer supported for it) verifies the JWT via `jose` for any deep link:
  - Valid session → proceeds to the target page.
  - No/invalid session → redirect to `/login?redirect=<originalPath>` (allowlisted path, no open-redirect); after login, sent to `redirect`.
- Gating is UX convenience only — every Route Handler re-validates the token server-side.

## 11. Security

- HTTPS/TLS at the hosting layer.
- Headers in `next.config.js`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`.
- XSS: React's default escaping, no `dangerouslySetInnerHTML`, Zod validation on all inputs.
- CSRF/clickjacking: `SameSite=Strict` refresh cookie + `X-Frame-Options: DENY` + Origin-header check on mutating routes.
- CORS: same-origin only.
- No raw payment data anywhere (§6).

## 12. Observability & Analytics

PostHog client in `lib/analytics/`, single `track(event, props)` call site for journey events (viewed product, added to cart, started checkout, placed order, cancelled order). Built-in session/error capture covers observability. One API key, no custom backend plumbing.

## 13. Testing

- **Vitest (unit)** — Zustand store actions, `lib/services` request shaping, Zod schemas, `server/services` business logic, auth token utils.
- **Cypress component** — design-system primitives, `ProductCard`, `ProductGrid`, `PaginationFooter`, cart item row.
- **Cypress E2E** — browse → detail → add to cart → checkout redirect (unauthenticated) → login → back on checkout → place order → cancel order; cancel-from-cart not disturbing checkout draft.

## 14. Image Delivery & Optimization

All via `next/image` — no hand-built pipeline:

- WebP/AVIF via content negotiation; responsive `sizes`/`srcset`.
- Lazy-load below-the-fold; `priority` on the LCP image (product-detail hero, first grid row).
- Explicit `width`/`height` (or sized `fill`) to prevent CLS.
- Immutable, aggressively cached optimized-image URLs (`Cache-Control: public, max-age=31536000, immutable`).
- No application-level image cache in React — consistent with dropping the IndexedDB/LRU cache in §9. The Service Worker's image caching (§9) is a distinct concern: it covers the offline case that CDN/browser caching can't reach, not a duplicate of it.
- No oversized source downloads — `next/image` requests only the size a given viewport needs.

## 15. Security Hardening — Open Items (Discussion, Not Yet Implemented)

§11 covers what's already in place (headers, CSRF/clickjacking, XSS, no raw payment data). This is a review of what a closer security pass over the actual implementation turns up — gaps and tradeoffs worth a decision before any of it gets built. Nothing in this section is implemented yet.

**Already solid, called out here so it isn't re-litigated:**

- Passwords: `scrypt` (memory-hard) with a random per-user salt and a `timingSafeEqual` comparison (`lib/auth/password.ts`) — no timing side-channel, no weak hash.
- `.env.local` is gitignored; `.env.example` ships with empty values only.
- Order/resource ownership: cancelling an order you don't own 404s identically to cancelling one that doesn't exist — no enumeration via status-code difference.
- Logout's limitation is already called out in code (`app/api/auth/logout/route.ts`): stateless JWTs mean logout only clears the cookie client-side — no server-side revocation list, so an already-issued refresh token stays valid until its own 7-day expiry if it was captured before logout. Real gap, already documented; listed again below because the fix (rotation) is related.

**Open gaps:**

1. **No refresh-token rotation.** `/api/auth/refresh` (`server/services/authService.ts`) issues a new _access_ token but never re-issues the _refresh_ token — the same refresh cookie is valid for its full 7-day lifetime with no reuse detection. Standard fix: rotate the refresh token on every use, store a hash of the latest valid one (or a small denylist) server-side, and treat a reused/old refresh token as a signal to invalidate the whole chain. Needs a decision on where that state lives, since this backend is in-memory/no-DB by design.
2. **No login rate limiting.** `/api/auth/login` has zero brute-force protection — no attempt counter, no lockout, no backoff. Even an in-memory sliding-window limiter (keyed by IP or email) would close most of this gap within the current no-external-infra constraint.
3. **CSP still has two `'unsafe-inline'` allowances** (`next.config.ts`), one already flagged with a TODO for a per-request nonce via `proxy.ts`. Worth actually verifying whether `style-src 'unsafe-inline'` is still needed at all — a grep of the app code turns up zero `style={{...}}` usage (Tailwind is class-based throughout), so it may only be there for a Next.js framework/dev-overlay internal, not anything we ship. Needs verification in a real prod build before removing.
4. **No CSP violation reporting** (`report-uri`/`report-to`) — an actual XSS attempt would currently fail silently client-side with nothing to alert on.
5. **No dependency/supply-chain scanning in CI** — no `pnpm audit` (or equivalent) step. `pnpm-workspace.yaml`'s `allowBuilds` restricting native postinstall scripts is already a related, existing mitigation; audit-in-CI would be the complementary piece.
6. **Service Worker cache + shared devices**: `/cart` and `/checkout`'s cached HTML shells are CSR-only (no personalized SSR content baked into what gets cached), so the current design doesn't appear to leak one user's data to the next user of a shared/public browser via the SW's `pages-v1` cache — but this hasn't been deliberately verified, only reasoned about. Worth an explicit test if this ever matters for the threat model.
7. **PostHog session recording and form inputs**: session recording is on (`lib/analytics/posthog.ts`, `disable_session_recording: false`). Haven't verified whether posthog-js's default input-masking is sufficient for the address form (name, city, postal code) — worth confirming the exact masking config rather than assuming the default is right for this app.

---

_Next: `CLAUDE.md` — operating instructions/conventions for building this repo with Claude Code._
