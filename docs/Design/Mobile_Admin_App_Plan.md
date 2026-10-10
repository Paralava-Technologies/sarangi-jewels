# Mobile Admin App Plan

## Overview
This document outlines the implementation plan for Phase 5: Mobile Admin App (Expo) of the Sarangi Jewels project, addressing tasks 33 and 34 from the Active Work Tracker.

## Task Breakdown & Implementation Strategy

### 1. Task 33: Mobile Admin UI
**Goal:** Build the screens for Orders, Fulfillment, and Barcode Scanning.
**Implementation Details:**
- **Navigation (Expo Router):** Setup a tab-based navigation or drawer for the main sections: Dashboard, Orders, Fulfillment, Settings.
- **Orders Screen (`app/orders.tsx`):**
  - Implement a list view (using `FlatList`) to show incoming and active orders.
  - Create an order detail modal/screen showing line items, shipping address, and current status.
- **Fulfillment Screen (`app/fulfillment.tsx`):**
  - Build a segmented control or tabs to filter orders by `PROCESSING`, `PICKED`, and `PACKED`.
  - Add swipe actions or prominent buttons to transition order states.
- **Barcode Scanning (`app/scanner.tsx`):**
  - Integrate `expo-camera` or `expo-barcode-scanner`.
  - Implement logic to scan a package label (QR/Barcode) which will quickly pull up the order details or mark it as SHIPPED.

### 2. Task 34: Mobile Admin API
**Goal:** Wire the mobile admin application to the backend endpoints.
**Implementation Details:**
- **Auth Integration:** Build a login screen (`app/login.tsx`) that hits the `/admin/auth/login` endpoint and securely stores the JWT (using `expo-secure-store`).
- **API Client:** Setup a centralized `api.ts` file configured with `axios` or `fetch` that automatically attaches the Bearer token.
- **Data Fetching:** Wire up the `Orders` and `Fulfillment` screens to fetch data from `/orders` and POST state changes to the new `/admin/fulfillment/:orderId/pick|pack|ship` endpoints.

## Next Steps
Please review this plan. If you approve of the architectural direction (such as using `expo-secure-store` and `expo-camera`), I will proceed with building the Mobile Admin App, starting with the authentication flow and navigation setup.
