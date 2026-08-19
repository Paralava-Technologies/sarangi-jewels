# Core API Expansion Plan

## Overview
This document outlines the implementation plan for Phase 3: Core API Expansion of the Sarangi Jewels project, addressing pending tasks 25 through 29 from the Active Work Tracker.

## Task Breakdown & Implementation Strategy

### 1. Task 25: Fulfillment API Module
**Goal:** Create dedicated API routes for the fulfillment pipeline (PICK, PACK, SHIP).
**Implementation Details:**
- **Module Creation:** Create `apps/api/src/modules/fulfillment/fulfillment.module.ts`.
- **Controller (`fulfillment.controller.ts`):** 
  - `POST /admin/fulfillment/:orderId/pick`
  - `POST /admin/fulfillment/:orderId/pack`
  - `POST /admin/fulfillment/:orderId/ship`
- **Service (`fulfillment.service.ts`):** Move or delegate state transition logic (and notifications) from `orders.service.ts` to `fulfillment.service.ts` to cleanly separate fulfillment operations from general order management.

### 2. Task 26: Additional API Modules
**Goal:** Implement CRUD for Users, Addresses, Inventory, Promotions, Notifications, Analytics, and Background Jobs.
**Implementation Details:**
- Audit existing modules (e.g., `users`, `catalog`, `promotions`).
- Create a `notifications` module for dispatching and storing alerts.
- Create an `analytics` module returning aggregated data (e.g., sales over time) for the Admin Dashboard charts.
- Implement a `jobs` module to queue and run background tasks (ties into Task 28).

### 3. Task 27: Prisma Schema Expansion
**Goal:** Add entities for Address and Shipment to complete the schema.
**Implementation Details:**
- **Address Entity:** Extract the inline JSON address storage into a dedicated relational `Address` model (with fields for `street1`, `street2`, `city`, `state`, `postalCode`, `country`, `isDefault`, and relations to `User`).
- **Shipment Entity:** Create a `Shipment` model linked to an `Order`, storing `trackingNumber`, `carrier`, `shippingLabelUrl`, and `dispatchedAt`.
- Run migrations and update dependent services (`orders`, `users`).

### 4. Task 28: Redis Integration
**Goal:** Wire Redis for caching, session management, or job queues.
**Implementation Details:**
- Install `@nestjs/cache-manager` and `cache-manager-redis-store`.
- Update `app.module.ts` to configure the global cache using `REDIS_URL`.
- Install `bullmq` and `@nestjs/bullmq` for background job queues (e.g., sending email notifications asynchronously).

### 5. Task 29: OpenAPI Export
**Goal:** Generate and export Swagger/OpenAPI documentation for the API.
**Implementation Details:**
- Install `@nestjs/swagger` and `swagger-ui-express`.
- Configure `main.ts` to build the Swagger document using `DocumentBuilder`.
- Expose the documentation at the `/api-docs` endpoint.

## Next Steps
Please review this plan. If you approve of the architectural direction (especially regarding schema migrations and Redis/BullMQ choices), I will proceed with implementation, starting with the Swagger integration and schema expansion.
