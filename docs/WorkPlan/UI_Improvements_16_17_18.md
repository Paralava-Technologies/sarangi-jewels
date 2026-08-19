# Work Plan: UI Improvements (Items 16, 17, 18)

This document outlines the proposed changes to address the active items 16, 17, and 18 from the `WORK_TRACKER_ACTIVE.md`.

## Task 16: Improve Cart Icon
- **Current State:** The cart icon in `cart-badge.tsx` uses an SVG path that resembles a dustbin.
- **Proposed Change:** Replace the SVG in `apps/web-store/src/components/cart/cart-badge.tsx` with a standard Shopping Bag or Shopping Cart icon that better suits an e-commerce platform. I will use a premium-looking bag SVG icon (e.g., from Lucide or a custom SVG).

## Task 17: Active Logout Button in Header
- **Current State:** Users must go to the "My Account" page to sign out. There is no quick action in the header.
- **Proposed Change:** 
  1. Modify `apps/web-store/src/components/layout/site-header.tsx` to detect if the user is logged in using `isLoggedIn()` from `@/lib/auth`.
  2. If the user is authenticated, render a "Sign Out" icon or text button next to the Profile icon in the `nav__actions` section.
  3. Wire the button to the `logout()` function from `@/lib/auth` and force a redirect or refresh to update the UI state.

## Task 18: Welcome Note Logo Update
- **Current State:** After successful registration, the welcome screen in `apps/web-store/src/app/register/page.tsx` displays a smiley face SVG.
- **Proposed Change:** Replace the smiley face SVG (lines 54-58) with the Sarangi Jewels brand logo (`<img src="/images/logo.png" />`), styled consistently with the welcome message aesthetic.

## Next Steps
Please review this plan. If you are satisfied with these approaches, let me know, and I will proceed with implementing the changes!
