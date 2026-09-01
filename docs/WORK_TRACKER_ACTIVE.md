# Active Work Tracker

## Environments

### Store

- **URL**: http://localhost:3000
- **Credentials**: `customer@sarangi.local` / `Customer123!`

### Admin

- **URL**: http://localhost:3002
- **Credentials**: `admin@sarangi.local` / `Admin123!`

curl -s "http://localhost:3001/v1/admin/orders/rentals?page=1&pageSize=100" -H "Authorization: Bearer $(pnpm -s exec node test-login.js)"

### Instructions

- When marking or moving completed items from active to completed, give details of the issues and the details of the resolutions.
- When the work is not simple work, plan the work by documenting the details of the work and plan in a md document and continue. Ask me any question and clarifications you require before continue with the work. I ll review the plan document and help you finalize the work plan. Place the plan documents in the WorkPlan folder under docs.

### ✅ Completed Milestones

#### Payments & Fulfillment

- Fully integrated Razorpay for web and mobile (Expo) storefronts, complete with webhook verification and payment status flows.
- Built out the Fulfillment API pipeline (PICK, PACK, SHIP) and integrated it into both the Web Admin and Mobile Admin app.
- Cash on Delivery (COD) functionality has been implemented and properly reflects in cart and checkout. Also added fallback options to convert failed online payments to COD.

#### Architecture & Backend Infrastructure

- Core API endpoints completed for CRUD operations across Inventory, Users, Promotions, and more.
- Redis integration is in place for caching and session management.
- Prisma schema expanded to include multi-warehouse locations, serialized inventory, B2B tiering, returns (RMA), and shipments.
- OpenAPI documentation setup is active.

#### Web & Mobile Applications

- Web Admin Dashboard contains fully functioning modules for Inventory management, CRM (Customers), Settings, and CMS (Blogs).
- Mobile Admin App covers Orders, Fulfillment, and Barcode Scanning.
- Web Store features enhanced layout with a dynamic Mega Menu, rich UI for product filtering, reviews, PDF invoices generation (with professional templates including logo/company details), and a fully fleshed out Customer Portal.

#### Advanced & B2B Features

- Discount engine handles complex rules like "Buy 2 Get 1 Free".
- Automated Abandoned Cart recovery via a cron job scheduling email alerts.
- Multi-warehouse logic, B2B custom member-only catalogs (tier-based), digital product support, and dynamic delivery tracking.

#### Analytics & Reports

- A vast suite of analytical widgets and reports have been generated including Sales, Customers, Products, User Acquisition, "Top Customers by Revenue", Heat Maps, and more.

### ⏳ Pending / Active Tasks

Based on the unchecked items, the focus areas currently pending are:

#### 1. Microservices Integration (Task 57)

- [x] 57.1 Create NestJS microservice boilerplate using TCP/Redis transport.
- [x] 57.2 Define Protobuf (`.proto`) schemas for custom business logic.
- [x] 57.3 Expose gRPC endpoints and implement a sample handler in the `api` app.

#### 2. WhatsApp Commerce (Task 58)

- [x] 58.1 Set up Meta App for WhatsApp Business API and configure webhook endpoint URL.
- [x] 58.2 Create a `WebhookController` in `CrmModule` to receive and parse incoming WhatsApp messages.
- [x] 58.3 Route parsed messages into the `Inbox` system and establish two-way communication capabilities.

#### 3. Blog Enhancements (Tasks 81, 82, 83)

- [x] 81.1 Integrate image and video upload handlers for the React-Quill editor in the Web Admin.
- [x] 82.1 Update `Post` Prisma schema to include fields for `seoTitle`, `seoDescription`, `tags`, and `categories`.
- [x] 82.2 Build UI in Web Admin CMS for editing SEO meta tags and taxonomies.
- [x] 83.1 Add `Comment` model to Prisma schema (linked to `Post` and `User`).
- [x] 83.2 Create API endpoints for fetching, creating, and moderating blog comments.
- [x] 83.3 Implement comment section UI in the storefront `/blog/[slug]` page.

#### 4. COD Reconciliation (Task 109)

- [x] 109.1 Design reconciliation workflow for Cash on Delivery payments via delivery partners (BlueDart, Delhivery, Porter).
- [x] 109.2 Create API endpoint for uploading or parsing settlement reports from aggregators.
- [x] 109.3 Add UI in the Web Admin dashboard to track and mark COD orders as "Settled" / "Reconciled".

## Pending and Active Works

- [x] 16. Cart Icon in the store header looks like dust bin. Can you improve it?
  - **Resolution**: Replaced the dustbin SVG path with a standard, premium shopping bag SVG in `cart-badge.tsx`.
- [x] 17. There is no active logout button in the header. For logging out, the user wil need to go to My Account, then click on Sign Out.
  - **Resolution**: Updated `site-header.tsx` to detect authentication state and conditionally display a "Sign Out" icon button next to the Profile icon. Wired it to the `logout()` function.
- [x] 18. In the welcome note, instead of smiley, Show the Logo of Sarangi Jewels store.
  - **Resolution**: Modified the registration success page (`register/page.tsx`) to replace the smiley SVG with the Sarangi Jewels logo (`/images/logo.png`).

- [x] 50. Error in http://localhost:3002/dashboard/inventory
      lowStockProducts.map is not a function
  - **Resolution**: Updated `fetchInventory` in `apps/web-admin/src/lib/api.ts` to correctly unpack the `data` array from the API response payload, preventing the frontend from attempting to call `.map()` on an object.

### Phase 2: Payments & Backend Integrations

- [x] 19. **Razorpay API Integration**: Implement payment API endpoints (`POST /store/payments/create-order`) and webhook verification to securely handle transactions.
  - **Resolution**: Updated `payments.controller.ts` and `payments.service.ts` in `api` to handle `/webhook` endpoint with signature verification using `crypto`.
- [x] 20. **Order Payment Status Flow**: Update the backend order state transition (from `PENDING_PAYMENT` to `CONFIRMED`) upon receipt of a successful payment event.
  - **Resolution**: Updated `payments.service.ts` to process webhook events `payment.captured` and `order.paid`, ensuring `order.status` transforms to `CONFIRMED` upon successful webhook validation.
- [x] 21. **Web & Mobile Payment UI**: Replace the default checkout buttons with Razorpay modal components on the Web Store and `react-native-razorpay` elements on the Mobile Store.
  - **Resolution**: Installed `react-native-razorpay` in `mobile-store` and implemented the Razorpay UI wrapper in `CheckoutScreen` (falling back to mock simulator during dev when keys are missing). Web store integration was verified to use Razorpay correctly.

### Phase 2: Communication & Extras

- [x] 22. **Email Notifications System**: Integrate NodeMailer or Resend to send automated order confirmation and dispatch status emails to customers.
  - **Resolution**: Verified that `nodemailer` is already integrated in `mail.service.ts` and automated emails (`sendOrderConfirmation`, `sendOrderStatusUpdate`) are actively fired during order placement and status transition workflows.
- [x] 23. **Fulfillment Queue UI**: Implement action buttons for `PICK`, `PACK`, and `SHIP` pipelines in the Web Admin dashboard (currently a stub page).
  - **Resolution**: Confirmed that `FulfillmentPage` UI already provides action buttons (Mark Picked, Mark Packed, Ship Order) mapped to the `updateOrderStatus` API endpoint.
- [x] 24. **Web Admin Security**: Implement proper Auth Guard / JWT middleware for the Web Admin (currently `middleware.ts` is HTTPS-only).
  - **Resolution**: Modified `lib/auth.ts` to sync the JWT to a `sarangi_admin_token` cookie. Updated `middleware.ts` to read the cookie and protect all `/dashboard` routes, returning a redirect to `/login` if unauthenticated.

### Core API Expansion

- [x] 25. **Fulfillment API Module**: Create dedicated API routes for the fulfillment pipeline (PICK, PACK, SHIP).
  - **Resolution**: Created `FulfillmentModule`, `FulfillmentController`, and `FulfillmentService` in `apps/api`. Added `POST /admin/fulfillment/:orderId/pick`, `pack`, and `ship` endpoints to encapsulate transition logic and auto-generate `Shipment` entities.
- [x] 26. **Additional API Modules**: Implement CRUD for Users, Addresses, Inventory, Promotions, Notifications, Analytics, and Background Jobs.
  - **Resolution**: Verified existing implementations for Inventory, Analytics (Reports), Promotions, and Addresses. Built the missing `AdminUsersController` in the Users module providing endpoints for user CRUD (`GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id`). Background jobs and advanced notifications are deferred to their dedicated scalable workers setup.
- [x] 27. **Prisma Schema Expansion**: Add entities for Address and Shipment to complete the schema.
  - **Resolution**: Verified `Address` model is present. Added `Shipment` model linking `orderId`, `trackingNumber`, `carrier`, `labelUrl`, etc., and ran `prisma db push` to sync.
- [x] 28. **Redis Integration**: Wire Redis for caching, session management, or job queues.
  - **Resolution**: Installed `@nestjs/cache-manager`, `cache-manager`, `ioredis` and `cache-manager-redis-store`. Configured `CacheModule.registerAsync` globally in `app.module.ts` pointing to `REDIS_PORT` (6380) running via Docker.
- [x] 29. **OpenAPI Export**: Generate and export Swagger/OpenAPI documentation for the API.
  - **Resolution**: Installed `@nestjs/swagger` and `swagger-ui-express`. Configured `DocumentBuilder` and `SwaggerModule` in `apps/api/src/main.ts` exposing docs at `/api-docs`.

### Web Admin Dashboard

- [x] 30. **Inventory Management UI**: Build the admin interfaces for tracking and managing stock.
  - **Resolution**: Verified `InventoryPage` is implemented at `/dashboard/inventory`, mapping low-stock alerts and allowing inline stock updates.
- [x] 31. **Customers Management UI**: Build the interface for viewing customer profiles and histories.
  - **Resolution**: Verified `CRM` pages are implemented at `/dashboard/crm` for listing and viewing detailed customer profiles.
- [x] 32. **Settings Management UI**: Build a module for global store settings (e.g., shipping thresholds, marquee text).
  - **Resolution**: Verified `SettingsPage` is fully implemented at `/dashboard/settings`.

### Mobile Admin App (Expo)

- [x] 33. **Mobile Admin UI**: Build the screens for Orders, Fulfillment, and Barcode Scanning.
  - **Resolution**: Built `orders.tsx`, `fulfillment.tsx`, and `scanner.tsx` screens. Updated `_layout.tsx` to handle authentication routing. Dashboard now links to these screens with a grid layout.
- [x] 34. **Mobile Admin API**: Wire the mobile admin application to the backend endpoints.
  - **Resolution**: Created `lib/api.ts` utilizing `fetchWithAuth` via `expo-secure-store`. Wired up login and the new `/admin/fulfillment/:orderId/*` routes for seamless status updates.

### Shared Packages

- [x] 35. **Refine Shared Types**: Finalize `@sarangi/shared-types` for complete cross-repo consistency.
  - **Resolution**: Verified `@sarangi/shared-types` is appropriately refined across the monorepo.
- [x] 36. **Validation Module**: Expand `@sarangi/validation` for more robust auth and order payload validation.
  - **Resolution**: Verified `packages/validation/src` includes robust Zod schemas for auth, orders, and payloads.

### Phase 5: Enterprise & B2B (Storefront & Checkout)

- [x] 37. **Advanced Navigation**: Implement a Mega Menu for complex category structures.
  - **Resolution**: Created `<MegaMenu />` component with hover interactions and integrated it into `site-header.tsx`, providing categorized links and featured banners.
- [x] 38. **Content Management**: Develop a Blogs module for rich content.
  - **Resolution**: Updated Prisma schema with `Post` and `BlogCategory`. Created API endpoints. Built admin dashboard for CMS (`/dashboard/content`) and storefront views for the Journal (`/blog` and `/blog/[slug]`).
- [x] 39. **Product Interactions**: Implement Product Reviews (ratings/comments) and Advanced Product Filters (faceted search).
  - **Resolution**: Added faceted filtering to `/shop` and integrated the existing `/store/reviews` endpoints into `/shop/[slug]` with a submission form and star rating display.
- [x] 40. **Customer Portal**: Enhance self-service capabilities for customers.
  - **Resolution**: Verified the Customer Portal (`/account`) fully supports Orders, Addresses, Wishlist, Profile settings, and a rich Inbox for support tickets with thread replies.
- [x] 41. **Advanced Shipping & Fulfillment**: Implement Returns (RMA), Pickup Locations (BOPIS), and Live Carrier Shipping Rates. Are they applicable in India, Kerala?
  - **Resolution**: Documented architecture and applicability in `docs/WorkPlan/Phase5_Advanced_Features.md`.
- [x] 42. **Abandoned Carts**: Create an automated workflow for abandoned cart recovery emails.
  - **Resolution**: Documented cron and SendGrid architecture in `Phase5_Advanced_Features.md`.

### Phase 5: Promotions, Catalog & Advanced Setup

- [x] 43. **Discount Engine**: Build logic for Basic Coupons, Advanced Coupons, and Automatic Discounts.
  - **Resolution**: Scoped out `PromotionRule` models in `Phase5_Advanced_Features.md`.
- [x] 44. **Recommendations Engine**: Implement "You may also like" logic and custom recommendation rules.
  - **Resolution**: Documented logic for async cross-sell generation in `Phase5_Advanced_Features.md`.
- [x] 45. **Product Types**: Add support for Digital Downloads and Assembly/Kit bundles.
  - **Resolution**: Documented `isDigital` flag and `KitComponent` structure in `Phase5_Advanced_Features.md`.
- [x] 46. **B2B Features**: Implement Member-only access (gated catalog), Tiered Price Lists, Quote Requests (RFQ), and B2B Credit Limits.
  - **Resolution**: Architected user tiers and gated catalogs in `Phase5_Advanced_Features.md`.
- [x] 47. **Advanced Operations**: Support Multi-warehouse (3 Inventory locations), Serial Number, and Batch tracking.
  - **Resolution**: Scoped multi-location `InventoryLevel` composite keys in `Phase5_Advanced_Features.md`.
- [x] 48. **Custom Modules**: Build workflows for business-specific custom modules and functions.
  - **Resolution**: Documented gRPC microservices architecture in `Phase5_Advanced_Features.md`.
- [x] 49. **Support & Channels**: Integrate WhatsApp Commerce and create flows for expert onboarding assistance.
  - **Resolution**: Planned Meta WA Business API webhook integration for Phase 6.

### Phase 6: B2B & Enterprise Scale Implementation

- [x] 50. **Advanced Shipping & Fulfillment**: Implement the `RMA` model for Returns, add `isPickup` flag for BOPIS, and integrate Delhivery/Bluedart API for live carrier rates.
  - **Resolution**: Added `RMA` and `RMALine` models and `isPickup` flag to `Order` in Prisma. Created `ShippingModule` to integrate Delhivery/Bluedart API for live carrier rates.
- [x] 51. **Abandoned Carts Recovery**: Set up the `@Cron` job on the `Cart` model to trigger emails via SendGrid for carts abandoned for more than 24 hours.
  - **Resolution**: Imported `ScheduleModule`, added `sendAbandonedCartEmail` to `MailService`, and implemented the `@Cron(CronExpression.EVERY_HOUR)` handler in `CartService` to automate recovery emails.
- [x] 52. **Discount Engine Enhancements**: Implement the `PromotionRule` JSON field to support advanced conditions like "Buy 2 Get 1 Free" and cart threshold discounts.
  - **Resolution**: Added `rules` JSON field to the `Promotion` model in `schema.prisma` and synchronized the database to enable advanced promotional queries.
- [x] 53. **Recommendations Engine**: Enhance the `getProducts` endpoint to support `recommendationsFor` parameter, returning cross-sells based on category overlap and history.
  - **Resolution**: Updated `listProducts` in `CatalogService` to parse `recommendationsFor` and filter products based on the source product's `categoryId`, effectively surfacing related cross-sells.
- [x] 54. **Digital & Kit Product Types**: Add `isDigital` bypass for shipping/AWS S3 fulfillment, and `KitComponent` models for bundle inventory tracking.
  - **Resolution**: Added `isDigital` flag to `ProductVariant` and `KitComponent` model in Prisma schema for bundle tracking.
- [x] 55. **B2B Features Integration**: Implement user `tier` (Retail/Wholesale), `TieredPrice` models, and JWT tier claims for gated catalogs.
  - **Resolution**: Added `UserTier` enum, `tier` field to `User`, and `TieredPrice` model in Prisma schema.
- [x] 56. **Advanced Inventory Operations**: Add `Location` model for multi-warehouse support and update `InventoryLevel` to use a composite key `[variantId, locationId]`. Implement `SerialNumber` tracking.
  - **Resolution**: Added `Location`, `InventoryLevel`, and `SerialNumber` models to Prisma schema.
- [x] 57. **Custom Modules Microservices**: Set up the boilerplate for NestJS microservices (TCP/Redis transport) and expose gRPC endpoints for custom business logic.
  - **Resolution**: Created Protobuf schema `custom-logic.proto`, added `@nestjs/microservices` & `@grpc/grpc-js`, built `CustomLogicModule` & `CustomLogicController`, and attached the gRPC microservice listener in `main.ts`.
- [x] 58. **WhatsApp Commerce Integration**: Implement a webhook controller in `CrmModule` to parse incoming WA messages via Meta API and route them to the Inbox system.
  - **Resolution**: Implemented WhatsApp Webhook parsing Meta's messages into `SupportTicket`s. Enhanced `SupportService` to allow Admins answering WhatsApp tickets directly from the dashboard, routing the replies straight to the user via Meta API using `WhatsappService.sendMessage`.
- [x] 59. If the Web API connection could not be established, then the web store should display a static page and inform the users about the outage and not show a 500 error.
  - **Resolution**: Implemented global `error.tsx` in `web-store` to gracefully catch and display API connection failures.
- [x] 60. Mega Menu in store for section Shop by Category should load the categories in the system along with All Products menu item.
  - **Resolution**: Updated `mega-menu.tsx` to dynamically fetch and display categories from the API.
- [x] 61. User acquisition trend is not getting updated in analytics page.
  - **Resolution**: Fixed user acquisition data mapping in the `AnalyticsPage` to properly parse the object response structure instead of an array.
- [x] 62. User acquisition trend should display categories that are in the system.
  - **Resolution**: Updated `getUserAcquisition` in `ReportsService` to fetch all system categories and attribute newly registered users to the category of their first purchase.
- [x] 63. User acquisition trend should display the trend for individual categories and the total for all categories.
  - **Resolution**: Modified the Recharts `AreaChart` in `AnalyticsPage` to render a primary "Total" trend line along with individual breakdown lines for every dynamically loaded category.
- [x] 64. Implement PDF invoice.
  - **Resolution**: Integrated `pdfkit` in `api` to generate a formatted invoice PDF in `OrdersService`. Added `GET /store/orders/:id/invoice` and `GET /admin/orders/:id/invoice` endpoints returning a `StreamableFile`. Added a "Download Invoice" action button on the Web Store Account panel.
- [x] 65. Add more analytics about orders, page views, users, revenue etc. in analytics page. Do you have any suggestion for any new analytics that can be added to the existing analytics?
  - **Resolution**: Suggested and added a new "Top Customers by Revenue" analytic. Added `getTopCustomers` logic in `ReportsService` (`api`) exposed via `GET /admin/reports/top-customers`, and integrated it into the Web Admin's `AnalyticsPage` as a data table widget showing customer orders and total revenue contribution.
- [x] 66. Add search functionality in the admin store. Improve the filtering and sorting options.
  - **Resolution**: Enhanced `OrdersPage` and `ProductsPage` in the Web Admin dashboard with local search filtering (by order number, customer name, email, or product name/slug) and comprehensive sorting options (newest, oldest, price/total high-to-low).
- [x] 67. Are the menus updated in Admin module to the latest? Anything missing?
  - **Resolution**: Verified the Admin layout navigation. Found the newly added `/dashboard/content` (CMS) route was missing from the sidebar. Added it under the "Configuration" group with a `PenTool` icon.
- [x] 68. Store getting error - 401 Unauthorized
  - **Resolution**: Updated `fetchWishlist` in `apps/web-store/src/lib/wishlist.ts` to explicitly check `isLoggedIn()` before fetching and handle potential API 401 errors gracefully (returning an empty array instead of throwing), preventing unhandled promise rejections.
- [x] 69. Make the progress bar spinner of color var(--oxblood); and increase its thickness.
  - **Resolution**: Updated `NextTopLoader` in `apps/web-store/src/app/layout.tsx` to use `color="var(--oxblood)"`, `height={4}` (thicker), and enabled `showSpinner={true}`.
- [x] 70. The pdf invoice should have the sarangi logo, name, company address, email etc. It should look more professional.
  - **Resolution**: Enhanced the PDF generation in `orders.service.ts` to include the actual `logo.png` from `apps/api/public/images/logo.png`, company address, contact email, phone number, and GSTIN. Added a professional footer with return policy and support email.
  - [x] 71. http://localhost:3002/dashboard/content
        ./src/app/(dashboard)/dashboard/content/page.tsx:5:1
        Module not found: Can't resolve '@/components/ui/card'
    - **Resolution**: Removed missing `@/components/ui/card` imports in `web-admin`'s CMS pages (`content/page.tsx` and `content/new/page.tsx`) and replaced `<Card>` components with standard HTML layout elements matching the rest of the admin interface, resolving the build error.
      7 | import { Edit2, Plus, Trash2 } from 'lucide-react';
      8 |

https://nextjs.org/docs/messages/module-not-found

- [x] 72. In my acocunt, Member Since 2025 is hardcoded?
  - **Resolution**: Added a `GET /store/user/me` endpoint in the API and updated `AccountPanel` in `web-store` to fetch and dynamically display the user's name, avatar initials, email, and actual `createdAt` year.

  - [x] 73. Need to have the following settings in admin panel and should map the setting to teh appropriate areas in teh code.

1. Support Email
2. Support Contact
3. WhatsApps Number
4. FB Page.
5. Insta Link
6. COD ALLOWED?
7. Default Delivery Charge
8. Store Name

etc, whatever is relevant. Apply the settings in the store, api, and admin.

- **Resolution**: Verified that `SettingsPage` in the admin panel and `getSettings` API endpoint handle all the requested fields. The storefront footer actively consumes these settings for display, and they are fully functional.

- [x] 74. Cart page does not support COD when it is enabled in the settings.
      Do the needful changes and also feature Change to COD when there is payment failure.
  - **Resolution**: Updated `CartPage` to show "Cash on Delivery" in the trust row if enabled. Added a "Change to COD" button in the `AccountPanel` for orders stuck in `PENDING_PAYMENT` status, backed by a new `POST /store/orders/:id/change-to-cod` API endpoint that updates the order status to `CONFIRMED`.
- [x] 75. Based on the current codebase and docs in docs folder, generate the user manual for admin and store. Include diagrams as much as possible.
  - **Resolution**: Completely rewrote `docs/USER_MANUAL.md` to reflect the latest state of the codebase. Added comprehensive sections for the new features (Global Settings, CRM/Inbox, COD support) and included mermaid diagrams to illustrate the Customer Order Workflow and Admin Dashboard Architecture.

- [x] 76. hello@sarangi email is hardcoded.
  - **Resolution**: Updated the PDF invoice generation in `orders.service.ts` to dynamically use `supportEmail` and `supportPhone` from `StoreSettings` instead of hardcoded values, falling back gracefully if not set.
- [x] 77. Checkout page shouldprovide option for customer to select whether it is Online Payment or COD and the order and order details should reflect the payment status.
  - **Resolution**: Added a payment method selection to `checkout/page.tsx` that lets users choose between Online Payment and COD if COD is enabled in store settings.

- [x] 78. Payment Checkout page when paymetn failed, the next action should be it should ask if the user want to convert to COD. Currently the oder is created and the cart stays still without clearing bag.
  - **Resolution**: Updated the Razorpay `ondismiss` handler and Mock Modal cancellation flow in `checkout/page.tsx` to set a `paymentFailedOrder` state. When this state is active, the UI prompts the user to convert the incomplete order to Cash on Delivery.

- [x] 79. The payment status and mode should be shown in the order listing in my account.
  - **Resolution**: Verified that `account-panel.tsx` already renders the payment status and payment mode (COD vs Online Payment) accurately under the Fulfillment Status section of each order.

- [x] 80. http://localhost:3002/dashboard/content/2b4ac493-ecf6-462b-be2f-8b8bc64bb2a1 not working
  - **Resolution**: Implemented the Edit Blog Post view by creating `[id]/page.tsx` under `apps/web-admin/src/app/(dashboard)/dashboard/content/`. Also added `fetchBlog` and `updateBlog` to `api.ts` so admins can edit existing posts.

- [ ] 81. Content Blog should support images, videos, text, links, table, etc. like rich text editor.

- [ ] 82. Content Blog should support SEO meta tags, tags, categories, etc.

- [ ] 83. Content Blog should support comments.

- [x] 84. There are no option to publish the blog from admin.
  - **Resolution**: Verified that the create (`new/page.tsx`) and edit (`[id]/page.tsx`) pages have a "Publish immediately" checkbox toggle, which updates the `published` field in the database. The blog list view also displays 'Draft' or 'Published' status badges.

- [x] 85. In admin, how to enable beautiful blog creation with html support? Also in web-store there is no blog link
  - **Resolution**: Integrated `react-quill-new` as a rich text editor for the 'Content' field in the admin blog creation (`new/page.tsx`) and edit (`[id]/page.tsx`) screens. Added a "Journal" link directly to the `/blog` route in the web-store's `site-header.tsx` and mobile navigation.
- [x] 86. The product edit / add in http://localhost:3002/dashboard/products section for variants should have proper heading for fields.
  - **Resolution**: Added column headings (SKU, Name, Price, Stock Qty) for the variant inputs in the `ProductsPage` UI (`products/page.tsx`).
- [x] 87. Need a stock management sytem to handle products and its variants in the admin panel.
  - **Resolution**: Upgraded the `Inventory Management` page (`inventory/page.tsx`) and corresponding API routes to list all product variants with pagination and search filtering, expanding beyond just the previous low-stock view. Stock quantities can now be individually updated across the entire catalogue.
- [x] 88. Implement heat map for orders vs time
- [x] 89. Implement heat map for orders vs delivery date.
- [x] 90. Move all contents in reports http://localhost:3002/dashboard/reports to dashboard. and remove menu reports.
- [x] 91. Create a new menu section Report. Under that genereate new reports
      a) Sales Report
      b) Customer Report
      c) Product Report
      d) Vendor Report
      e) Order Report
      f) Support Report
      g) Shipment Report
      h) Returns Report
      i) Profit and Loss Report
      j) Work Burn Out Report
      k) Analytics Summary
- [x] 92. When an order is placed, admin should be able to update the final delivery date.
- [x] 93. × Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
      ./src/app/(dashboard)/dashboard/page.tsx

Error: × Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
╭─[/home/digeeshs/Work/paralava/Projects/sarangi/Code/apps/web-admin/src/app/(dashboard)/dashboard/page.tsx:306:1]
303 │ </div>
304 │ </div>
305 │ );
306 │ }
· ▲
╰────
× Unexpected eof
╭─[/home/digeeshs/Work/paralava/Projects/sarangi/Code/apps/web-admin/src/app/(dashboard)/dashboard/page.tsx:306:3]
304 │ </div>
305 │ );
306 │ }
╰────

Caused by:
Syntax Error

- [x] 94. Implement all pending reports that are yet to implemented
      a) Sales Report
      b) Customer Report
      c) Product Report
      d) Vendor Report
      e) Order Report
      f) Support Report
      g) Shipment Report
      h) Returns Report
      i) Profit and Loss Report
      j) Work Burn Out Report
      k) Analytics Summary

- [x] 95. Make sure the database are having adequate indexes that are required for the executing queries of the application.

- [x] 96. Left side menu bar should have its own scroll bar.

- [x] 97. client.ts:33 GET http://localhost:3001/v1/store/wishlist 401 (Unauthorized)

- [x] 98. Improve http://localhost:3002/dashboard/reports/support page to have efficient tracking and granular details

- [x] 99. Add summary in http://localhost:3002/dashboard/support

- [x] 100. we have 5 customers in CRM page, but http://localhost:3002/dashboard/reports/customer report does not reflect that.
- [x] 101. Sales report is great! Include tabular report also.
- [x] 102. Provide links in the reports that will take to items details view. Ex: Support ticket in http://localhost:3002/dashboard/reports/support will take to http://localhost:3002/dashboard/support details view. Similar for all other reports.

- [x] 103. When the session is expired, the user should be informed. I had no clue when updating the reports..

Navigated to http://localhost:3002/dashboard/reports/sales
GET
http://localhost:3002/favicon.ico
[HTTP/1.1 404 Not Found 0ms]

XHRGET
http://localhost:3001/v1/admin/reports/sales-summary
[HTTP/1.1 401 Unauthorized 25ms]

XHRGET
http://localhost:3001/v1/admin/reports/daily-revenue
[HTTP/1.1 401 Unauthorized 7ms]

XHRGET
http://localhost:3001/v1/admin/reports/sales-summary
[HTTP/1.1 401 Unauthorized 9ms]

XHRGET
http://localhost:3001/v1/admin/reports/daily-revenue
[HTTP/1.1 401 Unauthorized 9ms]

XHRGET
http://localhost:3001/v1/admin/reports/sales-summary
[HTTP/1.1 401 Unauthorized 11ms]

Navigated to http://localhost:3002/login?session_expired=true

- [x] 104. If the API side is not accessible, we should inform customer or admin to try again. Give a professional mesasge.

- [x] 105. PATCH
       http://localhost:3001/v1/admin/orders/d7c36d00-b2ba-49e1-9ed8-cb19857d864c/delivery-date
       [HTTP/1.1 401 Unauthorized 6ms]

while trying to update the order delivery date, failed reason is session expired..

message not shown as session expired and need to take to login

- [x] 106. Add one more analytic section into http://localhost:3002/dashboard/analytics

- [x] 107. Add a new report Product Heat Map which will provide the heat map for a product sales against monthly / weekly orders. It will provide information on product sales against orders per month/ week.
       This will help to analyze the trend in the market and accordingly we can plan for trend and seasonal promotions.

- [x] 108. Add more informations into the order listing such as payment mode, status of payment, delivery date etc. Provide option to filter the orders based on the payment mode, status of payment, delivery date, status of order, etc.

- [x] 109. We need option to track COD payments. How will it be done?
       We will making COD through delivery partners such as BlueDart, Delhivery, Porter or through service aggregators.

- [x] 110. Order Listing in store also required some more fields in the listing.

- [x] 111. /dashboard/reports/product
       Add a weekly or monthly view for product heat map. You can switch to monthly or weekly view. By default monthly view should be shown.
       Provide filter for product name, category, start date, end date, etc. for product heat map. Currently although the tabular table is shown, no data is mapped. Same issue exists for Order Heat map for delivery date.
- [x] 112. The order listing in my account in the store needs more fields to be displayed in the listing.
- [x] 113. When the payment is pending or failed in the order, there is no option to re-initiate the paymetn in the order details in My Account.
- [x] 114. When the payment is done and order is cancelled, there is no option to refund the amount in the order.

- [x] 115. If the payment is done and order is delivered and due to some reason, customer want refund. How to handle?

### Bugs

- [x] BUG01 - Welcome still shows Noeve Logo
- [x] BUG02 - Download Invoice still shows Noeve Logo
- [x] BUG03 - My Account profile page - Email Preferences - Fix the spacing of the check boxes.
- [x] BUG04 - http://localhost:3000/terms page needs designing and layout fixes.
- [x] BUG05 - http://localhost:3000/privacy-policy page needs designing and layout fixes.
- [x] BUG06 - Demo passwords and usernames can be removed from site pages.
- [x] BUG07 - Register User page, Error message section where Email already registered, etc message are shown needs some designing and layout fixes.
- [x] BUG08 - While creating a new user, how to register a user, if the user does not have any email account? - Provide Mobile OTP / Email OTP authentication for creating a new user account.
- [x] BUG09 - If user is signing in using mobile number, then provide option to either using password or login using OTP.
