import mongoose from 'mongoose';

const mentorGroupSchema = new mongoose.Schema({
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
    min: 0
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
    enum: ['active', 'upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    userId: String,
    userName: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  sessions: [{
    date: Date,
    topic: String,
    notes: String,
    attendance: [{
      userId: String,
      userName: String,
      attended: Boolean
    }]
  }]
}, {
  timestamps: true
});

// Index for faster queries
mentorGroupSchema.index({ mentorId: 1 });
mentorGroupSchema.index({ sector: 1 });
mentorGroupSchema.index({ status: 1 });
mentorGroupSchema.index({ 'currentParticipants.userId': 1 });

// Virtual for available spots
mentorGroupSchema.virtual('availableSpots').get(function() {
  return this.maxParticipants - this.currentParticipants.length;
});

// Method to check if group is full
mentorGroupSchema.methods.isFull = function() {
  return this.currentParticipants.length >= this.maxParticipants;
};

// Method to add participant
mentorGroupSchema.methods.addParticipant = function(userId, userName) {
  if (this.isFull()) {
    throw new Error('Group is full');
  }
  
  const alreadyJoined = this.currentParticipants.some(p => p.userId === userId);
  if (alreadyJoined) {
    throw new Error('User already in this group');
  }
  
  this.currentParticipants.push({ userId, userName });
  return this.save();
};

// Method to remove participant
mentorGroupSchema.methods.removeParticipant = function(userId) {
  this.currentParticipants = this.currentParticipants.filter(p => p.userId !== userId);
  return this.save();
};

export default mongoose.model('MentorGroup', mentorGroupSchema);
