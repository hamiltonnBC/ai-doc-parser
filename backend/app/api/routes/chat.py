from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import ChatRequest, ChatResponse, ChatMessageResponse
from app.services.rag_service import rag_service

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
def ask_question(request: ChatRequest, db: Session = Depends(get_db)):
    """Ask a question about documents in a case"""
    try:
        # Query documents using RAG service
        result = rag_service.query_documents(request.question, request.case_id, db)
        
        # Save chat message to database
        rag_service.save_chat_message(
            case_id=request.case_id,
            question=request.question,
            answer=result["answer"],
            sources=result["sources"],
            db=db
        )
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            confidence=result.get("confidence")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@router.get("/history/{case_id}", response_model=List[ChatMessageResponse])
def get_chat_history(case_id: UUID, db: Session = Depends(get_db)):
    """Get chat history for a case"""
    try:
        messages = rag_service.get_chat_history(case_id, db)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@router.post("/clear/{case_id}")
def clear_chat_history(case_id: UUID, db: Session = Depends(get_db)):
    """Clear chat history for a case"""
    try:
        success = rag_service.clear_chat_history(case_id, db)
        if success:
            return {"message": "Chat history cleared successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear chat history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")

@router.get("/sources/{chat_id}")
def get_chat_sources(chat_id: UUID, db: Session = Depends(get_db)):
    """Get source documents for a specific chat message"""
    try:
        from app.models import ChatMessage
        chat_message = db.query(ChatMessage).filter(ChatMessage.id == chat_id).first()
        if not chat_message:
            raise HTTPException(status_code=404, detail="Chat message not found")
        
        return {"sources": chat_message.sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sources: {str(e)}")

@router.post("/reprocess-embeddings/{document_id}")
def reprocess_document_embeddings(document_id: UUID, db: Session = Depends(get_db)):
    """Reprocess embeddings for a specific document"""
    try:
        success = rag_service.reprocess_document_embeddings(document_id, db)
        if success:
            return {"message": "Document embeddings reprocessed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to reprocess document embeddings")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reprocessing embeddings: {str(e)}")

@router.post("/reprocess-all-embeddings/{case_id}")
def reprocess_all_embeddings(case_id: UUID, db: Session = Depends(get_db)):
    """Reprocess embeddings for all documents in a case"""
    try:
        from app.models import Document
        documents = db.query(Document).filter(
            Document.case_id == case_id,
            Document.processed == True
        ).all()
        
        success_count = 0
        for document in documents:
            if rag_service.reprocess_document_embeddings(document.id, db):
                success_count += 1
        
        return {
            "message": f"Reprocessed embeddings for {success_count}/{len(documents)} documents",
            "total_documents": len(documents),
            "successful": success_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reprocessing embeddings: {str(e)}")
