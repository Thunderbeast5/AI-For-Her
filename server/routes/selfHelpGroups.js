import express from 'express';
import SelfHelpGroup from '../models/SelfHelpGroup.js';
import SelfHelpGroupChat from '../models/SelfHelpGroupChat.js';

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await SelfHelpGroup.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get groups by user (member or admin)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await SelfHelpGroup.find({
      $or: [
        { adminId: userId },
        { 'members.userId': userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single group
router.get('/:id', async (req, res) => {
  try {
    const group = await SelfHelpGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, sector, goals, maxMembers, userId, userName, userEmail } = req.body;

    const group = new SelfHelpGroup({
      name,
      description,
      sector,
      goals,
      maxMembers: maxMembers || 10,
      adminId: userId,
      adminName: userName,
      adminEmail: userEmail,
      members: [{
        userId,
        name: userName,
        email: userEmail,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    const savedGroup = await group.save();

    // Create group chat for this self-help group in separate collection
    const groupChat = new SelfHelpGroupChat({
      groupId: savedGroup._id,
      groupName: savedGroup.name,
      participants: [{
        userId: userId,
        userName: userName,
        role: 'admin'
      }],
      messages: []
    });
    await groupChat.save();

    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Request to join a group
router.post('/:id/join-request', async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;
    const group = await SelfHelpGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if already a member
    if (group.members.some(m => m.userId === userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Check if already has pending request
    if (group.joinRequests.some(r => r.userId === userId && r.status === 'pending')) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    // Add join request
    group.joinRequests.push({
      userId,
      name: userName,
      email: userEmail,
      status: 'pending',
      requestedAt: new Date()
    });

    await group.save();
    res.json({ message: 'Join request sent successfully', group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get pending join requests for groups admin by user
router.get('/admin/:userId/requests', async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await SelfHelpGroup.find({ 
      adminId: userId,
      'joinRequests.status': 'pending'
    });

    const allRequests = [];
    groups.forEach(group => {
      const pendingRequests = group.joinRequests.filter(r => r.status === 'pending');
      pendingRequests.forEach(request => {
        allRequests.push({
          ...request.toObject(),
          groupId: group._id,
          groupName: group.name
        });
      });
    });

    res.json(allRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject join request
router.patch('/:id/join-request/:requestUserId', async (req, res) => {
  try {
    const { id, requestUserId } = req.params;
    const { status, adminId } = req.body; // status: 'approved' or 'rejected'

    const group = await SelfHelpGroup.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.adminId !== adminId) {
      return res.status(403).json({ message: 'Only group admin can approve/reject requests' });
    }

    // Find the request
    const requestIndex = group.joinRequests.findIndex(
      r => r.userId === requestUserId && r.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    const request = group.joinRequests[requestIndex];

    if (status === 'approved') {
      // Check if group is full
      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ message: 'Group is full' });
      }

      // Add to members
      group.members.push({
        userId: request.userId,
        name: request.name,
        email: request.email,
        role: 'member',
        joinedAt: new Date()
      });

      // Update group chat participants in separate collection
      await SelfHelpGroupChat.findOneAndUpdate(
        { groupId: id },
        {
          $push: {
            participants: {
              userId: request.userId,
              userName: request.name,
              role: 'member'
            }
          }
        }
      );
    }

    // Update request status
    group.joinRequests[requestIndex].status = status;
    group.joinRequests[requestIndex].respondedAt = new Date();
    group.joinRequests[requestIndex].respondedBy = adminId;

    await group.save();
    res.json({ message: `Request ${status} successfully`, group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove member from group (admin only)
router.delete('/:id/member/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { adminId } = req.body;

    const group = await SelfHelpGroup.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.adminId !== adminId) {
      return res.status(403).json({ message: 'Only group admin can remove members' });
    }

    // Cannot remove admin
    if (memberId === group.adminId) {
      return res.status(400).json({ message: 'Cannot remove group admin' });
    }

    // Remove member
    group.members = group.members.filter(m => m.userId !== memberId);

    // Remove from group chat in separate collection
    await SelfHelpGroupChat.findOneAndUpdate(
      { groupId: id },
      {
        $pull: {
          participants: { userId: memberId }
        }
      }
    );

    await group.save();
    res.json({ message: 'Member removed successfully', group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leave group
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const group = await SelfHelpGroup.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Admin cannot leave (must delete group or transfer admin)
    if (group.adminId === userId) {
      return res.status(400).json({ message: 'Admin cannot leave group. Delete the group or transfer admin rights first.' });
    }

    // Remove member
    group.members = group.members.filter(m => m.userId !== userId);

    // Remove from group chat in separate collection
    await SelfHelpGroupChat.findOneAndUpdate(
      { groupId: id },
      {
        $pull: {
          participants: { userId: userId }
        }
      }
    );

    await group.save();
    res.json({ message: 'You have left the group', group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete group (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const group = await SelfHelpGroup.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.adminId !== adminId) {
      return res.status(403).json({ message: 'Only group admin can delete the group' });
    }

    // Delete group chat from separate collection
    await SelfHelpGroupChat.findOneAndDelete({ groupId: id });

    // Delete group
    await SelfHelpGroup.findByIdAndDelete(id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update group (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, name, description, sector, goals, maxMembers } = req.body;

    const group = await SelfHelpGroup.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.adminId !== adminId) {
      return res.status(403).json({ message: 'Only group admin can update the group' });
    }

    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;
    if (sector) group.sector = sector;
    if (goals !== undefined) group.goals = goals;
    if (maxMembers && maxMembers >= group.members.length) {
      group.maxMembers = maxMembers;
    }

    await group.save();
    res.json({ message: 'Group updated successfully', group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
