# Setup script for CSE471 Backend
Write-Host "=== CSE471 Backend Setup ===" -ForegroundColor Cyan

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py db upgrade

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "To run the server, use: python manage.py run" -ForegroundColor Cyan
Write-Host "Server will run on port 1588" -ForegroundColor Cyan

