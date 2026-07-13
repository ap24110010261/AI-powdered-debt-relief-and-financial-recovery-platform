from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class LoanType(str, enum.Enum):
    home = "Home Loan"
    car = "Car Loan"
    personal = "Personal Loan"
    credit_card = "Credit Card"
    education = "Education Loan"
    business = "Business Loan"
    other = "Other"


class StressLevel(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loans = relationship("Loan", back_populates="owner", cascade="all, delete")
    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete")
    settlement_records = relationship("SettlementRecord", back_populates="user", cascade="all, delete")
    ai_history = relationship("AIHistory", back_populates="user", cascade="all, delete")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_name = Column(String, nullable=False)
    loan_type = Column(String, default="Personal Loan")
    lender_name = Column(String, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    monthly_emi = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    overdue_months = Column(Integer, default=0)
    due_date = Column(String, nullable=True)
    priority_score = Column(Float, default=0.0)
    priority_level = Column(String, default="Medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="loans")
    settlement_records = relationship("SettlementRecord", back_populates="loan", cascade="all, delete")


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    monthly_income = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    existing_debts = Column(Float, default=0.0)
    financial_health_score = Column(Float, default=0.0)
    emi_ratio = Column(Float, default=0.0)
    debt_to_income_ratio = Column(Float, default=0.0)
    monthly_surplus = Column(Float, default=0.0)
    stress_level = Column(String, default="Low")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="financial_profile")


class SettlementRecord(Base):
    __tablename__ = "settlement_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    settlement_prediction = Column(String)
    recommended_amount = Column(Float)
    settlement_percentage = Column(Float)
    priority_level = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="settlement_records")
    loan = relationship("Loan", back_populates="settlement_records")


class AIHistory(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_id = Column(Integer, nullable=True)
    lender_name = Column(String)
    hardship_reason = Column(String)
    negotiation_strategy = Column(Text)
    settlement_letter = Column(Text)
    ai_response = Column(Text)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ai_history")
