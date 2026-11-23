import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
