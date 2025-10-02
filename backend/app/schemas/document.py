from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class DocumentWithText(BaseModel):
    id: UUID
    case_id: UUID
    filename: str
    file_type: Optional[str] = None
    document_type: Optional[str] = None
    uploaded_at: datetime
    processed: bool
    ocr_text: Optional[str] = None
    summary: Optional[str] = None
    page_count: Optional[int] = None
    
    class Config:
        from_attributes = True
