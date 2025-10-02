from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Placeholder for RAG implementation
    return ChatResponse(
        answer="RAG implementation coming soon",
        sources=[]
    )
