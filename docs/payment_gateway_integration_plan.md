# Payment Gateway Research & Integration Plan

## 1. Research: Best Payment Gateways for E-commerce in India (Kerala)

When selecting a payment gateway for `sarangijewels.com` in Kerala, it's crucial to consider local payment preferences (UPI, net banking via local banks like Federal Bank/South Indian Bank, cards), settlement cycles, and ease of integration.

Here are the top contenders:

### A. Razorpay (Highly Recommended)
*   **Pros:** Market leader in India. Excellent developer APIs, incredibly smooth UI/UX (checkout), supports almost all payment methods (Cards, Netbanking, UPI, Wallets, PayLater). Fast settlement options.
*   **Cons:** Stricter onboarding process compared to the past.
*   **Verdict:** **Best overall choice.** Its modern API, webhooks, and React/Node SDKs make it the easiest to integrate with a modern tech stack (like our Next.js/React storefront). 

### B. Cashfree Payments
*   **Pros:** Known for very fast settlements (T+1 or instant) and robust payout features. Excellent if you have a multi-vendor setup where payouts need to be automated. Good UPI support.
*   **Cons:** Checkout UI is slightly less polished than Razorpay.
*   **Verdict:** Great alternative if instant settlement or complex vendor payouts are a priority.

### C. PayU
*   **Pros:** Long-standing, highly reliable, high transaction success rates. Great support for international cards if `sarangijewels.com` plans to sell outside India.
*   **Cons:** Documentation and developer experience are not as modern as Razorpay.

### D. PhonePe Payment Gateway
*   **Pros:** Deep integration with the PhonePe app, zero setup/maintenance fees currently being offered for new merchants, excellent for a mobile-first UPI-heavy customer base.
*   **Cons:** Newer as a standalone PG for merchants compared to Razorpay/PayU, meaning fewer third-party plugins out of the box.

### Recommendation: Razorpay
Given our modern web stack, requirement for a seamless checkout experience, and previous context indicating a preference for Razorpay, **Razorpay** is the clear winner for `sarangijewels.com`.

---

## 2. Integration Plan (Razorpay)

Here is the step-by-step implementation plan for integrating Razorpay into the `sarangijewels.com` application.

### Phase 1: Preparation & Account Setup
1.  **Create Razorpay Account:** Sign up on Razorpay, submit KYC documents (GST, PAN, Bank Details of the Kerala business).
2.  **API Keys:** Generate Test API Keys (`key_id` and `key_secret`) from the Razorpay Dashboard.
3.  **Environment Variables:** Add these keys to the backend API and frontend Web Store `.env` files.

### Phase 2: Backend Implementation (Node.js API)
1.  **Install SDK:** `npm install razorpay` in the API workspace.
2.  **Order Creation Endpoint:** 
    *   Create a `POST /api/payments/create-order` endpoint.
    *   When a user initiates checkout, calculate the final total in INR (convert to paise by multiplying by 100).
    *   Call `razorpay.orders.create({ amount, currency: "INR", receipt: internal_order_id })`.
    *   Return the `razorpay_order_id` to the frontend.
3.  **Payment Verification (Webhook & Endpoint):**
    *   Create a `POST /api/payments/verify` endpoint to verify the signature (`razorpay_signature`) returned by the frontend using `crypto.createHmac`.
    *   Set up a Webhook endpoint (`POST /api/webhooks/razorpay`) to listen for events like `payment.captured` or `payment.failed` to update the order status in Firestore/database asynchronously.

### Phase 3: Frontend Implementation (React/Next.js Web Store)
1.  **Load Razorpay Script:** Dynamically load `https://checkout.razorpay.com/v1/checkout.js` on the checkout page.
2.  **Checkout UI Integration:**
    *   When the user clicks "Pay Now", fetch the `razorpay_order_id` from the backend.
    *   Initialize the Razorpay Checkout modal with the options:
        ```javascript
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amountInPaise,
            currency: "INR",
            name: "Sarangi Jewels Store",
            description: "Order Payment",
            order_id: razorpay_order_id,
            handler: function (response) {
                // Call backend verify endpoint with response.razorpay_payment_id, etc.
            },
            prefill: {
                name: customer.name,
                email: customer.email,
                contact: customer.phone // Crucial for Indian customers
            },
            theme: { color: "#3399cc" } // Match Sarangi Jewels branding
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        ```
3.  **Handle Responses:** On success, redirect to the Order Confirmation page. On failure/dismissal, show a retry option.

### Phase 4: Testing & Go-Live
1.  **Test Suite:** Perform end-to-end testing using Razorpay test cards and UPI handles (e.g., `success@razorpay`). Test edge cases (network drop, user closing modal).
2.  **Live Mode:** Switch to Live API keys in production environment variables once KYC is approved.
3.  **Monitor:** Check the first few live transactions in the Razorpay dashboard to ensure reconciliation matches our internal database.

---

## 3. Webhook Generation & Configuration Guide

Webhooks are crucial for ensuring your backend (`sarangijewels.com` API) stays in sync with the actual payment status on Razorpay's end, especially in cases where the user's browser closes before redirecting back to the storefront.

### Steps to Generate & Configure the Webhook:

1. **Log in to the Razorpay Dashboard:**
   * Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) and log in with your credentials.
   * Make sure you are in the correct mode (**Test Mode** for development/staging, **Live Mode** for production).

2. **Navigate to Webhook Settings:**
   * On the left sidebar, click on **Settings** (usually at the bottom).
   * Go to the **Webhooks** tab.
   * Click on the **Add New Webhook** button.

3. **Fill in the Webhook Details:**
   * **Webhook URL:** Enter your backend endpoint URL. 
     * For production, it will be something like: `https://api.sarangijewels.com/v1/store/payments/webhook`
     * **For Local Development (using Ngrok):**
       Since Razorpay cannot send requests to `localhost`, you need to expose your local API port (3001) to the internet.
       1. Download and install [Ngrok](https://ngrok.com/download).
       2. Authenticate with your token: `ngrok config add-authtoken <your_token>`.
       3. Run the following command in your terminal: `ngrok http 3001`
       4. Ngrok will output a Forwarding URL (e.g., `https://1234-abcd.ngrok-free.app`).
       5. Copy this URL and append the webhook path. Your final Webhook URL will look like: `https://1234-abcd.ngrok-free.app/v1/store/payments/webhook`
   * **Secret:** Enter a strong random string. 
     * This exact string **MUST** be copied into your `apps/api/.env` file as `RAZORPAY_WEBHOOK_SECRET=your_secret_string`. 
     * The backend uses this secret to verify that the webhook actually came from Razorpay.
   * **Alert Email:** Enter an admin email address to be notified if the webhook starts failing.

4. **Select Active Events:**
   * Check the boxes for the events your backend needs to listen to. For our current implementation, select:
     * `payment.captured`
     * `payment.failed`
     * `order.paid`

5. **Save and Enable:**
   * Click **Create Webhook** or **Save**. 
   * The webhook is now active and Razorpay will start sending POST requests to your URL whenever those events occur.
