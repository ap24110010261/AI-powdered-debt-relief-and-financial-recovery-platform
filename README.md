# FinRelief AI – Debt Relief & Financial Recovery Platform

AI-Powered platform to manage loans, generate negotiation letters, predict settlements, and track financial health.

## 🎥 Demo Video

A full demonstration of the FinRelief platform in action can be found in the [Demo Video](./Demo%20Video/Finrelief%20Demo%20Video.mp4) folder.

## 📚 Project Documentation

The repository includes comprehensive documentation covering the entire software development lifecycle of the project, organized into the following phases:

1. **Brainstorming & Ideation**: Includes Empathy maps, problem statements, and idea prioritization.
2. **Requirement Analysis**: Covers the customer journey, data flow diagrams, solution requirements, and tech stack.
3. **Project Design Phase**: Details the solution architecture, proposed solution, and problem-solution fit.
4. **Project Planning Phase**: Contains the overall project planning strategy.
5. **Project Development Phase**: Outlines coding standards, layout, readability, reusability, and functional features.
6. **Project Testing**: Includes performance testing documentation.
7. **Project Documentation**: Houses sample project documentation and executable file details.
8. **Project Demonstration**: Details the demonstration of proposed features, scalability & future plans, team involvement, and communication.

You can explore these documents in the [Project Documentation](./Project%20Documentation/) directory.

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite + Recharts + Lucide Icons
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **AI:** Groq API (LLaMA 3.3 70B)
- **Auth:** JWT + bcrypt

## 🚀 Deployment

- **Frontend:** Vercel
- **Backend:** Render

## 💻 Local Development

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

## ⚙️ Environment Variables

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
