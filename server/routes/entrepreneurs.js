import express from 'express';
import Entrepreneur from '../models/Entrepreneur.js';

const router = express.Router();

// Get entrepreneur by userId
router.get('/:userId', async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOne({ userId: req.params.userId });
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }
    res.json(entrepreneur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update entrepreneur
router.put('/:userId', async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOneAndUpdate(
      { userId: req.params.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(entrepreneur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete entrepreneur
router.delete('/:userId', async (req, res) => {
  try {
    await Entrepreneur.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: 'Entrepreneur deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
