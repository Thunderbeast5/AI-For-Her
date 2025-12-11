# 🌟 Startup Sathi - Women Entrepreneurship Support Assistant

**Modern React + Node.js Application for Women Entrepreneurs in India**

A comprehensive AI-powered chatbot that helps women entrepreneurs in India discover business ideas, create detailed plans, find government schemes, analyze locations, and get expert business advice in English, Hindi, and Marathi.

---

## ✨ Key Features

### 💡 **Business Idea Generation**
- Personalized business ideas based on location, interests, and budget
- 5 tailored suggestions with detailed descriptions
- Filtering by interest categories (Cooking, Sewing, Dairy, Farming, Beauty, Handicrafts, Teaching, Retail)

### 📋 **Comprehensive Business Planning**
- Detailed 6-month business plans with:
  - Executive Summary
  - Market Analysis
  - Financial Projections
  - Operations Plan
  - Marketing Strategy
- Section-by-section deep dives with actionable steps

### 💰 **Government Schemes & Funding**
- Detailed information on:
  - MUDRA Loans (Shishu/Kishor/Tarun)
  - Stand-Up India
  - PMEGP (Prime Minister's Employment Generation Programme)
  - CGTMSE (Credit Guarantee Scheme)
  - State-specific schemes
- Loan amounts, interest rates, eligibility, and application steps

### 🗺️ **Location Analysis**
- Demographic analysis with percentages
- Target customer estimation
- Nearby resources and institutions
- Market penetration potential
- Revenue projections based on location
- Infrastructure assessment

### 📄 **PDF Document Analysis** (NEW!)
- Upload business documents, legal papers, or scheme guidelines
- AI-powered content extraction and analysis
- Simple, point-wise explanations of complex documents
- Ask questions about uploaded PDFs

### ❓ **Business Question Assistant**
- Expert advice on any business topic
- Structured, point-wise responses
- Specific cost estimates and timelines
- Step-by-step instructions for "how-to" questions

### 🌐 **Multi-language Support**
- Full support for English, Hindi, and Marathi
- 8 additional languages coming soon
- Language-specific responses and translations

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ChatbotinReact
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
npm start
```

3. **Set up Frontend** (in a new terminal)
```bash
cd chatbotreact
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
NODE_ENV=development

# Optional (fallback APIs)
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Getting API Keys

1. **Groq API** (Primary, Required):
   - Visit: https://console.groq.com
   - Create account and get API key
   - Free tier available

2. **Google Gemini** (Optional fallback):
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key

---

## 📁 Project Structure

```
ChatbotinReact/
├── backend/                    # Node.js Express backend
│   ├── routes/
│   │   ├── chat.js            # Chat and PDF upload endpoints
│   │   ├── business.js        # Business logic
│   │   └── location.js        # Location services
│   ├── services/
│   │   ├── llmService.js      # AI/LLM interactions
│   │   └── geocodingService.js
│   ├── utils/
│   │   ├── translations.js    # Multi-language support
│   │   ├── sessionManager.js  # Session handling
│   │   └── intentDetector.js
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env.example
│
├── chatbotreact/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.jsx   # Main chatbot UI
│   │   │   ├── Message.jsx   # Message display
│   │   │   ├── VoiceInput.jsx
│   │   │   └── MapModal.jsx  # Location maps
│   │   ├── services/
│   │   │   └── api.js        # API client
│   │   ├── utils/
│   │   │   └── translations.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🎯 Features in Detail

### 1. PDF Document Analysis
Upload business-related PDFs (legal documents, scheme details, guides) and:
- Get AI-powered summaries in simple language
- Ask specific questions about the document
- Receive point-wise, easy-to-understand explanations
- Available only in "Ask Business Question" mode

### 2. Structured Responses
All responses follow a consistent format:
- **Investment Breakdown** with specific costs
- **Step-by-step guides** with numbered lists
- **Government schemes** with eligibility and application steps
- **Marketing strategies** with platform recommendations

### 3. Location-Based Insights
- Automatic GPS location detection
- Demographic analysis with percentages
- "X% of population could be customers"
- Nearby institutions with conversion rates
- Revenue potential calculations

---

## 🧪 Testing

### Backend API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test chat endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi", "session_id": "test123", "language": "en-IN"}'
```

---

## 📝 Usage Examples

### Generate Business Ideas
1. Click "💡 Generate Business Idea & Plan"
2. Enter name and location
3. Select interest (e.g., "Farming & Agriculture")
4. Set budget
5. Review 5 personalized business ideas

### Upload and Analyze PDF
1. Click "❓ Ask Business Question"
2. Click "📄 Upload PDF" button
3. Select business document
4. Bot provides summary
5. Ask: "Explain this in simple words"
6. Get point-wise breakdown

### Get Location Analysis
1. Select a business idea
2. Click "🗺️ स्थान विश्लेषण करा" (Analyze Location)
3. Get detailed analysis with:
   - Demographics percentages
   - Customer potential
   - Nearby resources
   - Revenue projections

---

## 🌐 Supported Languages

- ✅ **English** - Full support
- ✅ **Hindi (हिंदी)** - Full support  
- ✅ **Marathi (मराठी)** - Full support
- 🔜 **8+ more languages** - Coming soon (Gujarati, Tamil, Telugu, Kannada, Bengali, Punjabi, Malayalam, Odia)

---

## 🔒 Security Notes

- Never commit `.env` files to Git
- Keep API keys secure
- Use environment variables for sensitive data
- Enable CORS only for trusted origins in production

---

## 🚀 Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, or DigitalOcean
- Set environment variables in platform settings
- Ensure PORT is configurable

### Frontend (React)
- Deploy to: Vercel, Netlify, or Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Update API base URL for production

---

## 🤝 Contributing

This project is designed for women entrepreneurship in India. Contributions welcome for:
- Additional language translations
- New government scheme information
- Enhanced business analysis features
- Bug fixes and performance improvements

---

## 📄 License

MIT License - Feel free to use for educational and commercial purposes

---

## 🙏 Acknowledgments

- Groq for LLM API
- MapLibre for mapping
- All contributors to women entrepreneurship in India

---

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review console logs for errors
3. Verify API keys are set correctly
4. Ensure both frontend and backend are running

---

**Built with ❤️ for Women Entrepreneurs in India 🇮🇳**
npm run build
```

Output: `dist/` folder

---

## 🐛 Troubleshooting

### Dependencies won't install
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
npm run dev -- --port 3000
```

### Voice not working
- Use Chrome or Edge
- Enable microphone permissions
- Use HTTPS in production

### Map not showing
- Allow location permissions
- Check browser console

---

## 📞 Support

1. Check documentation files
2. Review browser console
3. Check Flask backend logs
4. Verify API connectivity

---

## 🎓 Learn More

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [MapLibre Docs](https://maplibre.org)

---

## ✅ Status

- [x] All features implemented
- [x] Fully responsive
- [x] Multi-language support
- [x] Voice features working
- [x] Map integration complete
- [x] Documentation complete
- [x] Production ready

---

## 🎉 Get Started

```bash
cd chatbotreact
npm install
npm run dev
```

**Empowering Women Entrepreneurs in Rural & Semi-Urban India 🌾**

---

*Built with ❤️ using React & Vite*
