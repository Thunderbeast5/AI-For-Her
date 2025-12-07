import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  entrepreneurId: { type: String, required: true, index: true },
  mentorId: { type: String, required: true, index: true },
  entrepreneurName: String,
  entrepreneurEmail: String,
  mentorName: String,
  mentorEmail: String,
  mentorType: { type: String, required: true, enum: ['personal', 'group'], default: 'personal' },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentAmount: { type: Number, default: 0 },
  paymentId: String,
  requestMessage: String,
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  completedAt: Date,
  
  // Session details
  sessionCount: { type: Number, default: 0 },
  lastSessionDate: Date,
  
  // Ratings
  rating: Number,
  feedback: String
});

// Compound index for querying connections
connectionSchema.index({ entrepreneurId: 1, mentorId: 1 });
connectionSchema.index({ mentorId: 1, status: 1 });

export default mongoose.model('Connection', connectionSchema);
