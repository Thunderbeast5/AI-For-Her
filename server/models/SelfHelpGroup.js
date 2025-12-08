import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: String,
  email: String,
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const joinRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: String,
  email: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  respondedBy: String
});

const selfHelpGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  goals: String,
  maxMembers: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  adminId: {
    type: String,
    required: true
  },
  adminName: String,
  adminEmail: String,
  members: [memberSchema],
  joinRequests: [joinRequestSchema],
  groupImage: String,
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
selfHelpGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('SelfHelpGroup', selfHelpGroupSchema);
