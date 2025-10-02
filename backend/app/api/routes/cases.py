from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import CaseCreate, CaseResponse
from app.models import Case

router = APIRouter()

@router.post("/", response_model=CaseResponse)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    db_case = Case(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.get("/", response_model=list[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).all()
    return cases
