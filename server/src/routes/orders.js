import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../config/db.js';
import auth from '../middleware/auth.js';
import { generateOrderId } from '../utils/generateOrderId.js';

const router = Router();

// All order routes require authentication
router.use(auth);

const getRazorpayInstance = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// POST /api/orders/create-razorpay-order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Delivery address is required.' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: { select: { id: true, name: true, price: true, stock: true } },
      },
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Validate stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}.`,
        });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ message: 'Failed to create payment order.' });
  }
});

// POST /api/orders/verify-payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !address) {
      return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { select: { id: true, price: true, stock: true } } },
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderId = generateOrderId();

    // Create order and items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderId,
          userId: req.user.id,
          total,
          status: 'PAID',
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          address,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              size: item.size ?? null,
              color: item.color ?? null,
            })),
          },
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, images: true } } },
          },
        },
      });

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/orders — user's orders, newest first
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true } } },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true, description: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
