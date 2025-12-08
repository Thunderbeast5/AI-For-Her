import dotenv from 'dotenv';
// IMPORTANT: Configure dotenv FIRST before other imports
dotenv.config();

// Debug: Check if .env is loaded
console.log('=== Environment Variables Debug ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'defined' : 'undefined');
console.log('===================================');

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import entrepreneurRoutes from './routes/entrepreneurs.js';
import mentorRoutes from './routes/mentors.js';
import investorRoutes from './routes/investors.js';
import startupRoutes from './routes/startups.js';
import connectionRoutes from './routes/connections.js';
import chatRoutes from './routes/chat.js';
import sessionRoutes from './routes/sessions.js';
import opportunityRoutes from './routes/opportunities.js';
import notificationRoutes from './routes/notifications.js';
import mentorGroupRoutes from './routes/mentorGroups.js';
import groupChatRoutes from './routes/groupChats.js';
import groupSessionRoutes from './routes/groupSessions.js';
import investmentProjectRoutes from './routes/investmentProjects.js';

import selfHelpGroupRoutes from './routes/selfHelpGroups.js';
import selfHelpGroupChatRoutes from './routes/selfHelpGroupChats.js';

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';


const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://women:women@cluster0.a770erh.mongodb.net/ai_for_her?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entrepreneurs', entrepreneurRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mentor-groups', mentorGroupRoutes);
app.use('/api/group-chats', groupChatRoutes);
app.use('/api/group-sessions', groupSessionRoutes);
app.use('/api/investment-projects', investmentProjectRoutes);

app.use('/api/self-help-groups', selfHelpGroupRoutes);
app.use('/api/self-help-group-chats', selfHelpGroupChatRoutes);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
