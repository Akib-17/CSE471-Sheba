# Setup script for CSE471 Frontend
Write-Host "=== CSE471 Frontend Setup ===" -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "To run the frontend, use: npm run dev" -ForegroundColor Cyan
Write-Host "Frontend will run on http://localhost:5173" -ForegroundColor Cyan

