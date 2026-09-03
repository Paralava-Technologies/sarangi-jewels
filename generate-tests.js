const fs = require('fs');

const testCases = [
  // WEB STORE - AUTHENTICATION
  ['TC-WS-AUTH-001', 'Web Store', 'Auth', 'Registration - Valid Data', 'None', '1. Go to Sign Up\n2. Enter valid Name, Email, Password\n3. Submit', 'Account created, logged in, redirected to profile', ''],
  ['TC-WS-AUTH-002', 'Web Store', 'Auth', 'Registration - Duplicate Email', 'Account with email X exists', '1. Go to Sign Up\n2. Enter email X\n3. Submit', 'Error message: "Email already in use"', ''],
  ['TC-WS-AUTH-003', 'Web Store', 'Auth', 'Registration - Weak Password', 'None', '1. Go to Sign Up\n2. Enter short password (< 6 chars)\n3. Submit', 'Validation error on password field', ''],
  ['TC-WS-AUTH-004', 'Web Store', 'Auth', 'Login - Valid Credentials', 'Account exists', '1. Go to Login\n2. Enter correct email & password\n3. Submit', 'Authentication success, token stored, redirected', ''],
  ['TC-WS-AUTH-005', 'Web Store', 'Auth', 'Login - Invalid Credentials', 'Account exists', '1. Go to Login\n2. Enter wrong password\n3. Submit', 'Error message: "Invalid credentials"', ''],
  ['TC-WS-AUTH-006', 'Web Store', 'Auth', 'Logout', 'User is logged in', '1. Click Logout in profile dropdown', 'Session cleared, token removed, redirected to home', ''],

  // WEB STORE - CATALOG & SEARCH
  ['TC-WS-CAT-001', 'Web Store', 'Catalog', 'Category Navigation', 'Categories exist', '1. Hover on Shop menu\n2. Click "Necklaces"', 'Navigated to /category/necklaces, only necklaces shown', ''],
  ['TC-WS-CAT-002', 'Web Store', 'Catalog', 'Product Filtering', 'On category page', '1. Select "Price: Low to High" filter', 'Products re-order instantly based on price', ''],
  ['TC-WS-CAT-003', 'Web Store', 'Catalog', 'Search - Exact Match', 'None', '1. Type exact product name in search\n2. Hit enter', 'Product appears as first result', ''],
  ['TC-WS-CAT-004', 'Web Store', 'Catalog', 'Search - Partial/Typo', 'None', '1. Type partial keyword (e.g. "Neckl")\n2. Hit enter', 'Relevant products returned via fuzzy search', ''],
  ['TC-WS-CAT-005', 'Web Store', 'Catalog', 'Product Details Load', 'None', '1. Click a product card', 'PDP loads with images, description, price, variants', ''],
  ['TC-WS-CAT-006', 'Web Store', 'Catalog', 'Variant Selection', 'Product has size variants', '1. Click Size 7\n2. Check price/SKU', 'Price updates dynamically if variant has different price', ''],

  // WEB STORE - CART & RENTALS
  ['TC-WS-CRT-001', 'Web Store', 'Cart', 'Add Retail Item', 'None', '1. Open retail product\n2. Click Add to Cart', 'Sidebar opens, item added, subtotal updates', ''],
  ['TC-WS-CRT-002', 'Web Store', 'Cart', 'Rental - Valid Dates', 'None', '1. Open rental item\n2. Select future 3-day range\n3. Add to Cart', 'Item added with deposit fee and date metadata', ''],
  ['TC-WS-CRT-003', 'Web Store', 'Cart', 'Rental - Past Dates', 'None', '1. Open rental item\n2. Try selecting past date', 'Calendar prevents selection of past dates', ''],
  ['TC-WS-CRT-004', 'Web Store', 'Cart', 'Rental - Double Booking', 'Item rented on Aug 20-22', '1. Try booking Aug 21', 'Calendar grays out Aug 21, shows "Unavailable"', ''],
  ['TC-WS-CRT-005', 'Web Store', 'Cart', 'Remove Item', 'Item in cart', '1. Open cart\n2. Click trash icon on item', 'Item removed, cart total recalculates instantly', ''],
  
  // WEB STORE - CHECKOUT
  ['TC-WS-CHK-001', 'Web Store', 'Checkout', 'Promo Code - Valid', 'Item in cart', '1. Enter valid promo code\n2. Apply', 'Discount applied to subtotal, total updates', ''],
  ['TC-WS-CHK-002', 'Web Store', 'Checkout', 'Promo Code - Invalid', 'Item in cart', '1. Enter fake code\n2. Apply', 'Error message "Invalid or expired promo code"', ''],
  ['TC-WS-CHK-003', 'Web Store', 'Checkout', 'Address Management', 'Logged in', '1. Proceed to checkout\n2. Select saved address', 'Shipping fields auto-populate correctly', ''],
  ['TC-WS-CHK-004', 'Web Store', 'Checkout', 'Delivery Type - Shipping', 'Items in cart', '1. Select "Ship to Address"', 'Shipping fee calculated based on distance/rules', ''],
  ['TC-WS-CHK-005', 'Web Store', 'Checkout', 'Delivery Type - Store Pickup', 'Items in cart', '1. Select "Store Pickup"', 'Shipping fee removed, address fields disabled/hidden', ''],
  ['TC-WS-CHK-006', 'Web Store', 'Checkout', 'Payment - Razorpay Success', 'Checkout valid', '1. Select Online Payment\n2. Complete Razorpay flow', 'Order created, payment verified, redirected to Success UI', ''],
  ['TC-WS-CHK-007', 'Web Store', 'Checkout', 'Payment - Razorpay Failure', 'Checkout valid', '1. Select Online Payment\n2. Fail the mock payment', 'Redirected to order details with PENDING_PAYMENT status', ''],
  ['TC-WS-CHK-008', 'Web Store', 'Checkout', 'Payment - COD', 'Checkout valid', '1. Select Cash on Delivery\n2. Submit', 'Order created as CONFIRMED, no payment gateway invoked', ''],

  // USER PROFILE
  ['TC-WS-PRF-001', 'Web Store', 'Profile', 'Upload ID Proof (Valid)', 'Logged in', '1. Go to Profile\n2. Upload valid JPG/PDF ID\n3. Submit', 'Upload succeeds, document URL saved, status PENDING', ''],
  ['TC-WS-PRF-002', 'Web Store', 'Profile', 'Upload ID Proof (Invalid)', 'Logged in', '1. Try uploading an .exe or 50MB file', 'Client-side/Server-side validation rejects upload', ''],
  ['TC-WS-PRF-003', 'Web Store', 'Profile', 'Order History', 'Orders exist', '1. Go to Orders tab', 'List of past orders shown with correct statuses', ''],
  
  // WEB ADMIN - DASHBOARD & AUTH
  ['TC-AD-AUTH-001', 'Web Admin', 'Auth', 'Admin Login', 'Admin credentials', '1. Go to /dashboard\n2. Login', 'Access granted to admin panel', ''],
  ['TC-AD-AUTH-002', 'Web Admin', 'Auth', 'Customer Login Blocked', 'Customer credentials', '1. Go to /dashboard\n2. Login as retail customer', 'Access denied, 403 Forbidden', ''],
  
  // WEB ADMIN - CATALOG
  ['TC-AD-CAT-001', 'Web Admin', 'Catalog', 'Create Product', 'Admin logged in', '1. Create new product\n2. Add images & variants\n3. Save', 'Product successfully persists in DB and shows on storefront', ''],
  ['TC-AD-CAT-002', 'Web Admin', 'Catalog', 'Manage Rental Inventory', 'Rental product exists', '1. Go to Inventory\n2. Add Serial Number (e.g. NECK-001)', 'Physical serial number tracked for rental bookings', ''],
  
  // WEB ADMIN - ORDERS & FULFILLMENT
  ['TC-AD-ORD-001', 'Web Admin', 'Orders', 'Order List Rendering', 'Orders exist', '1. Go to Orders page', 'Table shows order number, user, amount, status, badges', ''],
  ['TC-AD-ORD-002', 'Web Admin', 'Orders', 'View Order Details', 'Order exists', '1. Click order row', 'Expanded view shows lines, financial summary, user details', ''],
  ['TC-AD-ORD-003', 'Web Admin', 'Orders', 'Fulfillment - Shipping', 'Status=PACKED, Type=Ship', '1. Click Next Status\n2. Select SHIPPED\n3. Enter AWB', 'Order transitions to SHIPPED, AWB tracking saved', ''],
  ['TC-AD-ORD-004', 'Web Admin', 'Orders', 'Fulfillment - Pickup', 'Status=PACKED, Type=Pickup', '1. Click Next Status', 'Only READY_FOR_PICKUP is available, SHIPPED is hidden', ''],
  ['TC-AD-ORD-005', 'Web Admin', 'Orders', 'Fulfillment - Pickup Complete', 'Status=READY', '1. Click Next Status', 'Order transitions to DELIVERED once customer collects', ''],
  
  // WEB ADMIN - RENTAL WORKFLOW & ID
  ['TC-AD-RNT-001', 'Web Admin', 'Rentals', 'Verify Customer ID', 'ID Uploaded', '1. Open rental order\n2. View ID panel\n3. Click Approve', 'ID Verification Status changes to VERIFIED globally', ''],
  ['TC-AD-RNT-002', 'Web Admin', 'Rentals', 'Reject Customer ID', 'ID Uploaded', '1. Open rental order\n2. View ID panel\n3. Click Reject', 'ID Status becomes REJECTED, user notified', ''],
  ['TC-AD-RNT-003', 'Web Admin', 'Rentals', 'Rental Heatmap Matrix', 'Rentals exist', '1. Go to Rentals', 'Matrix spans [Today-15] to [Today+15], blocks marked', ''],
  ['TC-AD-RNT-004', 'Web Admin', 'Rentals', 'Process Return (No Deposit)', 'Status=DELIVERED', '1. Click Process Return on line item', 'Status history updated to RETURNED, no API refund fired', ''],
  ['TC-AD-RNT-005', 'Web Admin', 'Rentals', 'Process Return (With Deposit)', 'Deposit paid via Razorpay', '1. Click Process Return on line item', 'Razorpay partial refund API triggered for exact deposit amount', ''],

  // WEB ADMIN - SALES & COD
  ['TC-AD-COD-001', 'Web Admin', 'Sales', 'COD Reconciliation - Valid CSV', 'Shipped COD exists', '1. Upload valid Courier settlement CSV', 'Orders matched by AWB, status bulk updated to SUCCESS', ''],
  ['TC-AD-COD-002', 'Web Admin', 'Sales', 'COD Reconciliation - Invalid CSV', 'None', '1. Upload malformed CSV', 'System catches parse error, shows readable error message', ''],

  // WEB ADMIN - CRM & BLOGS
  ['TC-AD-CRM-001', 'Web Admin', 'CRM', 'Support Inbox Web Ticket', 'Customer sent message', '1. Open Inbox\n2. Reply to web ticket', 'Customer receives reply on their account dashboard', ''],
  ['TC-AD-CRM-002', 'Web Admin', 'CRM', 'WhatsApp Meta Webhook', 'None', '1. Simulate WhatsApp message to webhook', 'System creates/updates ticket in Inbox automatically', ''],
  ['TC-AD-CMS-001', 'Web Admin', 'CMS', 'Publish Blog Post', 'None', '1. Create blog post with rich text\n2. Publish', 'Post immediately visible on Storefront Journal', ''],
  
  // WEB API - SECURITY & INFRA
  ['TC-API-SEC-001', 'Web API', 'Security', 'No Token', 'None', '1. GET /v1/admin/orders without Auth header', '401 Unauthorized', ''],
  ['TC-API-SEC-002', 'Web API', 'Security', 'Invalid Role', 'Customer token', '1. GET /v1/admin/orders with Customer token', '403 Forbidden', ''],
  ['TC-API-SEC-003', 'Web API', 'Validation', 'Invalid DTO Payload', 'None', '1. POST malformed data to checkout', '400 Bad Request with Zod schema validation errors', ''],
  
  // MOBILE STORE (EXPO)
  ['TC-MOB-APP-001', 'Mobile Store', 'UI', 'Tab Navigation', 'App running', '1. Tap Home, Shop, Cart, Profile tabs', 'Screens transition smoothly using Expo Router', ''],
  ['TC-MOB-APP-002', 'Mobile Store', 'UI', 'Product Grid Responsiveness', 'On Shop tab', '1. View product grid on mobile emulator', 'Grid displays in 2-column masonry or 1-column layout properly', ''],
  ['TC-MOB-APP-003', 'Mobile Store', 'Auth', 'Session Persistence', 'Logged in', '1. Close app\n2. Reopen app', 'User remains logged in via SecureStore token', ''],
  ['TC-MOB-APP-004', 'Mobile Store', 'Cart', 'Mobile Checkout', 'Items in cart', '1. Proceed to checkout on mobile device', 'Checkout flow fits mobile screen without horizontal scroll', ''],

  // EDGE CASES & NEGATIVE TESTING
  ['TC-EDG-CRT-001', 'Web Store', 'Cart', 'Empty Cart Checkout', 'Cart is empty', '1. Try to navigate to /checkout directly via URL', 'Redirected back to cart or home with "Cart is empty" message', ''],
  ['TC-EDG-CRT-002', 'Web Store', 'Cart', 'Exceed Stock Limit', 'Product has 5 items in stock', '1. Add 6 items of same product to cart', 'Validation error "Not enough stock available" is displayed', ''],
  ['TC-EDG-CRT-003', 'Web Store', 'Cart', 'Overlapping Rentals', 'Rental item in cart for Aug 1-3', '1. Add same rental item for Aug 2-4', 'Validation error "Dates overlap with existing item in cart"', ''],
  ['TC-EDG-CHK-001', 'Web Store', 'Checkout', 'Invalid ZIP Code', 'Items in cart', '1. Enter alphanumeric ZIP code in address\\n2. Proceed', 'Validation error on ZIP code field', ''],
  ['TC-EDG-CHK-002', 'Web Store', 'Checkout', 'Promo Code - Minimum Spend', 'Cart total is 500', '1. Apply promo code requiring 1000 spend', 'Error message "Minimum spend requirement not met"', ''],

  // ADMIN ROLES & RBAC
  ['TC-RBC-ADM-001', 'Web Admin', 'Security', 'Fulfillment Role Restrictions', 'Logged in as FULFILLMENT user', '1. Try to access /dashboard/users', '403 Forbidden or UI hides the Users tab', ''],
  ['TC-RBC-ADM-002', 'Web Admin', 'Security', 'Fulfillment Role Allowed', 'Logged in as FULFILLMENT user', '1. Access /dashboard/orders', 'Access granted, can update order statuses', ''],
  
  // MISC PLATFORM FEATURES
  ['TC-MIS-INV-001', 'Web Admin', 'Orders', 'Generate PDF Invoice', 'Order exists', '1. Open order details\\n2. Click Download Invoice', 'PDF file downloads successfully with correct tax split and company details', ''],
  ['TC-MIS-PWD-001', 'Web Store', 'Auth', 'Forgot Password', 'None', '1. Click "Forgot Password" on login\\n2. Enter valid email', 'Reset email dispatched with secure token link', ''],
  ['TC-MIS-PWD-002', 'Web Store', 'Auth', 'Reset Password', 'Received reset link', '1. Click link\\n2. Enter new password', 'Password updated successfully, old password invalidated', '']
];

let csvContent = '"Test Case ID","Application","Module","Test Scenario","Pre-conditions","Test Steps","Expected Result","Status"\n';

testCases.forEach(row => {
  const formattedRow = row.map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',');
  csvContent += formattedRow + '\n';
});

fs.writeFileSync('docs/TEST_CASES.csv', csvContent, 'utf8');
console.log('Successfully wrote ' + testCases.length + ' test cases to docs/TEST_CASES.csv');
