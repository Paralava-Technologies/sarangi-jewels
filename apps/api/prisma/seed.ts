import { PrismaClient, ProductStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const IMG = (_text?: string, _bg?: string, _fg?: string) =>
  `/public/uploads/placeholder.png`;

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  basePriceCents: number;
  material?: string;
  purity?: string;
  gemstone?: string;
  weightGrams?: number;
  careInstructions?: string;
  imageText: string;
  sku: string;
  stock?: number;
};

const PRODUCTS: ProductSeed[] = [
  {
    slug: 'gold-pendant-classic',
    name: 'Gold Pendant — Classic',
    description:
      'An 18K gold pendant with a timeless silhouette. Perfect for everyday elegance or layered with chains.',
    categorySlug: 'pendants',
    basePriceCents: 2499900,
    material: 'Gold',
    purity: '18K',
    weightGrams: 4.2,
    careInstructions: 'Store in a dry pouch. Avoid direct contact with perfumes.',
    imageText: 'Gold Pendant',
    sku: 'GPC-001',
  },
  {
    slug: 'rose-gold-heart-pendant',
    name: 'Rose Gold Heart Pendant',
    description: 'Delicate heart motif in warm rose gold — a romantic gift or self-indulgent treat.',
    categorySlug: 'pendants',
    basePriceCents: 1899900,
    material: 'Rose gold',
    purity: '14K',
    weightGrams: 3.1,
    careInstructions: 'Wipe with a soft cloth after wear.',
    imageText: 'Heart Pendant',
    sku: 'RGH-002',
  },
  {
    slug: 'emerald-drop-pendant',
    name: 'Emerald Drop Pendant',
    description: 'Faceted emerald teardrop set in gold — statement piece for evening wear.',
    categorySlug: 'pendants',
    basePriceCents: 4599900,
    material: 'Gold',
    purity: '18K',
    gemstone: 'Emerald',
    weightGrams: 5.8,
    imageText: 'Emerald Pendant',
    sku: 'EDP-003',
  },
  {
    slug: 'diamond-stud-earrings',
    name: 'Diamond Stud Earrings',
    description: 'Brilliant-cut diamonds in a classic four-prong setting. Sold as a pair.',
    categorySlug: 'jewellery',
    basePriceCents: 8999900,
    material: 'White gold',
    purity: '18K',
    gemstone: 'Diamond',
    weightGrams: 2.4,
    imageText: 'Diamond Studs',
    sku: 'DSE-010',
  },
  {
    slug: 'pearl-strand-necklace',
    name: 'Cultured Pearl Strand',
    description: 'Lustrous freshwater pearls hand-knotted on silk — refined and versatile.',
    categorySlug: 'jewellery',
    basePriceCents: 3299900,
    material: 'Pearl',
    gemstone: 'Freshwater pearl',
    weightGrams: 28,
    imageText: 'Pearl Necklace',
    sku: 'PSN-011',
  },
  {
    slug: 'gold-bangle-twist',
    name: 'Twist Gold Bangle',
    description: 'Sculptural twist design in hallmarked gold. Slips on for effortless glamour.',
    categorySlug: 'jewellery',
    basePriceCents: 5499900,
    material: 'Gold',
    purity: '22K',
    weightGrams: 18.5,
    imageText: 'Gold Bangle',
    sku: 'GBT-012',
  },
  {
    slug: 'ruby-cocktail-ring',
    name: 'Ruby Cocktail Ring',
    description: 'Oval ruby centre stone with diamond halo — bold colour for special occasions.',
    categorySlug: 'jewellery',
    basePriceCents: 6799900,
    material: 'Gold',
    purity: '18K',
    gemstone: 'Ruby',
    weightGrams: 6.2,
    imageText: 'Ruby Ring',
    sku: 'RCR-013',
  },
  {
    slug: 'silver-chain-bracelet',
    name: 'Sterling Silver Chain Bracelet',
    description: 'Minimal link bracelet in rhodium-plated sterling silver. Layer-friendly.',
    categorySlug: 'jewellery',
    basePriceCents: 899900,
    material: 'Sterling silver',
    purity: '925',
    weightGrams: 12,
    imageText: 'Silver Bracelet',
    sku: 'SCB-014',
  },
  {
    slug: 'jewellery-care-kit',
    name: 'Sarangi Jewels Jewellery Care Kit',
    description:
      'Polishing cloth, gentle cleaning solution, and soft brush — everything to maintain your pieces.',
    categorySlug: 'care-accessories',
    basePriceCents: 149900,
    careInstructions: 'Follow included guide. Keep solution away from porous stones.',
    imageText: 'Care Kit',
    sku: 'JCK-020',
  },
  {
    slug: 'velvet-jewellery-box',
    name: 'Velvet Jewellery Box',
    description: 'Compact travel box with ring rolls and necklace hook. Available in plum or gold trim.',
    categorySlug: 'care-accessories',
    basePriceCents: 249900,
    imageText: 'Jewellery Box',
    sku: 'VJB-021',
  },
  {
    slug: 'organizer-tray-set',
    name: 'Drawer Organizer Tray Set',
    description: 'Modular velvet trays for rings, earrings, and chains — keeps dressing tables tidy.',
    categorySlug: 'care-accessories',
    basePriceCents: 199900,
    imageText: 'Organizer Set',
    sku: 'OTS-022',
  },
  {
    slug: 'ultrasonic-cleaner-mini',
    name: 'Mini Ultrasonic Cleaner',
    description: 'Gentle ultrasonic bath for gold and silver. Not suitable for soft gemstones.',
    categorySlug: 'care-accessories',
    basePriceCents: 399900,
    imageText: 'Cleaner Mini',
    sku: 'UCM-023',
  },
];

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const customerPassword = await bcrypt.hash('Customer123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@noeve.local' },
    update: {},
    create: {
      email: 'admin@noeve.local',
      passwordHash: adminPassword,
      firstName: 'Sarangi Jewels',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@noeve.local' },
    update: {},
    create: {
      email: 'customer@noeve.local',
      passwordHash: customerPassword,
      firstName: 'Demo',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'jewellery' },
      update: {},
      create: {
        name: 'Jewellery',
        slug: 'jewellery',
        description: 'Fine jewellery — earrings, necklaces, rings & bangles',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'pendants' },
      update: {},
      create: {
        name: 'Pendants',
        slug: 'pendants',
        description: 'Elegant pendants in gold and gemstone',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'care-accessories' },
      update: {},
      create: {
        name: 'Care & Accessories',
        slug: 'care-accessories',
        description: 'Storage, cleaning & care for your collection',
        sortOrder: 3,
      },
    }),
  ]);

  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  for (const p of PRODUCTS) {
    const category = categoryBySlug[p.categorySlug];
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        status: ProductStatus.ACTIVE,
        basePriceCents: p.basePriceCents,
        material: p.material,
        purity: p.purity,
        gemstone: p.gemstone,
        weightGrams: p.weightGrams,
        careInstructions: p.careInstructions,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: ProductStatus.ACTIVE,
        categoryId: category.id,
        basePriceCents: p.basePriceCents,
        currency: 'INR',
        material: p.material,
        purity: p.purity,
        gemstone: p.gemstone,
        weightGrams: p.weightGrams,
        careInstructions: p.careInstructions,
        images: {
          create: [
            {
              url: IMG(p.imageText),
              alt: p.name,
              sortOrder: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              sku: p.sku,
              name: 'Default',
              priceCents: p.basePriceCents,
              stockQuantity: p.stock ?? 25,
            },
          ],
        },
      },
    });
  }

  console.log(`Seed complete — ${PRODUCTS.length} products.`);
  console.log('  Admin:    admin@noeve.local / Admin123!');
  console.log('  Customer: customer@noeve.local / Customer123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
