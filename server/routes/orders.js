import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/orders - list orders, optionally filtered by ownerId
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = ownerId ? { owners: ownerId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/orders - create a new order
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (totalAmount == null) {
      return res.status(400).json({ message: 'totalAmount is required' });
    }

    // Generate a simple order number
    const orderNumber = `ORD-${Date.now()}`;

    // Derive owners (entrepreneur userIds) from products
    const ownerIds = new Set();
    for (const item of items) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId).select('userId');
      if (product?.userId) {
        ownerIds.add(String(product.userId));
      }
    }

    const order = new Order({
      items,
      totalAmount,
      orderNumber,
      owners: Array.from(ownerIds),
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
