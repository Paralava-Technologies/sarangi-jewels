const fs = require('fs');
let schema = fs.readFileSync('apps/api/prisma/schema.prisma', 'utf8');

// Update Order
schema = schema.replace(
  /payment\s+Payment\?/,
  `paymentId      String?      @map("payment_id")\n  payment        Payment?     @relation(fields: [paymentId], references: [id])`
);

// Update Payment
schema = schema.replace(
  /orderId\s+String\s+@unique\s+@map\("order_id"\)/,
  ``
);
schema = schema.replace(
  /order\s+Order\s+@relation\(fields:\s*\[orderId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade\)/,
  `orders Order[]`
);

fs.writeFileSync('apps/api/prisma/schema.prisma', schema);
