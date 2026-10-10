# Rental Order Workflow

This document outlines the end-to-end workflow for Rental Orders in the Sarangi Jewels e-commerce platform, from customer booking to deposit refunds.

## 1. Booking & Checkout

*   **Cart Additions:** Customers can add rental products to their cart. Each rental item (`isRental = true`) captures a specific `rentStartDate` and `rentEndDate`.
*   **Security Deposit:** The price of a rental item includes both the base rental fee and a mandatory security deposit (`rentalDepositCents`), which is calculated per quantity.
*   **Order Splitting:** If a customer checks out with a mix of retail purchases and rental bookings, the backend (`orders.service.ts -> createFromCart`) automatically splits the cart into two separate orders: one `RETAIL` order and one `RENTAL` order. This simplifies fulfillment and return logic.
*   **Payment:** The customer pays the combined total (Rental Fee + Deposit + Tax + Shipping).

## 2. Customer ID Verification

*   **Requirement:** To protect high-value jewelry, rental orders require the customer to have a verified ID.
*   **Checkout Warning:** If a customer's ID is not yet verified (`idVerificationStatus !== 'VERIFIED'`), they will see a warning at checkout prompting them to upload a valid ID via their Account Portal. They can complete the checkout, but the order remains on hold.
*   **Admin Approval:** Admins view the uploaded ID document from the Order Details panel in the Admin Dashboard (`/dashboard/orders`). They can click **Approve ID** or **Reject ID**. 
*   *Note: Fulfillment (Packing/Shipping) should not proceed until the ID is marked as `VERIFIED`.*

## 3. Fulfillment Pipeline

Once the ID is verified and payment is successful, the rental order follows the standard fulfillment state machine:
*   `CONFIRMED` &rarr; `PROCESSING` &rarr; `PICKED` &rarr; `PACKED`
*   From `PACKED`, it transitions to `SHIPPED` (for courier delivery) or `READY_FOR_PICKUP` (for Store Pickup/BOPIS).
*   Upon reaching the customer, the order is marked as `DELIVERED`.

## 4. Return & Deposit Refund

When the rental period ends and the customer returns the item:

1.  **Tracking Deposits:** Admins can track all held deposits, overdue returns, and refunds pending via the **Payments & Deposits** page (`/dashboard/deposits`).
2.  **Processing the Return:** From the Order Details panel, the admin locates the specific rental line item and clicks **Process Return / Refund Deposit**.
3.  **Automated Refund:** The backend `processRentalReturn` function executes:
    *   It verifies the order and line item.
    *   If the deposit was paid online via Razorpay, it automatically triggers a partial refund (`refundPartial`) for the exact `depositCents` amount back to the customer's original payment method.
    *   It logs a history note: *"Rental item returned: [Qty] × [Item]. Deposit refunded."*
4.  **Order Completion:** Once all rental items in the order are returned, the overall order status can be moved to `RETURNED`.

### Damage and Deductions

The Admin Dashboard provides a reference table for **Damage Fee Tiers**:
*   *Normal wear:* No charge (Full deposit refunded).
*   *Minor tarnish:* 10% deduction.
*   *Stone loss:* 25-40% deduction.
*   *Item lost/unreturned:* Deposit fully forfeited.

*(Note: Currently, the automated "Process Return" button refunds the full deposit. If a deduction is necessary due to damage, the admin must process the refund manually through the payment gateway or a manual refund button, adjusting the amount based on the damage tier).*
