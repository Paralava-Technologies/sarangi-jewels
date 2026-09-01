# ATOMIC Design Integration Plan for Sarangi Jewels & Rentals

## Overview
This plan outlines the systematic integration of the vanilla Web Component architecture (`ATOMICDesign`) into the existing Next.js 15 / React 19 application (`apps/web-store`). Our primary goal is to **enhance the visual aesthetics** to match the new Atomic layout while **preserving all existing features** (SSR, SEO, routing, cart state, and API integration).

## Architectural Strategy
The ATOMIC Design utilizes native Web Components (Light DOM via `customElements.define`) and raw CSS. Since `web-store` is a Next.js App Router application, directly injecting `components.js` would break Server-Side Rendering (SSR) and Next.js routing capabilities. 

**Our Approach: "React Translation Strategy"**
Instead of using the raw Custom Elements, we will systematically translate the structural blueprints of `components.js` into standard Next.js React Components (Server and Client Components as appropriate). This ensures:
1. Full Next.js compatibility (`next/link`, `next/image`).
2. SEO optimization through SSR.
3. Seamless integration with existing providers (e.g., `CartProvider`).

---

## Phase 1: Style & Asset Consolidation
1. **Merge CSS Definitions:**
   - Analyze `docs/sarangi-design/ATOMICDesign/styles.css` and the existing `apps/web-store/src/app/globals.css`.
   - Safely merge new ATOMIC classes into `globals.css` ensuring existing Tailwind configurations are not overridden.
   - Retain the base variables (`--bone`, `--ink`, `--oxblood`) and ensure global texture overlays remain intact.
2. **Asset Migration:**
   - Copy any missing assets (like `sarangi-logo-mark.png`, `jewel-drip` SVGs) from `ATOMICDesign/assets` to `apps/web-store/public/assets`.

## Phase 2: Component Translation Pipeline
We will convert each Atomic element into a React Component under `src/components/atomic/`:

### Structural Components (Server Components)
- `SJHeader` -> `components/atomic/SJHeader.tsx` (Use `next/link` for navigation).
- `SJFooter` -> `components/atomic/SJFooter.tsx` (Static links).
- `SJUtilityBar` -> `components/atomic/SJUtilityBar.tsx`.
- `SJTrustStrip` -> `components/atomic/SJTrustStrip.tsx`.

### UI / Display Components (Server Components)
- `SJProductCard` -> Convert `href`, `title`, `price` into React props. Ensure `<img>` tags use `<Image />` for optimization.
- `SJCatCard`, `SJTestiCard`, `SJSplitCard`, `SJSectionHead`.

### Interactive Components (Client Components - `use client`)
- `SJProductDetail` -> `components/atomic/SJProductDetail.tsx`. 
  - *Integration:* Hook the "Add To Bag" buttons directly into the existing `useCart()` / `CartProvider` context instead of raw DOM manipulation.
- `SJHomeHero` -> Port the `heroGo` and slider logic to React state (`useState`, `useEffect` for timer).
- `SJCartRow` -> Connect quantity steppers (`-`, `+`) and remove actions to the Next.js `CartProvider` state.

## Phase 3: Data Binding & State Integration
1. **Cart & Commerce:**
   - Map `SJProductDetail` props to the `@sarangi/api-client` response payloads.
   - Wire the "Buy — Own It" vs "Rent — Wear It" toggle state directly into React state, passing the correct mode to the cart action.
2. **Authentication Flow:**
   - The ATOMIC Auth layouts (found in `login.html`, `register.html`) must wrap the existing authentication logic. 
   - We will replace the Next.js auth form containers with the `.auth`, `.auth__visual`, and `.auth__form-card` HTML structure from the Atomic design, keeping the `onSubmit` handlers intact.

## Phase 4: Page-by-Page Rollout
Replace existing page architectures route-by-route to ensure stability:
1. **Global Layout (`app/layout.tsx`):** Swap `SiteHeader` / `SiteFooter` with the translated `SJHeader` / `SJFooter`.
2. **Homepage (`app/page.tsx`):** Implement `SJHomeHero`, `SJUtilityBar`, and feature carousels using the new components.
3. **Product Detail Page (`app/products/[slug]/page.tsx`):** Replace existing PDP markup with the `SJProductDetail` wrapper, feeding it live server data.
4. **Cart/Checkout (`app/cart/page.tsx`):** Apply `.cart-layout`, `.cart-items`, and `.summary` styling rules to the active cart mapping loop.

## Phase 5: QA & Feature Validation
- **Routing check:** Ensure no raw `<a href="shop.html">` tags exist; all must be `Link href="/shop"`.
- **Cart check:** Verify adding items from the new `SJProductDetail` correctly updates the `CartProvider` count on the `SJHeader`.
- **Responsive check:** Verify Mobile Navigation (`SJHeader` burger menu) works via React state instead of global window functions.

## Summary
By translating the Atomic Design blueprints into native Next.js React components, we bridge the gap between the beautiful aesthetic vision and our robust, SEO-friendly SSR architecture without losing any backend bindings or state logic.

---

## Work Logs (Last Updated: August 2026)

### Completed Work Items
1. **Global Styles & CSS Translation:**
   - Merged the ATOMIC Design `.auth-wrap`, `.shop-layout`, `.cart-layout`, and standard atomic classes into the main Next.js styling system.
2. **Page Translations:**
   - **Homepage:** Translated `SJHomeHero`, `SJJewelDrip`, `SJSplitCard`, `SJCatCard`, and `SJTrustStrip`.
   - **Product Detail:** Built `SJProductDetail` with "Buy vs. Rent" modes and connected it to `useCart`.
   - **Shop Listing:** Replaced legacy layout with `.shop-layout` and integrated `SJPageBanner` and `SJProductCard`.
   - **Rentals Page:** Structured the new dedicated rentals landing page with atomic `.rent-plan-toggle` and `sj-rent-step`.
   - **Cart Page:** Rewrote the cart with `.cart-summary` and grid layouts while retaining backend cart syncing logic.
   - **Authentication:** Overhauled `Login`, `Register`, and the Account Dashboard fallback to use the new `.auth-wrap` and `.auth-visual` structural split.
3. **TypeScript & Next.js 15 Updates:**
   - Fixed `compareAtPriceCents` missing properties in the `Product` interfaces.
   - Re-typed `searchParams` and `params` to be `Promise<{...}>` according to Next 15 standards on the Blog and Shop pages.
   - Removed unused SARANGI hooks and variables from the newly migrated client components.
4. **Advanced Rental Flow:**
   - Implemented the "ID Verification" flow in the account dashboard.
   - Wired the Date Picker in the PDP to the Cart and backend reservation system to calculate valid days and pricing dynamically.
   - Integrated `isRental`, `rentStartDate`, and `rentEndDate` into Prisma schema, backend service, and frontend Cart provider.

### Pending Next Works
1. **Checkout Flow Polish:** 
   - Apply the ATOMIC checkout/billing summary design to the checkout process.
   - Verify layout alignment for mobile screens.
2. **Mobile Navigation (`SJHeader`):**
   - Ensure the mobile burger menu and navigation slider is perfectly connected to React state and is fully responsive.
3. **Testing & QA:**
   - Run a full End-to-End visual regression pass across devices to catch any remaining legacy SARANGI styles that conflict with ATOMIC layouts.
