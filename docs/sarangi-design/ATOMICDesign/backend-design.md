# Sarangi Jewels — Backend & Admin System Design

A basic but production-shaped backend for a store that **sells** jewellery and **rents** jewellery, dance costumes, and makeup services. The core complexity beyond a normal e-commerce backend is that the same item can have two transaction types, and rentable items need **date-based availability**, not just stock count.

---

## 1. Suggested Stack (simple, low-maintenance)

| Layer | Choice | Why |
|---|---|---|
| Frontend | The HTML/CSS templates provided, or rebuilt in Next.js/React later | Fast to launch now; swap to a framework once traffic justifies it |
| Backend API | Node.js (NestJS or Express) or Django | Either is fine — Django Admin gives you a free basic admin panel out of the box, which is a fast way to satisfy "basic backend design" for a first launch |
| Database | PostgreSQL | Relational integrity matters here (bookings can't double-allocate an item) |
| File/image storage | S3-compatible bucket (AWS S3 / Cloudflare R2) | Product photography, 360° views |
| Payments | Razorpay (India-first, supports UPI/cards/netbanking) | Needed for both checkout and rental deposits |
| Auth | Email/phone OTP + optional Google login | Indian customers expect OTP login |
| Notifications | WhatsApp Business API + SMS (MSG91/Twilio) + Email (SendGrid) | Order confirmations, rental pickup/return reminders |
| Hosting | Any VPS or Render/Railway to start, move to AWS/GCP later | Keep it simple for v1 |

---

## 2. Core Data Model

```
Product
 ├─ id, name, slug, description, category_id, sub_category_id
 ├─ material, finish (kemp/kundan/gold-tone/diamond-finish), weight
 ├─ transaction_type: SALE | RENTAL | BOTH
 ├─ sale_price, mrp, discount_pct           (if SALE or BOTH)
 ├─ rental_price_per_day, deposit_amount     (if RENTAL or BOTH)
 ├─ min_rental_days
 ├─ images[], video_url
 ├─ care_instructions, size_fit_notes
 ├─ is_active, is_featured, tags[]
 └─ created_at, updated_at

ProductVariant                 (e.g. size for costumes, color for sets)
 ├─ product_id, sku, attribute (size/color), stock_qty (for SALE)

Category / SubCategory
 ├─ Bridal Sets, Earrings, Bangles, Temple Jewellery, Anklets…
 ├─ Dance Costumes: Bharatanatyam, Mohiniyattam, Kathak, Kuchipudi…
 ├─ Makeup: Bridal, Party Glam, Stage/Dance, Add-ons (hair/draping)

Customer
 ├─ id, name, phone, email, addresses[], id_proof (for high-value rentals)
 ├─ loyalty_points, wishlist[], rental_history[]

Order (SALE)
 ├─ id, customer_id, items[], subtotal, discount, shipping, total
 ├─ payment_status, fulfillment_status, tracking_id
 └─ created_at

RentalBooking (this is the piece that makes this backend different)
 ├─ id, customer_id, product_id/variant_id
 ├─ start_date, end_date, pickup_method (store/delivery)
 ├─ rental_fee, deposit_amount, deposit_status (held/refunded/forfeited)
 ├─ status: REQUESTED → CONFIRMED → OUT_WITH_CUSTOMER → RETURNED → CLOSED
 ├─ condition_check_out[notes/photos], condition_check_in[notes/photos]
 ├─ late_fee_applied, damage_fee_applied
 └─ payment_id, refund_id

InventoryCalendar               (per rentable product/variant)
 ├─ product_id, date, status: AVAILABLE | BOOKED | CLEANING | BLOCKED
 └─ (cleaning buffer day auto-blocked after every return)

MakeupSession                    (service-type rental, no physical item held)
 ├─ id, customer_id, service_type, artist_id, session_date, time_slot
 ├─ location_type: IN_STORE | HOME_VISIT, address (if home visit)
 └─ price, status

Artist / Staff
 ├─ id, name, role (makeup artist / store staff / delivery), availability

Review, Wishlist, Coupon, Cart — standard e-commerce tables
```

**Key design decision:** rentable inventory is tracked as a **calendar of availability per item**, not a simple stock count — this is what prevents two customers from booking the same choker for overlapping wedding dates.

---

## 3. Order & Rental Lifecycle

**Sale flow:**
`Browse → Add to Bag → Checkout → Payment → Pack → Ship/Store Pickup → Delivered → (Return window: 7 days)`

**Rental flow:**
`Browse → Select Dates → Check Calendar Availability → Pay Rental Fee + Deposit
→ CONFIRMED → Pickup/Delivery → OUT_WITH_CUSTOMER → Customer Returns
→ Staff Condition Check → Cleaning (auto-blocks 1 day) → Deposit Refunded → CLOSED`

Automated reminders: 1 day before pickup, on the return-due date, and a late-return nudge if not returned.

**Makeup session flow:**
`Browse Services → Pick Date/Time + Artist → In-store or Home Visit → Pay → Confirmed → Reminder 1 day prior → Completed`

---

## 4. Admin Panel — Modules

A basic internal dashboard the shop staff will actually use day to day:

1. **Dashboard** — today's pickups, today's returns, low-stock alerts, pending payments, revenue split (sale vs rental) at a glance.
2. **Catalog Manager** — add/edit products, mark item as Sale / Rental / Both, upload photos, set rental price + deposit, set variants (size/color).
3. **Rental Calendar** — a visual calendar per item (like a hotel booking chart) showing booked/available/cleaning dates; staff can manually block dates for repair or photoshoots.
4. **Orders & Bookings** — unified queue of sale orders and rental bookings with status actions (Confirm, Mark Out, Mark Returned, Issue Refund).
5. **Condition Check Tool** — on pickup and return, staff upload photos + notes against the booking; auto-flags damage/delay fees.
6. **Customers** — profile, order/rental history, ID proof on file for high-value rentals, loyalty points.
7. **Makeup & Staff Scheduling** — artist calendar, session booking, home-visit address log.
8. **Payments & Deposits** — track held deposits separately from revenue; one-click refund on clean return.
9. **Coupons & Campaigns** — festival/wedding-season discount codes, first-rental offers.
10. **Reports** — best-selling categories, most-rented items, rental utilization rate (% of days an item earns), repeat customer rate.
11. **Roles** — Owner (full access), Store Staff (orders/bookings/condition checks), Delivery (status updates only).

---

## 5. A Few Rental-Specific Business Rules To Decide Early

- **Deposit handling:** hold via payment gateway pre-auth vs. collect upfront and refund after return — pick one and keep it consistent; it affects cash flow and customer trust.
- **Damage/loss policy:** define fixed damage-fee tiers (minor tarnish / stone loss / lost item = % of item value) so staff aren't deciding case by case.
- **Buffer days:** block 1 day between rentals of the same item for cleaning — bake this into the calendar logic, not manual memory.
- **ID verification:** for high-value bridal sets, consider requiring ID proof + a signed rental agreement (can be e-signed at checkout).
- **Cancellation window:** define how close to the date a rental can be cancelled with full refund (e.g. 48+ hours).

---

## 6. Suggested Build Order

1. Product catalog + basic storefront (what's been designed) — **launch sellable**
2. Cart + checkout + payments for **sale** items only
3. Rental calendar + booking flow for jewellery rentals
4. Extend rental engine to dance costumes (adds size/variant handling)
5. Makeup session booking (simplest — no physical inventory, just a calendar)
6. Admin dashboard + condition-check tooling
7. WhatsApp/SMS notification automation
8. Loyalty, reviews, and marketing features

This lets the shop go live with sales first, then layer in the rental engine — which is the more complex piece — without blocking launch.
