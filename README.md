# FinRelief AI – Debt Relief & Financial Recovery Platform

AI-Powered platform to manage loans, generate negotiation letters, predict settlements, and track financial health.

## Tech Stack

- **Frontend:** React 19 + Vite + Recharts + Lucide Icons
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **AI:** Groq API (LLaMA 3.3 70B)
- **Auth:** JWT + bcrypt

## Deployment

- **Frontend:** Vercel
- **Backend:** Render

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your GROQ_API_KEY
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key |
| `SECRET_KEY` | JWT secret key |
| `FRONTEND_URL` | Your Vercel frontend URL |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL + `/api` |
