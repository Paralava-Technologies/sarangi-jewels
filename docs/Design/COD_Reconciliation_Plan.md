# COD Reconciliation Implementation Plan (Task 109)

## Objective
Create a premium, robust reconciliation workflow for Cash on Delivery (COD) payments. The system must track cash collected by delivery partners (e.g., BlueDart, Delhivery), reconcile it against our internal order totals, and highlight any discrepancies to ensure financial integrity.

## The Premium Workflow
1. **Automated & Manual Sync:** The system will support automated settlement webhooks from major aggregators and a manual CSV/Excel upload interface for legacy reports.
2. **Intelligent Matching:** Reconciles based on Airway Bill (AWB) numbers or internal Order IDs.
3. **Discrepancy Engine:** Automatically flags orders where the collected amount is less than the expected amount, placing them in a "Requires Attention" queue.
4. **Financial Dashboard:** A dedicated view in the Web Admin showing "Unsettled COD Pipeline" (cash currently with drivers/aggregators) vs. "Settled Cash".

## Implementation Steps

### Phase 1: Database & Schema Updates (Prisma)
1. Update `Order` model or create a `Settlement` model to track:
   - `codStatus`: `PENDING_COLLECTION`, `COLLECTED_BY_PARTNER`, `SETTLED_TO_BANK`, `DISCREPANCY`.
   - `settledAmount`: The actual amount deposited.
   - `settlementReference`: Transaction ID from the aggregator.
   - `settledAt`: Timestamp of the settlement.

### Phase 2: Backend Core (NestJS API & Firebase Compatibility)
1. **Settlement Controller:** Create `POST /admin/reconciliation/upload` to handle CSV file parsing using libraries like `papaparse` or `csv-parser`.
2. **Reconciliation Service:** 
   - Parse the rows, look up orders by AWB/OrderID.
   - Compare `Order.total` with `Row.collectedAmount`.
   - Update statuses and generate an audit log of the settlement.
   - *Firebase Support:* Ensure the upload and parsing logic is stateless and can run within a Firebase Cloud Function.

### Phase 3: Web Admin UI (Next.js)
1. **Reconciliation Dashboard:** Create `/dashboard/reconciliation`.
2. **File Upload Module:** A drag-and-drop zone for uploading aggregator settlement reports.
3. **Discrepancy Table:** A UI table highlighting orders with unmatched amounts, allowing the admin to "Force Settle" or "Raise Ticket with Partner".
4. **Analytics Cards:** Display metrics for "Total COD in Transit", "Total Settled This Week", etc.

## Questions for Clarification
1. **Aggregators:** Do you have specific formats or APIs from Delhivery/BlueDart you want to integrate immediately, or should we start with a standard generic CSV upload template?
2. **Discrepancy Action:** What should the system do if a partner settles ₹900 instead of ₹1000? Should it auto-settle the partial amount and raise a flag, or block the settlement entirely until reviewed?
