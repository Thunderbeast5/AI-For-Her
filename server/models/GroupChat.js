import mongoose from 'mongoose';

const groupChatSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    ref: 'MentorGroup'
  },
  groupName: {
    type: String,
    required: true
  },
  mentorId: {
    type: String,
    required: true
  },
  participants: [{
    userId: String,
    userName: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    senderId: {
      type: String,
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [{
      userId: String,
      readAt: Date
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
groupChatSchema.index({ groupId: 1 });
groupChatSchema.index({ 'participants.userId': 1 });
groupChatSchema.index({ 'messages.timestamp': -1 });

export default mongoose.model('GroupChat', groupChatSchema);
