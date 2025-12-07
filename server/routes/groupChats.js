import express from 'express';
import GroupChat from '../models/GroupChat.js';
import MentorGroup from '../models/MentorGroup.js';

const router = express.Router();

// Get or create group chat for a mentor group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    let groupChat = await GroupChat.findOne({ groupId });
    
    if (!groupChat) {
      // Get group details to create chat
      const group = await MentorGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      // Create new group chat with participants including the mentor/admin
      const participants = [
        // Add mentor as first participant (admin)
        {
          userId: group.mentorId,
          userName: group.mentorName,
          joinedAt: group.createdAt || new Date()
        },
        // Add all other participants
        ...group.currentParticipants.map(p => ({
          userId: p.userId,
          userName: p.userName,
          joinedAt: p.joinedAt
        }))
      ];

      // Remove duplicates in case mentor is also in currentParticipants
      const uniqueParticipants = participants.filter((participant, index, self) =>
        index === self.findIndex((p) => p.userId === participant.userId)
      );

      groupChat = new GroupChat({
        groupId: group._id,
        groupName: group.groupName,
        mentorId: group.mentorId,
        participants: uniqueParticipants
      });
      await groupChat.save();
    } else {
      // Update existing chat to ensure mentor is in participants
      const group = await MentorGroup.findById(groupId);
      if (group) {
        const mentorInParticipants = groupChat.participants.some(p => p.userId === group.mentorId);
        if (!mentorInParticipants) {
          groupChat.participants.unshift({
            userId: group.mentorId,
            userName: group.mentorName,
            joinedAt: group.createdAt || new Date()
          });
          await groupChat.save();
        }
      }
    }
    
    res.json(groupChat);
  } catch (error) {
    console.error('Error fetching group chat:', error);
    res.status(500).json({ message: 'Error fetching group chat', error: error.message });
  }
});

// Send message to group chat
router.post('/group/:groupId/message', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, senderName, message } = req.body;
    
    const groupChat = await GroupChat.findOne({ groupId });
    
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }
    
    // Check if user is participant or mentor/admin
    const isParticipant = groupChat.participants.some(p => p.userId === senderId);
    const isMentor = groupChat.mentorId === senderId;
    
    if (!isParticipant && !isMentor) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }
    
    groupChat.messages.push({
      senderId,
      senderName,
      message,
      timestamp: new Date()
    });
    
    await groupChat.save();
    
    res.json(groupChat);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark messages as read
router.post('/group/:groupId/read', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    const groupChat = await GroupChat.findOne({ groupId });
    
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }
    
    // Mark all messages as read for this user
    groupChat.messages.forEach(msg => {
      if (msg.senderId !== userId && !msg.readBy.some(r => r.userId === userId)) {
        msg.readBy.push({ userId, readAt: new Date() });
      }
    });
    
    await groupChat.save();
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

// Add participant to group chat
router.post('/group/:groupId/participant', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, userName } = req.body;
    
    const groupChat = await GroupChat.findOne({ groupId });
    
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }
    
    // Check if already participant
    const exists = groupChat.participants.some(p => p.userId === userId);
    if (!exists) {
      groupChat.participants.push({ userId, userName });
      await groupChat.save();
    }
    
    res.json(groupChat);
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ message: 'Error adding participant', error: error.message });
  }
});

// Remove participant from group chat
router.delete('/group/:groupId/participant/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    
    const groupChat = await GroupChat.findOne({ groupId });
    
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }
    
    groupChat.participants = groupChat.participants.filter(p => p.userId !== userId);
    await groupChat.save();
    
    res.json({ message: 'Participant removed' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ message: 'Error removing participant', error: error.message });
  }
});

// Get user's group chats
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const groupChats = await GroupChat.find({
      'participants.userId': userId,
      isActive: true
    }).sort({ updatedAt: -1 });
    
    res.json(groupChats);
  } catch (error) {
    console.error('Error fetching user group chats:', error);
    res.status(500).json({ message: 'Error fetching group chats', error: error.message });
  }
});

export default router;
