from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.ai_service import generate_negotiation_letter
from app.financial_engine import calculate_settlement_recommendation

router = APIRouter()


@router.post("/generate", response_model=schemas.AIHistoryOut)
def generate_letter(
    request: schemas.AIGenerateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(models.Loan).filter(
        models.Loan.id == request.loan_id,
        models.Loan.user_id == current_user.id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    profile = db.query(models.FinancialProfile).filter(
        models.FinancialProfile.user_id == current_user.id
    ).first()

    # Get settlement recommendation for context
    rec = calculate_settlement_recommendation(loan, profile)

    # Generate letter via AI or fallback
    result = generate_negotiation_letter(
        user=current_user,
        loan=loan,
        financial_profile=profile,
        hardship_reason=request.hardship_reason,
        tone=request.tone,
        settlement_amount=rec["recommended_amount"],
        settlement_pct=rec["settlement_percentage"]
    )

    # Store in AI history
    ai_record = models.AIHistory(
        user_id=current_user.id,
        loan_id=loan.id,
        lender_name=loan.lender_name,
        hardship_reason=request.hardship_reason,
        negotiation_strategy=result["strategy"],
        settlement_letter=result["letter"],
        ai_response=f"Generated using {'Gemini AI' if result['used_ai'] else 'Fallback Template'}"
    )
    db.add(ai_record)
    db.commit()
    db.refresh(ai_record)
    return ai_record


@router.get("/history", response_model=List[schemas.AIHistoryOut])
def get_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.AIHistory).filter(
        models.AIHistory.user_id == current_user.id
    ).order_by(models.AIHistory.generated_at.desc()).all()


@router.get("/history/{history_id}", response_model=schemas.AIHistoryOut)
def get_history_item(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(models.AIHistory).filter(
        models.AIHistory.id == history_id,
        models.AIHistory.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="History record not found")
    return record


@router.delete("/history/{history_id}")
def delete_history(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(models.AIHistory).filter(
        models.AIHistory.id == history_id,
        models.AIHistory.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="History record not found")
    db.delete(record)
    db.commit()
    return {"message": "History record deleted"}
