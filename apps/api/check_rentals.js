const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.orderLine.count({ where: { isRental: true } });
  console.log("Rental Count:", count);
  const rentals = await prisma.orderLine.findMany({ where: { isRental: true } });
  console.log("Rentals:", rentals);
}
check().finally(() => prisma.$disconnect());
