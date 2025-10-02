from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class CaseBase(BaseModel):
    name: str
    description: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    filename: str
    file_type: Optional[str] = None
    document_type: Optional[str] = None

class DocumentCreate(DocumentBase):
    case_id: UUID
    file_path: str

class DocumentResponse(DocumentBase):
    id: UUID
    case_id: UUID
    uploaded_at: datetime
    processed: bool
    summary: Optional[str] = None
    page_count: Optional[int] = None
    
    class Config:
        from_attributes = True

class EntityResponse(BaseModel):
    id: UUID
    entity_type: str
    entity_value: str
    confidence: float
    source_location: Optional[dict] = None
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    case_id: UUID
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict] = []
