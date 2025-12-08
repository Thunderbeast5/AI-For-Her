import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products/public - public storefront (all products)
router.get('/public', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/products?userId=... - entrepreneur's own products
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required' });
    }

    const products = await Product.find({ userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { userId, name, description, price, category, imageUrl, tags } = req.body;

    if (!userId || !name || price == null || !category) {
      return res.status(400).json({ message: 'userId, name, price and category are required' });
    }

    const product = new Product({
      userId,
      name,
      description: description || '',
      price,
      category,
      imageUrl: imageUrl || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/products/:id - update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, tags } = req.body;

    const update = {
      ...(name != null && { name }),
      ...(description != null && { description }),
      ...(price != null && { price }),
      ...(category != null && { category }),
      ...(imageUrl != null && { imageUrl }),
      ...(tags != null && { tags }),
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
