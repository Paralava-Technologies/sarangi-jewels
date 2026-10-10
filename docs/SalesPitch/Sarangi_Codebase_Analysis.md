# Sarangi Jewels Platform — Codebase Analysis
**What works well, and what's missing**
Prepared 12 September 2026

---

## 1. What this codebase actually is

This is a real, working full-stack commerce platform, not a template or a prototype:

- **~28,000 lines** of TypeScript/JavaScript across 5 applications and 5 shared packages, in a pnpm + Turborepo monorepo.
- **Backend:** NestJS API (`apps/api`) with 23 feature modules (auth, catalog, cart, orders, payments, fulfillment, inventory, reviews, wishlist, CRM, blogs, reports, reconciliation, support, shipping, settings, admin, makeup, store, health, mail, users), plus a gRPC "custom-logic" microservice for business-rule extensions.
- **Database:** PostgreSQL via Prisma, with a 678-line schema covering products, variants, multi-location inventory, orders, shipments, returns, serial-number tracking, B2B pricing tiers, and more.
- **Frontends:** Two Next.js 15 apps (customer web-store, web-admin) and two Expo/React-native apps (mobile-store, mobile-admin), sharing types and an API client package.

This is a meaningfully larger and more complete system than most small-business "website + admin panel" builds. It's a legitimate selling point.

## 2. What's genuinely effective

**Payments are real, not a mockup.** `payments.service.ts` integrates the actual Razorpay SDK, generates HMAC-SHA256 signatures, verifies both client-side payment confirmation and server-side webhooks, and supports refunds — with a clean fallback to a sandbox/mock mode when no live keys are configured. This is production-grade payment handling, not a "fake checkout button."

**One backend, four clients.** Customer web, customer mobile, admin web, and admin mobile all talk to the same NestJS API and Prisma database. A price change or stock update from the admin dashboard is instantly reflected everywhere — there's no risk of the website and the app showing different stock.

**The data model anticipates real retail complexity**, not just a basic cart-and-checkout demo:
- Multi-location inventory (relevant if the shop ever adds a second outlet or separates jewellery/rental stock)
- Serial and batch number tracking (valuable for high-value jewellery pieces)
- Returns/RMA workflow, pickup locations (BOPIS), abandoned-cart tracking
- B2B-style price lists and quote requests, useful if wholesale or bulk costume-rental deals are ever offered

**Security fundamentals are in place.** Passwords are hashed with bcrypt (cost factor 12, not the weaker default), JWT-based auth with role guards (customer/admin/fulfillment/support), server-side validation on every request via Zod schemas, and HTTPS enforcement in production. No real secrets are committed to the repository — `.env` files contain only placeholder values.

**The rental workflow is a genuine differentiator.** Most off-the-shelf e-commerce software (Shopify, WooCommerce, etc.) has no concept of a rental booking with availability windows, deposits, and returns — this platform was clearly built with the costume-rental side of the business in mind from the data model up, not bolted on.

**Documentation is unusually thorough** for a project this size — architecture docs, deployment guides for three different hosting scenarios, a user manual, and a maintained work tracker.

## 3. What's missing or incomplete

Being direct about gaps matters for setting expectations before the sale — and for pricing the source-code option correctly, since some of these are the kind of thing a buyer would want to fix immediately.

| Gap | Why it matters |
|---|---|
| **Refresh tokens duplicate access tokens** (`auth.service.ts` — `issueTokens`) | The "refresh token" returned is literally the same JWT as the access token. This means there's no real session-refresh mechanism; a logged-in session is only as long-lived as the access token's expiry (15 min by default), or the token has to be issued with an unusually long lifetime, which is itself a security trade-off. |
| **OTP/SMS login is mocked** | `sendOtp` prints the OTP to the server console instead of sending a real SMS via Twilio/AWS SNS (Twilio is a listed dependency but not wired into this flow). Phone-based login won't work for real customers until this is connected. |
| **No API rate limiting** | No `@nestjs/throttler` or equivalent is configured anywhere in the API. Login, OTP-send, and checkout endpoints are unprotected against brute-force or abuse traffic. |
| **No `helmet` / security-headers middleware** | Common HTTP security headers (CSP, X-Content-Type-Options, etc.) aren't set. Low effort to add, but currently absent. |
| **Thin automated test coverage** | Only 2 spec/test files exist across the entire monorepo despite the scale of the codebase. There's a CI workflow, but limited tests running in it — regressions would mostly be caught by manual QA, not automated checks. |
| **Loose scratch/debug scripts at the repo root** | Files like `scratch.ts`, `rewrite.js`, `rewrite_payments.js`, `test-login.js`, `get-inv.js`, `update_orders.js` sit in the project root — these look like one-off developer utilities that were never cleaned up. They're not shipped to production, but they're a code-hygiene flag for anyone auditing the repo, and a couple (e.g. scripts that touch payments/orders directly) should be reviewed before handover in case they contain leftover debugging logic. |
| **Search is basic** | The architecture docs note Meilisearch/full-text search as a "Phase 2" item; current product search appears to rely on simpler filtering rather than a dedicated search engine. Fine at small catalog sizes, may need revisiting if the catalog grows large. |
| **No formal analytics/BI layer** | "Reports" exist as an API module, but there's no dedicated analytics warehouse or dashboarding tool — reporting is what the admin dashboard's reports module exposes directly from the transactional database. |
| **Self-reported progress vs. verified progress** | The project's own `WORK_TRACKER.md` marks nearly everything "✅ Done," but a few of the underlying implementations are simpler than "Done" implies (e.g., OTP is mocked, refresh tokens don't function as real refresh tokens). Worth knowing before repeating those claims to a buyer as unconditional facts. |

## 4. Bottom line for the pitch

The strengths above are real and sellable as-is: working payments, a shared backend across four clients, a data model built for jewellery + apparel + rentals together, and solid documentation. The gaps are normal for a project at this stage — none of them are "doesn't work," they're "needs a short follow-up pass" (rate limiting, real OTP wiring, refresh tokens, test coverage). That framing is honest and still strongly positions the software as a real, working asset worth ₹2,00,000 — most small retail businesses are comparing this against buying nothing at all, or a generic template with none of the rental-specific logic this platform already has built in.
