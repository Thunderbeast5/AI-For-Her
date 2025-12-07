import express from 'express';
import MentorGroup from '../models/MentorGroup.js';

const router = express.Router();

// Get all active groups (for entrepreneurs)
router.get('/active', async (req, res) => {
  try {
    const groups = await MentorGroup.find({ 
      status: { $in: ['active', 'upcoming'] },
      isPublic: true 
    }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching active groups:', error);
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
});

// Get groups by mentor ID
router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const groups = await MentorGroup.find({ mentorId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching mentor groups:', error);
    res.status(500).json({ message: 'Error fetching mentor groups', error: error.message });
  }
});

// Get groups by participant ID
router.get('/participant/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await MentorGroup.find({ 
      'currentParticipants.userId': userId 
    }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching participant groups:', error);
    res.status(500).json({ message: 'Error fetching participant groups', error: error.message });
  }
});

// Get single group by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Error fetching group', error: error.message });
  }
});

// Create new group
router.post('/', async (req, res) => {
  try {
    const groupData = req.body;
    
    // Validate required fields
    if (!groupData.groupName || !groupData.mentorId || !groupData.sector) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newGroup = new MentorGroup(groupData);
    await newGroup.save();
    
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
});

// Update group
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Only mentor can update their group
    if (group.mentorId !== updateData.mentorId) {
      return res.status(403).json({ message: 'Unauthorized to update this group' });
    }
    
    const updatedGroup = await MentorGroup.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Error updating group', error: error.message });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.query;
    
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Only mentor can delete their group
    if (group.mentorId !== mentorId) {
      return res.status(403).json({ message: 'Unauthorized to delete this group' });
    }
    
    await MentorGroup.findByIdAndDelete(id);
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Error deleting group', error: error.message });
  }
});

// Join group
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ message: 'Missing userId or userName' });
    }
    
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    if (group.status === 'completed' || group.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot join a completed or cancelled group' });
    }
    
    try {
      await group.addParticipant(userId, userName);
      res.json(group);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Error joining group', error: error.message });
  }
});

// Leave group
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }
    
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    await group.removeParticipant(userId);
    res.json(group);
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
});

// Add session to group
router.post('/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionData = req.body;
    
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    group.sessions.push(sessionData);
    await group.save();
    
    res.json(group);
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ message: 'Error adding session', error: error.message });
  }
});

// Add review to group
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const reviewData = req.body;
    
    const group = await MentorGroup.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a participant
    const isParticipant = group.currentParticipants.some(p => p.userId === reviewData.userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Only participants can leave reviews' });
    }
    
    group.reviews.push(reviewData);
    
    // Update average rating
    const avgRating = group.reviews.reduce((sum, r) => sum + r.rating, 0) / group.reviews.length;
    group.rating = Math.round(avgRating * 10) / 10;
    
    await group.save();
    
    res.json(group);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

export default router;
