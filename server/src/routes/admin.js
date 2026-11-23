import { Router } from 'express';
import prisma from '../config/db.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { upload } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

// All admin routes require auth + admin role
router.use(auth, adminAuth);

// ─── DASHBOARD ─────────────────────────────────────────────────────────────

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, paidOrders, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'PAID' },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { id: true } },
        },
      }),
    ]);

    return res.json({
      totalOrders,
      revenue: paidOrders._sum.total || 0,
      totalProducts,
      totalUsers,
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ─── PRODUCTS ───────────────────────────────────────────────────────────────

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.product.count(),
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
    console.error('Admin get products error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/admin/products — create product with Cloudinary image upload
router.post('/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, sizes, colors } = req.body;

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ message: 'name, description, price, and categoryId are required.' });
    }

    const imageUrls = req.files ? req.files.map((f) => f.path) : [];

    const parsedSizes = sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : [];
    const parsedColors = colors ? (Array.isArray(colors) ? colors : JSON.parse(colors)) : [];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        images: imageUrls,
        categoryId,
        sizes: parsedSizes,
        colors: parsedColors,
      },
      include: { category: true },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/admin/products/:id — update product
router.put('/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, sizes, colors, replaceImages } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const newImageUrls = req.files ? req.files.map((f) => f.path) : [];

    // Replace or append images
    let finalImages;
    if (replaceImages === 'true' || replaceImages === true) {
      // Delete old Cloudinary images
      for (const imgUrl of existing.images) {
        try {
          const publicId = imgUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`fashion-ecom/${publicId}`);
        } catch (e) {
          console.error('Cloudinary delete error:', e.message);
        }
      }
      finalImages = newImageUrls;
    } else {
      finalImages = [...existing.images, ...newImageUrls];
    }

    const updateData = { images: finalImages };
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (categoryId) updateData.categoryId = categoryId;
    if (sizes) updateData.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
    if (colors) updateData.colors = Array.isArray(colors) ? colors : JSON.parse(colors);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/admin/products/:id — delete product and its Cloudinary images
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Delete images from Cloudinary
    for (const imgUrl of product.images) {
      try {
        // Extract public_id — Cloudinary URLs end with /folder/public_id.ext
        const parts = imgUrl.split('/');
        const fileWithExt = parts[parts.length - 1];
        const publicId = `fashion-ecom/${fileWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error('Cloudinary image delete error:', e.message);
      }
    }

    await prisma.product.delete({ where: { id } });

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ─── ORDERS ─────────────────────────────────────────────────────────────────

// GET /api/admin/orders — all orders with user info and item count
router.get('/orders', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { id: true } },
        },
      }),
      prisma.order.count(),
    ]);

    return res.json({
      orders,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/admin/orders/:id/status — update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}.` });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

// GET /api/admin/categories — all categories with product count
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/admin/categories — create category with optional image
router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'name and slug are required.' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const category = await prisma.category.create({
      data: { name, slug, image: imageUrl },
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Category name or slug already exists.' });
    }
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/admin/categories/:id — update category
router.put('/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (req.file) updateData.image = req.file.path;

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return res.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Category name or slug already exists.' });
    }
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/admin/categories/:id — delete if no products
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${category._count.products} product(s). Remove products first.`,
      });
    }

    await prisma.category.delete({ where: { id } });

    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
