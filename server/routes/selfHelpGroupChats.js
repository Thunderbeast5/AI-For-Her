import express from 'express';
import SelfHelpGroupChat from '../models/SelfHelpGroupChat.js';
import SelfHelpGroup from '../models/SelfHelpGroup.js';

const router = express.Router();

// Get or create chat for a self-help group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    let groupChat = await SelfHelpGroupChat.findOne({ groupId });

    if (!groupChat) {
      // Get group details to create chat
      const group = await SelfHelpGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      // Create new group chat with participants
      groupChat = new SelfHelpGroupChat({
        groupId,
        groupName: group.name,
        participants: group.members.map(member => ({
          userId: member.userId,
          userName: member.name,
          role: member.role
        })),
        messages: []
      });
      await groupChat.save();
    }

    res.json(groupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message in self-help group chat
router.post('/group/:groupId/message', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, senderName, message } = req.body;

    const groupChat = await SelfHelpGroupChat.findOne({ groupId });
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    // Add message
    groupChat.messages.push({
      senderId,
      senderName,
      message,
      timestamp: new Date(),
      isRead: false,
      readBy: []
    });

    await groupChat.save();
    res.json(groupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.patch('/group/:groupId/read', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const groupChat = await SelfHelpGroupChat.findOne({ groupId });
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    // Mark messages as read
    groupChat.messages.forEach(msg => {
      if (msg.senderId !== userId && !msg.readBy.some(r => r.userId === userId)) {
        msg.readBy.push({
          userId,
          readAt: new Date()
        });
      }
    });

    await groupChat.save();
    res.json(groupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a message (sender only)
router.delete('/group/:groupId/message/:messageId', async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const { userId } = req.body;

    const groupChat = await SelfHelpGroupChat.findOne({ groupId });
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    const message = groupChat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    message.remove();
    await groupChat.save();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread message count for user
router.get('/group/:groupId/unread/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const groupChat = await SelfHelpGroupChat.findOne({ groupId });
    if (!groupChat) {
      return res.json({ unreadCount: 0 });
    }

    const unreadCount = groupChat.messages.filter(
      msg => msg.senderId !== userId && !msg.readBy.some(r => r.userId === userId)
    ).length;

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
