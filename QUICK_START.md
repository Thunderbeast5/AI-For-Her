# 🚀 Quick Start Guide - MongoDB Version

## ✅ Completed Setup

All dependencies have been installed:
- ✅ Frontend dependencies (including axios)
- ✅ Backend dependencies (express, mongoose, jwt, bcryptjs)
- ✅ MongoDB connection configured
- ✅ All API routes created
- ✅ Authentication system ready
- ✅ User models (Entrepreneur, Mentor, Investor) created

## 🎯 How to Run the Application

### Option 1: Using PowerShell Script (Recommended)
```powershell
.\start-all.ps1
```
This will start both backend (port 5000) and frontend (port 5173) automatically.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

## 📋 MongoDB Atlas Information

- **Connection**: Already configured in `server/.env`
- **Database**: `ai_for_her`
- **Collections**:
  - `entrepreneurs` - All entrepreneur users
  - `mentors` - All mentor users
  - `investors` - All investor users
  - `startups` - All startup information

## 🔑 Key Features

1. **Role-Based Collections**: Users are stored in separate collections based on their role
2. **JWT Authentication**: Secure token-based authentication
3. **Same Schema**: All fields remain identical to Firebase version
4. **REST API**: Clean API endpoints for all operations
5. **Password Security**: Bcrypt hashing for all passwords

## 📝 Test the Application

1. Start both servers (backend and frontend)
2. Navigate to `http://localhost:5173`
3. Sign up as a new user (entrepreneur, mentor, or investor)
4. Login and access your profile
5. Edit and save your profile information

## 🔍 Verify Data in MongoDB

You can view your data directly in MongoDB Atlas:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your credentials
3. Browse Collections → `ai_for_her` database
4. View users in their respective collections

## 🛠️ API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Login

### Profile Management
- `GET /api/entrepreneurs/:userId` - Get profile
- `PUT /api/entrepreneurs/:userId` - Update profile
- (Similar for /api/mentors and /api/investors)

### Startups
- `GET /api/startups` - List all startups
- `POST /api/startups` - Create startup
- `PUT /api/startups/:id` - Update startup

## 🚨 Important Notes

1. **Backend must be running** before using the frontend
2. **Port 5000** must be available for backend
3. **JWT_SECRET** should be changed in production
4. All user data is now in MongoDB, not Firebase

## 📚 Documentation

- Full migration guide: `MONGODB_MIGRATION.md`
- Schema documentation: `SCHEMA.md`
- Server code: `server/` directory
- API client: `src/api/index.js`

## ❓ Troubleshooting

**Backend won't start:**
- Check if port 5000 is available
- Verify MongoDB connection string in `server/.env`

**Frontend can't connect:**
- Ensure backend is running on port 5000
- Check `.env` file has correct `VITE_API_URL`

**Login issues:**
- Clear localStorage: `localStorage.clear()` in browser console
- Check MongoDB Atlas for user existence
- Verify JWT_SECRET is set in backend

## 🎉 You're Ready!

Everything is set up and ready to use. Just run the servers and start using your application with MongoDB Atlas!
