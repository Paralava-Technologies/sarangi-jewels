fetch('http://localhost:3001/v1/admin/products/8364d42b-f033-41e8-91b4-6c3e8506deaa', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Product',
    slug: 'test-product',
    categoryId: '11111111-1111-1111-1111-111111111111',
    basePriceCents: 1000,
    rentPriceCents: null
  })
}).then(async r => console.log(r.status, await r.text()));
