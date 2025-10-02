from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DocumentResponse
from app.schemas.document import DocumentWithText
from app.models import Document, Case
from app.utils.document_processor import DocumentProcessor
import os
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def process_document_background(document_id: str):
    """Background task to process document"""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            processor = DocumentProcessor()
            processor.process_document(document, db)
    except Exception as e:
        logger.error(f"Background processing failed for {document_id}: {str(e)}")
    finally:
        db.close()

@router.post("/upload/{case_id}", response_model=DocumentResponse)
async def upload_document(
    case_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if case exists
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save file
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{file_id}{file_extension}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Create document record
    document = Document(
        case_id=case_id,
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Process document in background
    background_tasks.add_task(process_document_background, str(document.id))
    
    return document

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/case/{case_id}", response_model=list[DocumentResponse])
def get_case_documents(case_id: str, db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.case_id == case_id).all()
    return documents

@router.post("/{document_id}/reprocess")
def reprocess_document(document_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Manually trigger document reprocessing"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document.processed = False
    db.commit()
    
    background_tasks.add_task(process_document_background, document_id)
    return {"message": "Document reprocessing started"}

@router.get("/{document_id}/text", response_model=DocumentWithText)
def get_document_with_text(document_id: str, db: Session = Depends(get_db)):
    """Get document with extracted text"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document and its associated data"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Delete associated entities first (foreign key constraint)
        from app.models import ExtractedEntity
        db.query(ExtractedEntity).filter(ExtractedEntity.document_id == document_id).delete()
        
        # Delete the file from storage
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
            logger.info(f"Deleted file: {document.file_path}")
        
        # Delete the document record
        db.delete(document)
        db.commit()
        
        logger.info(f"Successfully deleted document: {document.filename}")
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting document")
