const path = require('path');
const { PrismaClient: PrismaClientAPI } = require('./apps/api/node_modules/@prisma/client');

async function run() {
  const prisma = new PrismaClientAPI();
  const rentals = await prisma.orderLine.findMany({
    where: { isRental: true },
    include: { order: true }
  });
  console.log(JSON.stringify(rentals, null, 2));
}

run().catch(console.error);
