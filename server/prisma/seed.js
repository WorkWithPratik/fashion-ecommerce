import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Men Clothing', slug: 'men-clothing', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Women Clothing', slug: 'women-clothing', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Footwear & Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Initial fashion categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
