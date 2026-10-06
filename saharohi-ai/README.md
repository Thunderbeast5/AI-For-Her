# Saharohi AI (phase 1: location → budget → domain → top 3 ideas → business plan)

## Backend
cd backend && python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # add GROQ_API_KEY
uvicorn main:app --reload --port 8000

## Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173 (proxies /api -> :8000)
