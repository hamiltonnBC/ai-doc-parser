from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import EntityResponse
from app.models import ExtractedEntity, Document

router = APIRouter()

@router.get("/document/{document_id}", response_model=list[EntityResponse])
def get_document_entities(document_id: str, db: Session = Depends(get_db)):
    """Get all extracted entities for a document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    entities = db.query(ExtractedEntity).filter(
        ExtractedEntity.document_id == document_id
    ).all()
    
    return entities

@router.get("/case/{case_id}", response_model=list[EntityResponse])
def get_case_entities(case_id: str, db: Session = Depends(get_db)):
    """Get all extracted entities for all documents in a case"""
    entities = db.query(ExtractedEntity).join(Document).filter(
        Document.case_id == case_id
    ).all()
    
    return entities
