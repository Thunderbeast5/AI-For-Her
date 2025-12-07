import express from 'express';
import Connection from '../models/Connection.js';
import Mentor from '../models/Mentor.js';

const router = express.Router();

// Get all connections for a user (entrepreneur or mentor)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;
    
    let connections;
    if (role === 'entrepreneur') {
      connections = await Connection.find({ entrepreneurId: userId }).sort({ createdAt: -1 });
    } else if (role === 'mentor') {
      connections = await Connection.find({ mentorId: userId }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: 'Role parameter required' });
    }
    
    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific connection
router.get('/:id', async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new connection request
router.post('/', async (req, res) => {
  try {
    const connection = new Connection(req.body);
    await connection.save();
    
    // Update mentor's total connections
    if (connection.status === 'active') {
      await Mentor.findOneAndUpdate(
        { userId: connection.mentorId },
        { $inc: { totalConnections: 1 } }
      );
    }
    
    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update connection (accept/complete/cancel, update payment)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    
    const connection = await Connection.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    // Update mentor stats if status changed to active
    if (updates.status === 'active' && req.body.status === 'active') {
      await Mentor.findOneAndUpdate(
        { userId: connection.mentorId },
        { $inc: { totalConnections: 1 } }
      );
    }
    
    res.json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if connection exists between entrepreneur and mentor
router.get('/check/:entrepreneurId/:mentorId', async (req, res) => {
  try {
    const { entrepreneurId, mentorId } = req.params;
    const connection = await Connection.findOne({
      entrepreneurId,
      mentorId,
      status: { $in: ['pending', 'active'] }
    });
    
    res.json({ 
      success: true, 
      exists: !!connection,
      connection: connection || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete connection
router.delete('/:id', async (req, res) => {
  try {
    const connection = await Connection.findByIdAndDelete(req.params.id);
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json({ success: true, message: 'Connection deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept connection request (mentor action)
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await Connection.findByIdAndUpdate(
      id,
      { 
        status: 'pending', // Keep pending until payment
        acceptedAt: new Date()
      },
      { new: true }
    );
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    res.json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject connection request (mentor action)
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const connection = await Connection.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        rejectionReason: reason
      },
      { new: true }
    );
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    res.json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete payment and activate connection
router.post('/:id/complete-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentId, paymentAmount } = req.body;
    
    const connection = await Connection.findByIdAndUpdate(
      id,
      { 
        status: 'active',
        paymentStatus: 'completed',
        paymentId,
        paymentAmount
      },
      { new: true }
    );
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    // Update mentor's total connections
    await Mentor.findOneAndUpdate(
      { userId: connection.mentorId },
      { $inc: { totalConnections: 1 } }
    );
    
    res.json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
