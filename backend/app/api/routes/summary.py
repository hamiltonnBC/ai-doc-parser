from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Case, Document, Summary
from app.services.summary_service import SummaryService
from pydantic import BaseModel

router = APIRouter()

class SummaryResponse(BaseModel):
    case_id: str
    summary: str
    document_count: int

@router.get("/{case_id}", response_model=SummaryResponse)
def get_case_summary(case_id: str, db: Session = Depends(get_db)):
    """Generate or retrieve case summary"""
    
    # Check if case exists
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Get all processed documents
    documents = db.query(Document).filter(
        Document.case_id == case_id,
        Document.processed == True
    ).all()
    
    if not documents:
        return SummaryResponse(
            case_id=case_id,
            summary="No processed documents available for summary.",
            document_count=0
        )
    
    # Check for existing summary
    existing_summary = db.query(Summary).filter(
        Summary.case_id == case_id,
        Summary.summary_type == "case"
    ).first()
    
    if existing_summary:
        return SummaryResponse(
            case_id=case_id,
            summary=existing_summary.content,
            document_count=len(documents)
        )
    
    # Generate new summary
    summary_service = SummaryService()
    documents_text = [
        (doc.document_type or "general", doc.ocr_text or "")
        for doc in documents
    ]
    
    summary_text = summary_service.generate_case_summary(documents_text)
    
    # Save summary
    new_summary = Summary(
        case_id=case_id,
        summary_type="case",
        content=summary_text
    )
    db.add(new_summary)
    db.commit()
    
    return SummaryResponse(
        case_id=case_id,
        summary=summary_text,
        document_count=len(documents)
    )
