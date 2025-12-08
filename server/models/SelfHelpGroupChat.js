import mongoose from 'mongoose';

const selfHelpGroupChatSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SelfHelpGroup'
  },
  groupName: {
    type: String,
    required: true
  },
  participants: [{
    userId: String,
    userName: String,
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
selfHelpGroupChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('SelfHelpGroupChat', selfHelpGroupChatSchema);
