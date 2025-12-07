import express from 'express';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();

// Get all messages for a connection
router.get('/connection/:connectionId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ 
      connectionId: req.params.connectionId 
    }).sort({ createdAt: 1 });
    
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const message = new ChatMessage(req.body);
    await message.save();
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/read/:connectionId/:userId', async (req, res) => {
  try {
    await ChatMessage.updateMany(
      { 
        connectionId: req.params.connectionId,
        senderId: { $ne: req.params.userId },
        read: false
      },
      { read: true }
    );
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread message count
router.get('/unread/:userId', async (req, res) => {
  try {
    const count = await ChatMessage.countDocuments({
      senderId: { $ne: req.params.userId },
      read: false
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
