# Sheba - Service Marketplace (CSE471 Project)

A full-stack web application connecting users with local service providers (Electricians, Plumbers, Salon, etc.). Features real-time chat, location-based matching, and role-based dashboards.

## Project Structure
- `backend/` — Flask API (SQLAlchemy, SocketIO, JWT Auth)
- `frontend/` — React App (Vite, Axios, Styled Components)

## Quick Start (Windows)

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Database Setup (Initialize & Seed)
flask db upgrade
python manage.py run
```
Backend runs on: `http://localhost:5000`

### 2. Frontend Setup
Open a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000` (or similar)

## Features
- **Role-Based Access**: User & Provider Dashboards.
- **Real-Time Chat**: Socket.IO powered messaging for service requests.
- **Search & Filter**: Find providers by category and location.
- **Automated Pricing**: Providers set their own fee ranges.

## Troubleshooting
- **Database Error**: If you see "no such table", run `flask db upgrade` in the `backend` folder.
- **Socket Error**: Ensure backend is running on port 5000.

If you want, I can now:

- Initialize a git repository and make an initial commit
- Add migrations and a sample resource (CRUD endpoints)
- Implement refresh tokens and safer auth cookie flow
