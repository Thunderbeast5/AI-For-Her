import mongoose from 'mongoose';

const groupSessionSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  mentorId: {
    type: String,
    required: true,
    ref: 'Mentor'
  },
  mentorName: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true,
    enum: [
      'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
      'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
      'Agriculture & Farming', 'Catering & Food Services', 
      'Retail & E-commerce', 'Education & Training', 'Technology', 
      'Finance', 'Other'
    ]
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 2,
    max: 50,
    default: 10
  },
  currentParticipants: [{
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    }
  }],
  schedule: {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    time: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 30,
      max: 180,
      default: 60 // in minutes
    },
    frequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly'],
      default: 'Weekly'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 1 // Must be paid, minimum ₹1
  },
  language: {
    type: String,
    required: true,
    enum: ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 
           'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Other']
  },
  meetingLink: {
    type: String,
    trim: true
  },
  topics: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  groupImage: {
    type: String,
    trim: true
  },
  rules: [{
    type: String,
    trim: true
  }],
  sessions: [{
    title: String,
    date: Date,
    duration: Number,
    meetingLink: String,
    recording: String,
    materials: [String],
    completedAt: Date
  }],
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
groupSessionSchema.index({ mentorId: 1 });
groupSessionSchema.index({ status: 1 });
groupSessionSchema.index({ 'currentParticipants.userId': 1 });
groupSessionSchema.index({ sector: 1 });
groupSessionSchema.index({ createdAt: -1 });

const GroupSession = mongoose.model('GroupSession', groupSessionSchema);

export default GroupSession;
