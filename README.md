# SmartFlow AI 🚀

**AI-powered Smart Automation Platform** — Hackathon Edition

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally on port 27017

### 1. Install MongoDB (if not installed)
Download from: https://www.mongodb.com/try/download/community
Start MongoDB service: `net start MongoDB` or run `mongod`

### 2. Start the Application

**Option A: Double-click `start.bat`** ← Easiest!

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm install
node server.js

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 3. Load Demo Data (Optional)
```bash
cd backend
node seed.js
```
Or double-click `seed-demo.bat`

### 4. Open the App
Visit: http://localhost:5173

## Demo Account
- **Email**: demo@smartflow.ai
- **Password**: demo1234

## Project Structure
```
Smart Automation/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # JWT auth
│   ├── server.js     # Entry point
│   └── seed.js       # Demo data seeder
├── frontend/         # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/    # All pages
│   │   ├── components/ # Reusable components
│   │   ├── context/  # Auth context
│   │   └── services/ # API calls
│   └── index.html
├── start.bat         # Start everything
└── seed-demo.bat     # Load demo data
```

## Features
- ✅ JWT Authentication (Register/Login)
- ✅ Dashboard with real-time stats
- ✅ Create, Edit, Delete Automations
- ✅ Run Now with status simulation
- ✅ AI Assistant (rule-based NLP)
- ✅ Activity/Execution logs
- ✅ Alerts system (failure/success)
- ✅ Analytics with charts
- ✅ Settings with preferences
- ✅ Responsive design (mobile + desktop)

## API Endpoints
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET/POST /api/automations` - Automations CRUD
- `POST /api/automations/:id/run` - Run Now
- `GET /api/activity` - Execution logs
- `GET /api/alerts` - Alerts
- `GET /api/analytics` - Analytics stats
- `POST /api/ai/suggest` - AI suggestion

## Demo Flow (for judges)
1. Register/Login → Demo account shortcut available
2. Dashboard → Shows stats and charts
3. AI Assistant → Describe a task, get automation suggestion
4. Create Automation → Fill form, create
5. Automations → Click "Run Now" to execute
6. Activity → See execution history
7. Alerts → See failure/success alerts
8. Analytics → View performance charts
