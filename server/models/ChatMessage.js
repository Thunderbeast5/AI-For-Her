import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  connectionId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, required: true, enum: ['entrepreneur', 'mentor'] },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
  fileUrl: String,
  fileName: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
chatMessageSchema.index({ connectionId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, read: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
