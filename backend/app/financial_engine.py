from typing import List
from app import models


def calculate_financial_health(
    monthly_income: float,
    monthly_expenses: float,
    loans: List[models.Loan],
    existing_debts: float = 0.0
) -> dict:
    """Core financial calculation engine for FinRelief AI."""
    
    total_monthly_emi = sum(loan.monthly_emi for loan in loans) + existing_debts
    total_outstanding = sum(loan.outstanding_amount for loan in loans)
    monthly_surplus = monthly_income - monthly_expenses - total_monthly_emi

    # EMI Ratio (EMI / Income) - key stress indicator
    emi_ratio = (total_monthly_emi / monthly_income * 100) if monthly_income > 0 else 0

    # Debt to Income Ratio (Total Outstanding / Annual Income)
    annual_income = monthly_income * 12
    debt_to_income_ratio = (total_outstanding / annual_income * 100) if annual_income > 0 else 0

    # Stress Level Classification
    if emi_ratio < 30:
        stress_level = "Low"
    elif emi_ratio < 50:
        stress_level = "Medium"
    else:
        stress_level = "High"

    # Financial Health Score (0-100)
    surplus_ratio = max(0, monthly_surplus / monthly_income * 100) if monthly_income > 0 else 0
    emi_penalty = min(100, emi_ratio)
    health_score = max(0, min(100, 100 - emi_penalty + surplus_ratio * 0.3))

    return {
        "total_monthly_emi": round(total_monthly_emi, 2),
        "total_outstanding": round(total_outstanding, 2),
        "monthly_surplus": round(monthly_surplus, 2),
        "emi_ratio": round(emi_ratio, 2),
        "debt_to_income_ratio": round(debt_to_income_ratio, 2),
        "stress_level": stress_level,
        "financial_health_score": round(health_score, 2)
    }


def calculate_priority_score(loan: models.Loan) -> float:
    """
    Compute a numeric priority score for each loan.
    Higher = more urgent to address.
    """
    overdue_weight = loan.overdue_months * 10
    interest_weight = loan.interest_rate * 2
    outstanding_weight = min(loan.outstanding_amount / 10000, 20)  # Cap at 20 pts
    emi_weight = min(loan.monthly_emi / 1000, 10)  # Cap at 10 pts
    return round(overdue_weight + interest_weight + outstanding_weight + emi_weight, 2)


def classify_priority_level(score: float) -> str:
    if score >= 50:
        return "High"
    elif score >= 25:
        return "Medium"
    else:
        return "Low"


def sort_loans_by_priority(loans: List[models.Loan]) -> List[models.Loan]:
    """Sort loans by priority score descending."""
    for loan in loans:
        loan.priority_score = calculate_priority_score(loan)
        loan.priority_level = classify_priority_level(loan.priority_score)
    return sorted(loans, key=lambda l: l.priority_score, reverse=True)


def calculate_settlement_recommendation(loan: models.Loan, financial_profile: models.FinancialProfile) -> dict:
    """
    Generate a settlement recommendation for a specific loan based on:
    - Outstanding amount
    - Financial stress level
    - Overdue duration
    - Monthly surplus
    """
    stress = financial_profile.stress_level if financial_profile else "High"
    surplus = financial_profile.monthly_surplus if financial_profile else 0

    # Settlement percentage based on stress level
    if stress == "High":
        settlement_pct = 40  # Can only offer 40% of outstanding
    elif stress == "Medium":
        settlement_pct = 60
    else:
        settlement_pct = 75

    # Adjust based on overdue months (longer = lender more willing to negotiate)
    if loan.overdue_months >= 6:
        settlement_pct = max(settlement_pct - 10, 30)  # More negotiable
    elif loan.overdue_months >= 3:
        settlement_pct = max(settlement_pct - 5, 35)

    recommended_amount = round(loan.outstanding_amount * settlement_pct / 100, 2)

    # Prediction category
    if settlement_pct <= 45:
        prediction = "Highly Negotiable"
    elif settlement_pct <= 65:
        prediction = "Moderately Negotiable"
    else:
        prediction = "Standard Settlement"

    # Monthly EMI simulation
    affordable_emi = max(0, surplus * 0.4)  # Use 40% of surplus for repayment

    return {
        "settlement_prediction": prediction,
        "recommended_amount": recommended_amount,
        "settlement_percentage": settlement_pct,
        "priority_level": loan.priority_level,
        "affordable_emi": round(affordable_emi, 2)
    }
