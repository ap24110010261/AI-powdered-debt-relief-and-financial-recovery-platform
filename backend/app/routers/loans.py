from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.financial_engine import calculate_priority_score, classify_priority_level

router = APIRouter()


@router.get("/", response_model=List[schemas.LoanOut])
def get_loans(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    loans = db.query(models.Loan).filter(models.Loan.user_id == current_user.id).all()
    # Recalculate priorities
    for loan in loans:
        loan.priority_score = calculate_priority_score(loan)
        loan.priority_level = classify_priority_level(loan.priority_score)
    return sorted(loans, key=lambda l: l.priority_score, reverse=True)


@router.post("/", response_model=schemas.LoanOut)
def add_loan(
    loan_data: schemas.LoanCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = models.Loan(user_id=current_user.id, **loan_data.model_dump())
    loan.priority_score = calculate_priority_score(loan)
    loan.priority_level = classify_priority_level(loan.priority_score)
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/{loan_id}", response_model=schemas.LoanOut)
def get_loan(
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
    return loan


@router.put("/{loan_id}", response_model=schemas.LoanOut)
def update_loan(
    loan_id: int,
    loan_data: schemas.LoanUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(models.Loan).filter(
        models.Loan.id == loan_id,
        models.Loan.user_id == current_user.id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    for field, value in loan_data.model_dump(exclude_unset=True).items():
        setattr(loan, field, value)
    
    loan.priority_score = calculate_priority_score(loan)
    loan.priority_level = classify_priority_level(loan.priority_score)
    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}")
def delete_loan(
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
    db.delete(loan)
    db.commit()
    return {"message": "Loan deleted successfully"}
