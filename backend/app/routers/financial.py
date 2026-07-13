from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.financial_engine import calculate_financial_health, calculate_settlement_recommendation

router = APIRouter()


@router.get("/profile", response_model=schemas.FinancialProfileOut)
def get_financial_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.FinancialProfile).filter(
        models.FinancialProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Financial profile not found")
    return profile


@router.post("/profile", response_model=schemas.FinancialProfileOut)
def update_financial_profile(
    profile_data: schemas.FinancialProfileCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loans = db.query(models.Loan).filter(models.Loan.user_id == current_user.id).all()
    health = calculate_financial_health(
        profile_data.monthly_income,
        profile_data.monthly_expenses,
        loans,
        profile_data.existing_debts
    )

    profile = db.query(models.FinancialProfile).filter(
        models.FinancialProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = models.FinancialProfile(user_id=current_user.id)
        db.add(profile)

    profile.monthly_income = profile_data.monthly_income
    profile.monthly_expenses = profile_data.monthly_expenses
    profile.existing_debts = profile_data.existing_debts
    profile.emi_ratio = health["emi_ratio"]
    profile.debt_to_income_ratio = health["debt_to_income_ratio"]
    profile.monthly_surplus = health["monthly_surplus"]
    profile.stress_level = health["stress_level"]
    profile.financial_health_score = health["financial_health_score"]
    
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/health")
def get_financial_health(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.FinancialProfile).filter(
        models.FinancialProfile.user_id == current_user.id
    ).first()
    loans = db.query(models.Loan).filter(models.Loan.user_id == current_user.id).all()
    health = calculate_financial_health(
        profile.monthly_income if profile else 0,
        profile.monthly_expenses if profile else 0,
        loans,
        profile.existing_debts if profile else 0
    )
    return health


@router.post("/settlement/{loan_id}", response_model=schemas.SettlementOut)
def get_settlement_recommendation(
    loan_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(models.Loan).filter(
        models.Loan.id == loan_id,
        models.Loan.user_id == current_user.id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    profile = db.query(models.FinancialProfile).filter(
        models.FinancialProfile.user_id == current_user.id
    ).first()

    recommendation = calculate_settlement_recommendation(loan, profile)

    # Store settlement record
    settlement = models.SettlementRecord(
        user_id=current_user.id,
        loan_id=loan_id,
        settlement_prediction=recommendation["settlement_prediction"],
        recommended_amount=recommendation["recommended_amount"],
        settlement_percentage=recommendation["settlement_percentage"],
        priority_level=recommendation["priority_level"],
        notes=f"Affordable EMI: ₹{recommendation['affordable_emi']:,.2f}"
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement


@router.get("/settlements", response_model=list[schemas.SettlementOut])
def get_all_settlements(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.SettlementRecord).filter(
        models.SettlementRecord.user_id == current_user.id
    ).order_by(models.SettlementRecord.created_at.desc()).all()
