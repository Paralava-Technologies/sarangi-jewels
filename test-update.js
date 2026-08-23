const { z } = require('./packages/validation/dist/index.js');
console.log(z.object({ rentPriceCents: z.number().nullable().optional() }).safeParse({ rentPriceCents: null }));
