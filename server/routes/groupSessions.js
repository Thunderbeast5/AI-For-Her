import express from 'express';
import GroupSession from '../models/GroupSession.js';

const router = express.Router();

// Get all active group sessions (for entrepreneurs)
router.get('/active', async (req, res) => {
  try {
    const sessions = await GroupSession.find({ 
      status: { $in: ['active', 'upcoming'] },
      isPublic: true 
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
});

// Get sessions by mentor ID
router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const sessions = await GroupSession.find({ mentorId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    res.status(500).json({ message: 'Error fetching mentor sessions', error: error.message });
  }
});

// Get sessions by participant ID
router.get('/participant/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await GroupSession.find({ 
      'currentParticipants.userId': userId 
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching participant sessions:', error);
    res.status(500).json({ message: 'Error fetching participant sessions', error: error.message });
  }
});

// Get single session by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await GroupSession.findById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
});

// Create new group session
router.post('/', async (req, res) => {
  try {
    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.groupName || !sessionData.mentorId || !sessionData.sector) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Ensure price is greater than 0 for paid sessions
    if (!sessionData.price || sessionData.price <= 0) {
      return res.status(400).json({ message: 'Group sessions must have a price greater than ₹0' });
    }
    
    const newSession = new GroupSession(sessionData);
    await newSession.save();
    
    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
});

// Update group session
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const session = await GroupSession.findById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Only mentor can update their session
    if (session.mentorId !== updateData.mentorId) {
      return res.status(403).json({ message: 'Unauthorized to update this session' });
    }
    
    // Ensure price stays greater than 0
    if (updateData.price !== undefined && updateData.price <= 0) {
      return res.status(400).json({ message: 'Group sessions must have a price greater than ₹0' });
    }
    
    const updatedSession = await GroupSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
});

// Delete group session
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.query;
    
    const session = await GroupSession.findById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Only mentor can delete their session
    if (session.mentorId !== mentorId) {
      return res.status(403).json({ message: 'Unauthorized to delete this session' });
    }
    
    await GroupSession.findByIdAndDelete(id);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
});

// Join group session (enroll with payment)
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;
    
    const session = await GroupSession.findById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if already enrolled
    const alreadyEnrolled = session.currentParticipants.some(p => p.userId === userId);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this session' });
    }
    
    // Check if session is full
    if (session.currentParticipants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is full' });
    }
    
    // Add participant
    session.currentParticipants.push({
      userId,
      userName,
      joinedAt: new Date(),
      paymentStatus: 'completed'
    });
    
    // Update revenue
    session.totalRevenue = (session.totalRevenue || 0) + session.price;
    
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ message: 'Error joining session', error: error.message });
  }
});

// Leave group session
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const session = await GroupSession.findById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Remove participant
    session.currentParticipants = session.currentParticipants.filter(
      p => p.userId !== userId
    );
    
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('Error leaving session:', error);
    res.status(500).json({ message: 'Error leaving session', error: error.message });
  }
});

// Add session recording/materials
router.post('/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionData = req.body;
    
    const groupSession = await GroupSession.findById(id);
    
    if (!groupSession) {
      return res.status(404).json({ message: 'Group session not found' });
    }
    
    groupSession.sessions.push(sessionData);
    await groupSession.save();
    
    res.json(groupSession);
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ message: 'Error adding session', error: error.message });
  }
});

export default router;
