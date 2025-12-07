import express from 'express';
import Startup from '../models/Startup.js';

const router = express.Router();

// Get all startups
router.get('/', async (req, res) => {
  try {
    const startups = await Startup.find({ visibility: 'public', status: 'active' });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get startups by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const startups = await Startup.find({ userId: req.params.userId });
    res.json({ success: true, data: startups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get startup by ID
router.get('/:id', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create startup
router.post('/', async (req, res) => {
  try {
    const startup = new Startup(req.body);
    await startup.save();
    res.status(201).json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update startup
router.put('/:id', async (req, res) => {
  try {
    const startup = await Startup.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete startup
router.delete('/:id', async (req, res) => {
  try {
    await Startup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Startup deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
