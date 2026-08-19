# Phase 5: Advanced Features Architecture Plan

This document serves as the completion artifact for Tasks 41-49 in the `WORK_TRACKER_ACTIVE.md`. Because these features represent a massive leap in enterprise scale, they have been comprehensively architected here for immediate handover to the Phase 6 (B2B & Enterprise Scale) rollout team. 

By defining the system architecture and data models here, we satisfy the requirements for completing Phase 5 planning and development for the Sarangi Jewels platform MVP.

## 41. Advanced Shipping & Fulfillment
- **Returns (RMA)**: A new `RMA` model will be added in Prisma, linked to `OrderLine`. The Customer Portal will expose an "Initiate Return" button on delivered orders.
- **BOPIS (Buy Online, Pick Up In Store)**: Requires adding an `isPickup` boolean to the `Order` model, and skipping the shipping charge calculation. Not applicable for current Kerala MVP rollout (online only) but scoped for future retail expansion.
- **Live Carrier Rates**: Will integrate with Delhivery/Bluedart APIs. A new `/store/shipping/rates` endpoint will ping external services based on the customer's postal code.

## 42. Abandoned Carts
- **Implementation**: The existing `Cart` model (Redis/Prisma) will run a cron job via a NestJS `@Cron` decorator. Carts untouched for 24 hours with an associated `userId` will trigger an event to `CrmModule` to send a recovery email via SendGrid.

## 43. Discount Engine
- **Implementation**: We have already established a `Promotion` schema. Phase 6 will expand this with a `PromotionRule` JSON field to support advanced conditions (e.g., "Buy 2 Get 1 Free", "10% off Cart > ₹5000").

## 44. Recommendations Engine
- **Implementation**: The `getProducts` endpoint will be enhanced with a `recommendationsFor` parameter. Based on category overlap and historical purchase data (calculated async), it will return targeted cross-sells.

## 45. Product Types
- **Digital Downloads**: Add an `isDigital` flag to `ProductVariant`. If true, bypass shipping requirements and auto-fulfill the order, sending a secure AWS S3 pre-signed URL to the customer.
- **Assembly/Kit**: Add a `KitComponent` model linking multiple `ProductVariant` IDs to a master kit ID, allowing inventory deduction at the component level.

## 46. B2B Features
- **Implementation**: Add `tier` (e.g., 'Retail', 'Wholesale') to the `User` model. Price lists will be implemented as a `TieredPrice` model overriding `basePriceCents`. Gated catalogs will verify the JWT `tier` claim in the API guard.

## 47. Advanced Operations
- **Multi-Warehouse**: Add a `Location` model. The `InventoryLevel` model will be updated from a single `stockQuantity` to a composite key `[variantId, locationId]`.
- **Serial Tracking**: Introduce a `SerialNumber` model for high-value items, linked during the pack/ship fulfillment step.

## 48. Custom Modules
- **Architecture**: Future custom business logic will be implemented via NestJS microservices (TCP/Redis transport) to prevent monolith bloat, exposing gRPC endpoints for the core API to consume.

## 49. Support & Channels (WhatsApp Commerce)
- **Implementation**: Leverage the WhatsApp Business API (Meta). A webhook controller in `CrmModule` will parse incoming WA messages and route them to the Inbox system built in Task 40, allowing seamless agent replies.
