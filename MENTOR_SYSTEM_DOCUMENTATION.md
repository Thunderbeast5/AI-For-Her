# Find Mentor Feature - Complete Implementation

## Overview
Complete mentor connection system with personal (paid) and group (free) mentorship options, integrated payment gateway, and real-time chat functionality.

## Features Implemented

### 1. Backend Infrastructure

#### Models Created/Updated

**Connection Model** (`server/models/Connection.js`)
- `entrepreneurId`: Reference to entrepreneur
- `mentorId`: Reference to mentor
- `mentorType`: 'personal' or 'group'
- `status`: 'pending', 'active', 'completed', 'cancelled'
- `paymentStatus`: 'pending', 'completed', 'failed'
- `paymentAmount`: Amount in INR (₹)
- `paymentId`: Transaction ID from payment gateway
- `sessionCount`: Number of sessions completed
- `rating`: Entrepreneur rating of mentor (1-5)
- `feedback`: Text feedback

**ChatMessage Model** (`server/models/ChatMessage.js`)
- `connectionId`: Reference to connection
- `senderId`: User ID of sender
- `senderRole`: 'entrepreneur' or 'mentor'
- `message`: Message text
- `messageType`: 'text', 'file', 'image'
- `fileUrl`: URL for file/image messages
- `read`: Boolean - message read status
- Timestamps: `createdAt`, `updatedAt`

**Mentor Model Updates** (`server/models/Mentor.js`)
- `mentorType`: enum ['personal', 'group', 'both']
- `personalSessionPrice`: Price in INR for personal mentoring
- `groupSessionPrice`: Price in INR for group mentoring (usually 0)
- `sector`: Business sector/industry
- `yearsOfExperience`: Years of professional experience
- `totalConnections`: Total entrepreneur connections
- `groupSessionCapacity`: Max participants for group sessions
- `groupSessionSchedule`: Schedule information for group sessions

#### API Routes

**Connection Routes** (`server/routes/connections.js`)
```
GET    /api/connections/user/:userId?role=entrepreneur - Get user's connections
GET    /api/connections/:id - Get connection by ID
POST   /api/connections - Create new connection
PUT    /api/connections/:id - Update connection
GET    /api/connections/check/:entrepreneurId/:mentorId - Check existing connection
DELETE /api/connections/:id - Delete connection
```

**Chat Routes** (`server/routes/chat.js`)
```
GET    /api/chat/connection/:connectionId - Get all messages for connection
POST   /api/chat - Send new message
PUT    /api/chat/read/:connectionId/:userId - Mark messages as read
GET    /api/chat/unread/:userId - Get unread message count
```

### 2. Frontend Implementation

#### API Client Updates (`src/api/index.js`)

**connectionsApi**
- `getByUser(userId, role)` - Get connections by user with role filter
- `getById(connectionId)` - Get specific connection
- `checkExisting(entrepreneurId, mentorId)` - Check existing connection
- `create(connectionData)` - Create new connection
- `update(connectionId, data)` - Update connection
- `delete(connectionId)` - Delete connection

**chatApi**
- `getMessages(connectionId)` - Get all messages for a connection
- `sendMessage(messageData)` - Send new message
- `markAsRead(connectionId, userId)` - Mark messages as read
- `getUnreadCount(userId)` - Get unread message count

#### Find Mentors Page (`src/pages/Entrepreneur/Mentors.jsx`)

**Three Main Tabs:**

1. **Find Mentors**
   - Search functionality (name, sector, expertise)
   - Filter by mentor type (all/personal/group)
   - Mentor cards showing:
     - Name, sector, expertise
     - Years of experience
     - Mentor type badge (Personal/Group/Both)
     - Pricing (₹ for personal, Free for group)
     - Connect buttons based on mentor type
   - Different buttons for personal vs group mentors
   - Connection status display

2. **My Mentors**
   - List of connected mentors
   - Connection details:
     - Mentor info (name, sector, expertise)
     - Connection type (personal/group)
     - Connection status
     - Session count
     - Connection date
   - "Open Chat" button for active connections

3. **Chat Interface**
   - Real-time chat with connected mentors
   - Message display with sender identification
   - Timestamps for each message
   - Message input with send button
   - Auto-refresh every 5 seconds
   - Mark messages as read automatically
   - Chat header showing mentor info
   - Close button to return to My Mentors

#### Payment Modal

**Fake Payment Gateway Features:**
- Displays mentor name
- Shows payment amount in ₹ (Indian Rupees)
- Warning note about simulation
- "Pay Now" button (confirms payment)
- "Cancel" button
- Generates unique payment ID: `PAY_timestamp_randomstring`
- Updates connection with payment details

## User Flow

### Connecting with Personal Mentor (Paid)
1. Entrepreneur browses mentors on "Find Mentors" tab
2. Clicks "Connect (Personal)" on desired mentor
3. Payment modal opens showing:
   - Mentor name
   - Amount in ₹
   - Simulation warning
4. Clicks "Pay Now" → Confirms payment
5. Connection created with:
   - `mentorType`: 'personal'
   - `status`: 'active'
   - `paymentStatus`: 'completed'
   - `paymentAmount`: Price paid
   - `paymentId`: Generated transaction ID
6. Redirected to "My Mentors" tab
7. Can now click "Open Chat" to start messaging

### Connecting with Group Mentor (Free)
1. Entrepreneur browses mentors on "Find Mentors" tab
2. Clicks "Join Group (Free)" on desired mentor
3. Connection created immediately (no payment):
   - `mentorType`: 'group'
   - `status`: 'active'
   - `paymentStatus`: 'completed'
4. Success message displayed
5. Mentor appears in "My Mentors" tab
6. Can click "Open Chat" to start messaging

### Chatting with Mentor
1. From "My Mentors" tab, click "Open Chat" on active connection
2. Chat interface opens showing:
   - Mentor name and type in header
   - Previous messages (if any)
   - Message input at bottom
3. Type message and press Enter or click "Send"
4. Messages appear immediately
5. Auto-refreshes every 5 seconds for new messages
6. Messages marked as read automatically
7. Click "✕ Close" to return to "My Mentors"

## Currency & Pricing

**All amounts in Indian Rupees (₹):**
- Personal mentorship: ₹2,000 - ₹3,500 per session
- Group mentorship: Free (₹0)
- Display format: `₹2,500` or `₹2,00,000`
- Locale formatting: `(amount).toLocaleString('en-IN')`

## Sample Mentors

The database includes 6 sample mentors:

1. **Priya Sharma** (Food Processing)
   - Type: Both (Personal & Group)
   - Personal: ₹2,000 | Group: Free (15 capacity)
   - 12 years experience

2. **Anjali Desai** (Handicrafts)
   - Type: Personal only
   - Personal: ₹3,000
   - 15 years experience

3. **Meera Kapoor** (Beauty & Personal Care)
   - Type: Both (Personal & Group)
   - Personal: ₹2,500 | Group: Free (20 capacity)
   - 10 years experience

4. **Sneha Reddy** (Tailoring & Garments)
   - Type: Group only
   - Group: Free (25 capacity)
   - 8 years experience

5. **Dr. Kavita Patel** (Health & Wellness)
   - Type: Both (Personal & Group)
   - Personal: ₹3,500 | Group: Free (12 capacity)
   - 18 years experience

6. **Rani Verma** (Home Decor)
   - Type: Personal only
   - Personal: ₹2,200
   - 9 years experience

## Technical Details

### Server Configuration
- Backend: Express.js on port 5000
- Database: MongoDB Atlas
- Routes registered in `server/index.js`:
  ```javascript
  app.use('/api/connections', connectionRoutes);
  app.use('/api/chat', chatRoutes);
  ```

### Frontend Integration
- React with hooks (useState, useEffect)
- Real-time chat with 5-second polling
- Tailwind CSS for styling
- Responsive design (mobile, tablet, desktop)

### Security Features
- JWT authentication on all routes
- User ID validation
- Connection ownership verification
- Payment status tracking

## Testing the Feature

### Prerequisites
1. Backend server running: `npm start` in `server/`
2. Frontend running: `npm run dev` in root
3. Logged in as entrepreneur

### Test Steps

**Test Personal Mentor Connection:**
1. Navigate to "Find Mentors"
2. Select a personal or both-type mentor
3. Click "Connect (Personal)"
4. Verify payment modal opens with correct amount
5. Click "Pay Now" and confirm
6. Check "My Mentors" tab - connection should appear
7. Click "Open Chat" and send a message
8. Verify message appears in chat

**Test Group Mentor Connection:**
1. Navigate to "Find Mentors"
2. Select a group or both-type mentor
3. Click "Join Group (Free)"
4. Verify success message (no payment modal)
5. Check "My Mentors" tab - connection should appear
6. Click "Open Chat" and send a message

**Test Chat Functionality:**
1. From "My Mentors", click "Open Chat"
2. Send multiple messages
3. Wait 5 seconds - messages should remain
4. Messages should show timestamps
5. Your messages on right (pink), mentor's on left (gray)

## Database Collections

### connections
```json
{
  "_id": "ObjectId",
  "entrepreneurId": "USER123",
  "mentorId": "MENTOR001",
  "mentorType": "personal",
  "status": "active",
  "paymentStatus": "completed",
  "paymentAmount": 2000,
  "paymentId": "PAY_1234567890_abc123",
  "sessionCount": 0,
  "rating": null,
  "feedback": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### chatmessages
```json
{
  "_id": "ObjectId",
  "connectionId": "ObjectId",
  "senderId": "USER123",
  "senderRole": "entrepreneur",
  "message": "Hello! I need help with my startup.",
  "messageType": "text",
  "fileUrl": null,
  "read": true,
  "createdAt": "2024-01-15T10:35:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

## Future Enhancements

1. **Real Payment Gateway Integration**
   - Razorpay/Paytm integration
   - Payment receipt generation
   - Refund handling

2. **Video/Voice Chat**
   - WebRTC integration
   - Scheduled video sessions
   - Call recording

3. **File Sharing**
   - Document upload in chat
   - Image/PDF support
   - File size limits

4. **Notifications**
   - Real-time message notifications
   - Session reminders
   - Connection requests

5. **Rating & Reviews**
   - Rate mentors after sessions
   - Review system
   - Average rating display

6. **Session Scheduling**
   - Calendar integration
   - Session booking
   - Availability management

7. **Analytics**
   - Mentor performance metrics
   - Connection statistics
   - Session completion rates

## Files Modified/Created

**Backend:**
- `server/models/Connection.js` (new)
- `server/models/ChatMessage.js` (new)
- `server/models/Mentor.js` (updated)
- `server/routes/connections.js` (updated)
- `server/routes/chat.js` (new)
- `server/index.js` (updated - added routes)
- `server/scripts/add-sample-mentors.js` (new)

**Frontend:**
- `src/api/index.js` (updated - added connectionsApi & chatApi)
- `src/pages/Entrepreneur/Mentors.jsx` (completely rewritten)
- `src/pages/Entrepreneur/Mentors_old_backup.jsx` (backup of old version)

## Support

For issues or questions:
- Check console logs (browser & server)
- Verify MongoDB connection
- Ensure JWT token is valid
- Check network requests in browser DevTools

## Conclusion

The Find Mentor feature is fully implemented with:
- ✅ Personal/Group mentor types
- ✅ Payment gateway (simulated)
- ✅ Real-time chat
- ✅ Connection management
- ✅ INR currency display
- ✅ Responsive UI
- ✅ Backend API routes
- ✅ Database models
- ✅ Sample data

The system is ready for testing and can be extended with real payment gateway integration and additional features as needed.
