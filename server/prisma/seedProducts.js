import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log('No categories found. Run seed.js first.');
    return;
  }

  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });

  const sampleProducts = [
    {
      name: 'Classic Tailored Blazer',
      description: 'Sophisticated single-breasted wool-blend blazer designed for timeless elegance.',
      price: 4999,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
      ],
      categoryId: catMap['men-clothing'] || categories[0].id,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy Blue', 'Charcoal']
    },
    {
      name: 'Oversized Silk Evening Dress',
      description: 'Flowing pure silk maxi dress with a flattering silhouette and deep V-neckline.',
      price: 6499,
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
      ],
      categoryId: catMap['women-clothing'] || categories[0].id,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Emerald Green', 'Champagne', 'Ruby Red']
    },
    {
      name: 'Handcrafted Leather Loafers',
      description: 'Italian leather loafers featuring premium Goodyear welt construction and cushioned insole.',
      price: 5299,
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'
      ],
      categoryId: catMap['shoes'] || categories[0].id,
      sizes: ['7', '8', '9', '10', '11'],
      colors: ['Cognac Brown', 'Obsidian Black']
    },
    {
      name: 'Minimalist Gold Chronograph Watch',
      description: 'Ultra-slim stainless steel case with sapphire crystal glass and genuine leather strap.',
      price: 8999,
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
      ],
      categoryId: catMap['accessories'] || categories[0].id,
      sizes: ['One Size'],
      colors: ['Rose Gold', 'Matte Black', 'Silver']
    },
    {
      name: 'Vintage Distressed Denim Jacket',
      description: 'Heavyweight washed denim jacket with sherpa collar and antique brass hardware.',
      price: 3499,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=800&q=80'
      ],
      categoryId: catMap['men-clothing'] || categories[0].id,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Washed Indigo', 'Faded Black']
    },
    {
      name: 'Chunky Sole Street Sneakers',
      description: 'Contemporary streetwear runners with breathable mesh upper and lightweight EVA sole.',
      price: 4199,
      stock: 22,
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'
      ],
      categoryId: catMap['shoes'] || categories[0].id,
      sizes: ['6', '7', '8', '9', '10'],
      colors: ['Triple White', 'Panda Black/White']
    }
  ];

  for (const prod of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }

  console.log(`✅ ${sampleProducts.length} sample fashion products inserted into database!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
