# Chatbot Integration Guide

## Overview
Your Flask chatbot backend is now integrated with the React frontend Chat.jsx component.

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd chatbot1
pip install -r requirements.txt
```

### 2. Install Missing Python Package
```bash
pip install flask-cors
```

### 3. Set Up Environment Variables
Create a `.env` file in the `chatbot1` folder with your API keys:
```
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Initialize Database
```bash
cd chatbot1
python
>>> from app import app, db
>>> with app.app_context():
>>>     db.create_all()
>>> exit()
```

### 5. Run the Flask Backend
```bash
cd chatbot1
python app.py
```
The backend will run on `http://localhost:5000`

### 6. Run the React Frontend
In a separate terminal:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## How It Works

### Backend (Flask)
- **Endpoint**: `POST /api/chat`
- **Request**: `{ "message": "user message", "session_id": "unique_session_id" }`
- **Response**: `{ "reply": "AI response", "buttons": [], "ideas": [], "resources": [], "schemes": [] }`

### Frontend (React)
- Chat.jsx connects to Flask backend
- Displays AI responses with markdown formatting
- Shows interactive buttons from chatbot
- Displays business ideas, resources, and schemes
- Maintains session across messages

## Features Integrated

✅ **AI-Powered Conversations** - Groq LLM integration
✅ **Intent Detection** - NLP-based user intent recognition
✅ **Business Idea Generation** - Personalized startup suggestions
✅ **Local Resources** - Find suppliers, markets, government offices
✅ **Government Schemes** - Discover relevant funding opportunities
✅ **Interactive Buttons** - Dynamic UI based on conversation flow
✅ **Session Management** - Maintains user context across messages
✅ **RAG Integration** - Retrieval-Augmented Generation for personalized responses

## Troubleshooting

### Backend Not Starting
- Check if all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version (3.8+)
- Check for port conflicts (5000)

### Frontend Connection Error
- Ensure Flask backend is running on port 5000
- Check browser console for CORS errors
- Verify CHATBOT_API_URL in Chat.jsx matches backend URL

### Database Errors
- Delete `startup_sathi.db` and reinitialize
- Check SQLAlchemy version compatibility

## Deployment

### For Production:
1. Change `CHATBOT_API_URL` in Chat.jsx to your deployed backend URL
2. Deploy Flask app to a service like Render, Heroku, or Railway
3. Update CORS settings in app.py to allow your frontend domain
4. Set environment variables on your hosting platform

## API Endpoints

- `POST /api/chat` - Main chat endpoint
- `GET /` - Serves HTML template (optional)

## Next Steps

1. Add API keys to `.env` file
2. Test the chatbot locally
3. Deploy backend to production
4. Update frontend API URL
5. Test end-to-end integration

## Support

For issues, check:
- Flask backend logs
- Browser console errors
- Network tab in DevTools
