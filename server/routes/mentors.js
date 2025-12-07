import express from 'express';
import Mentor from '../models/Mentor.js';

const router = express.Router();

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find({ availability: true });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor by userId
router.get('/:userId', async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.params.userId });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update mentor
router.put('/:userId', async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndUpdate(
      { userId: req.params.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete mentor
router.delete('/:userId', async (req, res) => {
  try {
    await Mentor.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: 'Mentor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
