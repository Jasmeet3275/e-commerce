# PRD — E-commerce Web Platform

## Functional Requirements

1. **Product Listing Page**
2. **Product Detail Page**
3. **Cart Page**
4. **Checkout Page**
5. User can drop off at any point in the journey — progress is not lost.
6. Direct link redirect support:
   - Logged in → link opens directly to the target page.
   - Not logged in → redirected to login, then sent to the originally intended page after login.
7. User can cancel a product — both from the cart (before ordering) and after the order has been placed (immediate cancel, any time — no time window, no approval step).

## Non-Functional Requirements

- **Auth**: required to complete checkout. Route gating on the client is UX only — every action is authorized server-side.
- **Offline**: read-only cached browsing — last-viewed products, product detail, and current cart remain visible offline. New actions (checkout, placing/cancelling an order) require connectivity.
- **Devices**: single responsive codebase for desktop, tablet, mobile.
- **Locale**: single country, single currency.
- **SEO**: product list and product detail pages are server-rendered/crawlable with accurate per-page metadata.
- **Performance**: fast first load, including on slow connections; interactive (SPA-like) after load.
- **Security**: HTTPS/TLS everywhere; XSS-safe rendering; CSRF/clickjacking protection; CORS restricted to known origins; payment details are tokenized client-side and never touch app state, logs, or storage in raw form.

## Scope Notes (already agreed)

- Mock backend only (no real database) — API contract designed so a real one can be swapped in later.
- Payment and WhatsApp-style journey nudges are stubbed behind clean interfaces — no real vendor integration in this build.
- Analytics + observability use a real SDK: **PostHog** (single integration — product/journey events, basic session recording, error capture).

---
*Next: `ARCHITECTURE.md` — rendering strategy, data models, API contracts, state management, caching, auth, security, testing.*
