# AI Journal App

A full-stack journaling app where you can write, read, update, and delete journal entries. After saving, you can trigger an AI mood analysis that detects your emotional state and gives a short empathetic insight.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **AI:** Groq API (Llama 3.3 70b) — free tier

## Features

- Register / Login with JWT authentication
- Create, read, update, delete journal entries
- On-demand mood analysis per entry (mood label, emoji, insight)
- Analyze button on each dashboard card
- Dark themed UI

## Project Structure

```
├── backend/
│   ├── models/         # User, Journal schemas
│   ├── routes/         # auth.js, journals.js
│   ├── middleware/     # JWT auth middleware
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── api/        # axios instance
        ├── components/ # Navbar, JournalCard, MoodBadge
        ├── context/    # AuthContext
        └── pages/      # Login, Register, Dashboard, JournalEditor, JournalView
```

## Setup

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

- MongoDB: [mongodb.com/atlas](https://mongodb.com/atlas) — free tier available
- Groq API key: [console.groq.com](https://console.groq.com) — free, no credit card needed

### 3. Run the app

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login |
| GET | /api/journals | Get all journals |
| GET | /api/journals/:id | Get single journal |
| POST | /api/journals | Create journal |
| PUT | /api/journals/:id | Update journal |
| DELETE | /api/journals/:id | Delete journal |
| POST | /api/journals/:id/analyze | Analyze mood with AI |
