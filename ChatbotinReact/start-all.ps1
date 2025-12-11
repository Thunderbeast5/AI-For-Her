# Start React Chatbot - Backend and Frontend

Write-Host "🚀 Starting React Chatbot Application..." -ForegroundColor Green
Write-Host ""

# Start Backend in new terminal
Write-Host "📦 Starting Node.js Backend on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new terminal
Write-Host "⚛️ Starting React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\chatbotreact'; npm run dev"

Write-Host ""
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
