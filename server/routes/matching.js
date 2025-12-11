import express from 'express';
import { findMatches } from '../services/matchingService.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/matching/:entrepreneurId
// @desc    Get mentor matches for an entrepreneur
// @access  Private
router.get('/:entrepreneurId', auth, async (req, res) => {
  try {
    const matches = await findMatches(req.params.entrepreneurId);
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
