import express from 'express';
import Investor from '../models/Investor.js';

const router = express.Router();

// Get investor by userId
router.get('/:userId', async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.params.userId });
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    res.json(investor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update investor
router.put('/:userId', async (req, res) => {
  try {
    const investor = await Investor.findOneAndUpdate(
      { userId: req.params.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(investor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete investor
router.delete('/:userId', async (req, res) => {
  try {
    await Investor.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: 'Investor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
