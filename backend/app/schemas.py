from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# Loan Schemas
class LoanCreate(BaseModel):
    loan_name: str
    loan_type: str = "Personal Loan"
    lender_name: str
    outstanding_amount: float
    monthly_emi: float
    interest_rate: float
    overdue_months: int = 0
    due_date: Optional[str] = None

class LoanOut(BaseModel):
    id: int
    loan_name: str
    loan_type: str
    lender_name: str
    outstanding_amount: float
    monthly_emi: float
    interest_rate: float
    overdue_months: int
    due_date: Optional[str]
    priority_score: float
    priority_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class LoanUpdate(BaseModel):
    loan_name: Optional[str] = None
    loan_type: Optional[str] = None
    lender_name: Optional[str] = None
    outstanding_amount: Optional[float] = None
    monthly_emi: Optional[float] = None
    interest_rate: Optional[float] = None
    overdue_months: Optional[int] = None
    due_date: Optional[str] = None


# Financial Profile Schemas
class FinancialProfileCreate(BaseModel):
    monthly_income: float
    monthly_expenses: float
    existing_debts: float = 0.0

class FinancialProfileOut(BaseModel):
    id: int
    user_id: int
    monthly_income: float
    monthly_expenses: float
    existing_debts: float
    financial_health_score: float
    emi_ratio: float
    debt_to_income_ratio: float
    monthly_surplus: float
    stress_level: str
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Settlement Schemas
class SettlementCreate(BaseModel):
    loan_id: int
    notes: Optional[str] = None

class SettlementOut(BaseModel):
    id: int
    loan_id: int
    settlement_prediction: str
    recommended_amount: float
    settlement_percentage: float
    priority_level: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# AI Negotiation Schemas
class AIGenerateRequest(BaseModel):
    loan_id: int
    hardship_reason: str
    tone: str = "Professional"  # Professional, Hardship, Urgent

class AIHistoryOut(BaseModel):
    id: int
    lender_name: Optional[str]
    hardship_reason: Optional[str]
    negotiation_strategy: Optional[str]
    settlement_letter: Optional[str]
    generated_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardStats(BaseModel):
    total_outstanding: float
    total_loans: int
    monthly_emi_total: float
    monthly_income: float
    monthly_expenses: float
    monthly_surplus: float
    emi_ratio: float
    debt_to_income_ratio: float
    stress_level: str
    financial_health_score: float
    high_priority_loans: int
    ai_letters_generated: int
