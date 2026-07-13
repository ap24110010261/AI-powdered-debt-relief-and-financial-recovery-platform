import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from app.database import engine, Base
from app.routers import auth, loans, financial, ai_negotiation, dashboard

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinRelief AI - Debt Relief Platform",
    description="AI-Powered Debt Relief & Financial Recovery Platform API",
    version="1.0.0"
)

# Dynamic CORS: allow both local dev and production frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
# Add production frontend URL if set
if FRONTEND_URL and FRONTEND_URL not in origins:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(loans.router, prefix="/api/loans", tags=["Loans"])
app.include_router(financial.router, prefix="/api/financial", tags=["Financial Engine"])
app.include_router(ai_negotiation.router, prefix="/api/ai", tags=["AI Negotiation"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "FinRelief AI API is running", "status": "ok"}
