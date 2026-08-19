# Delivery Partner Integration Guide

This document outlines the steps to set up accounts with major delivery partners (Delhivery, BlueDart, Porter) in India and how to integrate their COD (Cash on Delivery) settlement reports into the Sarangi Jewels platform.

## 1. Setting Up Partner Accounts

### A. Delhivery
1. **Account Creation:**
   - Visit the [Delhivery One Registration Page](https://one.delhivery.com/register).
   - Sign up using your business email and phone number.
   - Complete the KYC process (requires GST certificate, PAN card, and cancelled cheque).
2. **Obtaining API Credentials:**
   - Once the account is approved, log in to the Delhivery One portal.
   - Navigate to **Settings > API Access**.
   - Generate a new API token. Keep this token secure; it will be used if you decide to implement automated API reconciliation later.
3. **Downloading COD Settlement Reports:**
   - Go to the **Finances > COD Settlements** section in the portal.
   - Select the desired date range and click **Export CSV**.

### B. BlueDart
1. **Account Creation:**
   - BlueDart requires a direct sales contact for B2B eCommerce accounts.
   - Visit the [BlueDart Contact Page](https://www.bluedart.com/contact-us) or call their toll-free number to register as an eCommerce merchant.
   - Sign the SLA and provide KYC documents (Company Registration, GST, PAN, Bank Details).
2. **Obtaining API Credentials:**
   - Once onboarded, request access to the **BlueDart E-commerce API portal**.
   - Your account manager will provide you with a Login ID, License Key, and Version information.
3. **Downloading COD Settlement Reports:**
   - Log in to the BlueDart Customer Portal.
   - Navigate to **Reports > COD Remittance Report**.
   - Set the date parameters and export the report as an Excel/CSV file.

### C. Porter (For Hyperlocal/Same-Day)
1. **Account Creation:**
   - Visit the [Porter for Enterprise](https://enterprise.porter.in/) page.
   - Click "Sign Up" and provide your business details.
   - Complete the standard KYC process.
2. **Obtaining API Credentials:**
   - Go to the **Developer/API Section** within the Enterprise dashboard.
   - Generate your API Key and Secret.
3. **Downloading COD Settlement Reports:**
   - Navigate to **Trips/Payments** in the dashboard.
   - Download the Settlement Summary report.

---

## 2. Integrating with Sarangi Jewels

Sarangi Jewels currently supports a robust **CSV Batch Upload** method for reconciling COD payments collected by these partners.

### Step 1: Prepare the CSV File
Before uploading the file to Sarangi Jewels, ensure it contains the required columns. You may need to slightly modify the headers exported from the partners to match Sarangi Jewels's expectations:

**Required Columns:**
- **Order ID** (or `Order Number`, `AWB`): The unique identifier for the order in Sarangi Jewels.
- **Settled Amount** (or `Amount`): The actual cash amount deposited by the partner.

**Optional (but recommended) Columns:**
- **Partner**: The name of the delivery partner (e.g., `Delhivery`, `BlueDart`, `Porter`).
- **Reference** (or `Transaction ID`): The bank UTR or partner's transaction reference.

*Example CSV Format:*
```csv
Order ID,Settled Amount,Partner,Reference
NV-10042,1500,Delhivery,UTR998811223
NV-10043,2999,BlueDart,BD-UTR-443321
```

### Step 2: Upload and Reconcile in Sarangi Jewels Admin
1. Log in to the Sarangi Jewels Web Admin Dashboard (`http://localhost:3002`).
2. Navigate to **Reconciliation** on the sidebar (`/dashboard/reconciliation`).
3. Drag and drop the prepared CSV file into the upload zone.
4. Click **Process Report**.

### Step 3: Handling Discrepancies
The system will automatically compare the `Settled Amount` against the `Expected Amount` (Order Total):
- **Success:** If the amounts match, the order is marked as `SETTLED_TO_BANK` and the payment status becomes `SUCCESS`.
- **Discrepancy:** If the partner remitted less than expected, the order is flagged with a `DISCREPANCY` status. The exact shortfall will be noted. You can view these on the Reconciliation dashboard to raise disputes with the delivery partner.

---

## 3. Future Automation (Optional)
If you wish to move away from manual CSV uploads, you can build direct webhook listeners in the `apps/api/src/modules/reconciliation` module using the API credentials obtained during account setup. 

*Reference the `COD_Reconciliation_Plan.md` or contact the development team to enable real-time webhook endpoints (`POST /v1/webhooks/[partner]/settlement`).*
