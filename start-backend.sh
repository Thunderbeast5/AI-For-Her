#!/bin/bash

echo "🚀 Starting AI for Her - Backend Server"
echo "========================================"
echo ""

cd chatbot

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Backend server starting on http://localhost:5001"
echo "📡 API endpoints available at http://localhost:5001/api/*"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Flask server
python app.py
