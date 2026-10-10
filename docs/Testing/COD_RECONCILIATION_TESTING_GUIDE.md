# COD Reconciliation Testing Guide

This document outlines how to thoroughly test the COD Reconciliation system, covering both the Manual (CSV Upload) mode and the Automatic (Webhook) mode for all delivery partners (Delhivery, BlueDart, Porter, and Generic).

## Prerequisites for Testing

Before testing, you need some test orders in the system that are eligible for COD.

1. **Enable COD**: Go to the **Admin Dashboard > Settings** (`http://localhost:3002/dashboard/settings`). Ensure "Allow Cash on Delivery (COD)" is checked and saved.
2. **Create Test Orders**:
   - Go to the **Storefront** (`http://localhost:3000`).
   - Add products to your cart and proceed to checkout.
   - Select **Cash on Delivery (COD)** as the payment method.
   - Place at least 2 or 3 orders.
   - Note down the **Order Numbers** (e.g., `NV-0001`, `NV-0002`). You can view these in the Admin Orders page (`http://localhost:3002/dashboard/orders`).

---

## 1. Testing Manual Mode (CSV Upload)

The manual mode acts as the fallback mechanism and relies on CSV report uploads.

### Step 1: Create a Mock CSV File
Create a file named `mock_settlement.csv` on your computer using Excel, Numbers, or any text editor with the following content. Make sure to replace the `Order ID` with actual order numbers from your system:

```csv
Order ID,Settled Amount,Partner,Reference
NV-0001,1500.50,Delhivery,TXN-9981
NV-0002,1000.00,BlueDart,TXN-9982
```
*(Note: Intentionally make the `Settled Amount` for one order **less** than the actual order total to test the discrepancy engine).*

### Step 2: Upload the CSV
1. Go to **Admin Dashboard > Reconciliation** (`http://localhost:3002/dashboard/reconciliation`).
2. Upload the `mock_settlement.csv` file.
3. Click **Process Report**.

### Step 3: Verify the Results
- **UI Dashboard**: The screen should display counts for "Total Processed", "Successfully Settled", and "Discrepancies Found".
- **Database / Orders Page**:
  - The order with the fully matching amount should now be marked as `Payment: SUCCESS`.
  - The order with the short payment should be marked with a discrepancy.

---

## 2. Testing Automatic Mode (Webhooks)

The automatic mode relies on real-time POST requests sent by the delivery partners to the Sarangi Jewels API. To test this locally without the real partners, you can use **Postman**, **cURL**, or a **Node.js Script** to simulate the incoming webhooks.

### Step 1: Enable Automatic Mode
1. Go to **Admin Dashboard > Settings** (`http://localhost:3002/dashboard/settings`).
2. Change the **COD Reconciliation Mode** to `Automatic (Webhooks via Partners)`.
3. Save the settings.

### Step 2: Simulate the Webhooks

You can use standard API testing tools to send POST requests to your local API (`http://localhost:3001`).

#### A. Testing Delhivery Webhook
- **URL**: `POST http://localhost:3001/v1/webhooks/reconciliation/delhivery`
- **Headers**: `Content-Type: application/json`
- **Body (Raw JSON)**:
  ```json
  {
    "waybill": "NV-0003", 
    "remittance_amount": 1499.00,
    "utr_number": "UTR-DEL-555"
  }
  ```
  *(Replace `NV-0003` with a real pending order number).*

#### B. Testing BlueDart Webhook
- **URL**: `POST http://localhost:3001/v1/webhooks/reconciliation/bluedart`
- **Headers**: `Content-Type: application/json`
- **Body (Raw JSON)**:
  ```json
  {
    "AWBNo": "NV-0004", 
    "CODAmountCollected": 2500.50,
    "ChequeUTRNo": "UTR-BD-999"
  }
  ```

#### C. Testing Porter Webhook
- **URL**: `POST http://localhost:3001/v1/webhooks/reconciliation/porter`
- **Headers**: `Content-Type: application/json`
- **Body (Raw JSON)**:
  ```json
  {
    "crn": "NV-0005", 
    "collected_amount": 850.00,
    "transaction_ref": "PTR-TXN-123"
  }
  ```

#### D. Testing a Generic Future Partner
- **URL**: `POST http://localhost:3001/v1/webhooks/reconciliation/generic/XpressBees`
- **Headers**: `Content-Type: application/json`
- **Body (Raw JSON)**:
  ```json
  {
    "orderId": "NV-0006", 
    "settledAmount": 3000.00,
    "reference": "XB-UTR-777"
  }
  ```

### Step 3: Verify the Webhook Results
- **Check API Response**: The API should return `201 Created` with a body like `{"success": true, "result": {"status": "SETTLED", "orderId": "..."}}`.
- **Verify in Database/UI**: Go to the Admin Orders page and verify that the tested orders have their payment status updated to `SUCCESS`.

---

## 3. Automated Script Testing (Alternative)

A testing script (`test-webhooks.js`) is included in the root of the repository to rapidly fire test payloads at the webhook endpoints.

1. Edit `/home/digeeshs/Work/paralava/Projects/sarangi/Code/test-webhooks.js`.
2. Replace the dummy `waybill`, `AWBNo`, and `orderId` values with actual pending COD order numbers from your local database.
3. Run the script:
   ```bash
   node test-webhooks.js
   ```
4. You should see successful JSON responses in your terminal indicating the reconciliation states.
