import { Router } from 'express';
import prisma from '../config/db.js';
import auth from '../middleware/auth.js';

const router = Router();

// All cart routes require authentication
router.use(auth);

// GET /api/cart — get user's cart items
router.get('/', async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            sizes: true,
            colors: true,
          },
        },
      },
    });

    return res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/cart or /api/cart/add — add or upsert a cart item
router.post(['/', '/add'], async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock.` });
    }

    // Check if the same combination already exists
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        size: size ?? null,
        color: color ?? null,
      },
    });

    let cartItem;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock.` });
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: { select: { id: true, name: true, price: true, images: true, stock: true } } },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
          size: size ?? null,
          color: color ?? null,
        },
        include: { product: { select: { id: true, name: true, price: true, images: true, stock: true } } },
      });
    }

    return res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/cart/:id — update quantity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    const product = await prisma.product.findUnique({ where: { id: cartItem.productId } });
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock.` });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: { select: { id: true, name: true, price: true, images: true, stock: true } } },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/cart — clear entire cart (must be before /:id)
router.delete('/', async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    return res.json({ message: 'Cart cleared.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/cart/:id — remove one item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await prisma.cartItem.delete({ where: { id } });
    return res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
