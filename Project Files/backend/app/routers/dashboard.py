from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.financial_engine import calculate_financial_health

router = APIRouter()


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loans = db.query(models.Loan).filter(models.Loan.user_id == current_user.id).all()
    profile = db.query(models.FinancialProfile).filter(
        models.FinancialProfile.user_id == current_user.id
    ).first()
    ai_count = db.query(models.AIHistory).filter(
        models.AIHistory.user_id == current_user.id
    ).count()
    high_priority = sum(1 for l in loans if l.priority_level == "High")

    health = calculate_financial_health(
        profile.monthly_income if profile else 0,
        profile.monthly_expenses if profile else 0,
        loans,
        profile.existing_debts if profile else 0
    )

    return {
        "total_outstanding": health["total_outstanding"],
        "total_loans": len(loans),
        "monthly_emi_total": health["total_monthly_emi"],
        "monthly_income": profile.monthly_income if profile else 0,
        "monthly_expenses": profile.monthly_expenses if profile else 0,
        "monthly_surplus": health["monthly_surplus"],
        "emi_ratio": health["emi_ratio"],
        "debt_to_income_ratio": health["debt_to_income_ratio"],
        "stress_level": health["stress_level"],
        "financial_health_score": health["financial_health_score"],
        "high_priority_loans": high_priority,
        "ai_letters_generated": ai_count
    }
