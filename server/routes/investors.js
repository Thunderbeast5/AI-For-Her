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

// Save a project
router.post('/:userId/save-project/:projectId', async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.params.userId });
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    // Check if project is already saved
    if (investor.savedProjects.includes(req.params.projectId)) {
      return res.status(400).json({ message: 'Project already saved' });
    }

    investor.savedProjects.push(req.params.projectId);
    investor.updatedAt = new Date();
    await investor.save();

    res.json({ message: 'Project saved successfully', savedProjects: investor.savedProjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unsave a project
router.delete('/:userId/save-project/:projectId', async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.params.userId });
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    investor.savedProjects = investor.savedProjects.filter(
      id => id.toString() !== req.params.projectId
    );
    investor.updatedAt = new Date();
    await investor.save();

    res.json({ message: 'Project unsaved successfully', savedProjects: investor.savedProjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get saved projects
router.get('/:userId/saved-projects', async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.params.userId })
      .populate({
        path: 'savedProjects',
        populate: {
          path: 'startupId',
          model: 'Startup'
        }
      });
    
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    res.json(investor.savedProjects || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
