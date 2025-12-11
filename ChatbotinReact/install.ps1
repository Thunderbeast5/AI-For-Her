# React Chatbot - Installation Script
# Run this script to set up and start the React chatbot

Write-Host "🚀 Starting React Chatbot Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Navigate to the React app directory
$reactDir = "ChatbotinReact\chatbotreact"
if (Test-Path $reactDir) {
    Set-Location $reactDir
    
    # Install dependencies
    Write-Host "Running npm install..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ React directory not found: $reactDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Start Flask Backend (in separate terminal):" -ForegroundColor Yellow
Write-Host "   cd Chatbot" -ForegroundColor White
Write-Host "   python app.py" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Start React App:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Open Browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - SETUP_GUIDE.md - Quick setup guide" -ForegroundColor White
Write-Host "   - README_REACT.md - Full documentation" -ForegroundColor White
Write-Host "   - PROJECT_SUMMARY.md - Project overview" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to start! Run: npm run dev" -ForegroundColor Green
